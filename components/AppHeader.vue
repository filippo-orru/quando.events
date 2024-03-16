<script setup lang="ts">
let header = ref()

function onScroll() {
    if (window.scrollY > 10) {
        header.value.classList.add('bg-accent', 'shadow-md')
    } else {
        header.value.classList.remove('bg-accent', 'shadow-md')
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
    <header class="py-4 px-6 fixed left-0 right-0 top-0 text-black/70 z-10 transition-colors" ref="header">
        <div class="container mx-auto flex px-12 justify-end items-center">
            <nav>
                <NuxtLink to="/sign-in" class="hover:text-black-90 hover:underline">Sign in</NuxtLink>
            </nav>
        </div>
    </header>
</template>

<style lang="scss"></style>