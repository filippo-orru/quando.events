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
    return date.getTime() > start.getTime() && date.getTime() < end.getTime();
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
        let top = (dateToPercentOfDay(now.value) / 100) * scrollViewportRef.value!.scrollHeight - scrollViewportRef.value!.clientHeight + 200;
        console.log(dateToPercentOfDay(now.value) / 100 - 1, top);
        scrollViewportRef.value!.scrollTo({ top: top });
        viewportIsReady.value = true;
    });
});

</script>

<template>
    <div class="flex flex-col w-full h-full overflow-hidden">
        <div class="flex flex-col w-full py-2">
            <div class="flex w-full h-full justify-stretch items-center px-4 text-gray-500">
                <div class="flex-[0.8]">
                </div>
                <div class="inline-flex flex-col justify-center items-center flex-1 gap-1 text-center text-xs"
                    v-for="day in thisWeek" :key="day.date.getTime()">
                    <div>
                        <span class="md:hidden">{{ day.dayOfTheWeek.substring(0, 1).toUpperCase() }}</span>
                        <span class="hidden md:block">{{ day.dayOfTheWeek.substring(0, 3).toUpperCase() }}</span>
                    </div>
                    <span class="inline-flex justify-center items-center w-10 h-10 text-2xl rounded-full"
                        :class="{ 'bg-blue-500 text-white': day.isToday }">{{ day.date.getDate() }}</span>
                </div>
            </div>
        </div>
        <div class="w-full h-full overflow-y-scroll overflow-x-hidden" ref="scrollViewportRef">
            <div class="container mx-auto w-full flex h-[1500px] py-4 px-2 md:px-4 relative opacity-0 transition-all"
                :class="{ 'opacity-100': viewportIsReady }">
                <div class="absolute top-0 bottom-0 left-0 right-0 my-4 mx-2 md:mx-4">
                    <div class="absolute h-0 w-full flex justify-stretch items-center gap-2 text-xs text-gray-400"
                        v-for="(hour, index) in 24" :key="hour" :style="{ top: (100 * index / 24) + '%' }">

                        <div>{{ (hour - 1).toString().padStart(2, '0') }}:00</div>
                        <div class="w-full border-t bg-gray-200"></div>
                    </div>
                </div>
                <span class="flex-[0.8]"></span>
                <div class="flex-1 h-full relative border-r border-gray-200" :class="{ 'border-l': index == 0 }"
                    v-for="(day, index) in thisWeek" :key="day.date.toString()">
                    <div class="w-full h-full absolute">
                        <div
                            v-for="group in calendarEventsWithOverlapGroups.filter((group) => group.some((event) => isSameDay(event.start, day.date)))"
                            :key="group[0].start.toString()">
                            <div class="absolute left-0 right-1 md:right-2 p-1 md:px-2 md:py-2 overflow-hidden inline-flex flex-col justify-start bg-blue-500 text-white rounded-md text-xs break-all
                            cursor-pointer hover:bg-blue-600" v-for="(event, index) in group"
                                :class="{ 'flex-row gap-4': eventIsShort(event), 'outline right-0 md:right-0 left-[50%]': index >= 1, 'pr-[50%]': index == 0 && group.length > 1 }"
                                :key="event.start.toString()" :style="{
                        top: dateToPercentOfDay(event.start) + '%',
                        height: 'calc(' + eventDuration(event) * 100 / oneDayMs + '% - 1px)',
                    }" :data-overlay-index="index" :data-overlay-group-size="group.length">
                                <span>{{ event.title }}</span>
                                <div class="hidden opacity-80 md:block">
                                    <span v-if="!eventIsShort(event)">{{ formatTime(event.start) }} – {{
                        formatTime(event.end) }}</span>
                                    <span v-else>{{ formatTime(event.start) }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="day.isToday" class="absolute w-full h-[2px] bg-gray-500 -translate-y-1/2"
                            :style="{ top: dateToPercentOfDay(now) + '%' }">
                            <div
                                class="absolute w-3 h-3 bg-gray-500 rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss"></style>