<script setup lang="ts">
import { NewMeetingSteps } from '~/data/NewMeeting';


</script>

<template>
    <NewMeetingWrapper title="Calendar" :step="NewMeetingSteps.Times" :padding="false">
        <CalendarComponent />
        <a href="/new-meeting/invite" class="absolute right-10 bottom-10 bg-blue-600 rounded-full w-12 h-12 mt-auto flex items-center justify-center cursor-pointer shadow-xl
        hover:bg-blue-500">
            <font-awesome-icon icon="arrow-right" class="text-white" />
        </a>
    </NewMeetingWrapper>
</template>

<style lang="scss"></style>