<script setup lang="ts">
import { capitalize } from 'vue';
import { NewMeetingStep } from '~/data/NewMeeting';

defineProps<{
    title: string,
    step: NewMeetingStep
}>();
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <!-- <div class="bg-gray-200 shadow-md py-4 px-6 text-black/70 z-10 transition-colors">
            <div class="container mx-auto flex px-12 justify-between items-center">
                <p class="font-bold">{{ title }}</p>
            </div>
        </div> -->

        <div class="flex-grow h-0 container mx-auto px-12 py-12">
            <div class="relative h-full">
                <slot />
            </div>
        </div>
        <NewMeetingStepper :step="step" />
    </div>
</template>