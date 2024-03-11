<script setup lang="ts">
import { add, isSameDay, previousMonday, isMonday } from "date-fns";

let now = useState('today', () => new Date());
function updateToday() {
    now.value = new Date();
}
let updateTodayTimer: NodeJS.Timeout;

onBeforeMount(() => {
    updateTodayTimer = setInterval(updateToday, 1000);
});
onUnmounted(() => {
    clearInterval(updateTodayTimer);
});

let startOfTheWeek = isMonday(now.value) ? new Date(now.value) : previousMonday(now.value);
startOfTheWeek.setHours(0, 0, 0, 0);

const oneDayMs = 24 * 60 * 60 * 1000;

const scrollViewportRef = ref<HTMLDivElement>();
const viewportIsReady = useState('viewportIsReady', () => false);

let daysOfTheWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
let thisWeek = daysOfTheWeek.map((day, index) => {
    const date = add(startOfTheWeek, { days: index });
    return {
        dayOfTheWeek: day,
        date: date,
        isToday: isSameDay(now.value, date)
    }
});

function dateTimeMinutes(date: Date) {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

function dateToPercentOfDay(date: Date) {
    return dateTimeMinutes(date) / (24 * 0.6);
}

function formatTime(date: Date) {
    return date.getHours().toString() + ":" + date.getMinutes().toString().padStart(2, '0');
}

function dateIsBetween(date: Date, start: Date, end: Date) {
    return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

type CalendarEntry = {
    start: Date;
    end: Date;
    title: string;
};

function eventDuration(event: CalendarEntry) {
    return event.end.getTime() - event.start.getTime();
}

function eventIsShort(event: CalendarEntry) {
    return eventDuration(event) < 40 * 60 * 1000;
}

const calendarEventsWithOverlapGroups: globalThis.Ref<Array<Array<CalendarEntry>>> = useState('calendarEntries', () => {
    let events = [...Array(5 + Math.floor(Math.random() * 5))].map((_, index) => {
        let start = add(startOfTheWeek, { days: Math.floor(Math.random() * 7), hours: 7 + Math.floor(Math.random() * 8) });
        return {
            start: start,
            end: add(start, { minutes: (2 + Math.floor(Math.random() * 5)) * 30 }),
            title: `Event ${index + 1}`
        };
    });

    let overlapGroups: Array<Array<CalendarEntry>> = [];
    for (let event of events) {
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
});

onMounted(() => {
    nextTick(() => {
        let top = (1 - dateToPercentOfDay(now.value) / 100) * scrollViewportRef.value!.scrollHeight - 200;
        scrollViewportRef.value!.scrollTo({top: top});
        viewportIsReady.value = true;
    });
});

</script>

<template>
    <div class="calendar">
        <div class="header">
            <div class="days">
                <div class="time">
                </div>
                <div class="day" :class="{ 'today': day.isToday }" v-for="day in thisWeek" :key="day.date.getTime()">
                    <span class="day-of-the-week">
                        <span class="single-letter">{{ day.dayOfTheWeek.substring(0, 1).toUpperCase() }}</span>
                        <span class="full">{{ day.dayOfTheWeek.substring(0, 3).toUpperCase() }}</span>
                    </span>
                    <span class="day-of-the-month">{{ day.date.getDate() }}</span>
                </div>
            </div>
        </div>
        <div class="body" ref="scrollViewportRef">
            <div class="days" :class="{ 'ready': viewportIsReady }">
                <div class="time-indicators">
                    <div class="indicator" v-for="(hour, index) in 24" :key="hour"
                        :style="{ top: (100 * index / 24) + '%' }">

                        <div class="time">{{ (hour - 1).toString().padStart(2, '0') }}:00</div>
                        <div class="separator"></div>
                    </div>
                </div>
                <span class="time-indicators-placeholder"></span>
                <div class="day" :class="{ 'first': index == 0 }" v-for="(day, index) in thisWeek"
                    :key="day.date.toString()">
                    <div class="events">
                        <div class="event-overlap-group"
                            v-for="group in calendarEventsWithOverlapGroups.filter((group) => group.some((event) => isSameDay(event.start, day.date)))"
                            :key="group[0].start.toString()">
                            <div class="event" v-for="(event, index) in group"
                                :class="{ 'small': eventIsShort(event), isOverlaid: index >= 1 }"
                                :key="event.start.toString()" :style="{
                    top: dateToPercentOfDay(event.start) + '%',
                    height: 'calc(' + eventDuration(event) * 100 / oneDayMs + '% - 1px)',
                    left: index >= 1 ? '50%' : '0',
                    paddingRight: index == 0 && group.length > 1 ? '50%' : '0'
                }" :data-overlay-index="index" :data-overlay-group-size="group.length">
                                <span>{{ event.title }}</span>
                                <span v-if="!eventIsShort(event)" class="time">{{ formatTime(event.start) }} – {{
                    formatTime(event.end) }}</span>
                                <span v-else class="time">{{ formatTime(event.start) }}</span>
                            </div>
                        </div>
                        <div v-if="day.isToday" class="now-indicator" :style="{ top: dateToPercentOfDay(now) + '%' }">
                            <div class="dot"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.calendar {
    --var-background: #ffffff;
    --var-separator: #dfdfdf;

    --var-accent: #1595e5;
    --var-accent-hover: #128bc3;
    --var-text-on-accent: white;

    --var-text: #333333;
    --var-text-secondary: #7c7c7c;

    --var-now-indicator: #ec3737;
    --var-now-indicator: #3a3a3a;

    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    // max-width: 800px;
    overflow: hidden;

    .header {
        display: flex;
        flex-direction: column;
        width: 100%;

        padding: 12px 0;

        .days {
            display: flex;
            flex-direction: row;
            justify-content: stretch;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 0 16px; // Same as body

            color: var(--var-text-secondary);

            .day {
                display: inline-flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                flex: 1;
                gap: 6px;

                text-align: center;
                font-size: 0.7rem;

                .day-of-the-month {
                    width: 32px;
                    height: 32px;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;

                    font-size: 1.4rem;
                    border-radius: 50%;

                    &:hover {
                        cursor: pointer;
                        background-color: #dfdfdf;
                    }
                }

                .day-of-the-week .full {
                    display: none;
                }

                @media screen and (min-width: 768px) {
                    .day-of-the-week .single-letter {
                        display: none;
                    }

                    .day-of-the-week .full {
                        display: block;
                    }
                }

                &.today .day-of-the-month {
                    background-color: var(--var-accent);
                    color: white;

                    &:hover {
                        background-color: var(--var-accent-hover);
                    }
                }
            }

            .time {
                flex: 0.8;
            }
        }
    }

    .body {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        background-color: var(--var-background);

        .days {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 1500px;
            padding: 16px 6px;

            @media screen and (min-width: 768px) {
                padding: 16px;
            }

            position: relative;

            opacity: 0;

            &.ready {
                opacity: 1;
                transition: opacity 0.15s;
            }

            .time-indicators {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: 16px 6px;

                @media screen and (min-width: 768px) {
                    margin: 16px;
                }

                .indicator {
                    position: absolute;
                    height: 0px;
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: stretch;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    color: var(--var-text-secondary);

                    .separator {
                        width: 100%;
                        height: 1px;
                        background-color: var(--var-separator);
                    }
                }

            }

            .time-indicators-placeholder {
                flex: 0.8;
            }

            .day {
                flex: 1;
                height: 100%;
                position: relative;

                display: block;
                border-right: 1px solid var(--var-separator);

                &.first {
                    border-left: 1px solid var(--var-separator);
                }

                .events {
                    width: 100%;
                    height: 100%;
                    position: absolute;

                    .now-indicator {
                        position: absolute;
                        width: 100%;
                        height: 2px;
                        transform: translateY(-50%);
                        background-color: var(--var-now-indicator);

                        .dot {
                            position: absolute;
                            width: 11px;
                            height: 11px;
                            background-color: var(--var-now-indicator);
                            border-radius: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                        }
                    }

                    .event {
                        flex: 1;
                        position: absolute;
                        left: 0;
                        right: 4px;

                        @media screen and (min-width: 768px) {
                            right: 12px;
                        }

                        overflow: hidden;

                        display: inline-flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        background: var(--var-accent);
                        color: var(--var-text-on-accent);
                        border-radius: 4px;
                        font-size: 0.7rem;
                        cursor: pointer;
                        padding: 3px;
                        word-break: break-all;
                        @media screen and (min-width: 768px) {
                            padding: 4px 8px;
                        }

                        &:hover {
                            background: var(--var-accent-hover);
                        }

                        &.small {
                            font-size: 0.7rem;
                            flex-direction: row;
                            gap: 8px;
                        }

                        &.isOverlaid {
                            outline: 1px solid white;
                            right: 0;
                        }

                        .time {
                            display: none;
                            opacity: 0.8;
                            @media screen and (min-width: 768px) {
                                display: block;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>