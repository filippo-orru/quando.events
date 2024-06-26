<script lang="ts" setup>

const props = defineProps<{
  meetingId: string,
  isOpen: boolean,
  closeModal: () => void,
}>();

let meetingStore = useNewMeetingStore(props.meetingId);
let meetingData = meetingStore.data as MeetingData;

let userStore = useUserInfoStore()

let copiedLink = ref(false);

function copyLink() {
  let link = window.location.href;
  navigator.clipboard.writeText(link);
  copiedLink.value = true;
  setTimeout(() => {
    copiedLink.value = false;
  }, 2000);
}

function shareWhatsapp() {
  let link = window.location.href;
  let url = `https://wa.me/?text=${encodeURIComponent(link)}`;
  window.open(url, '_blank');
}

function shareTelegram() {
  let link = window.location.href;
  let url = `https://t.me/share/url?url=${encodeURIComponent(link)}`;
  window.open(url, '_blank');
}

function shareMail() {
  let link = window.location.href;
  let url = `mailto:?subject=Join my meeting&body=${encodeURIComponent(link)}`;
  window.open(url, '_blank');
}
</script>

<template>

  <SimpleDialog title="Invite others" :is-open="isOpen" :close-modal="closeModal">
    <div class="flex flex-col gap-4">
      <div v-for="member in meetingData.members">
        <div class="flex">
          <UserProfilePictureCircle :name="member.name" />
          <span class="flex-1 bg-gray-100 text-gray-800 text-sm rounded-lg block w-full p-2.5">
            {{ member.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div v-if="meetingData.members.length > 1" class="border-t border-gray-400 my-12"></div>

    <!-- Mock social share card -->
    <div class="flex flex-row gap-4 bg-gray-100 rounded-lg shadow-lg overflow-hidden">
      <img class="w-[40%]" src="/share-preview.jpg" />
      <div class="p-4 flex items-center">
        <span class="italic text-gray-800 text-xl my-auto">
          {{ meetingData.title && `Join ${meetingData.title} by ${userStore.name}` || `Join a meeting by
          ${userStore.name}` }}
          <!-- TODO use organizer name -->
        </span>
      </div>
    </div>

    <!-- share buttons row -->
    <div class="flex mt-6 gap-4 justify-evenly">
      <div class="flex-1 flex flex-col gap-2 items-center">
        <button class="bg-accent hover:bg-accent-dark
        text-lg shadow-md rounded-full h-12 w-12 flex items-center justify-center text-white p-2" @click="copyLink()">
          <Transition name="fade" mode="out-in">
            <font-awesome-icon v-if="copiedLink" :icon="['fas', 'check']" />
            <font-awesome-icon v-else :icon="['fas', 'link']" />
          </Transition>
        </button>
        Copy link
      </div>
      <div class="flex-1 flex flex-col gap-2 items-center">
        <button class="bg-green-500 hover:bg-green-600
        text-xl shadow-md rounded-full h-12 w-12 flex items-center justify-center text-white p-2"
          @click="shareWhatsapp()">
          <font-awesome-icon :icon="['fab', 'whatsapp']" />
        </button>
        WhatsApp
      </div>
      <div class="flex-1 flex flex-col gap-2 items-center">
        <button class="bg-sky-500 hover:bg-sky-600
        text-xl shadow-md rounded-full h-12 w-12 flex items-center justify-center text-white p-2"
          @click="shareTelegram()">
          <font-awesome-icon :icon="['fab', 'telegram']" />
        </button>
        Telegram
      </div>
      <div class="flex-1 flex flex-col gap-2 items-center">
        <button class="bg-blue-600 hover:bg-blue-700
        text-xl shadow-md rounded-full h-12 w-12 flex items-center justify-center text-white p-2"
          @click="shareMail()">
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </button>
        Mail
      </div>
    </div>


    <div class="mt-6 float-right">
      <button type="button"
        class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium bg-accent-light/50 text-accent-800 hover:bg-accent-light"
        @click="closeModal()">
        Done
      </button>
    </div>
  </SimpleDialog>
</template>

<style>

</style>