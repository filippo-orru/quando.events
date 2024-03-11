<script setup lang="ts">
import { NewMeetingSteps } from '~/data/NewMeeting';

let store = useNewMeetingStore();
</script>

<template>
    <NewMeetingWrapper title="Name" :step="NewMeetingSteps.Name" :padding="true" :next-step="NewMeetingSteps.Calendar">
        <section class="text-gray-800">
            <p class="text-lg">What's your name?</p>
            <input type="text" id="first_name" v-model="store.name" name="first_name"
                class="mt-4 bg-gray-50 border border-gray-400 text-gray-800 text-sm rounded-lg focus:ring-blue-200 block w-full p-2.5"
                placeholder="Alex" required />
            <p class="mt-1 text-xs italic">Your name will only be visible to the participants of your event.</p>
        </section>
    </NewMeetingWrapper>
</template>

<style lang="scss"></style>~/stores/meetingStore