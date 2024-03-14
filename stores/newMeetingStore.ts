import { add, intervalToDuration, isMonday, previousMonday, set } from 'date-fns';
import { defineStore } from 'pinia'

const oneDayMs = 24 * 60 * 60 * 1000;

export interface CalendarTimeslot {
    start: Date;
    end: Date;
}

export interface CalendarEntry extends CalendarTimeslot {
    id: String;
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


export function dateIsBetween(date: Date, start: Date, end: Date) {
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
}

export const useNewMeetingStore = defineStore('newMeetingStore', {
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
            name: '',
            eventTitle: '',
            selectedTimes: [] as CalendarTimeslot[],
            events: events as CalendarEntry[],
        } as NewMeetingStore;
    },

    getters: {
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
                    
                });
            },
            deserialize: (value: string) => {
                // Convert timestamps to dates
                let parsed = JSON.parse(value);
                return {
                    name: parsed.name,
                    eventTitle: parsed.eventTitle,
                    selectedTimes: parsed.selectedTimes.map((timeslot: { start: number, end: number }) => ({
                        start: new Date(timeslot.start),
                        end: new Date(timeslot.end),
                    })),
                };
            },
        },
    }
})