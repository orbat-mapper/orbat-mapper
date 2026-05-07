<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import EditableLabel from "@/components/EditableLabel.vue";
import DetailsPanelHeader from "@/modules/scenarioeditor/DetailsPanelHeader.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";
import type { SelectedScenarioFeatures } from "@/stores/selectedStore";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import {
  isArrowAnnotation,
  isTextAnnotation,
  type AnnotationLayerItemUpdate,
} from "@/types/scenarioLayerItems";
import ScenarioFeatureArrowSettings from "@/modules/scenarioeditor/ScenarioFeatureArrowSettings.vue";
import ScenarioFeatureStrokeSettings from "@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue";
import ScenarioFeatureVisibilitySettings from "@/modules/scenarioeditor/ScenarioFeatureVisibilitySettings.vue";
import ScenarioAnnotationTextSettings from "@/modules/scenarioeditor/ScenarioAnnotationTextSettings.vue";
import type { UpdateOptions } from "@/scenariostore/geo";

const props = defineProps<{
  selectedIds: SelectedScenarioFeatures;
}>();

const { geo } = injectStrict(activeScenarioKey);
const engineRef = injectStrict(activeScenarioMapEngineKey);

const annotation = computed(() => {
  if (props.selectedIds.size !== 1) return undefined;
  return geo.getAnnotationLayerItemById(props.selectedIds.values().next().value!).layerItem;
});

function updateAnnotation(data: AnnotationLayerItemUpdate, options?: UpdateOptions) {
  if (!annotation.value) return;
  if (options) {
    geo.updateAnnotation(annotation.value.id, data, options);
    return;
  }
  geo.updateAnnotation(annotation.value.id, data);
}

function commitAnnotation() {}

function updateName(value: string) {
  updateAnnotation({ name: value });
}

function reanchorToCurrentZoom() {
  const zoom = engineRef.value?.map.getZoom();
  if (annotation.value && typeof zoom === "number") {
    updateAnnotation({ anchorZoom: zoom });
  }
}
</script>

<template>
  <div>
    <DetailsPanelHeader>
      <template v-if="annotation" #leading>
        <component :is="getGeometryIcon(annotation)" class="text-muted-foreground size-6" />
      </template>
      <template #title>
        <EditableLabel
          v-if="annotation"
          :model-value="annotation.name ?? ''"
          @update-value="updateName"
        />
      </template>
      <template #trailing>
        <Button size="sm" type="button" variant="outline" @click="reanchorToCurrentZoom">
          Re-anchor
        </Button>
      </template>
    </DetailsPanelHeader>

    <PanelDataGrid v-if="annotation" class="mt-4">
      <ScenarioFeatureVisibilitySettings :feature="annotation" @update="updateAnnotation" />
      <ScenarioFeatureStrokeSettings
        v-if="isArrowAnnotation(annotation)"
        :feature="annotation"
        @update="updateAnnotation"
        @commit="commitAnnotation"
      />
      <ScenarioFeatureArrowSettings
        v-if="isArrowAnnotation(annotation)"
        :feature="annotation"
        @update="updateAnnotation"
      />
      <ScenarioAnnotationTextSettings
        v-if="isTextAnnotation(annotation)"
        :annotation="annotation"
        @update="updateAnnotation"
      />
    </PanelDataGrid>
  </div>
</template>
