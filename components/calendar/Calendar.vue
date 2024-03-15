<script lang="ts" setup>
import { add, isSameDay, previousMonday, isMonday, addSeconds, addMinutes, addHours, formatDuration, intervalToDuration } from "date-fns";
import { type CalendarTimeslot } from '~/data/Meeting';
import type { NewMeetingProps } from "~/stores/NewMeetingStore";

const props = defineProps<{props: NewMeetingProps}>();
let meetingProps = props.props;
let meetingData = meetingProps.data;

let importedEvents = useImportedCalendarEventsStore();

let now = useState('today', () => new Date());
function updateToday() {
  now.value = new Date();
}
let updateTodayTimer: NodeJS.Timeout;

function updateMeetingInfo() {
  meetingProps.fetchUpdate();
}
let updateMeetingInfoTimer: NodeJS.Timeout;

const scrollViewportRef = ref<HTMLDivElement>();
const viewportIsReady = useState('viewportIsReady', () => false);

let daysOfTheWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

let currentWeek = useState('currentWeek', () => getStartOfTheWeek(now.value));
let weekTransitionDirection = useState('lastWeekChange', () => true); // True for right, false for left. Used for transition
function toWeek(next: boolean) {
  weekTransitionDirection.value = next;
  setTimeout(() => {
    currentWeek.value = add(currentWeek.value, { weeks: next ? 1 : -1 });
  }, 0);
}

function getDaysOfWeek(monday: Date) {
  return daysOfTheWeek.map((day, index) => {
    const date = add(monday, { days: index });
    return {
      dayOfTheWeek: day,
      date: date,
      isToday: isSameDay(now.value, date)
    }
  });
}

function dateToPercentOfDay(date: Date) {
  let oneDayMinutes = 24 * 60;
  let dateDayMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  return 100 * dateDayMinutes / oneDayMinutes;
}

function getTimeslotTop(slot: CalendarTimeslot): number {
  if (draggingTimeslotPosition.value && draggingTimeslotPosition.value.slot == slot) {
    return dateToPercentOfDay(getTimeslotWithDrag(slot, draggingTimeslotPosition.value).start);
  } else {
    return dateToPercentOfDay(slot.start);
  }
}
function getTimeslotHeight(slot: CalendarTimeslot): number {
  if (draggingTimeslotPosition.value && draggingTimeslotPosition.value.slot == slot) {
    return getHeight(getTimeslotWithDrag(slot, draggingTimeslotPosition.value));
  } else {
    return getHeight(slot);
  }
}

function formatTime(date: Date) {
  return date.getHours().toString() + ":" + date.getMinutes().toString().padStart(2, '0');
}

function formatTimeslotDuration(slot: CalendarTimeslot) {
  let duration;
  if (draggingTimeslotPosition.value && draggingTimeslotPosition.value.slot == slot) {
    let draggingSlot = getTimeslotWithDrag(slot, draggingTimeslotPosition.value);
    duration = intervalToDuration({ start: draggingSlot.start, end: draggingSlot.end });
  } else {
    duration = intervalToDuration({ start: slot.start, end: slot.end });
  }

  let str = [""];
  if (duration.hours) {
    str.push(duration.hours + "h");
  }
  if (duration.minutes) {
    str.push(duration.minutes + "m");
  }
  return str.join(" ");
}

function showAddTimeslotButtonFor(day: Date, hour: number) {
  let timeslot: CalendarTimeslot = {
    start: addHours(day, hour),
    end: addHours(day, hour + 1),
  };
  return meetingData.selectedTimes.every((slot2) => timeslotsOverlap(timeslot, slot2) in [Overlap.None, Overlap.Touch]);
}

