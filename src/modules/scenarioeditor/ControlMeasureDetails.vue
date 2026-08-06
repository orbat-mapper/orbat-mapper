<script setup lang="ts">
/**
 * The details panel for control measures — the `tacticalGraphic` branch of
 * `DetailsPanelContent`.
 *
 * It exists because the feature panel cannot describe one: every accessor there goes
 * through `getGeometryLayerItemById`, which returns nothing for a `tacticalGraphic`,
 * so a selected control measure used to render an empty header over four empty tabs.
 *
 * All the overlay / sidebar / pin / resize chrome comes from `MapEditorDetailsPanel`
 * by being a branch here — nothing of it is re-implemented, exactly as the feature
 * branch does it.
 *
 * Editing the shape is an **explicit gesture**: the Edit shape button arms `cmEdit`.
 * A click on the map only ever selects (ADR-0006), and the panel stays usable while
 * armed — which is the whole reason `useScenarioDraw` was hoisted out of the draw
 * toolbar, since that toolbar is usually closed.
 */
import { computed, ref, watch } from "vue";
import {
  IconAlertOutline,
  IconMagnifyExpand as ZoomIcon,
  IconPalette as StyleIcon,
  IconPencil as EditIcon,
  IconVectorPolyline as ShapeIcon,
} from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import { injectStrict } from "@/utils";
import {
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioDrawKey,
} from "@/components/injects";
import { type SelectedScenarioFeatures, useSelectedItems } from "@/stores/selectedStore";
import { useUiStore } from "@/stores/uiStore";
import { useTabStore } from "@/stores/tabStore";
import { renderMarkdown } from "@/composables/formatting";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import {
  resolveControlMeasureControlPoints,
  resolveControlMeasureOptions,
  resolveControlMeasureStyle,
} from "@/geo/controlMeasures";
import { isSupportedGraphicKind } from "@/scenariostore/tacticalGraphics";
import type { ControlMeasureStyleUpdate } from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import { isNTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type {
  NTacticalGraphicLayerItem,
  TacticalGraphicOptions,
} from "@/types/scenarioLayerItems";
import DetailsPanelHeader from "@/modules/scenarioeditor/DetailsPanelHeader.vue";
import PanelTitle from "@/modules/scenarioeditor/PanelTitle.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import ControlMeasureStyleSettings from "@/modules/scenarioeditor/ControlMeasureStyleSettings.vue";
import ControlMeasureEchelonSelect from "@/modules/scenarioeditor/ControlMeasureEchelonSelect.vue";
import ControlMeasureAmplifiers from "@/modules/scenarioeditor/ControlMeasureAmplifiers.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import EditMetaForm from "@/modules/scenarioeditor/EditMetaForm.vue";
import IconButton from "@/components/IconButton.vue";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import ScrollTabs from "@/components/ScrollTabs.vue";
import ScenarioLayerItemState from "@/modules/scenarioeditor/ScenarioLayerItemState.vue";

interface Props {
  selectedIds: SelectedScenarioFeatures;
}

const props = defineProps<Props>();

const { geo } = injectStrict(activeScenarioKey);
const engineRef = injectStrict(activeScenarioMapEngineKey);
const scenarioDraw = injectStrict(scenarioDrawKey);
const { clear: clearSelection } = useSelectedItems();
const uiStore = useUiStore();
const { controlMeasureDetailsTab: selectedTab } = storeToRefs(useTabStore());

const tabList = computed(() => {
  const tabs = [
    { label: "Style", value: "0" },
    { label: "Amplifiers", value: "1" },
    { label: "Details", value: "2" },
    { label: "State", value: "3" },
  ];
  if (uiStore.debugMode) tabs.push({ label: "Debug", value: "4" });
  return tabs;
});

const selectedTabString = computed({
  get: () => selectedTab.value.toString(),
  set: (value: string) => {
    selectedTab.value = Number(value);
  },
});

watch(
  () => uiStore.debugMode,
  (debugMode) => {
    if (!debugMode && selectedTab.value === 4) selectedTab.value = 0;
  },
  { immediate: true },
);

const item = computed<NTacticalGraphicLayerItem | null>(() => {
  if (props.selectedIds.size !== 1) return null;
  const { layerItem } = geo.getLayerItemById(props.selectedIds.values().next().value!);
  return layerItem && isNTacticalGraphicLayerItem(layerItem) ? layerItem : null;
});

const isMultiMode = computed(() => props.selectedIds.size > 1);
const supported = computed(() =>
  item.value ? isSupportedGraphicKind(item.value.graphicKind) : false,
);

/**
 * Read-time, like the layer tree's icon tint: the same projection the map renders
 * with. Nothing derived is stored.
 */
const strokeColor = computed(() => {
  if (!item.value) return undefined;
  const style = resolveControlMeasureStyle(item.value);
  return style.strokeColor ?? style.color;
});

const kindName = computed(() => {
  const kind = item.value?.graphicKind;
  if (!kind) return "";
  if (!supported.value) return String(kind);
  return CONTROL_MEASURE_METADATA[kind as ControlMeasureId]?.name ?? String(kind);
});

// The **projected** points, like `strokeColor` above and like the map: a recorded
// shape patch replaces `controlPoints` at the current time, so the top-level array
// would disagree with what is drawn.
const controlPointCount = computed(() =>
  item.value ? resolveControlMeasureControlPoints(item.value).length : 0,
);
// Projected too, for the same reason as `strokeColor` and `controlPointCount`: a
// recorded options patch is what the map is drawing with at the current time.
const resolvedOptions = computed(() =>
  item.value ? resolveControlMeasureOptions(item.value) : undefined,
);
const hDescription = computed(() => renderMarkdown(item.value?.description || ""));

const itemName = ref("");
watch(
  () => item.value?.name,
  (name) => {
    itemName.value = name ?? "";
  },
  { immediate: true },
);

const isEditMode = ref(false);
function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
  selectedTab.value = 2;
}

