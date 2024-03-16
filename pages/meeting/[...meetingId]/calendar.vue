<script setup lang="ts">

</script>

<template>
    <NewMeetingWrapper v-slot="props">
        <Calendar :meeting-id="props.meetingId" />
    </NewMeetingWrapper>
</template>