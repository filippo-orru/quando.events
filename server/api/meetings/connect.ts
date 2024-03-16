import { MeetingSerialized } from "~/data/Meeting";
import { MeetingWsMessageC, MeetingWsMessageS } from "~/stores/NewMeetingStore";

type WsClient = {
    userId: string;
    peer: WsPeer;
};

type WsPeer = { send: (message: string) => void };

type WsErrorS = 'Unauthorized' | 'Bad token' | 'NotFound';

const clients: {
    [meetingId: string]:
    { [peerId: string]: WsClient }
} = {};

export function sendMeetingUpdate(meetingId: string, fromUserId: string, meeting: MeetingSerialized) {
    let clientList = clients[meetingId];
    if (clientList) {
        for (let peerId of Object.keys(clientList)) {
            let client = clientList[peerId];
            if (client.userId !== fromUserId) {
                sendMessage(
                    client.peer,
                    {
                        type: "update",
                        data: meeting
                    }
                );
            }
        }
    }
}

function sendMessage(peer: WsPeer, message: MeetingWsMessageS) {
    peer.send(JSON.stringify(message));
}

function sendError(peer: WsPeer, message?: WsErrorS) {
    sendMessage(peer,
        {
            type: "error",
            message: message
        }
    );
}


export default defineWebSocketHandler({
    async upgrade(request) {
    },
    async open(peer) {
    },

    async message(peer, message) {
        // console.log("[ws] message", peer, message);
        let msg = JSON.parse(message.text()) as MeetingWsMessageC;

        let user;
        switch (msg.type) {
            case 'auth':
                user = await getUserByToken(msg.userId, msg.token);
                if (!user) {
                    sendMessage(peer, { type: "authResponse", response: "unauthorized" });
                } else {
                    let clientList = clients[msg.meetingId] || (clients[msg.meetingId] = {});
                    clientList[peer.id] = { userId: user.id, peer: peer };
                    sendMessage(peer, { type: "authResponse", response: "ok" });
                }
                break;
            case 'update':
                let meetingId = msg.meetingId!;
                let client = clients[meetingId][peer.id];
                if (!client) {
                    sendError(peer, "Unauthorized");
                    return;
                }
                user = await getUserById(client.userId);
                if (user) {
                    let meeting = await updateMeeting(meetingId, user.id, msg.data);
                    if (!meeting) {
                        sendError(peer, "NotFound");
                        return;
                    }
                    sendMeetingUpdate(meetingId, user.id, meeting);
                } else {
                    sendError(peer, "Unauthorized");
                }
                break;

        }
    },

    close(peer, event) {
        // console.log("[ws] close", peer, event);
    },

    error(peer, error) {
        // console.log("[ws] error", peer, error);
    },
});