function showStylePanel() {
  selectedTab.value = 0;
}

function updateName(name: string) {
  if (item.value) geo.updateLayerItem(item.value.id, { name });
}

/**
 * One undoable store write per settled control — no preview/rollback pair like the
 * plain-feature style tab needs, because nothing in the styling UI writes mid-gesture:
 * the selects are discrete and the colour picker only emits on settle (ADR-0006, where
 * that rule is a leak fix rather than polish).
 *
 * The write is deliberately ungated. The gate that keeps colour off doctrinal kinds
 * lives in `ControlMeasureStyleSettings`, in the UI only; `updateTacticalGraphic` and
 * `toControlMeasure` stay uniform over kinds.
 */
function doStyleUpdate(data: ControlMeasureStyleUpdate) {
  if (item.value) scenarioDraw.updateControlMeasure(item.value.id, data);
}

function doAmplifierUpdate(textAmplifiers: NTacticalGraphicLayerItem["textAmplifiers"]) {
  if (item.value) scenarioDraw.updateControlMeasure(item.value.id, { textAmplifiers });
}

function doControlMeasureOptionsUpdate(options: TacticalGraphicOptions) {
  if (item.value) scenarioDraw.updateControlMeasure(item.value.id, { options });
}

function resetLabelPositions() {
  if (item.value) {
    scenarioDraw.updateControlMeasure(item.value.id, { amplifierPlacements: {} });
  }
}

function doMetaUpdate(data: {
  name?: string;
  description?: string;
  externalUrl?: string;
}) {
  if (item.value && data) geo.updateLayerItem(item.value.id, data);
  isEditMode.value = false;
}

// Editing needs a tactical-draw surface; OpenLayers has none. Step 18 owns the full
// capability gating, this is the panel's own honest affordance.
const canEditShape = computed(() => Boolean(engineRef.value?.draw) && supported.value);
const isEditingShape = computed(
  () => !!item.value && scenarioDraw.controlMeasureEditFeatureId.value === item.value.id,
);

function toggleEditShape() {
  if (!item.value) return;
  if (isEditingShape.value) {
    // Disarming settles, and an edit settles by closing and keeping its work.
    scenarioDraw.cancel();
    return;
  }
  scenarioDraw.startControlMeasureEdit(item.value.id);
}

/**
 * Additive to reshape rather than a separate mode the panel swaps into: the handles and
 * the transform box stay live, so nothing is taken away by turning it on. The flag
 * lives on the session composable, not here, because it is sticky across edits — see
 * `useControlMeasureEditSession`.
 */
const labelDragModel = computed({
  get: () => scenarioDraw.controlMeasureLabelDrag.value,
  set: (value: boolean) => scenarioDraw.setControlMeasureLabelDrag(value),
});

function doZoom() {
  const [first] = [...props.selectedIds];
  if (first !== undefined) engineRef.value?.layers.zoomToFeature(first);
}

function doDelete() {
  // Goes through the armed-tool owner so any open session settles before the write.
  scenarioDraw.deleteSelected();
  clearSelection();
}
</script>

