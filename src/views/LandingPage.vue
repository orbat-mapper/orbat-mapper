<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted } from "vue";
import { useScenarioShare } from "@/composables/scenarioShare";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { useScenario } from "@/scenariostore";
import { ORBAT_CHART_ROUTE, TEXT_TO_ORBAT_ROUTE } from "@/router/names";

// ... existing imports
import { ExternalLinkIcon, MoonStarIcon, SunIcon } from "lucide-vue-next";
import ProseSection from "../components/ProseSection.vue";
import LandingPageScenarios from "./LandingPageScenarios.vue";
import { IconGithub as GithubIcon } from "@iconify-prerendered/vue-mdi";
import { CheckIcon } from "@heroicons/vue/24/outline";
import { Button } from "@/components/ui/button";
import { UseDark } from "@vueuse/components";

const route = useRoute();
const { loadScenarioFromUrlParam } = useScenarioShare();
const { loadScenario } = useBrowserScenarios();
const { scenario } = useScenario();

onMounted(async () => {
  if (route.query.data) {
    try {
      const scenarioData = await loadScenarioFromUrlParam(route.query.data as string);
      scenario.value.io.loadFromObject(scenarioData);
      await loadScenario(scenarioData);
    } catch (e) {
      console.error("Failed to load scenario from URL", e);
    }
  }
});

const features = [
  {
    name: "Create ORBATs",
    description: "Quickly build ORBATs.",
  },
  {
    name: "Draw features",
    description: "",
  },
  {
    name: "Client side only",
    description: "Everything is stored on your computer.",
  },
  {
    name: "Grid edit moe",
    description: "Efficient editing.",
  },
  {
    name: "Export to KML/KMZ",
    description: "View your scenario in 3D with Google Earth.",
  },
  {
    name: "Export as GeoJSON",
    description: "",
  },
  {
    name: "Import MilX",
    description: "Import military map overlays from map.army.",
  },
  {
    name: "Import GeoJSON",
    description: "",
  },
];
</script>

<template>
  <div class="bg-background flex h-full flex-col">
    <header
      class="bg-muted relative top-0 right-0 left-0 flex items-center justify-center gap-8 p-1 text-center"
    >
      <p>
        This is a work in progress prototype. Follow the
        <a href="https://github.com/orbat-mapper/orbat-mapper" class="underline"
          >development on GitHub <GithubIcon class="inline size-6 sm:size-10" />
        </a>
      </p>
      <UseDark v-slot="{ isDark, toggleDark }">
        <Button
          variant="ghost"
          size="icon"
          @click="toggleDark()"
          title="Toggle dark mode"
        >
          <SunIcon v-if="isDark" /><MoonStarIcon v-else />
        </Button>
      </UseDark>
    </header>

    <main>
      <section class="mt-16 sm:mt-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="text-center">
            <h1
              class="text-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              <span class="text-red-900 dark:text-red-900/90">ORBAT</span>
              Mapper<span
                class="text-muted-foreground absolute text-sm tracking-normal uppercase"
                >beta</span
              >
            </h1>
            <p
              class="text-muted-foreground mx-auto mt-3 max-w-md text-base sm:text-lg md:mt-5 md:max-w-3xl md:text-xl"
            >
              Recreate historic battles and military scenarios in your browser
            </p>
            <p class="mt-4">
              <Button as-child variant="link"
                ><a
                  href="https://docs.orbat-mapper.app/guide/about-orbat-mapper"
                  target="_blank"
                  >View documentation
                  <ExternalLinkIcon class="text-muted-foreground -ml-1" /></a
              ></Button>
            </p>
          </div>
        </div>
      </section>

      <section id="scenarios">
        <LandingPageScenarios class="mt-16" />
      </section>

      <section id="features" class="bg-muted/40 dark:bg-muted/20">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div class="mx-auto max-w-3xl text-center">
            <h2 class="text-heading text-3xl font-bold tracking-tight">Features</h2>
            <p class="text-muted-foreground mt-4 text-lg">
              Some of the things you can do with ORBAT mapper
            </p>
          </div>
          <dl
            class="mt-12 space-y-10 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8"
          >
            <div v-for="feature in features" :key="feature.name" class="relative">
              <dt>
                <CheckIcon
                  class="text-accent-foreground absolute h-6 w-6"
                  aria-hidden="true"
                />
                <p class="text-heading ml-9 text-lg leading-6 font-medium">
                  {{ feature.name }}
                </p>
              </dt>
              <dd class="text-muted-foreground mt-2 ml-9 text-base">
                {{ feature.description }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="links" class="">
        <ProseSection class="">
          <p class="text-center">Links to work in progress components and experiments</p>
          <div class="grid grid-cols-2 place-items-center gap-4">
            <div
              class="aspect-w-5 aspect-h-2 overflow-hidden rounded-lg dark:bg-slate-400"
            >
              <img
                src="/images/orbat-chart-demo-min.png"
                width="2136"
                height="1780"
                class="object-cover object-top"
              />
            </div>
            <ul class="flex flex-col gap-4">
              <router-link :to="{ name: TEXT_TO_ORBAT_ROUTE }" class="shrink-0"
                >Text to ORBAT
              </router-link>

              <router-link :to="{ name: ORBAT_CHART_ROUTE }" class="text-muted-foreground"
                >Orbat chart test
              </router-link>

              <router-link to="/storymode" class="text-muted-foreground"
                >Story mode test</router-link
              >
              <router-link to="/testgrid" class="text-muted-foreground"
                >Test grid</router-link
              >
              <router-link to="/testgrid2" class="text-muted-foreground"
                >Tanstack Table Test grid</router-link
              >
            </ul>
          </div>
        </ProseSection>
      </section>
    </main>
    <footer class="bg-muted/40">
      <div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          class="-mb-6 columns-2 font-medium sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/guide/about-orbat-mapper"
              class="text-muted-foreground hover:text-foreground text-sm leading-6"
              >About</a
            >
          </div>

          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/guide/getting-started"
              class="text-muted-foreground hover:text-foreground text-sm leading-6"
              >Getting started</a
            >
          </div>

          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/resources/tools"
              class="text-muted-foreground hover:text-foreground text-sm leading-6"
              >Resources</a
            >
          </div>

          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/support"
              class="text-muted-foreground hover:text-foreground text-sm leading-6"
              >Support</a
            >
          </div>
        </nav>
        <div class="mt-10 flex justify-center space-x-10">
          <a
            href="https://github.com/orbat-mapper/orbat-mapper"
            class="text-muted-foreground hover:text-foreground"
          >
            <span class="sr-only">GitHub</span>
            <svg
              class="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
