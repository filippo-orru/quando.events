<script setup lang="ts">
let props = defineProps<{
    name: string | null,
}>();

function nameIsReady() {
  return props.name && props.name.length > 1;
}

function getNameInitials() {
  let split = props.name!.trim().toUpperCase().split(' ');
  if (split.length > 1) {
    return split.slice(0, 2).map((name) => name.charAt(0)).join('');
  } else {
    return split[0].slice(0, 2);
  }
}

</script>
<template>
    <div class="rounded-full bg-accent h-10 w-10 mr-4 flex items-center justify-center text-accent-800/80 p-2">
        <Transition name="fade" mode="out-in">
            <font-awesome-icon v-if="!nameIsReady()" :icon="['fas', 'user']" />
            <span class="font-bold" v-else>{{ getNameInitials() }}</span>
        </Transition>
    </div>
</template>