enum Overlap {
  None, Touch, Cover, Overlap
}
function timeslotsOverlap(slot1: CalendarTimeslot, slot2: CalendarTimeslot): Overlap {
  if (slot1.start <= slot2.start && slot1.end >= slot2.end) {
    return Overlap.Cover;
  } else if ((slot1.start < slot2.start && slot1.end > slot2.start) ||
    (slot1.start < slot2.end && slot1.end > slot2.end)) {
    return Overlap.Overlap;
  } else if ((slot1.start <= slot2.start && slot1.end >= slot2.start) ||
    (slot1.start <= slot2.end && slot1.end >= slot2.end)) {
    return Overlap.Touch;
  } else {
    return Overlap.None;
  }

}

function mergeOverlappingTimeslots() {
  let allOk = false;
  let list = meetingData.selectedTimes;
  while (!allOk) {
    allOk = true;

    outer:
    for (let slot of list) {
      for (let otherSlot of list) {
        if (slot == otherSlot) continue;
        let overlap = timeslotsOverlap(slot, otherSlot);
        switch (overlap) {
          case Overlap.None:
            break;
          case Overlap.Cover:
            // slot1 completely contains otherSlot
            list = list.filter((s) => s != otherSlot);
            allOk = false;
            break outer;
          case Overlap.Overlap:
          case Overlap.Touch:
            // slot overlaps otherSlot
            let newStart = slot.start < otherSlot.start ? slot.start : otherSlot.start;
            let newEnd = slot.end > otherSlot.end ? slot.end : otherSlot.end;
            slot.start = newStart;
            slot.end = newEnd;

            list = list.filter((s) => s != otherSlot);
            allOk = false;
            break outer;
        }
      }
    }
  }
  meetingData.selectedTimes = list;
  meetingProps.saveMeetingData();
}

function addTimeslotViaTap(day: Date, hour: number) {
  // Delay for a bit to allow the user to see the button press
  setTimeout(() => {
    meetingData.selectedTimes.push({
      start: addHours(day, hour),
      end: addHours(day, hour + 1),
    });
    mergeOverlappingTimeslots();
  }, 100);
}
let locale: string;

function formatSelectedTimesDay(date: Date) {
  return date.toLocaleString(locale, { weekday: 'short' }) + " " + date.toLocaleString(locale, { day: '2-digit', month: '2-digit' })
}

function formatSelectedTimeslotTime(slot: CalendarTimeslot) {
  return slot.start.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' }) + " – " +
    slot.end.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' });
}

function removeTimeslot(day: Date, slot: CalendarTimeslot) {
  meetingData.selectedTimes = meetingData.selectedTimes.filter((s) => s.start != slot.start);
  meetingProps.saveMeetingData();
}

let bottomSheetExpanded: Ref<boolean> = useState('bottomSheetExpanded', () => false);

function toggleBottomSheet() {
  bottomSheetExpanded.value = !bottomSheetExpanded.value;
}

let swipeStartY: number | null = null;
function bottomSheetSwipeStart(event: TouchEvent) {
  swipeStartY = event.touches[0].screenY;
}
let minMoveDelta: number;
function bottomSheetSwipeMove(event: TouchEvent) {
  if (event.touches.length != 1 || !swipeStartY) {
    swipeStartY = null;
    return;
  }

  let delta = event.touches[0].screenY - swipeStartY!;
  if (bottomSheetExpanded.value && delta > minMoveDelta) {
    bottomSheetExpanded.value = false;
  } else if (!bottomSheetExpanded.value && delta < -minMoveDelta) {
    bottomSheetExpanded.value = true;
  }
}

let brands = ['google', 'microsoft', 'apple'];
let currentBrand = useState('currentBrand', () => 0);
let nextBrandTimer: NodeJS.Timeout;
function nextBrand() {
  currentBrand.value = (currentBrand.value + 1) % brands.length;
}

let showImportEventsDialog = useState('showImportEventsDialog', () => false);

type DragTimeslotWhich = 'start' | 'end' | 'both';
type DragTimeslot = {
  slot: CalendarTimeslot,
  which: DragTimeslotWhich,

  startY: number,
  currentY: number,
  startTimestamp: number,
};
let draggingTimeslotPosition: Ref<DragTimeslot | null> = useState('draggingTimeslotPosition', () => null);

