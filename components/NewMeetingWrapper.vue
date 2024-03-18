<script setup lang="ts">


defineProps<{
    padding?: boolean,
}>();

let userStore = useUserInfoStore();
userStore.init();

let meetingId = (useRoute().params['meetingId'] as string[])[0];
if (!meetingId) {
    // Redirect to the new meeting page
    navigateTo('/meetings/new');
}
let newMeetingStore = useNewMeetingStore(meetingId);

onMounted(async () => {
    await newMeetingStore.init();
});

</script>

<template>
    <div class="h-dvh">
        <div class="h-full relative" :class="{ 'container mx-auto p-12': padding !== false }">
            <div v-if="newMeetingStore.data === 'error'" class="h-full flex flex-col items-center justify-center">
                <h1 class="text-6xl font-bold">404</h1>
                <div class="text-gray-600 mt-4 text-center">
                    <p>The meeting you're trying to join does not exist.</p>
                    <p> Please check the link and try again.
                    </p>
                </div>
                <NuxtLink href="/" class="text-accent-800 mt-4 rounded-full px-4 py-2 bg-accent-light hover:bg-accent transition-colors 
                hover:shadow-md hover:ring-2 hover:ring-white">
                    Go home</NuxtLink>
            </div>
            <slot v-else-if="newMeetingStore.data" :meeting-id="meetingId" />
            <div v-else class="flex items-center justify-center h-full">
                <LoadingIndicator />
            </div>
        </div>
    </div>
</template>