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
                <div class="day" :class="{ 'first': index == 0 }" v-for="(day, index) in daysOfTheWeek" :key="day">
                    <div class="events">
                        <div class="event" v-for="r in Math.floor(Math.random() * 3) + 1" :key="r"
                            :style="{ top: Math.random() * 100 + '%', height: '25px' }">
                            <span>Event {{ r }}</span>
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
        background-color: #f2f2f2;

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

                    font-size: 1.1rem;
                    border-radius: 50%;
                    background-color: #d3d3d3;

                }

                &.today .day-of-the-month {
                    background-color: #b4cccf;
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
        background: rgb(187, 187, 187);

        .days {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 1500px;
            padding: 16px;
            position: relative;

            .time-indicators {
                flex: 0.8;
                width: 100%;
                height: 100%;
                position: absolute;

                .indicator {
                    position: relative;
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
                        position: relative;

                        display: inline-flex;
                        flex-direction: column;
                        justify-content: center;
                        text-align: center;
                        background: #cfcfcf;
                        border-radius: 4px;
                        padding: 4px;
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>