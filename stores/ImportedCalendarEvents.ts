import { defineStore } from 'pinia'
import { dateIsBetween } from './NewMeetingStore'
import type { CalendarEntry, CalendarImportSource, ImportedCalendarEntry } from '~/data/Meeting';
import { add, set } from 'date-fns';

type ImportedCalendarEventsStore = {
  events: ImportedCalendarEntry[];
};

type StoredCalendarEntry = {
  id: string;
  start: number;
  end: number;
  title: string;
  source: CalendarImportSource;
};

export const useImportedCalendarEventsStore = defineStore({
  id: 'importedCalendarEventsStore',
  state: () => {
    let hintEventStart = set(getStartOfTheWeek(new Date()), { hours: 14, minutes: 30 });

    let events = [
      {
        'start': hintEventStart,
        'end': add(hintEventStart, { hours: 3 }),
        title: 'Click to show your own calendar events!'
      }
    ] as ImportedCalendarEntry[];

    return { events: events }
  },
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
    addEvents(newEvents: ImportedCalendarEntry[]) {
      this.events.push(...newEvents.filter((newEvent) => !this.events.some((event) => event.id === newEvent.id)));
    },
    clear(source: CalendarImportSource) {
      this.events = this.events.filter((event) => event.source !== source);
    }
  },
  persist: {
    storage: window.localStorage,
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
              source: event.source,
            } as ImportedCalendarEntry)),
          } as ImportedCalendarEventsStore;
        }
      }
    }
  }
})
