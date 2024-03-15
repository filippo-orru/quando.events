<script setup lang="ts">
import type { NewMeetingStep } from '~/data/Meeting';

defineProps<{
    step: NewMeetingStep,
    nextStep?: NewMeetingStep,
    padding?: boolean,
    buttonClass?: string
}>();

let userStore = useUserInfoStore();

userStore.init();
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <div class="flex-grow h-0">
            <div class="h-full relative">
                <div class="h-full relative" :class="{ 'container mx-auto p-12': padding !== false }">
                    <slot />
                </div>
                <NuxtLink v-if="nextStep" :to="nextStep.link" class="absolute right-10 bg-blue-600 rounded-full w-12 h-12 mt-auto flex items-center justify-center cursor-pointer shadow-xl
                hover:bg-blue-500" :class="buttonClass || 'bottom-10'">
                    <font-awesome-icon icon="arrow-right" class="text-white" />
                </NuxtLink>
            </div>
        </div>
        <NewMeetingStepper :step="step" />
    </div>
</template>