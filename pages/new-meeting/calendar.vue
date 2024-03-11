<script setup lang="ts">
import { NewMeetingStep } from '~/data/NewMeeting';

</script>

<template>
    <NewMeetingWrapper title="Name" :step="NewMeetingStep.Name">
        <Calendar />
        <a href="/new-meeting/calendar" class="absolute right-0 bottom-0 bg-blue-600 rounded-full w-12 h-12 mt-auto flex items-center justify-center cursor-pointer shadow-xl
        hover:bg-blue-500">
            <font-awesome-icon icon="arrow-right" class="text-white" />
        </a>
    </NewMeetingWrapper>
</template>

<style lang="scss"></style>