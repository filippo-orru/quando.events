<script setup lang="ts">
import { useGoogleCalendarStore } from '~/stores/GoogleCalendarStore';

const props = defineProps<{
    isOpen: boolean,
    closeModal: () => void
}>();

let googleCalendar = useGoogleCalendarStore();
googleCalendar.init();

let showLimitedUseDisclosure = ref(false);
console.log("googleCalendar.importState", googleCalendar.importState)

</script>

<template>
    <SimpleDialog title="Import your calendar" import
        :is-open="isOpen && !showLimitedUseDisclosure && (googleCalendar.importState == 'idle' || googleCalendar.importState == 'done')"
        :close-modal="closeModal">
        <div class="mt-4 mb-6 text-sm text-gray-500">
            <p>To make scheduling easy, you can import your calendar.</p>
            <p class="mt-2">Your data never leaves your device.<br />
                Read the <a class="underline" href="/privacy">Privacy
                    Policy</a>, <a class="underline" href="/tos">Terms of Service</a>, and <a class="underline" href="#"
                    @click="showLimitedUseDisclosure = true">Limited Use Disclosure</a>. </p>
        </div>

        <div class="flex flex-col gap-4">
            <button v-if="!googleCalendar.isConnected" type="button" class="flex items-center justify-center gap-3 rounded-md border border-transparent 
            bg-secondary-100/60 text-secondary-800 px-4 py-2 text-sm font-medium focus-visible:ring-secondary-800
                                    "
                :class="googleCalendar.isReady ? 'hover:bg-secondary-100' : 'cursor-not-allowed opacity-50'"
                @click="googleCalendar.isReady ? googleCalendar.startImport() : undefined">
                <font-awesome-icon :icon="googleCalendar.isReady ? ['fab', 'google'] : 'spinner'" />
                Google Calendar
            </button>
            <div v-else
                class="flex items-center justify-start rounded-md border border-transparent bg-secondary-100/60 text-secondary px-4 py-2 text-sm font-medium focus-visible:ring-secondary-800">
                <div class="px-2 flex items-center justify-center gap-3">
                    <font-awesome-icon :icon="['fab', 'google']" />
                    Connected to Google Calendar
                </div>
                <button
                    class="ml-auto text-secondary-800 rounded-full hover:bg-secondary/50 flex items-center justify-center h-8 w-8"
                    @click="googleCalendar.remove()">
                    <font-awesome-icon :icon="['fas', 'times']" />
                </button>
            </div>
            <p v-if="googleCalendar.isConnected" class="text-xs text-gray-500">
                <span v-if="googleCalendar.lastUpdated">Last updated: {{
            googleCalendar.lastUpdated }}</span>
            </p>

            <!-- <button type="button"
                class="flex items-center justify-center rounded-md border border-transparent bg-sky-100 text-blue-900/80 hover:bg-sky-200/80 px-4 py-2 text-sm font-medium focus-visible:ring-blue-500">
                <font-awesome-icon :icon="['fab', 'microsoft']" class="mr-3" />
                Outlook
            </button>
            <button type="button"
                class="flex items-center justify-center rounded-md border border-transparent bg-sky-100 text-blue-900/80 hover:bg-sky-200/80 px-4 py-2 text-sm font-medium focus-visible:ring-blue-500">
                <font-awesome-icon :icon="['fab', 'apple']" class="mr-3" />
                Apple Calendar
            </button>
            <button
                class="flex items-center justify-center rounded-md border border-transparent text-blue-900/80 hover:bg-sky-100 px-4 py-2 text-sm font-medium focus-visible:ring-blue-500">
                I use another calendar
            </button> -->
            <p class="text-xs text-gray-500">Other calendar integrations coming soon.</p>

        </div>

        <div class="mt-4 float-right">
            <button type="button"
                class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium bg-accent-light/50 text-accent-800 hover:bg-accent-light"
                @click="props.closeModal">
                Done
            </button>
        </div>
    </SimpleDialog>
    <SimpleDialog title="Limited Use Disclosure" :is-open="showLimitedUseDisclosure"
        :close-modal="() => showLimitedUseDisclosure = false">
        <div class="mt-4 mb-6 text-sm text-gray-500">
            <p>When you import your Google Calendar, we use Google's API Services. Your calendar data is only used to
                display your events in your schedule and only stored locally.</p>
            <p class="mt-2">Our use and transfer to any other app of information received from Google APIs will adhere
                to the
                <a class="underline" href="https://developers.google.com/terms/api-services-user-data-policy">Google API
                    Services User
                    Data Policy</a>, including the Limited Use requirements.
            </p>
        </div>
    </SimpleDialog>
    <SimpleDialog title="Google Calendar Import" :is-open="googleCalendar.importState !== 'idle' && googleCalendar.importState !== 'done'"
        :close-modal="() => googleCalendar.remove()">
        <div class="mt-4 mb-6">
            <div v-if="googleCalendar.importState == 'loadedCalendars'">
                <p class="text-sm text-gray-500">Select the calendars you want to import:</p>
                <div class="mt-4">
                    <div v-for="calendar in googleCalendar.calendars" :key="calendar.id"
                        class="flex items-center justify-between py-2 border-b border-gray-200">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" :id="'calendar-' + calendar.id"
                                class="form-checkbox h-4 w-4 accent-accent" v-model="calendar.selected" />
                            <label class="text-sm text-gray-800" :for="'calendar-' + calendar.id">
                                {{ calendar.summary }}</label>
                        </div>
                    </div>
                    <button
                        class="mt-4 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium bg-accent-light/50 text-accent-800 hover:bg-accent-light"
                        @click="googleCalendar.importEvents()">
                        Import selected calendars
                    </button>
                </div>
            </div v-else-if="googleCalendar.importState == 'loadingEvents'">
        </div>
    </SimpleDialog>
</template>