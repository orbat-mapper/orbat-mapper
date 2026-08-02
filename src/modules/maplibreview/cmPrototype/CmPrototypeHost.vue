<script setup lang="ts">
// PROTOTYPE — throwaway (#640). Mounts one control-measure UI variant over the real
// MapLibre scenario view. Opt in with `?cmvariant=A|B|C`; a no-op otherwise, and
// stripped from production builds — same gate as `tacticalDrawProbe`.
//
// Three variants of the control-measure draw/edit UI on the existing MapLibre
// scenario route, switchable via `?cmvariant=`.
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { injectStrict } from "@/utils";
import { activeScenarioMapEngineKey } from "@/components/injects";
import CmVariantA from "./CmVariantA.vue";
import CmVariantB from "./CmVariantB.vue";
import CmVariantC from "./CmVariantC.vue";
import CmPrototypeSwitcher from "./CmPrototypeSwitcher.vue";
import { useCmPrototype } from "./useCmPrototype";

const VARIANTS = [
  { key: "A", name: "tactrace port", component: CmVariantA },
  { key: "B", name: "native orbat-mapper", component: CmVariantB },
  { key: "C", name: "panel-first", component: CmVariantC },
];

const route = useRoute();
const router = useRouter();
const engineRef = injectStrict(activeScenarioMapEngineKey);
const cm = useCmPrototype(engineRef);

const current = computed(() => {
  const v = String(route.query.cmvariant ?? "A").toUpperCase();
  return VARIANTS.some((x) => x.key === v) ? v : "A";
});
const active = computed(() => VARIANTS.find((v) => v.key === current.value)!.component);

function select(key: string) {
  router.replace({ query: { ...route.query, cmvariant: key } });
}
</script>

<template>
  <!-- Overlay anchored to the map area, so the app's own panels stay visible beside it. -->
  <div class="pointer-events-none absolute inset-0 z-20">
    <component :is="active" :cm="cm" />
  </div>
  <CmPrototypeSwitcher
    :variants="VARIANTS.map(({ key, name }) => ({ key, name }))"
    :current="current"
    @select="select"
  />
</template>
