import { useDebounceFn } from '@vueuse/core';
import { add, intervalToDuration, isMonday, previousMonday, set } from 'date-fns';
import { defineStore } from 'pinia'
import type { CalendarEntry, CalendarTimeslot } from '~/data/Meeting';
import type { UpdateMeeting } from '~/server/api/meetings/[...meetingId]/index.patch';
import type { MeetingParticipant } from '~/server/utils/db/meetings';

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
    data: MeetingData | null;
}

export type MeetingData = {
    title: string;
    selectedTimes: CalendarTimeslot[];
    members: MeetingParticipant[];
}

const newMeetingStore = (meetingId: string) => defineStore(`NewMeetingStore-${meetingId}`, {
    state: () => {
        // Random events
        // let events = [...Array(5 + Math.floor(Math.random() * 5))].map((_, index) => {
        //     let start = add(getStartOfTheWeek(new Date()), { days: Math.floor(Math.random() * 7), hours: 7 + Math.floor(Math.random() * 8) });
        //     return {
        //         start: start,
        //         end: add(start, { minutes: (2 + Math.floor(Math.random() * 5)) * 30 }),
        //         title: `Event ${index + 1}`,
        //     };
        // });
        let hintEventStart = set(getStartOfTheWeek(new Date()), { hours: 14, minutes: 30 });

        let events = [
            {
                'start': hintEventStart,
                'end': add(hintEventStart, { hours: 3 }),
                title: 'Click to show your own calendar events!'
            }
        ] as CalendarEntry[];

        return {
            meetingId: meetingId,
            data: null
        } as NewMeetingStore;
    },

    actions: {
        async fetchUpdate() {
            let userStore = useUserInfoStore();
            // Fetch the meeting from the server
            let meeting = await ApiClient.i.getMeeting(this.meetingId);
            if (meeting) {
                this.data = {
                    title: meeting.title,
                    members: meeting.members.filter((member) => member.id !== userStore.id),
                    selectedTimes: this.data?.selectedTimes || [],
                }
            }
        },
        save() {
            if (!this.data) {
                return;
            }
            saveMeeting(this.meetingId, this.data);
        }
    },

    getters: {
        selectedTimesByDay: (state) => {
            if (!state.data) {
                return {};
            }
            interface CalendarTimeslotByDay {
                day: Date;
                timeslots: CalendarTimeslot[];
            }

            let selectedTimesByDay: { [date: number]: CalendarTimeslotByDay } = {};
            for (let timeslot of state.data.selectedTimes) {
                let s = timeslot.start;
                let day = new Date(s.getFullYear(), s.getMonth(), s.getDate());
                let dayRaw = day.getTime();
                if (selectedTimesByDay[dayRaw]) {
                    selectedTimesByDay[dayRaw].timeslots.push(timeslot);
                } else {
                    selectedTimesByDay[dayRaw] = { day: day, timeslots: [timeslot] };
                }
            }
            return selectedTimesByDay;
        },
    },
})

export const useNewMeetingStore = (meetingId: string) => newMeetingStore(meetingId)();

const saveMeeting = useDebounceFn(async (id: string, data: MeetingData) => {
    // Save the selected times to the server
    let response = ApiClient.i.updateMeeting(id, {
        title: data.title,
        selectedTimes: data.selectedTimes.map((timeslot: CalendarTimeslot) => ({
            start: timeslot.start.getTime(),
            end: timeslot.end.getTime(),
        })),
    } as UpdateMeeting);

    // if (response.id !== 200) {
    //     console.error('Failed to save meeting');
    // }
}, 100);