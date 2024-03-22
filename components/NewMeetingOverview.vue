<script lang="ts" setup>
import { add, isSameDay, previousMonday, isMonday, addSeconds, addMinutes, addHours, formatDuration, intervalToDuration, getDay, getDate, set } from "date-fns";
import { type CalendarTimeslot } from '~/data/Meeting';

useHead({
  title: "quando.events",
  meta: [
    {
      name: "description",
      content: "Schedule a new meeting with quando.events"
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0, maximum-scale=1.0"
    }
  ]
});

let props = defineProps<{
  meetingId: string,
}>();

let newMeetingStore = useNewMeetingStore(props.meetingId);
let newMeetingStoreRef = storeToRefs(newMeetingStore);
let meetingData = newMeetingStoreRef.data as Ref<MeetingData>; // Ensured by NewMeetingWrapper

let userInfo = useUserInfoStore();

let importedEvents = useImportedCalendarEventsStore();

let now = useState('today', () => new Date());
function updateToday() {
  now.value = new Date();
}
let updateTodayTimer: NodeJS.Timeout;

const scrollViewportRef = ref<HTMLDivElement>();
const viewportIsReady = useState('viewportIsReady', () => false);

let showDaysRange = 5;

let daysOfTheWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

let currentRangeStart = useState('currentWeek', () => new Date(now.value));
let weekTransitionDirection = useState('lastWeekChange', () => true); // True for right, false for left. Used for transition
function toWeek(next: boolean) {
  weekTransitionDirection.value = next;
  setTimeout(() => {
    currentRangeStart.value = add(currentRangeStart.value, { days: next ? showDaysRange : -showDaysRange });
  }, 0);
}

type DayOfTheWeek = {
  dayOfTheWeek: string,
  date: Date,
  isToday: boolean,
  showAddTimeslotHint?: number
};

function getDaysOfTimeRange(start: Date): DayOfTheWeek[] {
  let startDay = getDay(start) - 1;
  let days = [] as DayOfTheWeek[];
  for (let i = 0; i < showDaysRange; i++) {
    let day = daysOfTheWeek[(startDay + i) % daysOfTheWeek.length];
    let date = add(start, { days: i });
    days.push({
      dayOfTheWeek: day,
      date: date,
      isToday: isSameDay(now.value, date),
      showAddTimeslotHint: isSameDay(add(now.value, { days: 1 }), date) ? set(now.value, { minutes: 0, seconds: 0, milliseconds: 0 }).getHours() : undefined,
    });
  }
  return days;
}

function dateToPercentOfDay(date: Date) {
  let oneDayMinutes = 24 * 60;
  let dateDayMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  return 100 * dateDayMinutes / oneDayMinutes;
}

function getTimeslotTop(slot: CalendarTimeslot | OverlapSlot): number {
  let actualSlot = 'original' in slot ? slot.overlap : slot;
  let originalSlot = 'original' in slot ? slot.original : slot;

  if (draggingTimeslotPosition.value && draggingTimeslotPosition.value.slot == originalSlot) {
    let draggingSlot = getTimeslotWithDrag(actualSlot, draggingTimeslotPosition.value);
    if (draggingSlot) {
      return dateToPercentOfDay(draggingSlot.start);
    } else {
      return 0;
    }
  } else {
    return dateToPercentOfDay(actualSlot.start);
  }
}
function getTimeslotHeight(slot: CalendarTimeslot | OverlapSlot): number {
  let actualSlot = 'original' in slot ? slot.overlap : slot;
  let originalSlot = 'original' in slot ? slot.original : slot;

  if (draggingTimeslotPosition.value && draggingTimeslotPosition.value.slot == originalSlot) {
    let draggingSlot = getTimeslotWithDrag(actualSlot, draggingTimeslotPosition.value);
    if (draggingSlot) {
      return getHeight(draggingSlot);
    } else {
      return 0;
    }
  } else {
    return getHeight(actualSlot);
  }
}

function formatTime(date: Date) {
  return date.getHours().toString() + ":" + date.getMinutes().toString().padStart(2, '0');
}

function showAddTimeslotButtonFor(day: Date, hour: number) {
  let timeslot: CalendarTimeslot = {
    start: addHours(day, hour),
    end: addHours(day, hour + 1),
  };
  return meetingData.value.selectedTimes.every((slot2) => timeslotsOverlap(timeslot, slot2) in [Overlap.None, Overlap.Touch]);
}

