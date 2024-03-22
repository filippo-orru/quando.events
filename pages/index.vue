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
  <div class="min-h-screen flex flex-col">
    <header class="py-6 fixed left-0 right-0 top-0 text-accent-800 font-bold z-10 transition-colors" ref="header">
      <nav class="container max-w-screen-lg mx-auto flex px-12 items-center gap-8 tracking-wide">
        <NuxtLink to="/" class="decoration-2 hover:underline">quando.events</NuxtLink>
        <div class="ml-auto flex gap-8">
          <NuxtLink :external="true" to="/meeting/new" class="hidden md:block ml-auto decoration-2 hover:underline">new
            meeting
          </NuxtLink>
          <!-- <NuxtLink to="/sign-in" class="decoration-2 hover:underline">sign in</NuxtLink> -->
        </div>
      </nav>
    </header>
    <div class="flex-grow">
      <section class="w-screen min-h-[60vh] flex justify-center relative overflow-hidden">
        <div id="landing-bg" class="absolute bg-gradient-to-r from-accent-light to-accent-light/30"></div>
        <div class=" flex items-center">
          <div
            class="container max-w-screen-lg mx-auto mt-4 px-12 py-24 md:py-16 flex flex-col md:flex-row justify-between">
            <div class="max-w-md mb-6">
              <h2 class="text-5xl font-bold">Busy friends make scheduling hard</h2>
              <p class="text-black/70 text-xl mt-4 mb-12">Find a time that fits everyone</p>
              <NuxtLink :external="true" class="bg-gray-800 text-white px-4 py-4 rounded-full hover:bg-gray-700
            hover:ring-2 hover:ring-white transition-colors hover:shadow-xl" href="/meeting/new">
                <font-awesome-icon icon="arrow-right" class="mr-2" /> Plan a meeting
              </NuxtLink>
              <!-- <p class="text-gray-600 mt-4 italic text-sm">It's free!</p> -->
            </div>
            <div class="flex justify-end">
              <div class="max-h-36 md:max-h-48 max-w-[80%]">
                <img src="/share-preview.jpg"
                  class="rounded-full m-auto mr-0 translate-x-5 md:translate-x-0 max-h-[100%] shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="container max-w-screen-lg mx-auto px-12">
        <section class="lg:flex gap-6 justify-between">
          <div>
            <h2 class="text-3xl font-bold mt-12">
              How it works
            </h2>
            <ol>
              <li class="mt-6">
                <table class="table-auto">
                  <tr>
                    <td>
                      <span
                        class="font-bold text-accent-800 mr-4 bg-accent/80 w-8 h-8 flex items-center justify-center rounded-full">1</span>
                    </td>
                    <td>
                      <h3 class="text-xl font-bold">Select when you're free</h3>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <p class="text-gray-600 mt-1">Sync your existing calendar.</p>
                    </td>
                  </tr>
                </table>
              </li>
              <li class="mt-6">
                <table class="table-auto">
                  <tr>
                    <td>
                      <span
                        class="font-bold text-accent-800 mr-4 bg-accent/80 w-8 h-8 flex items-center justify-center rounded-full">2</span>
                    </td>
                    <td>
                      <h3 class="text-xl font-bold">Share the link</h3>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <p class="text-gray-600 mt-1">Your friends select times that fit them.</p>
                    </td>
                  </tr>
                </table>
              </li>
              <li class="mt-6">
                <table class="table-auto">
                  <tr>
                    <td>
                      <span
                        class="font-bold text-accent-800 mr-4 bg-accent/80 w-8 h-8 flex items-center justify-center rounded-full">3</span>
                    </td>
                    <td>
                      <h3 class="text-xl font-bold">Meet in the overlap</h3>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <p class="text-gray-600 mt-1">Easily see when everyone's selected time overlaps.</p>
                    </td>
                  </tr>
                </table>
              </li>
            </ol>
          </div>

          <div>
            <img src="/screenshot.png" class="mt-6 w-96 border-2 shadow-xl rounded-lg mx-auto lg:mx-0" />
          </div>
        </section>
        <section class="container">
          <h2 class="text-3xl font-bold mt-12 mb-3">FAQ</h2>
          <div class="flex flex-col gap-6">
            <div class="">
              <h3 class="text-xl font-bold">How much does it cost?</h3>
              <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" /> It's free!</p>
            </div>
            <div class="">
              <h3 class="text-xl font-bold">Do I need to download anything?</h3>
              <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" />
                Nope, quando.events works right in your browser. No downloads or installations required.
              </p>
            </div>
            <div class="">
              <h3 class="text-xl font-bold">How many friends can I invite to a meeting?</h3>
              <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" />
                You can invite up to 15 friends.
              </p>
            </div>
            <div class="">
              <h3 class="text-xl font-bold">What calendars can by synced?</h3>
              <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" />
                Currently you can sync Google Calendar, but I'm actively working on adding support for Microsoft Outlook
                and Apple Calendar.
              </p>
            </div>
            <div class="">
              <h3 class="text-xl font-bold">What about timezones?</h3>
              <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" />
                You will always see all times in your local timezone.
              </p>
            </div>
            <div class="">
              <h3 class="text-xl font-bold">How can I get in contact?</h3>
              <p class="text-gray-600 mt-2"><font-awesome-icon icon="arrow-right" class="mr-2" />
                You can reach me at <a href="mailto:hello@quando.events"
                  class="text-accent-800 font-bold">hello@quando.events</a>
              </p>
            </div>
          </div>
          <div class="flex justify-center mt-8">
            <NuxtLink :external="true" class="bg-gray-800 text-white px-4 py-4 rounded-full hover:bg-gray-700
            hover:ring-2 hover:ring-white transition-colors hover:shadow-xl" href="/meeting/new">
              <font-awesome-icon icon="arrow-right" class="mr-2" /> Plan a meeting
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<style lang="scss">
#landing-bg {
  transform: rotate(-1.2deg) translateY(-30px);
  left: -100px;
  right: -100px;
  position: absolute;
  z-index: -5;
  top: -1000px;
  bottom: 0;
}
</style>