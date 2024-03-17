<script setup lang="ts">
import { useScriptTag } from '@vueuse/core'
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue'
import { useGoogleCalendarStore } from '~/stores/GoogleCalendarStore';

const props = defineProps<{
    isOpen: boolean,
    closeModal: () => void
}>();

let googleCalendar = useGoogleCalendarStore();
googleCalendar.init();

</script>

<template>
    <SimpleDialog title="Import your calendar" :is-open="isOpen" :close-modal="closeModal">

        <div class="mt-4 mb-6 text-sm text-gray-500">
            <p>To make scheduling easy, you can import your calendar. Your data never leaves your
                device.</p>
        </div>

        <div class="flex flex-col gap-4">
            <button v-if="!googleCalendar.isConnected" type="button" class="flex items-center justify-center rounded-md border border-transparent 
            bg-secondary-100/60 text-secondary-800 px-4 py-2 text-sm font-medium focus-visible:ring-secondary-800
                                    "
                :class="googleCalendar.isReady ? 'hover:bg-secondary-100' : 'cursor-not-allowed opacity-50'"
                @click="googleCalendar.isReady ? googleCalendar.importEvents() : undefined">
                <font-awesome-icon :icon="googleCalendar.isReady ? ['fab', 'google'] : 'spinner'" class="mr-3" />
                Google Calendar
            </button>
            <div v-else
                class="flex items-center justify-between rounded-md border border-transparent bg-secondary-100/60 text-secondary px-4 py-2 text-sm font-medium focus-visible:ring-secondary-800">
                <button class="invisible text-secondary-800">
                    <!-- For spacing -->
                    <font-awesome-icon :icon="['fas', 'times']" />
                </button>
                <div class="px-2">
                    <font-awesome-icon :icon="['fab', 'google']" class="mr-3" />
                    Connected to Google Calendar
                </div>
                <button class="text-secondary-800 rounded-full hover:bg-secondary/50 flex items-center justify-center h-8 w-8" @click="googleCalendar.remove()">
                    <font-awesome-icon :icon="['fas', 'times']" />
                </button>
            </div>

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
                class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-secondary-800/80 hover:bg-secondary-100 focus-visible:ring-secondary-800"
                @click="props.closeModal">
                Done
            </button>
        </div>
    </SimpleDialog>
</template>