enum Overlap {
  None, Touch, Cover, Overlap
}
function timeslotsOverlap(slot1: CalendarTimeslot, slot2: CalendarTimeslot): Overlap {
  if ((slot1.start <= slot2.start && slot1.end >= slot2.end) || (slot1.start >= slot2.start && slot1.end <= slot2.end)) {
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
  let list = meetingData.value.selectedTimes;
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
  meetingData.value.selectedTimes = list;
  newMeetingStore.save();
}

function addTimeslotViaTap(day: Date, hour: number) {
  console.log("add")
  // Delay for a bit to allow the user to see the button press
  setTimeout(() => {
    meetingData.value.selectedTimes.push({
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
  meetingData.value.selectedTimes = meetingData.value.selectedTimes.filter((s) => s.start != slot.start);
  newMeetingStore.save();
}

let bottomSheetExpanded: Ref<boolean> = useState('bottomSheetExpanded', () => false);
let bottomSheetScrollViewportRef = ref<HTMLDivElement>();

function toggleBottomSheet() {
  bottomSheetExpanded.value = !bottomSheetExpanded.value;
}

let swipeStart: { y: number, time: number } | null = null;
function bottomSheetSwipeStart(event: TouchEvent) {
  swipeStart = { y: event.touches[0].screenY, time: new Date().getTime() };
}
let minMoveDelta: number;
let minMomentum: number = 1;

// Used to detect movement direction and prevent swipe to refresh
let bottomSheetSwipeStartFromAnywhere: number | null = null;
function bottomSheetSwipeStartFromBody(event: TouchEvent) {
  bottomSheetSwipeStartFromAnywhere = event.touches[0].screenY;
}

function bottomSheetSwipeMove(event: TouchEvent) {
  if (event.touches.length != 1) {
    swipeStart = null;
    return;
  }

  let touchY = event.touches[0].screenY;
  if (!swipeStart) {
    if (bottomSheetScrollViewportRef.value?.scrollTop == 0 &&
      bottomSheetSwipeStartFromAnywhere && bottomSheetSwipeStartFromAnywhere - touchY < 0) {
      // Prevent accidental swipe to refresh
      event.preventDefault();
      event.stopPropagation();
    }
    return;
  }

  let swipeStartY = swipeStart.y;
  let delta = touchY - swipeStartY!;
  let momentum = delta / (new Date().getTime() - swipeStart.time);

  if (bottomSheetExpanded.value && (delta > minMoveDelta || momentum > minMomentum)) {
    bottomSheetExpanded.value = false;
  } else if (!bottomSheetExpanded.value && (delta < -minMoveDelta) || momentum < -minMomentum) {
    bottomSheetExpanded.value = true;
  }

  // debugger
  event.preventDefault();
  event.stopPropagation();
}

function bottomSheetSwipeEnd(event: TouchEvent) {
  swipeStart = null;
}

let brands = ['google']; // , 'microsoft', 'apple'
let currentBrand = useState('currentBrand', () => 0);
let nextBrandTimer: NodeJS.Timeout;
function nextBrand() {
  currentBrand.value = (currentBrand.value + 1) % brands.length;
}

let showImportEventsDialog = useState('showImportEventsDialog', () => false);
let showInviteDialog = useState('showInviteDialog', () => false);

type DragTimeslotWhich = 'start' | 'end' | 'both';
type DragTimeslot = {
  slot: CalendarTimeslot,
  which: DragTimeslotWhich,

  startY: number,
  currentY: number,
  startTimestamp: number,
};
let draggingTimeslotPosition: Ref<DragTimeslot | null> = useState('draggingTimeslotPosition', () => null);

let longPressing = ref(false);
let longPressStartTimer: NodeJS.Timeout | null = null;

function dragTimeslotStart(event: TouchEvent | MouseEvent, slot: CalendarTimeslot, which: DragTimeslotWhich, dragY?: number, isTouch: boolean = false) {
  if (!dragY) return;

  draggingTimeslotPosition.value = { slot, which, startY: dragY, currentY: dragY, startTimestamp: Date.now() };
  if (isTouch) {
    longPressStartTimer = setTimeout(() => {
      longPressing.value = true;
    }, 300);
  }
}

function cancelLongPress() {
  longPressing.value = false;
  if (longPressStartTimer) {
    clearTimeout(longPressStartTimer);
  }
}

function dragTimeslotMove(event: TouchEvent | MouseEvent, dragY?: number, isTouch: boolean = false) {
  if (!draggingTimeslotPosition.value || !dragY || !event.cancelable) {
    cancelLongPress();
    return;
  }


  if (isTouch && draggingTimeslotPosition.value.which == 'both') {
    // Long press is required for touch-and-drag gesture
    if (!longPressing.value) {
      if (Math.abs(dragY - draggingTimeslotPosition.value.startY) > 40) { // moved too much 
        cancelLongPress();
      }

      return;
    }
  }

  event.preventDefault();
  event.stopPropagation();
  draggingTimeslotPosition.value.currentY = dragY;
}

function dragTimeslotEnd(dragY?: number) {
  longPressing.value = false;

  if (!draggingTimeslotPosition.value) return;
  let y = dragY || draggingTimeslotPosition.value.currentY;

  draggingTimeslotPosition.value.currentY = y;
  let originalSlot = draggingTimeslotPosition.value.slot;
  let draggingSlot = getTimeslotWithDrag(originalSlot, draggingTimeslotPosition.value);
  if (!draggingSlot) {
    meetingData.value.selectedTimes = meetingData.value.selectedTimes.filter((s) => s != originalSlot);
  } else {
    draggingTimeslotPosition.value.slot.start = draggingSlot.start;
    draggingTimeslotPosition.value.slot.end = draggingSlot.end;
  }
  mergeOverlappingTimeslots();
  draggingTimeslotPosition.value = null;
}

function coerce(date: Date, min?: Date, max?: Date) {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

function getTimeslotWithDrag(slot: CalendarTimeslot, drag: DragTimeslot): CalendarTimeslot | null {
  let draggingSlot: CalendarTimeslot = {
    start: drag.slot.start,
    end: drag.slot.end,
  };

  let deltaPart = (drag.currentY - drag.startY) / scrollViewportRef.value!.scrollHeight;
  let deltaMinutes = Math.floor((24 * 60 / 15) * (deltaPart)) * 15;
  let dayStart = new Date(drag.slot.start.getTime());
  dayStart.setHours(0, 0, 0, 0);
  let dayEnd = add(dayStart, { days: 1 });
  // debugger;

  switch (drag.which) {
    case 'start':
      draggingSlot.start = coerce(addMinutes(slot.start, deltaMinutes), dayStart, slot.end);
      break;
    case 'end':
      draggingSlot.end = coerce(addMinutes(slot.end, deltaMinutes), slot.start, dayEnd);
      break;
    case 'both':
      draggingSlot.start = coerce(addMinutes(slot.start, deltaMinutes), dayStart, dayEnd);
      draggingSlot.end = coerce(addMinutes(slot.end, deltaMinutes), dayStart, dayEnd);
  }
  if (draggingSlot.start >= draggingSlot.end) return null;
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

function formatNames(names: string[]) {
  if (names.length == 1) {
    return names[0];
  } else if (names.length == 2) {
    return names.join(" and ");
  } else {
    return names.slice(0, names.length - 1).join(", ") + " and " + names[names.length - 1];
  }
}

function scrollToNow(smooth: boolean = true) {
  scrollTo(now.value, { smooth: smooth });
}

let highlightedTimeslot = ref<CalendarTimeslot | null>(null);

type ScrollToOptions = {
  smooth?: boolean,
  highlight?: CalendarTimeslot
};
function scrollTo(date: Date, options: ScrollToOptions = {}) {
  let thisMonday = getStartOfTheWeek(date);
  if (currentRangeStart.value != thisMonday) {
    weekTransitionDirection.value = currentRangeStart.value < thisMonday;
    currentRangeStart.value = thisMonday;
  }

  let scrollHeight = scrollViewportRef.value!.scrollHeight;
  let top = scrollHeight * dateToPercentOfDay(date) / 100 - 150;
  // console.console.log(scrollHeight, '*', dateToPercentOfDay(date) / 100, '-', 150, '=', top);
  scrollViewportRef.value!.scrollTo({ top: top, behavior: options.smooth ? 'smooth' : 'auto' });

  if (options.highlight) {
    highlightedTimeslot.value = options.highlight;
    setTimeout(() => {
      highlightedTimeslot.value = null;
    }, 1000);
  }
}

function getTimeslotsByDay(slots: CalendarTimeslot[]) {
  interface CalendarTimeslotByDay {
    day: Date;
    timeslots: CalendarTimeslot[];
  }

  let selectedTimesByDay: { [date: number]: CalendarTimeslotByDay } = {};
  for (let timeslot of slots) {
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

type OverlapSlot = {
  original: CalendarTimeslot,
  overlap: CalendarTimeslot,
}

function getFullOverlapTimeslots(slots: CalendarTimeslot[]): OverlapSlot[] {
  if (meetingData.value.members.length == 0) return [];

  let allCroppedSlots = [] as OverlapSlot[];
  for (let slot of slots) {
    let croppedSlots = [{ overlap: slot, original: slot }] as OverlapSlot[];

    for (let member of meetingData.value.members) {
      if (member.id == userInfo.id) continue;

      let croppedSlotsForMember: OverlapSlot[] = [];
      for (let croppedSlot of croppedSlots) {
        let s1 = croppedSlot.overlap;
        for (let otherSlot of member.times) {
          let s2 = otherSlot;

          if ((s1.start <= s2.start && s1.end >= s2.end) || (s1.start >= s2.start && s1.end <= s2.end)) {
            croppedSlotsForMember.push(
              {
                overlap: {
                  start: s1.start > s2.start ? s1.start : s2.start,
                  end: s1.end < s2.end ? s1.end : s2.end,
                } as CalendarTimeslot,
                original: slot
              },
            );
          } else if ((s1.start < s2.start && s1.end > s2.start) ||
            (s1.start < s2.end && s1.end > s2.end)) {
            croppedSlotsForMember.push(
              {
                overlap: {
                  start: s1.start > s2.start ? s1.start : s2.start,
                  end: s1.end < s2.end ? s1.end : s2.end,
                } as CalendarTimeslot,
                original: slot
              }
            );
          }
        }
      }

      croppedSlots = croppedSlotsForMember;
    }

    allCroppedSlots = allCroppedSlots.concat(croppedSlots);
  }
  return allCroppedSlots;
};

function hideTextInTimeslot(slot: CalendarTimeslot): boolean {
  if (meetingData.value.members.length === 0) return false;

  let isFullOverlap = meetingData.value.members.every((member) => {
    if (member.id == userInfo.id) return true;
    return member.times.some((slot2) => slot2.start <= slot.start && slot2.end > slot.start);
  });

  return isFullOverlap;
}

onBeforeMount(() => {
  updateTodayTimer = setInterval(updateToday, 1000);
  nextBrandTimer = setInterval(nextBrand, 5000);
});


onMounted(() => {
  minMoveDelta = Math.min(130, window.innerHeight * 0.15);
  locale = navigator.languages[0] || 'en-US';

  // Show more days on larger screens
  showDaysRange = window.innerWidth < 640 ? 5 : 7;

  nextTick(() => {
    scrollToNow(false);
    viewportIsReady.value = true;
  });
});

onUnmounted(() => {
  clearInterval(updateTodayTimer);
  clearInterval(nextBrandTimer);
});

</script>

<template>
  <div class="w-full h-full flex flex-col overflow-hidden relative">
    <!-- app header -->
    <div
      class="flex-shrink-0 bg-accent-light flex items-center justify-start gap-4 py-4 px-4 text-accent-800 shadow-sm z-20">
      <a href="/" class="ml-4 hover:underline font-bold flex gap-3 items-center">
        quando.events
      </a>
      <div>
      </div>
    </div>
    <!-- actual content -->
    <div class="flex-1 h-full flex flex-col overflow-hidden md:flex-row-reverse select-none">
      <div class="flex flex-col w-full h-full overflow-hidden md:pb-6 md:ml-3">
        <div class="w-full pt-4 pb-2">
          <!-- Calendar header -->
          <div class="mb-4 flex items-center justify-start gap-4 px-4 text-slate-500">
            <div class="flex flex-row-reverse md:flex-row">
              <!-- Today button, left / right chevrons to navigate weeks, current month -->
              <button
                class="mr-4 flex items-center justify-center px-3 py-1 rounded-md border hover:bg-gray-100 transition-colors"
                @click="scrollToNow()">
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
                  <p :key="currentRangeStart.toLocaleString(locale, { month: 'long', year: 'numeric' })">
                    <span>{{ currentRangeStart.toLocaleString(locale, { month: 'long' })
                      }}&nbsp;
                    </span>
                    <span class="hidden md:inline-block">{{ currentRangeStart.toLocaleString(locale, {
                  year: 'numeric'
                })
                      }}
                    </span>
                  </p>
                </Transition>
              </div>
            </div>

            <!-- Import button -->
            <!-- <button
              class="ml-auto flex items-center justify-center px-3 py-1 rounded-md border hover:bg-gray-100 transition-colors"
              @click="showImportEventsDialog = true">
              <Transition mode="out-in" name="fade">
                <font-awesome-icon :key="currentBrand" :icon="'fa-brands fa-' + brands[currentBrand]"
                  class="w-4 mr-2" />
              </Transition>
              <span>Import</span>
              <span class="hidden md:block">&nbsp;Calendar</span>
            </button> -->
          </div>
          <!-- <div class="relative"> -->
          <Transition :name="weekTransitionDirection ? 'change-week-r' : 'change-week-l'" mode="out-in">
            <div :key="currentRangeStart.getTime()"
              class="w-full container mx-auto flex justify-stretch items-center px-4 text-gray-500">
              <div class="w-12 flex-shrink-0">
                <!-- Time indicators placeholder -->
              </div>
              <div class="inline-flex flex-col justify-center items-center flex-1 gap-1 text-center text-xs"
                v-for="day in getDaysOfTimeRange(currentRangeStart)" :key="day.date.getTime()">
                <div>
                  <span class="md:hidden">{{ day.dayOfTheWeek.substring(0, 1).toUpperCase()
                    }}</span>
                  <span class="hidden md:block">{{ day.dayOfTheWeek.substring(0, 3).toUpperCase()
                    }}</span>
                </div>
                <span class="inline-flex justify-center items-center w-10 h-10 text-2xl rounded-full"
                  :class="{ 'bg-accent-dark text-white': day.isToday }">{{ day.date.getDate()
                  }}</span>
              </div>
            </div>
          </Transition>
          <!-- </div> -->
        </div>
        <div class="w-full h-full overflow-scroll overflow-x-hidden" ref="scrollViewportRef">
          <!-- Scrollable -->
          <div class="mb-36 md:mb-0">
            <Transition :name="weekTransitionDirection ? 'change-week-r' : 'change-week-l'" mode="out-in">
              <div :key="currentRangeStart.getTime()"
                class="container mx-auto w-full flex h-[1300px] py-4 px-2 md:px-4 relative opacity-0 transition-all overflow-hidden"
                :class="{ 'opacity-100': viewportIsReady }" @touchstart="weekSwipeStart" @touchmove="weekSwipeMove">
                <!-- Days viewport (tall) -->
                <div class="absolute top-0 bottom-0 left-0 right-0 my-4 mx-2 md:mx-4">
                  <!-- Time indicators -->
                  <div v-for="(hour, index) in 24"
                    class="absolute h-0 w-full flex justify-stretch items-center gap-2 text-xs text-gray-400"
                    :key="hour" :style="{ top: (100 * index / 24) + '%' }">
                    <!-- Time indicator -->
                    <div>{{ (hour - 1).toString().padStart(2, '0') }}:00</div>
                    <div class="w-full border-t"></div>
                  </div>
                </div>
                <span class="w-12 flex-shrink-0"></span>
                <div v-for="(day, index) in   getDaysOfTimeRange(currentRangeStart)  "
                  class="flex-1 h-full relative border-r border-gray-200" :class="{ 'border-l': index == 0 }"
                  :key="day.date.toString()" @mousemove="(event) => dragTimeslotMove(event, event.screenY)"
                  @mouseup="(event) => dragTimeslotEnd(event.screenY)"
                  @mouseleave="(event) => dragTimeslotEnd(event.screenY)"
                  @touchmove="(event) => dragTimeslotMove(event, event.touches[0] && event.touches[0].screenY, true)"
                  @touchend="(event) => dragTimeslotEnd(event.touches[0] && event.touches[0].screenY)"
                  @touchcancel="(event) => dragTimeslotEnd(event.touches[0] && event.touches[0].screenY)">
                  <!-- Day -->

                  <div class="w-full h-full absolute">

                    <!-- Events -->
                    <div
                      v-for="group in importedEvents.eventsInOverlapGroups.filter((group) => group.some((event) => isSameDay(event.start, day.date)))"
                      :key="group[0].start.toString()">
                      <!-- Event overlap group -->
                      <div class="absolute left-0 right-1 md:right-2 p-1 md:px-2 md:py-2 overflow-hidden inline-flex flex-col justify-start 
                                    bg-secondary/80 text-secondary-800 rounded-md text-xs break-all"
                        v-for="(event, index) in group" :class="{
                  'flex-row gap-4': isShort(event),
                  'outline outline-white bg-secondary right-0 md:right-0 left-[50%]': index >= 1,
                  'pr-[50%]': index == 0 && group.length > 1
                }" :key="event.start.toString()" :style="{
                  top: dateToPercentOfDay(event.start) + '%',
                  height: 'calc(' + getHeight(event) * 100 + '% - 1px)',
                }" :data-overlay-index="index" :data-overlay-group-size="group.length">
                        <!-- Event -->
                        <span>{{ event.title }}</span>
                        <div class="hidden opacity-80 mt-1 md:block">
                          <span v-if="!isShort(event)">
                            {{ formatTime(event.start) }} – {{ formatTime(event.end) }}
                          </span>
                          <span v-else>{{ formatTime(event.start) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Other members' time slots -->
                    <div v-for="member in  meetingData.members " class="w-full h-full absolute pointer-events-none">
                      <div v-for="slot in  member.times.filter((slot) => isSameDay(slot.start, day.date))  " class="bg-gradient-to-br from-secondary/50 to-secondary-300/50
                        absolute left-0 right-1 md:right-2 inline-flex flex-col justify-start text-secondary-800 rounded-md text-xs break-all
                    py-2 px-1 md:px-2 md:py-2 overflow-hidden" :style="{
                  top: getTimeslotTop(slot) + '%', height: 'calc('
                    + getTimeslotHeight(slot) * 100 + '% - 1px)',
                }">
                        <span class="transition-all"
                          :class="{ 'opacity-0': isShort(slot) || draggingTimeslotPosition?.slot === slot && draggingTimeslotPosition?.which !== 'both' }">
                          {{ member.name }}</span>
                      </div>
                    </div>

                    <!-- add time slot buttons -->
                    <div class="absolute w-full h-full flex flex-col" :class="{ 'hidden': draggingTimeslotPosition }">
                      <div class="flex-1 m-1 md:m-2" v-for="hour in 24">
                        <!-- add time slot -->
                        <button v-if="showAddTimeslotButtonFor(day.date, hour - 1)"
                          class="w-full h-full rounded-md flex items-center justify-center relative
                                    active:opacity-100 md:hover:bg-accent-light md:hover:opacity-100 transition-opacity"
                          :class="day.showAddTimeslotHint === (hour - 1) && meetingData.selectedTimes.length === 0 ? 'bg-accent-light/70' : 'bg-accent-light opacity-[1%]'"
                          @click="addTimeslotViaTap(day.date, hour - 1)">
                          <font-awesome-icon icon="plus" class="text-accent-800" />
                          <div v-if="day.showAddTimeslotHint === (hour - 1) && meetingData.selectedTimes.length === 0"
                            class="pointer-events-none absolute translate-y-2/3 translate-x-2/3 z-10">
                            <div class="rounded-2xl bg-gray-100 py-2 px-4 w-36 shadow-lg pointer-hint-anim">
                              <div class="absolute -left-2 -top-2 text-3xl -rotate-12">
                                <font-awesome-icon :icon="['fas', 'hand-pointer']" class="absolute text-white" />
                                <font-awesome-icon :icon="['far', 'hand-pointer']" class="absolute text-slate" />
                              </div>
                              Tap to select when you're available
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <!-- Time slots: content -->
                    <div v-for="slot in  meetingData.selectedTimes.filter((slot) => isSameDay(slot.start, day.date)) "
                      :key="'content ' + slot.start.toString()"
                      class="bg-gradient-to-bl from-accent-light to-accent-300  bg-accent absolute left-0 right-1 md:right-2 inline-flex flex-col justify-start text-accent-800 rounded-md text-xs break-all group transition-colors transition-shadow"
                      :class="{
                  'highlighted': highlightedTimeslot === slot,
                  'bg-accent-light shadow-lg': draggingTimeslotPosition?.slot === slot && (draggingTimeslotPosition.which === 'both' ? longPressing : true)
                }" :style="{
                  '-webkit-touch-callout': 'none', top: getTimeslotTop(slot) + '%', height: 'calc('
                    + getTimeslotHeight(slot) * 100 + '% - 1px)',
                }">
                      <!-- Time slot content -->
                      <div class="relative h-full py-2 px-1 md:px-2 md:py-2 overflow-hidden">
                        <span class="transition-all"
                          :class="{ 'opacity-0': hideTextInTimeslot(slot) || isShort(slot) || (draggingTimeslotPosition?.slot === slot && draggingTimeslotPosition?.which !== 'both') }">
                          You</span>
                      </div>
                    </div>

                    <!-- Time slot overlaps -->
                    <div
                      v-for="slot in getFullOverlapTimeslots(meetingData.selectedTimes.filter((slot) => isSameDay(slot.start, day.date))) "
                      :key="'overlap' + slot.original.start.toString()"
                      class="pointer-events-none absolute left-0 right-1 md:right-2 inline-flex flex-col justify-start text-accent-800 rounded-md text-xs break-all group"
                      :style="{
                  top: getTimeslotTop(slot) + '%', height: 'calc('
                    + getTimeslotHeight(slot) * 100 + '% - 1px)',
                }" :class="{ 'overlap-striped': !(draggingTimeslotPosition?.slot === slot.original && (draggingTimeslotPosition.which === 'both' ? longPressing : true)) }">
                      <div class="relative h-full py-2 px-1 md:px-2 md:py-2 overflow-hidden">
                        <span class="transition-all"
                          :class="{ 'opacity-0': isShort(slot.overlap) || (draggingTimeslotPosition?.slot === slot.original && (draggingTimeslotPosition.which === 'both' ? longPressing : true)) }">
                          {{ formatNames(['You', ...meetingData.members.map((m) => m.name)]) }}</span>
                      </div>
                    </div>

                    <!-- Time slots: drag areas -->
                    <div v-for="slot in  meetingData.selectedTimes.filter((slot) => isSameDay(slot.start, day.date)) "
                      :key="'drag' + slot.start.toString()"
                      class="absolute left-0 right-1 md:right-2 inline-flex flex-col justify-start text-xs group"
                      :style="{
                  '-webkit-touch-callout': 'none', top: getTimeslotTop(slot) + '%', height: 'calc('
                    + getTimeslotHeight(slot) * 100 + '% - 1px)',
                }">
                      <!-- TODO: not sure why, but i think because of the key change, the drag handles disappear for a frame when finishing a drag -->
                      <!-- Time slot: Center drag area -->
                      <div class="relative h-full py-2 px-1 md:px-2 md:py-2 overflow-hidden">
                        <div class="absolute left-0 right-0 top-3 bottom-3"
                          @touchstart="(event) => dragTimeslotStart(event, slot, 'both', event.touches[0] && event.touches[0].screenY, true)"
                          @touchcancel="(event) => dragTimeslotEnd(event.touches[0] && event.touches[0].screenY)"
                          @mousedown="(event) => dragTimeslotStart(event, slot, 'both', event.screenY)">
                          <!-- Center drag area for touch -->
                        </div>
                      </div>
                      <!-- Drag handles -->
                      <div class="absolute bg-white border-4 border-accent cursor-pointer md:border-2 rounded-full p-1.5 top-0 left-1 right-1 -translate-y-1/2
                                     md:group-hover:shadow-lg transition-opacity md:opacity-0 md:group-hover:opacity-100"
                        @mousedown="(event) => dragTimeslotStart(event, slot, 'start', event.screenY)"
                        @touchstart="(event) => dragTimeslotStart(event, slot, 'start', event.touches[0] && event.touches[0].screenY)">
                        <!-- Hover indicator -->
                        <div class="hidden absolute left-0 right-0 text-slate-500 -translate-y-1/2 md:flex justify-center 
                                        " :class="{ 'opacity-100': draggingTimeslotPosition?.slot === slot }">
                          <font-awesome-icon icon="caret-up" />
                        </div>
                      </div>
                      <div class="absolute bg-white border-4 border-accent cursor-pointer md:border-2 rounded-full p-1.5 bottom-0 right-1 left-1 translate-y-1/2
                                    md:group-hover:shadow-lg transition-opacity md:opacity-0 md:group-hover:opacity-100"
                        @mousedown="(event) => dragTimeslotStart(event, slot, 'end', event.screenY)"
                        @touchstart="(event) => dragTimeslotStart(event, slot, 'end', event.touches[0] && event.touches[0].screenY)">
                        <!-- Hover indicator -->
                        <div class="hidden absolute left-0 right-0 text-slate-500 -translate-y-1/2 md:flex justify-center 
                                    " :class="{ 'opacity-100': draggingTimeslotPosition?.slot === slot }">
                          <font-awesome-icon icon="caret-down" />
                        </div>
                      </div>
                    </div>

                    <!-- Now indicator -->
                    <div v-if="day.isToday"
                      class="pointer-events-none absolute w-full h-[2px] bg-gray-500 -translate-y-1/2"
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
      </div>

      <!-- Sidebar / bottom bar -->

      <div class="flex-shrink-0 absolute top-0 w-full h-full md:relative md:p-2 md:w-64 pointer-events-none"
        @touchstart.passive="bottomSheetSwipeStartFromBody" @touchmove="bottomSheetSwipeMove"
        @touchend="bottomSheetSwipeEnd">

        <!-- Sidebar bg overlay -->
        <div class="w-full h-full absolute transition-all md:hidden"
          :class="{ 'bg-black/40 pointer-events-auto': bottomSheetExpanded }" @click="bottomSheetExpanded = false">
        </div>

        <!-- Sidebar hint shadow -->
        <div class="w-full h-full absolute transition-all md:hidden"
          :class="{ 'bg-black/40 pointer-events-auto': bottomSheetExpanded }" @click="bottomSheetExpanded = false">
        </div>

        <!-- Sidebar -->
        <div class="w-full absolute bottom-0 md:py-8 bg-white border-t rounded-tr-3xl rounded-tl-3xl flex flex-col overflow-hidden
                h-20 data-[expanded=true]:h-[80%] md:data-[expanded=true]:h-full
                 md:h-full md:border-0 md:border-r md:rounded-none pointer-events-auto
                    shadow-[0_-5px_11px_0_rgba(0,0,0,0.1)] md:shadow-none z-10 transition-all"
          :data-expanded="bottomSheetExpanded">

          <!-- Sidebar head -->
          <div @click="toggleBottomSheet" @touchstart="bottomSheetSwipeStart"
            class="w-full py-4 md:pt-0 flex flex-col items-center gap-4 px-3">
            <div class="h-1 bg-slate-400 rounded-md w-12 md:hidden"></div> <!-- Drag-bar -->
            <p class="text-xl text-slate-600">
              {{ meetingData.title || "Event Details" }}
            </p>
          </div>

          <div class="h-full overflow-auto px-3" ref="bottomSheetScrollViewportRef">
            <div class=" pb-8">
              <label class="text-gray-500 mt-4">Title</label>
              <input type="text" v-model="meetingData.title" @input="(_) => newMeetingStore.save()" name="title"
                maxlength="100"
                class="bg-gray-50 border border-gray-400 text-gray-800 text-sm rounded-lg block w-full p-2.5"
                placeholder="Event title (optional)" :required="false" />

              <!-- Timeslots by day -->
              <p v-if="meetingData.selectedTimes.length == 0" class="text-gray-500">
                Select times for the event to get started
              </p>
              <div v-else>
                <p class="text-gray-500 mt-4">Selected times</p>
                <div class="flex flex-col gap-2 mt-2 text-sm mb-16">
                  <div v-for="slots in getTimeslotsByDay(meetingData.selectedTimes) "
                    class="flex flex-col gap-2 bg-gray-100 py-2 rounded-md">
                    <p class="text-slate-600 px-2">{{ formatSelectedTimesDay(slots.day) }}</p>
                    <div class="text-slate-500 flex justify-between pr-2 hover:bg-slate-500/10 px-2"
                      v-for="  slot in slots.timeslots  " @click="scrollTo(slot.start, { highlight: slot })">
                      <span>{{ formatTime(slot.start) }} – {{ formatTime(slot.end) }}</span>
                      <button class="rounded-full hover:bg-slate-500/20 h-6 w-6"
                        @click="() => removeTimeslot(slots.day, slot)"><font-awesome-icon icon="times" /></button>
                    </div>
                  </div>

                  <div v-for="member in meetingData.members.filter((m) => m.times.length > 0)"
                    class="flex flex-col gap-2">
                    <p class="text-gray-500 mt-4">{{ member.name }}</p>
                    <div v-for="slots in getTimeslotsByDay(member.times) "
                      class="flex flex-col gap-2 bg-gray-100 py-2 rounded-md">
                      <p class="text-slate-600 px-2">{{ formatSelectedTimesDay(slots.day) }}</p>
                      <div class="text-slate-500 flex justify-between pr-2 hover:bg-slate-500/10 px-2"
                        v-for="slot in slots.timeslots  " @click="scrollTo(slot.start, { highlight: slot })">
                        <span>{{ formatTime(slot.start) }} – {{ formatTime(slot.end) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <button class="absolute right-4 md:right-10 bg-accent rounded-full h-12 mt-auto flex px-6 items-center justify-center cursor-pointer shadow-xl
  text-accent-800 hover:bg-accent-dark bottom-24 md:bottom-10 flex gap-4" @click="showInviteDialog = true">
    Invite others
    <font-awesome-icon icon="user-plus" class="" />
  </button>

  <CalendarImportDialog :isOpen="showImportEventsDialog" :closeModal="() => showImportEventsDialog = false" />

  <InviteDialog :meeting-id="meetingId" :is-open="showInviteDialog" :close-modal="() => showInviteDialog = false" />

  <JoinMeetingDialog :meeting-id="meetingId" />
</template>

<style>
.overlap-striped {
  background-image: repeating-linear-gradient(-225deg, transparent, transparent 5px, #D18F9540 5px, #D18F9540 10px);
  border: 3px solid #D18F95;
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

@keyframes highlight-anim {
  0% {
    outline: 4px solid #e7525e;
  }

  100% {
    outline: 4px solid transparent;
  }
}

.highlighted {
  animation: highlight-anim 1.0s ease-out forwards;
}

.pointer-hint-anim {
  animation: pointer-hint 1.5s ease-in-out infinite;
}

@keyframes pointer-hint {
  0% {
    transform: translate(0px, 5px) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  50% {
    transform: translate(5px, 15px) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  100% {
    transform: translate(0px, 5px) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }
}
</style>