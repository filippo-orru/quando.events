import { useDebounceFn } from '@vueuse/core';
import { isMonday, previousMonday } from 'date-fns';
import { defineStore } from 'pinia'
import { serializeCalendarTimeslot, type CalendarTimeslot, type MeetingSerialized, deserializeMeeting } from '~/data/Meeting';
import type { UpdateMeeting } from '~/server/api/meetings/[...meetingId]/index.patch';
import type { MeetingMember } from '~/server/utils/db/meetings';

const oneDayMs = 24 * 60 * 60 * 1000;

export function getHeight(timeSlot: CalendarTimeslot) {
    return eventDuration(timeSlot) / oneDayMs;
}

function eventDuration(event: CalendarTimeslot) {
    return event.end.getTime() - event.start.getTime();
}

export function isShort(slot: CalendarTimeslot) {
    return eventDuration(slot) < 30 * 60 * 1000;
}


export function dateIsBetween(date: Date, start: Date, end: Date) {
    return date.getTime() > start.getTime() && date.getTime() < end.getTime();
}

export function getStartOfTheWeek(from: Date) {
    let startOfTheWeek = isMonday(from) ? new Date(from) : previousMonday(from);
    startOfTheWeek.setHours(0, 0, 0, 0)
    return startOfTheWeek;
}

interface NewMeetingStore {
    meetingId: string;
    data: MeetingData | null | 'error';
}

export type MeetingData = {
    title: string;
    selectedTimes: CalendarTimeslot[];
    members: MeetingMember[];
}

export type NewMeetingProps = {
    meetingId: string;
    data: MeetingData;

    saveMeetingData: () => Promise<void>;
};

const newMeetingStore = (meetingId: string) => defineStore(`NewMeetingStore-${meetingId}`, {
    state: () => {
        return {
            meetingId: meetingId,
            data: null
        } as NewMeetingStore;
    },

    actions: {
        init() {
            this.fetchUpdate();
            wsConnect();
        },
        async fetchUpdate() {
            try {
                let meeting = await ApiClient.i.getMeeting(this.meetingId);
                this.applyUpdate(meeting);
            } catch (e) {
                console.error(e);
                this.data = 'error';
            }
        },
        applyUpdate(newMeeting: Meeting) {
            let userStore = useUserInfoStore();
            if (newMeeting) {
                let myMember = newMeeting.members.find((member) => member.id === userStore.id);
                this.data = {
                    title: newMeeting.title,
                    members: newMeeting.members.filter((member) => member.id !== userStore.id),
                    selectedTimes: myMember && myMember.times || []
                }
            }
        },
        save() {
            if (this.data && this.data !== 'error') {
                saveMeeting(this.meetingId, this.data);
            }
        },
        getProps() {
            return {
                meetingId: this.meetingId,
                data: this.data,
                saveMeetingData: this.save
            } as NewMeetingProps
        },
    },

    getters: {

    },
})

// Messages sent by the client
export type MeetingWsMessageC =
    {
        type: 'auth';
        token: string;
        userId: string;
        meetingId: string;
    } | {
        type: 'update';
        data: UpdateMeeting;
    }

// Messages sent by the server
export type MeetingWsMessageS = {
    type: 'update';
    data: MeetingSerialized;
} | {
    type: 'error',
    message?: string;
}

let ws: WebSocket | null = null;
const wsConnect = async () => {
    const isSecure = location.protocol === "https:";
    const url = (isSecure ? "wss://" : "ws://") + location.host + "/api/meetings/connect";
    if (ws) {
        console.log("ws", "Closing previous connection before reconnecting...");
        ws.close();
    }

    let websocket = new WebSocket(url);

    websocket.addEventListener("message", (event) => {
        const message: MeetingWsMessageS = JSON.parse(event.data);
        switch (message.type) {
            case 'update':
                let store = useNewMeetingStore(message.data.id);
                store.applyUpdate(deserializeMeeting(message.data));
                break;
        }
    });

    await new Promise((resolve) => websocket.addEventListener("open", resolve));
    ws = websocket;
};

const wsSend = (message: string | object) => {
    let data = typeof message === 'string' ? message : JSON.stringify(message);
    console.log("sending message...");
    ws?.send(data);
}

export const useNewMeetingStore = (meetingId: string) => newMeetingStore(meetingId)();

const saveMeeting = useDebounceFn(async (id: string, meetingData: MeetingData) => {
    // Save the selected times to the server
    let data = {
        title: meetingData.title,
        selectedTimes: meetingData.selectedTimes.map((timeslot: CalendarTimeslot) => serializeCalendarTimeslot(timeslot)),
    } as UpdateMeeting;
    wsSend({
        'type': 'update',
        'data': data,
    });
    // let response = ApiClient.i.updateMeeting(id, );

    // if (response.id !== 200) {
    //     console.error('Failed to save meeting');
    // }
}, 100);