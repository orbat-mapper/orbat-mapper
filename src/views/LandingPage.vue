<template>
  <div class="min-h-screen overflow-hidden bg-gray-100">
    <main>
      <ProseSection class="">
        <h1><span class="text-red-900">Order of Battle</span> Mapper</h1>
        <p>Recreate historic battles and military scenarios.</p>

        <p>
          This is a work in progress prototype. Follow the development of
          <a href="https://github.com/orbat-mapper/orbat-mapper"
            >ORBAT Mapper on GitHub <GithubIcon class="inline h-10 w-10" /> </a
          >.
        </p>

        <div class="grid grid-cols-2 place-items-center gap-4">
          <div class="aspect-w-5 aspect-h-2 overflow-hidden rounded-lg bg-gray-100">
            <img
              src="/images/orbat-chart-demo-min.png"
              width="2136"
              height="1780"
              class="object-cover object-top"
            />
          </div>
          <router-link :to="{ name: ORBAT_CHART_ROUTE }" class="flex-shrink-0"
            >Orbat chart test
          </router-link>
        </div>
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          <router-link to="/storymode" class="">Story mode test</router-link>
          <router-link :to="{ name: ORBAT_CHART_ROUTE }" class=""
            >Orbat chart test
          </router-link>
        </ul>
      </ProseSection>

      <LandingPageScenarios />

      <ProseSection class="">
        <!--        <h2>Features</h2>-->
        <!--        <h2>Credits</h2>-->
      </ProseSection>

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
              <a href="https://mgrs-mapper.com/">MGRS Mapper</a> -
              <q>operational graphics tool for junior leaders</q>. Subscription based
              service. A limited free version is available.
            </p>
          </li>

          <li>
            <p>
              <a href="https://odin.syncpoint.io/en/"
                >ODIN open source command and control information system</a
              >. Desktop application available on most operating systems (Electron based).
              Still under development, but looks very promising!
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
      </ProseSection>
    </main>
  </div>
</template>

<script setup>
import ProseSection from "../components/ProseSection.vue";
import LandingPageScenarios from "./LandingPageScenarios.vue";
import { Github as GithubIcon } from "mdue";
import { ORBAT_CHART_ROUTE } from "@/router/names";
</script>
