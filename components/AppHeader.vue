<script setup lang="ts">
let header = ref()

function onScroll() {
    if (window.scrollY > 10) {
        header.value.classList.add('bg-accent-light', 'shadow-md')
    } else {
        header.value.classList.remove('bg-accent-light', 'shadow-md')
    }
}

onBeforeMount(() => {
    window.addEventListener('scroll', onScroll);
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
});

</script>
<template>
    <header class="py-6 px-6 fixed left-0 right-0 top-0 text-accent-800 font-bold z-10 transition-colors" ref="header">
        <div class="container max-w-screen-lg mx-auto flex px-12 justify-end items-center">
            <nav>
                <NuxtLink to="/sign-in" class="hover:underline">Sign in</NuxtLink>
            </nav>
        </div>
    </header>
</template>

<style lang="scss"></style>