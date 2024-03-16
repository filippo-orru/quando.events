<script lang="ts" setup>

let props = defineProps<{
  meetingId: string
  isOpen: boolean,
  closeModal: () => void
}>();

let meetingStore = useNewMeetingStore(props.meetingId);
let meetingData = meetingStore.data as MeetingData;

let userStore = useUserInfoStore();


function isSet(name: string | null) {
  return name && name.length > 1;
}

function nameIsReady(name: string) {
  return isSet(name);
}

function getNameInitials(name: string) {
  let split = name.trim().toUpperCase().split(' ');
  if (split.length > 1) {
    return split.slice(0, 2).map((name) => name.charAt(0)).join('');
  } else {
    return split[0].slice(0, 2);
  }
}

function copyLink() {
  let link = window.location.href;
  navigator.clipboard.writeText(link);
}
</script>

<template>

  <SimpleDialog title="Invite" :is-open="isOpen" :close-modal="closeModal">
    <div class="flex flex-col gap-4">
      <div v-for="member in meetingData.members">
        <div class="flex">
          <div class="rounded-full bg-slate-400 h-10 w-10 mr-4 flex items-center justify-center text-white p-2">
            <Transition name="fade" mode="out-in">
              <font-awesome-icon v-if="!nameIsReady(member.name)" :icon="['fas', 'user']" />
              <span v-else>{{ getNameInitials(member.name) }}</span>
            </Transition>
          </div>
          <span class="flex-1 bg-gray-100 text-gray-800 text-sm rounded-lg focus:ring-blue-200 block w-full p-2.5">
            {{ member.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-6"></div>

    <!-- Mock social share card -->
    <div class="flex flex-row gap-4 bg-gray-100 rounded-lg shadow-md overflow-hidden">
      <img class="w-[40%]" src="/share-preview.jpg" />
      <div class="p-4">
        <span class="flex-1 text-gray-800 text-sm focus:ring-blue-200 block w-full p-2.5">
          Join '{{ meetingData.title }}' by {{ userStore.name }}
        </span>
      </div>
    </div>

    <!-- share buttons row -->
    <div class="flex mt-4
      *:rounded-full *:h-12 *:w-12 *:mr-4 *:flex *:items-center *:justify-center *:text-white *:p-2">
      <button class="bg-blue-500 hover:bg-blue-600" @click="copyLink()">
        <font-awesome-icon :icon="['fas', 'link']" />
      </button>
    </div>

    <div class="mt-4 float-right">
      <button type="button" class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium bg-sky-100 text-blue-900/80 
        hover:bg-sky-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        @click="closeModal()">
        Done
      </button>
    </div>
  </SimpleDialog>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>