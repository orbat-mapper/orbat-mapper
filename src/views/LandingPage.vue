<template>
  <div class="pb-8">
    <main class="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
      <div class="text-center">
        <h1
          class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
        >
          <span class="block xl:inline">Order of Battle</span>
          {{ " " }}
          <span class="block text-red-900 xl:inline">mapper</span>
        </h1>
        <p
          class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
        >
          Recreate historic battles and military scenarios.
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 max-w-sm md:max-w-5xl mx-auto"
        >
          <div class="border rounded-lg overflow-hidden aspect-w-4 aspect-h-3">
            <img src="/images/orbat-chart-demo.png" class="object-cover object-center" />
          </div>
          <div class="border rounded-lg overflow-hidden aspect-w-4 aspect-h-3">
            <img src="/images/screenshot-2021-08-04.png" class="object-cover" />
          </div>
        </div>

        <p
          class="mt-4 max-w-md mx-auto text-base text-green-900-500 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl"
        >
          ORBAT mapper is currently under development. You can follow the
          <a href="https://github.com/orbat-mapper/orbat-mapper">development on Github</a> and

          <a href="https://preview--orbat-mapper.netlify.app"
            >try a work in progress preview</a
          >.
        </p>

        <div class="mt-5 mx-auto sm:flex sm:justify-center md:mt-8">
          <div class="rounded-md shadow">
            <a
              href="https://github.com/orbat-mapper/orbat-mapper"
              class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              View on Github
              <GithubIcon class="ml-4 w-8 h-8 inline" />
            </a>
          </div>
          <div class="mt-3 border border-gray-200 rounded-md shadow sm:mt-0 sm:ml-3">
            <a
              href="https://preview--orbat-mapper.netlify.app"
              class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Try preview
            </a>
          </div>
        </div>
      </div>

      <ProseSection class=""></ProseSection>

      <ProseSection class="">
        <h2>Other tools and resources</h2>

        <p>
          ORBAT mapper is created by a hobbyist. If you need something more professional
          or you want to create military overlays, try some of these excellent tools
          instead:
        </p>

        <ul>
          <li>
            <p>
              <a href="https://www.map.army/about/en.html">map.army</a> - a really nice
              web application for drawing map overlays with symbols and tactical graphics.
            </p>
          </li>

          <li>
            <p>
              <a href="https://odin.syncpoint.io/en/"
                >ODIN open source command and control information system</a
              >. Desktop application available on most operating systems (Electron based).

            </p>
          </li>

          <li>
            <p>
              <a href="https://mgrs-mapper.com/">MGRS Mapper</a> -
              <q>operational graphics tool for junior leaders</q>. Subscription based
              service. A limited free version is available.
            </p>
          </li>
        </ul>

        <h3>Military history</h3>

        <p>
          If you are interested in WW2 history I highly recommend the site
          <a href="https://www.project44.ca/">Project'44 the road to liberation</a>. Their
          <a href="https://map.project44.ca/">interactive WWII web map</a> and
          <a href="https://map.project44.ca/story-maps">story maps</a> are fantastic!
        </p>

        <p>
          For those who are interested in Cold War history, Hans Boersma's site
          <a href="https://www.orbat85.nl/"
            >Netherlands Armed Forces ORDER OF BATTLE 1985</a
          >
          is a real treat.
        </p>

        <p><a href="https://www.naval-history.net/index.htm">Naval-History.net</a> contains a wealth of information about the history of the Royal Navy.
        The site also contains an online version of Gordon Smith's book <a href="https://www.naval-history.net/NAVAL1982FALKLANDS.htm">BATTLE ATLAS of the FALKLANDS WAR 1982 by Land, Sea and Air</a>.  This book is used as one of the sources for ORBAT mapper's main demo scenario.
        </p>
      </ProseSection>
    </main>
  </div>
</template>

<script>
import ProseSection from "../components/ProseSection.vue";
import { Github as GithubIcon } from "mdue";

export default {
  components: {
    ProseSection,
    GithubIcon,
  },
};
</script>
