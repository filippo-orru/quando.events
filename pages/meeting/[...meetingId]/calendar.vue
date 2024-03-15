<script setup lang="ts">


</script>

<template>
    <NewMeetingWrapper :step="NewMeetingSteps.Calendar" :next-step="NewMeetingSteps.Invite" :padding="false"
    button-class="bottom-24 md:bottom-10">
    <Calendar v-if="newMeetingStore.data" :meetingId="meetingId" :data="newMeetingStore.data"
        :saveMeetingData="async () => { }" :fetchUpdate="async () => { await newMeetingStore.fetchUpdate() }" />
</template>