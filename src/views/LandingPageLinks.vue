<script setup lang="ts">
import { SYMBOL_BROWSER_ROUTE, TEXT_TO_ORBAT_ROUTE } from "@/router/names";
import ProseSection from "@/components/ProseSection.vue";

// The illustration is a file on the server, under `public/images/`. The standalone build replaces
// this module, thus the section does not show a broken image. See `vite.singlefile.config.ts`.
</script>

<template>
  <section id="links" class="">
    <ProseSection class="">
      <p class="text-center">Links to work in progress components and experiments</p>
      <div class="grid grid-cols-2 place-items-center gap-4">
        <div class="aspect-w-5 aspect-h-2 overflow-hidden rounded-lg dark:bg-slate-400">
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
          <router-link :to="{ name: SYMBOL_BROWSER_ROUTE }" class="text-muted-foreground"
            >Symbol Browser
          </router-link>
        </ul>
      </div>
    </ProseSection>
  </section>
</template>
