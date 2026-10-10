<script setup lang="ts">
import { computed, inject, type InjectionKey, type Ref } from "vue";

/**
 * The hover readout lives in its own component so that reading the hovered name does
 * not make the *grid* re-render. The ref is injected rather than passed as a prop
 * because a template binding would unwrap it in the panel's own render, which is
 * exactly the dependency this avoids: every pointer crossing would otherwise rebuild
 * every tile's vnode.
 */
const props = defineProps<{ total: string }>();
const hovered = inject(CONTROL_MEASURE_CATALOGUE_HOVERED, null);
const text = computed(() => hovered?.value ?? props.total);
</script>

<script lang="ts">
export const CONTROL_MEASURE_CATALOGUE_HOVERED = Symbol(
  "controlMeasureCatalogueHovered",
) as InjectionKey<Ref<string | null>>;
</script>

<template>
  <div
    aria-live="polite"
    class="text-muted-foreground shrink-0 truncate border-t px-3 py-1 text-xs"
  >
    {{ text }}
  </div>
</template>
