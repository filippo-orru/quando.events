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

function getNewMeetingProps(): NewMeetingProps {
    return {
        meetingId: meetingId,
        data: newMeetingStore.data,
        saveMeetingData: newMeetingStore.save,
        fetchUpdate: newMeetingStore.fetchUpdate
    } as NewMeetingProps;
}

onMounted(async () => {
    await newMeetingStore.fetchUpdate();
});

</script>

<template>
    <div class="flex flex-col min-h-screen">
        <div class="flex-grow h-0">
            <div class="h-full relative">
                <div class="h-full relative" :class="{ 'container mx-auto p-12': padding !== false }">
                    <slot v-if="newMeetingStore.data" :props="getNewMeetingProps()" />
                    <div v-else class="flex items-center justify-center h-full">
                        <font-awesome-icon icon="spinner" class="animate-spin text-gray-500 text-6xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>