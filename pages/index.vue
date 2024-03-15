<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader :translucent="true" />
    <div class="flex-grow">
      <section class="w-screen min-h-[50vh] flex items-center relative">
        <div id="landing-bg" class="bg-gradient-to-r from-lime-200 to-lime-300"></div>
        <div class="container mx-auto px-12">
          <div class="max-w-md">
            <h2 class="text-4xl font-bold">Busy friends can make scheduling hard</h2>
            <p class="text-black/70 text-xl mt-2 mb-12">But <span class="underline">meetme</span> makes it easy</p>
            <a class="bg-gray-800 text-white px-4 py-4 rounded-full hover:bg-gray-700
            hover:ring-2 hover:ring-lime-300 transition-colors hover:shadow-xl"
              href="/new-meeting">
              <font-awesome-icon icon="arrow-right" class="mr-2" /> Plan a meeting
            </a>
            <!-- <p class="text-gray-600 mt-4 italic text-sm">It's free!</p> -->
          </div>
        </div>
      </section>
      <section class="container mx-auto px-12">
        <h2 class="text-3xl font-bold mt-12">
          How it works
        </h2>
        <ol>
          <li class="mt-6">
            <table class="table-auto">
              <tr>
                <td>
                  <span
                    class="font-bold text-white/90 mr-4 bg-gray-800/80 w-8 h-8 flex items-center justify-center rounded-full">1</span>
                </td>
                <td>
                  <h3 class="text-xl font-bold">Plan a meeting</h3>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <p class="text-gray-600 mt-2">Enter your name and select times that fit you.</p>
                </td>
              </tr>
            </table>
          </li>
          <li class="mt-6">
            <table class="table-auto">
              <tr>
                <td>
                  <span
                    class="font-bold text-white/90 mr-4 bg-gray-800/80 w-8 h-8 flex items-center justify-center rounded-full">2</span>
                </td>
                <td>
                  <h3 class="text-xl font-bold">Share the link</h3>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <p class="text-gray-600 mt-2">Your friends select times that fit them.</p>
                </td>
              </tr>
            </table>
          </li>
          <li class="mt-6">
            <table class="table-auto">
              <tr>
                <td>
                  <span
                    class="font-bold text-white/90 mr-4 bg-gray-800/80 w-8 h-8 flex items-center justify-center rounded-full">3</span>
                </td>
                <td>
                  <h3 class="text-xl font-bold">Select the overlap</h3>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <p class="text-gray-600 mt-2">Easily see when everyone's schedule overlaps.</p>
                </td>
              </tr>
            </table>
          </li>
        </ol>
      </section>
      <section class="container mx-auto px-12">
        <h2 class="text-3xl font-bold mt-12">FAQ</h2>
        <div class="mt-6">
          <h3 class="text-xl font-bold">How much does it cost?</h3>
          <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" /> It's free!</p>
        </div>
      </section>
    </div>
    <div class="min-h-48"></div>
    <AppFooter />
  </div>
</template>

<style lang="scss">
#landing-bg {
  transform: rotate(-1.2deg);
  left: -100px;
  right: -100px;
  position: absolute;
  z-index: -5;
  top: -1000px;
  bottom: 0;
}
</style>