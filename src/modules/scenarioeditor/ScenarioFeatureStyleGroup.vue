<script setup lang="ts">
import { computed } from "vue";
import { isEqual } from "es-toolkit";
import ScenarioFeatureMarkerSettings from "@/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue";
import ScenarioFeatureStrokeSettings from "@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue";
import ScenarioFeatureArrowSettings from "@/modules/scenarioeditor/ScenarioFeatureArrowSettings.vue";
import ScenarioFeatureFillSettings from "@/modules/scenarioeditor/ScenarioFeatureFillSettings.vue";
import ScenarioFeatureTextSettings from "@/modules/scenarioeditor/ScenarioFeatureTextSettings.vue";
import ScenarioFeatureVisibilitySettings from "@/modules/scenarioeditor/ScenarioFeatureVisibilitySettings.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import type { GeometryLayerItemUpdate, NGeometryLayerItem } from "@/types/internalModels";
import type { UpdateOptions } from "@/scenariostore/geo";

// Style controls for features sharing one geometry kind. The controls show the
// first feature's values; updates are meant to be applied to all `features`.
const props = defineProps<{ features: NGeometryLayerItem[]; title?: string }>();
const emit = defineEmits<{
  (e: "update", value: GeometryLayerItemUpdate, options?: UpdateOptions): void;
  (e: "commit"): void;
}>();

const feature = computed(() => props.features[0]!);
const geometryType = computed(() => feature.value.geometryMeta.geometryKind);
const hasMarker = computed(
  () => geometryType.value === "Point" || geometryType.value === "GeometryCollection",
);
const hasStroke = computed(() => geometryType.value !== "Point");
const hasArrows = computed(() => geometryType.value === "LineString");
const hasFill = computed(
  () => !["Point", "LineString"].includes(geometryType.value || ""),
);
const hasText = computed(() => geometryType.value !== "Circle");

const hasMixedStyles = computed(() => {
  const [first, ...rest] = props.features;
  return rest.some((f) => !isEqual(f.style, first!.style));
});

function onUpdate(value: GeometryLayerItemUpdate, options?: UpdateOptions) {
  emit("update", value, options);
}
</script>
<template>
  <section>
    <header
      v-if="title"
      class="bg-foreground/10 text-foreground mt-4 flex items-center gap-2 rounded-md px-2 py-1.5"
    >
      <component :is="getGeometryIcon(feature)" class="text-muted-foreground size-5" />
      <span class="font-semibold" data-test="style-group-title">{{ title }}</span>
      <span
        class="bg-background text-muted-foreground ml-auto rounded-full px-2 text-xs tabular-nums"
        data-test="style-group-count"
      >
        {{ features.length }}
      </span>
    </header>
    <PanelDataGrid class="mt-4">
      <div
        v-if="hasMixedStyles"
        class="col-span-2 text-xs text-amber-700"
        data-test="mixed-styles-note"
      >
        Mixed values in current selection. Showing values from the first feature.
      </div>
      <ScenarioFeatureVisibilitySettings :feature="feature" @update="onUpdate" />
      <ScenarioFeatureMarkerSettings
        v-if="hasMarker"
        :feature="feature"
        @update="onUpdate"
      />
      <ScenarioFeatureStrokeSettings
        v-if="hasStroke"
        :feature="feature"
        @update="onUpdate"
        @commit="emit('commit')"
      />
      <ScenarioFeatureArrowSettings
        v-if="hasArrows"
        :feature="feature"
        @update="onUpdate"
      />
      <ScenarioFeatureFillSettings
        v-if="hasFill"
        :feature="feature"
        @update="onUpdate"
        @commit="emit('commit')"
      />
      <ScenarioFeatureTextSettings v-if="hasText" :feature="feature" @update="onUpdate" />
    </PanelDataGrid>
  </section>
</template>
