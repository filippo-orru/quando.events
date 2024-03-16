<script setup lang="ts">
import type { NewMeetingProps } from '~/stores/NewMeetingStore';


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
    <div class="flex flex-col min-h-screen">
        <div class="flex-grow h-0">
            <div class="h-full relative" :class="{ 'container mx-auto p-12': padding !== false }">
                <div v-if="newMeetingStore.data === 'error'" class="h-full flex flex-col items-center justify-center">
                    <h1 class="text-3xl font-bold">This meeting does not exist</h1>
                    <p class="text-gray-600 mt-2">Please check the link and try again.</p>
                    <a href="/meeting/new"
                        class="text-white mt-4 rounded-full px-4 py-2 bg-blue-500 hover:bg-blue-400 transition-colors 
                hover:shadow-md hover:ring-2 hover:ring-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                        Create a new meeting</a>
                </div>
                <slot v-else-if="newMeetingStore.data" :props="newMeetingStore.getProps()" />
                <div v-else class="flex items-center justify-center h-full">
                    <LoadingIndicator />
                </div>
            </div>
        </div>
    </div>
</template>