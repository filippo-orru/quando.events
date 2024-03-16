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
            ApiClient.i.tokenStore.addTokenUpdateListener((_) => sendAuth(meetingId));
            wsConnect(this.meetingId);
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
            console.log('Applying update', newMeeting, 'old', this.data);
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
    },

    getters: {

    },
})

// Messages sent by the client
export type MeetingWsMessageC =
    {
        type: 'auth';
        meetingId: string;
        token: string;
        userId: string;
    } | {
        type: 'update';
        meetingId: string;
        data: UpdateMeeting;
    }

// Messages sent by the server
export type MeetingWsMessageS =
    {
        type: 'authResponse';
        response: 'unauthorized' | 'unknown' | 'ok';
    } | {
        type: 'update';
        data: MeetingSerialized;
    } | {
        type: 'error',
        message?: string;
    }

let ws: WebSocket | null = null;
const wsConnect = async (meetingId: string) => {
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
            case 'authResponse':
                console.log('ws', 'auth response', message.response);
                if (message.response !== 'ok') {
                    // Log out?
                }
                break;
            case 'update':
                let store = useNewMeetingStore(message.data.id);
                store.applyUpdate(deserializeMeeting(message.data));
                break;
            case 'error':
                console.error('Error from server:', message.message);
                break;
        }
    });

    await new Promise((resolve) => websocket.addEventListener("open", resolve));
    ws = websocket;

    sendAuth(meetingId);
};

const wsSend = (message: MeetingWsMessageC) => {
    let data = JSON.stringify(message);
    console.log("sending message...", data);
    ws?.send(data);
}

function sendAuth(meetingId: string) {
    let accessToken = ApiClient.i.tokenStore.getAccessToken();
    if (!accessToken) {
        return;
    }
    wsSend({
        type: 'auth',
        meetingId: meetingId,
        token: accessToken.token,
        userId: accessToken.id,
    } as MeetingWsMessageC)
}

const saveMeeting = useDebounceFn(async (id: string, meetingData: MeetingData) => {
    // Save the selected times to the server
    let data = {
        title: meetingData.title,
        selectedTimes: meetingData.selectedTimes.map((timeslot: CalendarTimeslot) => serializeCalendarTimeslot(timeslot)),
    } as UpdateMeeting;
    wsSend({
        'type': 'update',
        'data': data,
        'meetingId': id
    } as MeetingWsMessageC);
    // let response = ApiClient.i.updateMeeting(id, );

    // if (response.id !== 200) {
    //     console.error('Failed to save meeting');
    // }
}, 100);

export const useNewMeetingStore = (meetingId: string) => newMeetingStore(meetingId)();