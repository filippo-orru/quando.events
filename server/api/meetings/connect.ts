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
                client.peer.send(JSON.stringify({
                    type: "update",
                    data: meeting
                } as MeetingWsMessageS));
            }
        }
    }
}

function sendError(peer: WsPeer, message?: WsErrorS) {
    peer.send(JSON.stringify({
        type: "error",
        message: message
    } as MeetingWsMessageS));
}

function getMeetingId(peer: any): string {
    try {
        let urlParts = peer.url.split("/");
        return urlParts[urlParts.length - 2]; // second to last part
    } catch (e) {
        sendError(peer, "Bad token");
        throw e;
    }
}

export default defineWebSocketHandler({
    async upgrade(request) {
    },
    async open(peer) {
        // console.log("[ws] upgrade", peer);
        let meetingId = getMeetingId(request);
        let token = (request.headers as Record<string, string>)['Authorization'];
        let user = await getUserByToken(token);
        if (!user) {
            throw new Error("Unauthorized");
        } else {
            let clientList = clients[meetingId] || (clients[meetingId] = {});
            clientList[request.id] = { userId: user.id, peer: request };
        }
    },

    async message(peer, message) {
        console.log("[ws] message", peer, message);
        let msg = JSON.parse(message.text()) as MeetingWsMessageC;

        switch (msg.type) {
            case 'auth':
                break;
            case 'update':
                let meetingId = msg.meetingId!;
                let client = clients[meetingId][peer.id];
                if (!client) {
                    sendError(peer, "Unauthorized");
                    return;
                }
                let user = await getUserById(client.userId);
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
        console.log("[ws] close", peer, event);
    },

    error(peer, error) {
        console.log("[ws] error", peer, error);
    },
});