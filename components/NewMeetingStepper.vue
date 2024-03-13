<script setup lang="ts">
import { NewMeetingSteps, type NewMeetingStep } from '~/data/NewMeeting';

const props = defineProps<{
    step: NewMeetingStep
}>();

</script>

<template>
    <div class="w-max-screen bg-white p-4 shadow-[0_-5px_11px_0_rgba(0,0,0,0.1)] z-50">
        <div class="flex flex-row justify-center items-center gap-x-16">
            <div v-for="step in NewMeetingSteps">
                <NuxtLink :to="step.link" class="flex flex-row items-center">
                    <div class="mr-4 relative flex items-center justify-center">
                        <div class="w-4 h-4 rounded-full bg-blue-200 absolute"
                            :class="{ 'bg-blue-200': step === props.step }"></div>
                        <div class="w-2 h-2 rounded-full absolute" :class="{ 'bg-blue-500': step === props.step }">
                        </div>
                    </div>
                    <div>{{ step.title }}</div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>