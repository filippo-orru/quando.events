<script setup lang="ts">
const year = new Date().getFullYear();
</script>
<template>
    <footer class="bg-gray-800 text-gray-400 py-4 px-6">
        <div class="container mx-auto flex justify-between items-center">
            <a href="https://filippo-orru.com" class="hover:underline">Filippo Orru {{ year }}</a>
            <nav>
                <a href="#" class="hover:text-gray-300 mr-8">Privacy</a>
                <a href="#" class="hover:text-gray-300">Terms</a>
            </nav>
        </div>
    </footer>
</template>

<style lang="scss"></style>