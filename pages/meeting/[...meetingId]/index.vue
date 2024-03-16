<script setup lang="ts">

</script>

<template>
    <NewMeetingWrapper v-slot="props">
        <NewMeetingOverview :meeting-id="props.meetingId" />
    </NewMeetingWrapper>
</template>