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

let store = useGoogleCalendarStore();
store.init();

</script>

<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-50">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 pt-4 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="div" class="flex items-center">
                                <h3 class="text-lg font-medium leading-6 text-gray-900"> Import your calendar </h3>
                                <button class="ml-auto p-2 rounded-full hover:bg-gray-200" @click="props.closeModal">
                                    <svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </DialogTitle>
                            <div class="mt-4 mb-6 text-sm text-gray-500">
                                <p>To make scheduling easy, you can import your calendar. Your data never leaves your
                                    device.</p>
                            </div>

                            <div class="flex flex-col gap-4">
                                <button type="button" class="flex items-center justify-center rounded-md border border-transparent bg-sky-100 text-blue-900/80 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                                    " :class="store.isReady ? 'hover:bg-sky-200/80' : 'cursor-not-allowed opacity-50'"
                                    @click="store.isReady ? store.importEvents() : undefined">
                                    <font-awesome-icon :icon="store.isReady ? ['fab', 'google'] : 'spinner'"
                                        class="mr-3" />
                                    Google Calendar
                                </button>
                                <button type="button"
                                    class="flex items-center justify-center rounded-md border border-transparent bg-sky-100 text-blue-900/80 hover:bg-sky-200/80 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                    <font-awesome-icon :icon="['fab', 'microsoft']" class="mr-3" />
                                    Outlook
                                </button>
                                <button type="button"
                                    class="flex items-center justify-center rounded-md border border-transparent bg-sky-100 text-blue-900/80 hover:bg-sky-200/80 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                    <font-awesome-icon :icon="['fab', 'apple']" class="mr-3" />
                                    Apple Calendar
                                </button>
                                <button
                                    class="flex items-center justify-center rounded-md border border-transparent text-blue-900/80 hover:bg-sky-100 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                    I use another calendar
                                </button>

                            </div>

                            <div class="mt-4 float-right">
                                <button type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-blue-900/80 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="props.closeModal">
                                    Done
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>