<script setup lang="ts">
import type { NewMeetingStep } from '~/data/NewMeeting';

defineProps<{
    title: string,
    step: NewMeetingStep,
    padding?: boolean
}>();
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <div class="flex-grow h-0" :class="{ 'container mx-auto p-12': padding !== false }">
            <div class="relative h-full">
                <slot />
            </div>
        </div>
        <NewMeetingStepper :step="step" />
    </div>
</template>