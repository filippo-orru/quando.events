import { defineStore } from 'pinia'
import { dateIsBetween, type CalendarEntry } from './newMeetingStore'

type ImportedCalendarEventsStore = {
  events: CalendarEntry[];
};

type StoredCalendarEntry = {
  id: string;
  start: number;
  end: number;
  title: string;
};

export const useImportedCalendarEventsStore = defineStore({
  id: 'importedCalendarEventsStore',
  state: () => ({
    events: [] as CalendarEntry[],
  }),
  getters: {
    eventsInOverlapGroups() {
      let overlapGroups: Array<Array<CalendarEntry>> = [];
      for (let event of this.events) {
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
  },
  actions: {
    addEvents(newEvents: CalendarEntry[]) {
      this.events.push(...newEvents.filter((newEvent) => !this.events.some((event) => event.id === newEvent.id)));
    }
  },
  persist: {
    serializer: {
      serialize: (value) => {
        let v = value as ImportedCalendarEventsStore;
        return JSON.stringify({
          events: v.events.map((event: CalendarEntry) => ({
            id: event.id,
            start: event.start.getTime(),
            end: event.end.getTime(),
            title: event.title,
          })),
        });
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value) as { events: StoredCalendarEntry[] } | null;
        if (!parsed) {
          return {
            events: [],
          } as ImportedCalendarEventsStore;
        } else {
          return {
            events: parsed.events.map((event) => ({
              id: event.id,
              start: new Date(event.start),
              end: new Date(event.end),
              title: event.title,
            })),
          } as ImportedCalendarEventsStore;
        }
      }
    }
  }
})
