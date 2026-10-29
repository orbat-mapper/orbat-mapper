<script setup lang="ts">
import { computed, ref } from "vue";

import InputCheckbox from "@/components/InputCheckbox.vue";
import { Button } from "@/components/ui/button";
import { activeScenarioKey } from "@/components/injects";
import LayerItemTreeSelect, {
  type LayerItemTreeLayer,
} from "@/modules/scenarioeditor/LayerItemTreeSelect.vue";
import type { FeatureId } from "@/types/scenarioGeoModels";
import {
  isNGeometryLayerItem,
  type NGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import { injectStrict } from "@/utils";

const props = defineProps<{ item: NGeometryLayerItem }>();
const emit = defineEmits<{
  paste: [];
  apply: [sourceId: FeatureId, deleteSource: boolean];
}>();

const { geo } = injectStrict(activeScenarioKey);

const sourceId = ref<FeatureId | null>(null);
const deleteSource = ref(false);

// Only features of the same geometry kind can lend their shape.
const sourceLayers = computed<LayerItemTreeLayer[]>(() =>
  geo.layerItemsLayers.value.map((layer) => ({
    id: layer.id,
    name: layer.name,
    items: layer.items.filter(
      (other) =>
        isNGeometryLayerItem(other) &&
        other.id !== props.item.id &&
        other.geometryMeta.geometryKind === props.item.geometryMeta.geometryKind,
    ),
  })),
);

function apply() {
  if (!sourceId.value) return;
  emit("apply", sourceId.value, deleteSource.value);
  sourceId.value = null;
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-muted-foreground text-sm">
      Record a new shape for this feature at the current time.
    </p>
    <Button type="button" variant="outline" size="sm" @click="emit('paste')">
      Paste GeoJSON geometry
    </Button>
    <LayerItemTreeSelect
      label="Use geometry from feature"
      placeholder="Select feature…"
      :layers="sourceLayers"
      v-model="sourceId"
    />
    <InputCheckbox v-model="deleteSource" label="Delete source feature" />
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="!sourceId"
      @click="apply()"
    >
      Use geometry
    </Button>
  </div>
</template>
