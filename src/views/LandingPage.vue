<template>
  <div class="min-h-screen bg-gray-100 overflow-hidden">
    <main>
      <ProseSection class="">
        <h1><span class="text-red-900">Order of Battle</span> Mapper</h1>
        <p>Recreate historic battles.</p>

        <p>
          Follow the development of
          <a href="https://github.com/kjellmf/orbat-mapper"
            >ORBAT Mapper on GitHub
            <GithubIcon class="w-10 h-10 inline" /> </a
          >.
        </p>
        <p>
          <router-link to="/storymode" class="">Story mode test</router-link>
        </p>

        <p>
          <router-link :to="{ name: ORBAT_CHART_ROUTE }" class=""
            >Orbat chart test
          </router-link>
        </p>
      </ProseSection>
      <LandingPageScenarios />

      <ProseSection class="">
        <!--        <h2>Features</h2>-->
        <!--        <h2>Credits</h2>-->
      </ProseSection>

      <ProseSection class="">
        <h2>Other tools and resources</h2>

        <p>
          ORBAT mapper is created by a hobbyist. If you need something more
          professional or you want to create military overlays, try some of
          these excellent tools instead:
        </p>

        <ul>
          <li>
            <p>
              <a href="https://www.map.army/about/en.html">map.army</a> - a
              really nice web application for drawing map overlays with symbols
              and tactical graphics.
            </p>
          </li>

          <li>
            <p>
              <a href="https://mgrs-mapper.com/">MGRS Mapper</a> -
              <q>operational graphics tool for junior leaders</q>. Subscription
              based service. A limited free version is available.
            </p>
          </li>

          <li>
            <p>
              <a href="https://odin.syncpoint.io/en/"
                >ODIN open source command and control information system</a
              >. Desktop application available on most operating systems
              (Electron based). Still under development, but looks very
              promising!
            </p>
          </li>
        </ul>

        <h3>Military history</h3>

        <p>
          If you are interested in WW2 history I highly recommend the site
          <a href="https://www.project44.ca/"
            >Project'44 the road to liberation</a
          >. Their
          <a href="https://map.project44.ca/">interactive WWII web map</a> and
          <a href="https://map.project44.ca/story-maps">story maps</a> are
          fantastic!
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

<script>
import ProseSection from "../components/ProseSection.vue";
import LandingPageScenarios from "./LandingPageScenarios.vue";
import { Github as GithubIcon } from "mdue";
import { ORBAT_CHART_ROUTE } from "../routes";

export default {
  components: {
    LandingPageScenarios,
    ProseSection,
    GithubIcon,
  },
  setup() {
    return { ORBAT_CHART_ROUTE };
  },
};
</script>
