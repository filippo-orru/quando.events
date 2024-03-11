<script setup lang="ts">
import { NewMeetingStep } from '~/data/NewMeeting';

</script>

<template>
    <NewMeetingWrapper title="Name" :step="NewMeetingStep.Name">
        <section>
            <p>Enter your name to get started. It will be shown to the participants of your event.</p>
            <div>
                <input type="text" id="first_name"
                    class="bg-gray-50 border border-gray-400 text-gray-800 text-sm rounded-lg focus:ring-blue-200 block w-full p-2.5"
                    placeholder="Alex" required />
            </div>
        </section>
        <a href="/new-meeting/calendar" class="absolute right-0 bottom-0 bg-blue-600 rounded-full w-12 h-12 mt-auto flex items-center justify-center cursor-pointer shadow-xl
        hover:bg-blue-500">
            <font-awesome-icon icon="arrow-right" class="text-white" />
        </a>
    </NewMeetingWrapper>
</template>

<style lang="scss"></style>