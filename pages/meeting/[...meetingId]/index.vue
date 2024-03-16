<script setup lang="ts">
// Redirect to /<meetingId>/calendar
let meetingId = (useRoute().params['meetingId'] as string[])[0];
navigateTo(`/meeting/${meetingId}/calendar`);
</script>
<template>
    <div class="flex flex-col items-center justify-center h-screen">
        <LoadingIndicator />
    </div>
</template>