<template>
  <div>
    <DetailsPanelHeader leading-align="center">
      <template v-if="item" #leading>
        <component
          :is="getGeometryIcon(item)"
          class="size-6"
          :style="supported ? { color: strokeColor } : undefined"
          :class="supported ? '' : 'text-muted-foreground'"
        />
      </template>
      <template #title>
        <EditableLabel v-if="item" v-model="itemName" @update-value="updateName" />
        <PanelTitle v-else-if="isMultiMode">
          {{ selectedIds.size }} control measures selected
        </PanelTitle>
      </template>
      <template v-if="item" #subtitle>
        <span class="flex items-center gap-1">
          {{ kindName }}
          <span
            v-if="!supported"
            class="flex items-center"
            :title="`Unsupported control measure kind '${item.graphicKind}' — kept in the scenario, but not drawn`"
          >
            <IconAlertOutline class="size-4" />
            <span class="sr-only">Unsupported</span>
          </span>
        </span>
      </template>
      <template #trailing>
        <Button
          v-if="isMultiMode"
          variant="outline"
          type="button"
          size="sm"
          @click="clearSelection()"
        >
          Clear
        </Button>
      </template>
      <template #actions>
        <IconButton title="Zoom to control measure" @click="doZoom()">
          <ZoomIcon class="size-5" />
        </IconButton>
        <IconButton
          v-if="item"
          title="Change control measure style"
          @click="showStylePanel()"
        >
          <StyleIcon class="size-5" />
        </IconButton>
        <IconButton
          v-if="item"
          :disabled="!canEditShape"
          :title="
            canEditShape
              ? 'Edit shape'
              : 'Editing control measures requires the MapLibre map'
          "
          @click="toggleEditShape()"
        >
          <ShapeIcon class="size-5" :class="isEditingShape ? 'text-amber-500' : ''" />
        </IconButton>
        <IconButton v-if="item" title="Edit data" @click="toggleEditMode()">
          <EditIcon class="size-5" />
        </IconButton>
      </template>
    </DetailsPanelHeader>

    <div
      v-if="isEditingShape"
      class="border-border bg-muted/50 mb-4 space-y-2 rounded-md border p-2 text-sm"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-muted-foreground">
          {{
            labelDragModel
              ? "Click a label to select it, then drag or rotate it."
              : "Drag the handles to reshape."
          }}
          Ctrl+Z undoes within the edit.
        </p>
        <Button type="button" variant="outline" size="sm" @click="toggleEditShape()">
          Done
        </Button>
      </div>
      <div class="flex items-center justify-between gap-2">
        <label class="flex items-center gap-2">
          <Switch v-model="labelDragModel" />
          <span>Move labels</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Reset label positions to their default placement"
          @click="resetLabelPositions()"
        >
          Reset positions
        </Button>
      </div>
    </div>

    <div v-if="item" class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTabString">
        <TabsContent value="0" class="mx-4">
          <PanelDataGrid class="mt-4">
            <ControlMeasureStyleSettings
              :graphic-kind="item.graphicKind"
              :measure-style="item.style"
              :standard-identity="item.standardIdentity"
              :color-mode="item.colorMode"
              :status="item.status"
              :options="resolvedOptions"
              :show-heading="false"
              @update="doStyleUpdate"
            />
            <ControlMeasureEchelonSelect
              :graphic-kind="item.graphicKind as ControlMeasureId"
              :options="resolvedOptions"
              inline
              @update="doControlMeasureOptionsUpdate"
            />
          </PanelDataGrid>
        </TabsContent>
        <TabsContent value="1" class="mx-4">
          <ControlMeasureAmplifiers
            v-if="supported"
            :graphic-kind="item.graphicKind as ControlMeasureId"
            :text-amplifiers="item.textAmplifiers"
            :options="resolvedOptions"
            @update="doAmplifierUpdate"
            @update-options="doControlMeasureOptionsUpdate"
          />
          <p v-else class="text-muted-foreground pt-4 text-sm">
            Amplifiers are unavailable for this unsupported control measure.
          </p>
        </TabsContent>
        <TabsContent value="2" class="mx-4">
          <PanelDataGrid class="mt-4">
            <div class="text-muted-foreground">Kind</div>
            <div class="truncate">{{ kindName }}</div>
            <div class="text-muted-foreground">Points</div>
            <div>{{ controlPointCount }}</div>
          </PanelDataGrid>

          <div v-if="isEditMode" class="mt-4">
            <EditMetaForm
              :item="item"
              @update="doMetaUpdate"
              @cancel="toggleEditMode()"
            />
          </div>
          <div v-else-if="item.description" class="prose prose-sm dark:prose-invert mt-4">
            <div v-html="hDescription"></div>
          </div>
        </TabsContent>
        <TabsContent value="3" class="mx-4">
          <ScenarioLayerItemState :item="item" heading="Control measure state" />
        </TabsContent>
        <TabsContent
          v-if="uiStore.debugMode"
          value="4"
          class="prose prose-sm dark:prose-invert mx-4 max-w-none"
        >
          <pre>{{ item }}</pre>
        </TabsContent>
      </ScrollTabs>
    </div>

    <div v-else-if="isMultiMode" class="mt-4">
      <Button type="button" variant="outline" size="sm" @click="doDelete()">
        Delete selected
      </Button>
    </div>
  </div>
</template>
