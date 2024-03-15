<script lang="ts" setup>
import { text } from '@fortawesome/fontawesome-svg-core';

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

function nameIsReady() {
  return isSet(nameValue.value);
}

function getNameInitials() {
  let split = nameValue.value.trim().toUpperCase().split(' ');
  if (split.length > 1) {
    return split.slice(0, 2).map((name) => name.charAt(0)).join('');
  } else {
    return split[0].slice(0, 2);
  }
}
</script>

<template>

  <SimpleDialog title="What's your name?" :is-open="!isSet(userStore.name)">
    <div class="text-gray-800">
      <div class="flex mt-4">
        <div class="rounded-full bg-slate-400 h-10 w-10 mr-4 flex items-center justify-center text-white p-2">
          <Transition name="fade" mode="out-in">
            <font-awesome-icon v-if="!nameIsReady()" :icon="['fas', 'user']" />
            <span v-else>{{ getNameInitials() }}</span>
          </Transition>
        </div>
        <input type="text" id="first_name" v-model="nameValue" name="first_name" autofocus autocomplete="given-name"
          maxlength="50" required placeholder="Alex"
          class="flex-1 bg-gray-50 border border-gray-400 text-gray-800 text-sm rounded-lg focus:ring-blue-200 block w-full p-2.5"
          @keyup.enter="event => handleEnterKey(event)" />
      </div>
      <p class="mt-1 text-gray-600 text-xs italic">Your name will only be visible to the participants of your event.</p>
    </div>

    <div class="mt-4 float-right">
      <button type="button" :disabled="!nameIsReady()" class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium bg-sky-100 text-blue-900/80 
        hover:bg-sky-100 
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        @click="userStore.setName(nameValue)">
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