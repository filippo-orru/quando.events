import { defineStore } from 'pinia'
import type { CalendarEntry, CalendarImportSource, ImportedCalendarEntry } from '~/data/Meeting';
import { add, set, type Interval, isWithinInterval, startOfDay, getOverlappingDaysInIntervals, eachDayOfInterval } from 'date-fns';

type ImportedCalendarEventsStore = {
  events: ImportedCalendarEntry[];
};

type StoredCalendarEntry = {
  id: string;
  start: number;
  end: number;
  title: string;
  source: CalendarImportSource;
  fullDay: boolean;
};

export type FullDayEventWithOffset = ImportedCalendarEntry & { offset: number };

export const useImportedCalendarEventsStore = defineStore({
  id: 'importedCalendarEventsStore',
  state: () => {
    let hintEventStart = set(getStartOfTheWeek(new Date()), { hours: 14, minutes: 30 });

    let events = [
      // {
      //   'start': hintEventStart,
      //   'end': add(hintEventStart, { hours: 3 }),
      //   title: 'Click to show your own calendar events!'
      // }
    ] as ImportedCalendarEntry[];

    return { events: events }
  },
  actions: {
    getEventsInOverlapGroups(interval: Interval) {
      let eventsWithinInterval = this.events.filter((event) => event.fullDay !== true && (isWithinIntervalExclusive(event.start, interval) || isWithinIntervalExclusive(event.end, interval)));

      let overlapGroups: Array<Array<CalendarEntry>> = [];
      for (let event of eventsWithinInterval) {
        let overlapGroup = overlapGroups.find((group) =>
          group.some((otherEvent) => isWithinIntervalExclusive(event.start, otherEvent) || isWithinIntervalExclusive(event.end, otherEvent))
        );
        if (overlapGroup) {
          overlapGroup.push(event);
        } else {
          overlapGroups.push([event]);
        }
      }
      return overlapGroups;
    },
    getFullDayEventsWithOffset(interval: Interval) {
      let eventsWithinInterval = this.events.filter((event) => event.fullDay === true && (isWithinIntervalExclusive(event.start, interval) || isWithinIntervalExclusive(event.end, interval)));
      eventsWithinInterval.sort((a, b) => getOverlappingDaysInIntervals(b, interval) - getOverlappingDaysInIntervals(a, interval)); // Sort by number of days, longest first

      let events = [] as FullDayEventWithOffset[];
      let slots = new Map<number, number[]>(); // Map<offset, occupiedDayTimestamps>
      for (let event of eventsWithinInterval) {
        let eventInterval = {
          start: startOfDay(event.start > interval.start ? event.start : interval.start),
          end: add(startOfDay(event.end < interval.end ? event.end : interval.end), { seconds: -1 })
        };
        let dayTimestamps = eachDayOfInterval(eventInterval).map((it) => startOfDay(it).getTime());
        let offset = 0;
        while (offset < 10) {
          let fitsInThisOffset = true;
          let daySlots = slots.get(offset);
          for (let dayTimestamp of dayTimestamps) {
            let daySlotIsOccupied = daySlots?.includes(dayTimestamp) || false;
            if (daySlotIsOccupied) {
              fitsInThisOffset = false;
              break;
            }
          }

          if (fitsInThisOffset) {
            for (let dayTimestamp of dayTimestamps) {
              if (!daySlots) {
                daySlots = [];
              }
              daySlots.push(dayTimestamp);
            }
            slots.set(offset, daySlots!);
            events.push({ ...event, offset: offset });
            break;
          }
          offset++;
        }
      }
      console.log(events);
      return events;
    },
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
        return JSON.stringify(
          {
            events: v.events.map((event: ImportedCalendarEntry) => ({
              id: event.id,
              start: event.start.getTime(),
              end: event.end.getTime(),
              title: event.title,
              source: event.source,
              fullDay: event.fullDay,
            } as StoredCalendarEntry)),
          }
        );
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value) as { events: StoredCalendarEntry[] } | null;
        if (!parsed) {
          return {
            events: [],
          } as ImportedCalendarEventsStore;
        } else {
          return {
            events: parsed.events.map((event: StoredCalendarEntry) => ({
              id: event.id,
              start: new Date(event.start),
              end: new Date(event.end),
              title: event.title,
              source: event.source,
              fullDay: event.fullDay,
            } as ImportedCalendarEntry)),
          } as ImportedCalendarEventsStore;
        }
      }
    }
  }
})


function isWithinIntervalExclusive(date: Date, interval: Interval) {
  return date > interval.start && date < interval.end;
}