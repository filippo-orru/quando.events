<script lang="ts" setup>
let props = defineProps<{
  meetingId: string
}>();

let meetingStore = useNewMeetingStore(props.meetingId);

let userIsMeetingCreator = (meetingStore.data as MeetingData).members.length === 0;

let userStore = useUserInfoStore();
let nameValue = ref('');

function handleEnterKey(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    userStore.setName(nameValue.value);
  }
}

function isSet(name: string | null) {
  return name && name.length > 1;
}
</script>

<template>

  <SimpleDialog :title="userIsMeetingCreator ? 'Join this meeting' : 'What\'s your name?'"
    :is-open="!isSet(userStore.name)">
    <div class="text-gray-800">
      <div class="flex mt-4">
        <UserProfilePictureCircle :name="userStore.name" />
        <div class="flex flex-col gap-1 w-full">
          <input type="text" id="first_name" v-model="nameValue" name="first_name" autofocus autocomplete="given-name"
            maxlength="50" required placeholder="Alex"
            class="flex-1 bg-gray-50 border border-gray-400 text-gray-800 text-sm rounded-lg focus:ring-blue-200 block w-full p-2.5"
            @keyup.enter="event => handleEnterKey(event)" />
          <p class="text-gray-500 text-xs italic">Your name will be shown to others in this event.</p>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="font-bold mb-2">How it works</h2>
      <ol class="flex flex-col gap-3">
        <li>1. Select when you're free</li>
        <li>2. Invite others</li>
        <li>3. Meet in the overlap</li>
      </ol>
    </div>

    <div class="mt-4 float-right">
      <button type="button" :disabled="!isSet(nameValue)" class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium bg-accent text-accent-800
        hover:bg-accent-dark
        disabled:opacity-50 disabled:cursor-not-allowed"
        @click="userStore.setName(nameValue)">
        {{ userIsMeetingCreator ? 'Join' : 'Done' }}
      </button>
    </div>
  </SimpleDialog>
</template>

<style>
</style>