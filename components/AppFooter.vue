<script setup lang="ts">
</script>
<template>
    <footer class="bg-secondary-800 text-secondary-100 pt-8 pb-24 mt-36">
        <div
            class="container max-w-screen-lg px-12 mx-auto flex justify-between items-center [&_a:hover]:text-secondary">
            <span class="tracking-wide">
                Made with <font-awesome-icon :icon="['fas', 'heart']" class="heartbeat mx-1"/> by
                <a href="https://filippo-orru.com" class="underline">Filippo Orru</a>
            </span>
            <nav class="flex gap-8 [&_a:hover]:underline">
                <a href="#" class="">Privacy</a>
                <a href="#" class="">Terms</a>
            </nav>
        </div>
    </footer>
</template>

<style lang="scss">
.heartbeat {
  animation: heartbeat 1s infinite;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>