let longPressing = false;

function dragTimeslotStart(event: TouchEvent | MouseEvent, slot: CalendarTimeslot, which: DragTimeslotWhich, dragY?: number) {
  if (!dragY) return;

  draggingTimeslotPosition.value = { slot, which, startY: dragY, currentY: dragY, startTimestamp: Date.now() };
}

function dragTimeslotMove(event: TouchEvent | MouseEvent, dragY?: number, isTouch: boolean = false) {
  if (!draggingTimeslotPosition.value || !dragY || !event.cancelable) return;

  if (isTouch && draggingTimeslotPosition.value.which == 'both') {
    // Long press only required for touch - moving
    if (!longPressing) {
      if (Math.abs(dragY - draggingTimeslotPosition.value.startY) > 40) {
        draggingTimeslotPosition.value = null; // Cancel drag if moved too much 
        return;
      }
      if (Date.now() - draggingTimeslotPosition.value.startTimestamp > 200) {
        longPressing = true;
      } else {
        return;
      }
    }
  }

  event.preventDefault();
  event.stopPropagation();
  draggingTimeslotPosition.value.currentY = dragY;
}

function dragTimeslotEnd(dragY?: number) {
  longPressing = false;

  if (!draggingTimeslotPosition.value) return;
  let y = dragY || draggingTimeslotPosition.value.currentY;

  draggingTimeslotPosition.value.currentY = y;
  let draggingSlot = getTimeslotWithDrag(draggingTimeslotPosition.value.slot, draggingTimeslotPosition.value);
  draggingTimeslotPosition.value.slot.start = draggingSlot.start;
  draggingTimeslotPosition.value.slot.end = draggingSlot.end;
  mergeOverlappingTimeslots();
  draggingTimeslotPosition.value = null;
}


function getTimeslotWithDrag(slot: CalendarTimeslot, drag: DragTimeslot) {
  let draggingSlot: CalendarTimeslot = {
    start: drag.slot.start,
    end: drag.slot.end,
  };

  let deltaPart = (drag.currentY - drag.startY) / scrollViewportRef.value!.scrollHeight;
  let deltaMinutes = Math.floor((24 * 60 / 15) * (deltaPart)) * 15;

  switch (drag.which) {
    case 'start':
      draggingSlot.start = addMinutes(slot.start, deltaMinutes);
      break;
    case 'end':
      draggingSlot.end = addMinutes(slot.end, deltaMinutes);
      break;
    case 'both':
      draggingSlot.start = addMinutes(slot.start, deltaMinutes);
      draggingSlot.end = addMinutes(slot.end, deltaMinutes);
  }
  return draggingSlot;
}

let swipeStartX: number | null = null;
function weekSwipeStart(event: TouchEvent) {
  swipeStartX = event.touches[0].screenX;
}
function weekSwipeMove(event: TouchEvent) {
  if (event.touches.length < 1 || !swipeStartX) {
    return;
  }

  let delta = event.touches[0].screenX - swipeStartX;
  if (delta > minMoveDelta) {
    toWeek(false);
    swipeStartX = null;
  } else if (delta < -minMoveDelta) {
    toWeek(true);
    swipeStartX = null;
  }
}

function weekSwipeEnd(event: TouchEvent) {
  swipeStartX = null;
}

function scrollToNow() {
  let thisMonday = getStartOfTheWeek(now.value);
  if (currentWeek.value != thisMonday) {
    weekTransitionDirection.value = currentWeek.value < thisMonday;
    currentWeek.value = thisMonday;
  }

  let scrollHeight = scrollViewportRef.value!.scrollHeight;
  let top = scrollHeight * dateToPercentOfDay(now.value) / 100 - 150;
  // console.log(scrollHeight, '*', dateToPercentOfDay(now.value) / 100, '-', 150, '=', top);
  scrollViewportRef.value!.scrollTo({ top: top });
}

