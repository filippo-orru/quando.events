<script setup lang="ts">
import { add, getDayOfYear, isSameDay, previousMonday } from "date-fns";

let today = new Date();
let startOfTheWeek = previousMonday(today);
let endOfTheWeek = add(startOfTheWeek, { days: 6 });
let daysOfTheWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
let thisWeek = daysOfTheWeek.map((day, index) => {
    const date = add(startOfTheWeek, { days: index });
    return {
        dayOfTheWeek: day,
        date: date,
        isToday: isSameDay(today, date)
    }
});

function dateToPercentOfDay(date: Date) {
    return (date.getHours() * 60 + date.getMinutes()) / (24 * 60) * 100;
}

function formatTime(date: Date) {
    return date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
}

type CalendarEntry = {
    start: Date;
    end: Date;
    title: string;
};

const calendarEntries: globalThis.Ref<Array<CalendarEntry>> = useState('calendarEntries', () => {
    return [...Array(5 + Math.floor(Math.random() * 5))].map((_, index) => {
        let start = add(startOfTheWeek, { hours: Math.random() * 7 * 24 });
        return {
            start: start,
            end: add(start, { minutes: (1 + Math.floor(Math.random() * 3)) * 30 }),
            title: `Event ${index + 1}`
        };
    });
});

</script>

<template>
    <div class="calendar">
        <div class="header">
            <!-- static header row -->
            <div class="days">
                <div class="time">
                    <!-- Placeholder for time -->
                </div>
                <div class="day" :class="{ 'today': day.isToday }" v-for="day in thisWeek" :key="day.date.getTime()">
                    <span class="day-of-the-week">{{ day.dayOfTheWeek.substring(0, 1).toUpperCase() }}</span>
                    <span class="day-of-the-month">{{ day.date.getDate() }}</span>
                </div>
            </div>
        </div>
        <div class="body">
            <div class="days">
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
                        <div class="event"
                            v-for="event in calendarEntries.filter((el) => isSameDay(el.start, day.date))"
                            :key="event.start.toString()"
                            :style="{ top: dateToPercentOfDay(event.start) + '%', height: dateToPercentOfDay(new Date(event.end.getTime() - event.start.getTime())) + '%' }">
                            <span>{{ event.title }}</span>
                            <span class="time">{{ formatTime(event.start) }} – {{ formatTime(event.end) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- dynamic days content -->
    </div>
</template>

<style lang="scss">
.calendar {
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

            font-size: 0.8rem;

            .day {
                display: inline-flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                flex: 1;
                text-align: center;
                gap: 6px;

                .day-of-the-month {
                    width: 32px;
                    height: 32px;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;

                    font-size: 1.2rem;
                    border-radius: 50%;

                    &:hover {
                        cursor: pointer;
                        background-color: #dfdfdf;
                    }

                }

                &.today .day-of-the-month {
                    background-color: #17a9b3;
                    color: white;
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
        background-color: #f2f2f2;

        .days {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 1500px;
            padding: 16px;
            position: relative;

            .time-indicators {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: 16px;

                .indicator {
                    position: absolute;
                    height: 0px;
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: stretch;
                    align-items: center;
                    gap: 8px;

                    .separator {
                        width: 100%;
                        height: 1px;
                        background-color: #a4a4a4;
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
                border-right: 1px solid #a4a4a4;

                &.first {
                    border-left: 1px solid #a4a4a4;
                }

                .events {
                    width: 100%;
                    height: 100%;
                    position: absolute;

                    .event {
                        flex: 1;
                        position: absolute;
                        left: 0;
                        right: 12px;

                        display: inline-flex;
                        flex-direction: column;
                        justify-content: start;
                        background: #1595e5;
                        color: white;
                        border-radius: 4px;
                        padding: 4px 8px;
                        font-size: 0.8rem;
                        cursor: pointer;

                        &:hover {
                            background: #0f8ac4;
                        }

                        .time {
                            opacity: 0.8;
                        }
                    }
                }
            }
        }
    }
}
</style>