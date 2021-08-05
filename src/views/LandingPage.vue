<template>
  <div class="min-h-screen bg-gray-100 overflow-hidden">
    <main>
      <ProseSection class="">
        <h1><span class="text-red-900">Order of Battle</span> Mapper</h1>
        <p>Recreate historic battles.</p>
      </ProseSection>
      <LandingPageScenarios />

      <ProseSection class="">
        <h2>Features</h2>
        <h2>Credits</h2>
      </ProseSection>

      <ProseSection class="">
        <h2>Related tools</h2>

        <p>
          ORBAT mapper is created by a hobbyist. If you need something more
          professional try some of these excellent tools:
        </p>

        <ul>
          <li>map.army</li>
          <li>MGRS mapper</li>
          <li>ODIN</li>
        </ul>

        <h2>Tools for creating military overlays</h2>
        <p>
          Need to plan your next mission or recreate a historic battle? Here are
          a few options
        </p>

        <p>
          <a href="https://www.map.army/about/en.html">map.army</a> - a really
          nice web application for drawing map overlays with symbols and
          tactical graphics.
        </p>

        <p>
          <a href="https://mgrs-mapper.com/">MGRS Mapper</a> - operational
          graphics tool for junior leaders. Subscription based service. A
          limited free version is available.
        </p>

        <p>
          <a href="https://odin.syncpoint.io/en/"
            >ODIN open source command and control information system</a
          >. Desktop application available on most operating systems (Electron
          based). Still under development, but looks very promising!
        </p>

        <ul>
          <li>
            <a href="https://www.symbol.army/about/en.html">symbol.army</a>.
          </li>
          <li>
            <a href="https://odin.syncpoint.io/en/"
              >ODIN open source command and control information system</a
            >.
          </li>
          <li>
            <a href="https://www.project44.ca/"
              >Project'44 the road to liberation</a
            >.
          </li>
        </ul>
      </ProseSection>
    </main>
  </div>
</template>

<script>
import ProseSection from "../components/ProseSection.vue";
import LandingPageScenarios from "./LandingPageScenarios.vue";

export default {
  components: {
    LandingPageScenarios,
    ProseSection,
  },
  setup() {
    return {};
  },
};
</script>
