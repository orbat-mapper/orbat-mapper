<script setup lang="ts">
// The heading text for the demo scenarios. It sits above the grid, thus it is a module of its
// own: the standalone build replaces it together with `DemoScenarioCards.vue`, and neither the
// note nor the invitation to open a demo is left behind. See `vite.singlefile.config.ts`.
</script>

<template>
  <section class="mb-2">
    <p
      class="bg-muted/50 text-muted-foreground relative top-0 right-0 left-0 p-4 text-center text-sm"
    >
      Please note that the demo scenarios are incomplete and they are still under
      development.
    </p>
  </section>
  <div class="mx-auto max-w-3xl px-4 text-center">
    <p class="text-muted-foreground text-lg">
      Try one of the bundled demo scenarios or create your own
    </p>
  </div>
</template>