function selectedTimesByDay() {
  interface CalendarTimeslotByDay {
    day: Date;
    timeslots: CalendarTimeslot[];
  }

  let selectedTimesByDay: { [date: number]: CalendarTimeslotByDay } = {};
  for (let timeslot of meetingProps.data.selectedTimes) {
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
}

onBeforeMount(() => {
  updateTodayTimer = setInterval(updateToday, 1000);
  nextBrandTimer = setInterval(nextBrand, 5000);
});


onMounted(() => {
  minMoveDelta = Math.min(130, window.innerHeight * 0.15);
  locale = navigator.languages[0] || 'en-US';


  nextTick(() => {
    scrollToNow();
    viewportIsReady.value = true;
  });
});

onUnmounted(() => {
  clearInterval(updateTodayTimer);
  clearInterval(nextBrandTimer);
  clearInterval(updateMeetingInfoTimer);
});

</script>

<template>
  <div class="h-full md:flex md:flex-row-reverse select-none">
    <div class="flex flex-col w-full h-full overflow-hidden  md:ml-3">
      <div class="w-full pt-4 pb-2">
        <!-- Calendar header -->
        <div class="mb-4 flex items-center justify-start gap-4 px-4 text-slate-500">
          <div class="flex flex-row-reverse md:flex-row">
            <!-- Today button, left / right chevrons to navigate weeks, current month -->
            <button
              class="mr-4 flex items-center justify-center px-3 py-1 rounded-md border hover:bg-gray-100 transition-colors"
              @click="scrollToNow">
              Today
            </button>

            <div class="hidden md:flex items-center justify-start gap-2">
              <div
                class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-sm"
                @click="toWeek(false)">
                <font-awesome-icon icon="chevron-left" />
              </div>
              <div
                class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-sm"
                @click="toWeek(true)">
                <font-awesome-icon icon="chevron-right" />
              </div>
            </div>

            <div class="mx-4 flex items-center justify-center text-xl">
              <Transition name="fade" mode="out-in">
                <p :key="currentWeek.toLocaleString(locale, { month: 'long', year: 'numeric' })">
                  <span>{{ currentWeek.toLocaleString(locale, { month: 'long' })
                    }}&nbsp;
                  </span>
                  <span class="hidden md:inline-block">{{ currentWeek.toLocaleString(locale, {
                year: 'numeric'
              })
                    }}
                  </span>
                </p>
              </Transition>
            </div>
          </div>

          <!-- Import button -->
          <button
            class="ml-auto flex items-center justify-center px-3 py-1 rounded-md border hover:bg-gray-100 transition-colors"
            @click="showImportEventsDialog = true">
            <Transition mode="out-in" name="fade">
              <font-awesome-icon :key="currentBrand" :icon="'fa-brands fa-' + brands[currentBrand]" class="w-4 mr-2" />
            </Transition>
            Import Calendar
          </button>
        </div>
        <!-- <div class="relative"> -->
        <Transition :name="weekTransitionDirection ? 'change-week-r' : 'change-week-l'" mode="out-in">
          <div :key="currentWeek.getTime()"
            class="w-full container mx-auto flex justify-stretch items-center px-4 text-gray-500">
            <div class="w-12 flex-shrink-0">
              <!-- Time indicators placeholder -->
            </div>
            <div class="inline-flex flex-col justify-center items-center flex-1 gap-1 text-center text-xs"
              v-for="day in getDaysOfWeek(currentWeek)" :key="day.date.getTime()">
              <div>
                <span class="md:hidden">{{ day.dayOfTheWeek.substring(0, 1).toUpperCase()
                  }}</span>
                <span class="hidden md:block">{{ day.dayOfTheWeek.substring(0, 3).toUpperCase()
                  }}</span>
              </div>
              <span class="inline-flex justify-center items-center w-10 h-10 text-2xl rounded-full"
                :class="{ 'bg-lime-500 text-white': day.isToday }">{{ day.date.getDate()
                }}</span>
            </div>
          </div>
        </Transition>
        <!-- </div> -->
      </div>
      <div class="w-full h-full overflow-scroll overflow-x-hidden" ref="scrollViewportRef">
        <!-- Scrollable -->
        <Transition :name="weekTransitionDirection ? 'change-week-r' : 'change-week-l'" mode="out-in">
          <div :key="currentWeek.getTime()"
            class="container mx-auto w-full flex h-[1300px] py-4 px-2 md:px-4 relative opacity-0 transition-all overflow-hidden"
            :class="{ 'opacity-100': viewportIsReady }" @touchstart="weekSwipeStart" @touchmove="weekSwipeMove">
            <!-- Days viewport (tall) -->
            <div class="absolute top-0 bottom-0 left-0 right-0 my-4 mx-2 md:mx-4">
              <!-- Time indicators -->
              <div v-for="(hour, index) in 24"
                class="absolute h-0 w-full flex justify-stretch items-center gap-2 text-xs text-gray-400" :key="hour"
                :style="{ top: (100 * index / 24) + '%' }">
                <!-- Time indicator -->
                <div>{{ (hour - 1).toString().padStart(2, '0') }}:00</div>
                <div class="w-full border-t bg-gray-200"></div>
              </div>
            </div>
            <span class="w-12 flex-shrink-0"></span>
            <div v-for="(day, index) in  getDaysOfWeek(currentWeek) "
              class="flex-1 h-full relative border-r border-gray-200" :class="{ 'border-l': index == 0 }"
              :key="day.date.toString()" @mousemove="(event) => dragTimeslotMove(event, event.screenY)"
              @mouseup="(event) => dragTimeslotEnd(event.screenY)"
              @touchmove="(event) => dragTimeslotMove(event, event.touches[0] && event.touches[0].screenY, true)"
              @touchend="(event) => dragTimeslotEnd(event.touches[0] && event.touches[0].screenY)">
              <!-- Day -->

              <div class="w-full h-full absolute">

                <!-- Events -->
                <div
                  v-for="group in importedEvents.eventsInOverlapGroups.filter((group) => group.some((event) => isSameDay(event.start, day.date)))"
                  :key="group[0].start.toString()">
                  <!-- Event overlap group -->
                  <div class="absolute left-0 right-1 md:right-2 p-1 md:px-2 md:py-2 overflow-hidden inline-flex flex-col justify-start 
                                    bg-lime-500/80 text-gray-600 rounded-md text-xs break-all"
                    v-for="(event, index) in group" :class="{
                'flex-row gap-4': isShort(event),
                'outline outline-white bg-lime-500 right-0 md:right-0 left-[50%]': index >= 1,
                'pr-[50%]': index == 0 && group.length > 1
              }" :key="event.start.toString()" :style="{
                top: dateToPercentOfDay(event.start) + '%',
                height: 'calc(' + getHeight(event) * 100 + '% - 1px)',
              }" :data-overlay-index="index" :data-overlay-group-size="group.length">
                    <!-- Event -->
                    <span>{{ event.title }}</span>
                    <div class="hidden opacity-80 md:block">
                      <span v-if="!isShort(event)">
                        {{ formatTime(event.start) }} – {{ formatTime(event.end) }}
                      </span>
                      <span v-else>{{ formatTime(event.start) }}</span>
                    </div>
                  </div>
                </div>

                <!-- add time slot buttons -->
                <div class="absolute w-full h-full flex flex-col" :class="{ 'hidden': draggingTimeslotPosition }">
                  <div class="flex-1 m-1 md:m-2" v-for="hour in 24">
                    <!-- add time slot -->
                    <div v-if="showAddTimeslotButtonFor(day.date, hour - 1)" class="w-full h-full bg-blue-200/80 rounded-md flex items-center justify-center
                                    opacity-0 active:opacity-100 md:hover:opacity-100 transition-opacity"
                      @click="addTimeslotViaTap(day.date, hour - 1)">
                      <font-awesome-icon icon="plus" class="text-gray-500" />
                    </div>
                  </div>
                </div>

                <!-- Time slots -->
                <div v-for="slot in  meetingData.selectedTimes.filter((slot) => isSameDay(slot.start, day.date)) "
                  :key="slot.start.toString()"
                  class="
                                    bg-blue-500 absolute left-0 right-1 md:right-2 inline-flex flex-col justify-start text-white rounded-md text-xs break-all group"
                  :style="{
                '-webkit-touch-callout': 'none', top: getTimeslotTop(slot) + '%', height: 'calc('
                  + getTimeslotHeight(slot) * 100 + '% - 1px)',
              }"
                  :class="{ 'striped-background': draggingTimeslotPosition?.slot !== slot || draggingTimeslotPosition?.which !== 'both' }">
                  <!-- Time slot -->
                  <div class="relative h-full py-2 px-1 md:px-2 md:py-2 overflow-hidden">
                    <div class="absolute left-0 right-0 top-3 bottom-3"
                      @touchstart="(event) => dragTimeslotStart(event, slot, 'both', event.touches[0] && event.touches[0].screenY)"
                      @touchcancel="(event) => dragTimeslotEnd(event.touches[0] && event.touches[0].screenY)"
                      @mousedown="(event) => dragTimeslotStart(event, slot, 'both', event.screenY)">
                      <!-- Center drag area for touch -->
                    </div>

                    <span class="transition-all"
                      :class="{ 'opacity-0': isShort(slot) || draggingTimeslotPosition?.slot === slot && draggingTimeslotPosition?.which !== 'both' }">
                      {{ formatTimeslotDuration(slot) }}</span>
                  </div>
                  <!-- Drag handles -->
                  <div class="absolute bg-white/90 outline outline-4 cursor-pointer md:outline-2 outline-blue-400 rounded-full p-1 top-0 left-1 md:right-1 -translate-y-1/2
                                    md:translate-y-0"
                    @mousedown="(event) => dragTimeslotStart(event, slot, 'start', event.screenY)"
                    @touchstart="(event) => dragTimeslotStart(event, slot, 'start', event.touches[0] && event.touches[0].screenY)">
                    <!-- Hover indicator -->
                    <div class="hidden absolute left-0 right-0 text-slate-500 -translate-y-1/2 md:flex justify-center 
                                        opacity-0 transition-opacity group-hover:opacity-100"
                      :class="{ 'opacity-100': draggingTimeslotPosition?.slot === slot }">
                      <font-awesome-icon icon="caret-up" />
                    </div>
                  </div>
                  <div class="absolute bg-white/90 outline outline-4 cursor-pointer md:outline-2 outline-blue-400 rounded-full p-1 bottom-0 right-1 md:left-1 translate-y-1/2
                                    md:translate-y-0"
                    @mousedown="(event) => dragTimeslotStart(event, slot, 'end', event.screenY)"
                    @touchstart="(event) => dragTimeslotStart(event, slot, 'end', event.touches[0] && event.touches[0].screenY)">
                    <!-- Hover indicator -->
                    <div class="hidden absolute left-0 right-0 text-slate-500 -translate-y-1/2 md:flex justify-center 
                                    opacity-0 transition-opacity group-hover:opacity-100"
                      :class="{ 'opacity-100': draggingTimeslotPosition?.slot === slot }">
                      <font-awesome-icon icon="caret-down" />
                    </div>
                  </div>
                </div>

                <!-- Now indicator -->
                <div v-if="day.isToday" class="absolute w-full h-[2px] bg-gray-500 -translate-y-1/2"
                  :style="{ top: dateToPercentOfDay(now) + '%' }">
                  <!-- Dot -->
                  <div class="absolute w-3 h-3 bg-gray-500 rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Sidebar / bottom bar -->

    <div class="flex-shrink-0 absolute top-0 w-full h-full md:relative md:p-2 md:w-64 pointer-events-none"
      @touchmove.passive="bottomSheetSwipeMove">

      <!-- Sidebar with bg overlay -->
      <div class="w-full h-full absolute transition-all md:hidden"
        :class="{ 'bg-black/40 pointer-events-auto': bottomSheetExpanded }" @click="bottomSheetExpanded = false">
      </div>

      <!-- Sidebar -->
      <div class="w-full absolute bottom-0 px-3 md:py-8 bg-white border-t rounded-tr-2xl rounded-tl-2xl flex flex-col overflow-hidden
                h-16 data-[expanded=true]:h-[80%] md:data-[expanded=true]:h-full
                 md:h-full md:border-0 md:border-r md:rounded-none pointer-events-auto
                    shadow-[0_-5px_11px_0_rgba(0,0,0,0.1)] md:shadow-none z-10 transition-all"
        :data-expanded="bottomSheetExpanded">

        <!-- Sidebar head -->
        <div @click="toggleBottomSheet" @touchstart="bottomSheetSwipeStart"
          class="w-full py-4 md:pt-0 flex flex-col items-center gap-4">
          <div class="h-1 bg-slate-400 rounded-md w-12 md:hidden"></div> <!-- Drag-bar -->
          <p class="text-xl text-slate-600">Your Event</p>
        </div>

        <div class="h-full overflow-auto">
          <div class=" pb-8">
            <label class="text-gray-500 mt-4">Title</label>
            <input type="text" v-model="meetingData.title" @input="(_) => meetingProps.saveMeetingData()" name="title"
              maxlength="100"
              class="bg-gray-50 border border-gray-400 text-gray-800 text-sm rounded-lg focus:ring-blue-200 block w-full p-2.5"
              placeholder="Event title (optional)" :required="false" />

            <!-- Timeslots by day -->
            <p class="text-gray-500 mt-4">Selected times</p>
            <div class="flex flex-col gap-2 mt-2 text-sm">
              <p v-if="meetingData.selectedTimes.length == 0" class="text-gray-500">No times
                selected yet
              </p>
              <div v-for=" slots in selectedTimesByDay()" class="flex flex-col gap-2 bg-gray-100 py-2 rounded-md">
                <p class="text-slate-600 px-2">{{ formatSelectedTimesDay(slots.day) }}</p>
                <div class="text-slate-500 flex justify-between pr-2 hover:bg-slate-500/10 px-2"
                  v-for=" slot  in  slots.timeslots ">
                  <span>{{ formatTime(slot.start) }} – {{ formatTime(slot.end) }}</span>
                  <button class="rounded-full hover:bg-slate-500/20 h-6 w-6"
                    @click="() => removeTimeslot(slots.day, slot)"><font-awesome-icon icon="times" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <NuxtLink to="/meeting/[...meetingId]/invite" class="absolute right-10 bg-blue-600 rounded-full w-12 h-12 mt-auto flex items-center justify-center cursor-pointer shadow-xl
                hover:bg-blue-500 bottom-24 md:bottom-10">
    <font-awesome-icon icon="arrow-right" class="text-white" />
  </NuxtLink>

  <CalendarImportDialog :isOpen="showImportEventsDialog" :closeModal="() => showImportEventsDialog = false" />
</template>

<style>
.striped-background {
  background: repeating-linear-gradient(-225deg, #2585e9ba, #2585e9ba 10px, #2585e9 10px, #2585e9 20px);
}

/* Transitions */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.change-week-l-enter-active,
.change-week-r-enter-active {
  transition: all 0.1s ease-out;
}

.change-week-l-leave-active,
.change-week-r-leave-active {
  transition: all 0.1s ease-in;
}

.change-week-l-leave-to,
.change-week-r-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.change-week-l-enter-from,
.change-week-r-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>