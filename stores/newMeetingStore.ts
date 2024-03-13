import { add, intervalToDuration, isMonday, previousMonday } from 'date-fns';
import { defineStore } from 'pinia'

const oneDayMs = 24 * 60 * 60 * 1000;

export interface CalendarTimeslot {
    start: Date;
    end: Date;
}

export interface CalendarEntry extends CalendarTimeslot {
    title: string;
};

export function getHeight(timeSlot: CalendarTimeslot) {
    return eventDuration(timeSlot) / oneDayMs;
}

function eventDuration(event: CalendarTimeslot) {
    return event.end.getTime() - event.start.getTime();
}

export function isShort(slot: CalendarTimeslot) {
    return eventDuration(slot) < 30 * 60 * 1000;
}


function dateIsBetween(date: Date, start: Date, end: Date) {
    return date.getTime() > start.getTime() && date.getTime() < end.getTime();
}

export function getStartOfTheWeek(from: Date) {
    let startOfTheWeek = isMonday(from) ? new Date(from) : previousMonday(from);
    startOfTheWeek.setHours(0, 0, 0, 0)
    return startOfTheWeek;
}

interface NewMeetingStore {
    name: string;
    eventTitle: string;
    selectedTimes: CalendarTimeslot[];
    events: CalendarEntry[];
}

export const useNewMeetingStore = defineStore('newMeetingStore', {
    state: () => {
        // Random events
        let events = [...Array(5 + Math.floor(Math.random() * 5))].map((_, index) => {
            let start = add(getStartOfTheWeek(new Date()), { days: Math.floor(Math.random() * 7), hours: 7 + Math.floor(Math.random() * 8) });
            return {
                start: start,
                end: add(start, { minutes: (2 + Math.floor(Math.random() * 5)) * 30 }),
                title: `Event ${index + 1}`,
            };
        });

        return {
            name: '',
            eventTitle: '',
            selectedTimes: [] as CalendarTimeslot[],
            events: events as CalendarEntry[],
        } as NewMeetingStore;
    },

    getters: {
        eventsInOverlapGroups: (state) => {
            let overlapGroups: Array<Array<CalendarEntry>> = [];
            for (let event of state.events) {
                let overlapGroup = overlapGroups.find((group) =>
                    group.some((otherEvent) =>
                        dateIsBetween(event.start, otherEvent.start, otherEvent.end) || dateIsBetween(event.end, otherEvent.start, otherEvent.end)
                    )
                );
                if (overlapGroup) {
                    overlapGroup.push(event);
                } else {
                    overlapGroups.push([event]);
                }
            }
            return overlapGroups;
        },
        selectedTimesByDay: (state) => {
            interface CalendarTimeslotByDay {
                day: Date;
                timeslots: CalendarTimeslot[];
            }

            let selectedTimesByDay: { [date: number]: CalendarTimeslotByDay } = {};
            for (let timeslot of state.selectedTimes) {
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

    actions: {
    },

    persist: {
        serializer: {
            serialize: (value) => {
                let v = value as NewMeetingStore;
                // Convert dates to timestamps
                return JSON.stringify({
                    name: v.name,
                    eventTitle: v.eventTitle,
                    selectedTimes: v.selectedTimes.map((timeslot: CalendarTimeslot) => ({
                        start: timeslot.start.getTime(),
                        end: timeslot.end.getTime(),
                    })),
                    events: v.events.map((event: CalendarEntry) => ({
                        start: event.start.getTime(),
                        end: event.end.getTime(),
                        title: event.title,
                    })),
                });
            },
            deserialize: (value: string) => {
                // Convert timestamps to dates
                let raw = JSON.parse(value);
                return {
                    name: raw.name,
                    eventTitle: raw.eventTitle,
                    events: raw.events.map((event: { start: number, end: number, title: string }) => ({
                        start: new Date(event.start),
                        end: new Date(event.end),
                        title: event.title,
                    })),
                    selectedTimes: raw.selectedTimes.map((timeslot: { start: number, end: number }) => ({
                        start: new Date(timeslot.start),
                        end: new Date(timeslot.end),
                    })),
                };
            },
        },
    }
})