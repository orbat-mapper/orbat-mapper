<script setup lang="ts">
/**
 * The details panel for point symbols — the `pointSymbol` branch of
 * `DetailsPanelContent`, laid out like `ControlMeasureDetails` so the two kinds of
 * control measure read as one family: the same header actions, the same tabs, and
 * moving/rotating/resizing as an explicit gesture the way reshaping is.
 */
import { computed, ref, watch } from "vue";
import {
  IconContentCopy as DuplicateIcon,
  IconMagnifyExpand as ZoomIcon,
  IconPalette as StyleIcon,
  IconPencil as EditIcon,
  IconVectorPolyline as ShapeIcon,
} from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import { resizePointSymbolSize } from "@orbat-mapper/tactical-draw";
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
import { isNPointSymbolLayerItem } from "@/types/scenarioLayerItems";
import type { NPointSymbolLayerItem } from "@/types/scenarioLayerItems";
import { DEFAULT_POINT_SYMBOL_SIZE } from "@/geo/pointSymbols";
import { convertPointSymbolSize, isPointSymbolSizeUnit } from "@/geo/pointSymbolSizing";
import { normalizeRotation } from "@/geo/rotation";
import { Sidc } from "@/symbology/sidc";
import { standardIdentityValues } from "@/symbology/values";
import { usePointSymbolEntry } from "@/modules/scenarioeditor/controlMeasureCatalogue";
import DetailsPanelHeader from "@/modules/scenarioeditor/DetailsPanelHeader.vue";
import PanelTitle from "@/modules/scenarioeditor/PanelTitle.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import EditMetaForm from "@/modules/scenarioeditor/EditMetaForm.vue";
import IconButton from "@/components/IconButton.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import {
  bearingDegreesToRadians,
  radiansToBearingDegrees,
} from "@/modules/scenarioeditor/scenarioMapViewSnapshot";
import PointSymbolAmplifiers from "@/modules/scenarioeditor/PointSymbolAmplifiers.vue";
import ScenarioLayerItemState from "@/modules/scenarioeditor/ScenarioLayerItemState.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const props = defineProps<{ selectedIds: SelectedScenarioFeatures }>();

const { geo } = injectStrict(activeScenarioKey);
const engineRef = injectStrict(activeScenarioMapEngineKey);
const scenarioDraw = injectStrict(scenarioDrawKey);
const { clear: clearSelection } = useSelectedItems();
const uiStore = useUiStore();
// Shared with the control-measure panel, so moving between the two kinds keeps the
// tab the user was on.
const { controlMeasureDetailsTab: selectedTab } = storeToRefs(useTabStore());

const tabList = computed(() => {
  const tabs = [
    { label: "Style", value: "0" },
    { label: "Amplifiers", value: "2" },
    { label: "Details", value: "3" },
    { label: "State", value: "4" },
  ];
  if (uiStore.debugMode) tabs.push({ label: "Debug", value: "5" });
  return tabs;
});
const selectedTabString = computed({
  get: () => selectedTab.value.toString(),
  set: (value: string) => (selectedTab.value = Number(value)),
});
// Fall back to Style when the stored tab is not offered, such as Debug once debug
// mode is off, so the body is never blank — also on mount with a stale selection.
watch(
  tabList,
  (tabs) => {
    if (!tabs.some((tab) => tab.value === selectedTabString.value)) selectedTab.value = 0;
  },
  { immediate: true },
);

const item = computed<NPointSymbolLayerItem | null>(() => {
  if (props.selectedIds.size !== 1) return null;
  const { layerItem } = geo.getLayerItemById(props.selectedIds.values().next().value!);
  return layerItem && isNPointSymbolLayerItem(layerItem) ? layerItem : null;
});
const isMultiMode = computed(() => props.selectedIds.size > 1);

const entry = usePointSymbolEntry(() => item.value?.sidc);
const kindName = computed(() => entry.value?.name ?? "Point symbol");

const itemName = ref("");
watch(
  () => item.value?.name,
  (name) => (itemName.value = name ?? ""),
  { immediate: true },
);
function updateName(name: string) {
  if (item.value) geo.updateLayerItem(item.value.id, { name });
}

/** Identity and status live in the SIDC, so both edits rewrite it. */
function updateSidc(change: (sidc: Sidc) => void) {
  if (!item.value) return;
  const sidc = new Sidc(item.value.sidc);
  change(sidc);
  scenarioDraw.updatePointSymbol(item.value.id, { sidc: sidc.toString() });
}
const identityModel = computed({
  get: () => (item.value ? new Sidc(item.value.sidc).standardIdentity : "3"),
  set: (value: string) => updateSidc((sidc) => (sidc.standardIdentity = value)),
});
const statusModel = computed({
  get: () =>
    item.value && new Sidc(item.value.sidc).status === "1" ? "planned" : "present",
  set: (value: string) =>
    updateSidc((sidc) => (sidc.status = value === "planned" ? "1" : "0")),
});

const size = computed(() => item.value?.size ?? DEFAULT_POINT_SYMBOL_SIZE);
/** A new value in the size's own unit; a ground size's on-screen bounds scale with it. */
function updateSize(value: string | number) {
  const next = Number(value);
  if (!item.value || !(next > 0)) return;
  scenarioDraw.updatePointSymbol(item.value.id, (current) => ({
    size: resizePointSymbolSize(current.size ?? DEFAULT_POINT_SYMBOL_SIZE, next),
  }));
}

/** Switch between screen and ground size, keeping how big it looks at this zoom. */
function updateSizeUnit(unit: unknown) {
  if (!item.value || !isPointSymbolSizeUnit(unit) || unit === size.value.unit) return;
  const zoom = engineRef.value?.map.getZoom();
  scenarioDraw.updatePointSymbol(item.value.id, (current) => ({
    size: convertPointSymbolSize(current.size ?? DEFAULT_POINT_SYMBOL_SIZE, unit, zoom),
  }));
}

/** Stored in radians, shown in degrees. */
const rotationDegrees = computed(() =>
  Math.round(normalizeRotation(radiansToBearingDegrees(item.value?.rotation ?? 0))),
);
function updateRotation(value: string | number) {
  const degrees = Number(value);
  if (!item.value || !Number.isFinite(degrees)) return;
  scenarioDraw.updatePointSymbol(item.value.id, {
    rotation: bearingDegreesToRadians(normalizeRotation(degrees)),
  });
}

function doAmplifierUpdate(textAmplifiers: Record<string, string>) {
  if (item.value) scenarioDraw.updatePointSymbol(item.value.id, { textAmplifiers });
}

const canEditShape = computed(() => Boolean(engineRef.value?.draw));
const isEditingShape = computed(
  () => !!item.value && scenarioDraw.controlMeasureEditFeatureId.value === item.value.id,
);
function toggleEditShape() {
  if (!item.value) return;
  if (isEditingShape.value) scenarioDraw.cancel();
  else scenarioDraw.startControlMeasureEdit(item.value.id);
}

const isEditMode = ref(false);
function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
  selectedTab.value = 3;
}
function showStylePanel() {
  selectedTab.value = 0;
}
const hDescription = computed(() => renderMarkdown(item.value?.description || ""));
function doMetaUpdate(data: {
  name?: string;
  description?: string;
  externalUrl?: string;
}) {
  if (item.value && data) geo.updateLayerItem(item.value.id, data);
  isEditMode.value = false;
}

function doZoom() {
  const [first] = [...props.selectedIds];
  if (first !== undefined) engineRef.value?.layers.zoomToFeature(first);
}
function doDuplicate() {
  scenarioDraw.duplicateSelected();
}
function doDelete() {
  scenarioDraw.deleteSelected();
  clearSelection();
}
</script>

<template>
  <div>
    <DetailsPanelHeader leading-align="center">
      <template v-if="item" #leading>
        <MilitarySymbol :sidc="item.sidc" :size="20" class="flex-none" />
      </template>
      <template #title>
        <EditableLabel v-if="item" v-model="itemName" @update-value="updateName" />
        <PanelTitle v-else-if="isMultiMode">
          {{ selectedIds.size }} control measures selected
        </PanelTitle>
      </template>
      <template v-if="item" #subtitle>{{ kindName }}</template>
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
        <IconButton v-if="item" title="Duplicate control measure" @click="doDuplicate()">
          <DuplicateIcon class="size-5" />
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
              ? 'Move, rotate or resize'
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
      class="border-border bg-muted/50 mb-4 flex flex-col gap-2 rounded-md border p-2 text-sm"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-muted-foreground">
          Drag to move; use the handles to rotate or resize. Ctrl+Z undoes within the
          edit.
        </p>
        <Button type="button" variant="outline" size="sm" @click="toggleEditShape()">
          Done
        </Button>
      </div>
    </div>

    <div v-if="item" class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTabString">
        <TabsContent value="0" class="mx-4">
          <PanelDataGrid class="mt-4">
            <label for="ps-identity" class="self-center">Identity</label>
            <NativeSelect
              id="ps-identity"
              v-model="identityModel"
              class="w-full"
              wrapper-class="w-full"
            >
              <NativeSelectOption
                v-for="option in standardIdentityValues"
                :key="option.code"
                :value="option.code"
              >
                {{ option.text }}
              </NativeSelectOption>
            </NativeSelect>

            <label for="ps-status" class="self-center">Status</label>
            <NativeSelect
              id="ps-status"
              v-model="statusModel"
              class="w-full"
              wrapper-class="w-full"
            >
              <NativeSelectOption value="present">Present</NativeSelectOption>
              <NativeSelectOption value="planned">Planned</NativeSelectOption>
            </NativeSelect>

            <label for="ps-size" class="self-center">Size</label>
            <div class="flex items-center gap-2">
              <Input
                id="ps-size"
                type="number"
                min="1"
                :model-value="size.value"
                class="h-8"
                @change="updateSize(($event.target as HTMLInputElement).value)"
              />
              <ToggleGroup
                :model-value="size.unit"
                type="single"
                size="sm"
                variant="outline"
                aria-label="Size unit"
                @update:model-value="updateSizeUnit"
              >
                <ToggleGroupItem
                  value="pixels"
                  title="Screen size: stays the same as you zoom"
                  class="px-2 text-xs"
                  >px</ToggleGroupItem
                >
                <ToggleGroupItem
                  value="meters"
                  title="Ground size: scales with the map"
                  class="px-2 text-xs"
                  >m</ToggleGroupItem
                >
              </ToggleGroup>
            </div>

            <label for="ps-rotation" class="self-center">Rotation</label>
            <div class="flex items-center gap-2">
              <Input
                id="ps-rotation"
                type="number"
                step="1"
                :model-value="rotationDegrees"
                class="h-8"
                @change="updateRotation(($event.target as HTMLInputElement).value)"
              />
              <span class="text-muted-foreground text-sm">°</span>
            </div>
          </PanelDataGrid>
        </TabsContent>
        <TabsContent value="2" class="mx-4">
          <PointSymbolAmplifiers
            :key="item.id"
            :sidc="item.sidc"
            :text-amplifiers="item.textAmplifiers"
            @update="doAmplifierUpdate"
          />
        </TabsContent>
        <TabsContent value="3" class="mx-4">
          <PanelDataGrid class="mt-4">
            <div class="text-muted-foreground">Kind</div>
            <div class="truncate">{{ kindName }}</div>
            <template v-if="entry">
              <div class="text-muted-foreground">Entity</div>
              <div>{{ entry.entity }}</div>
            </template>
            <div class="text-muted-foreground">SIDC</div>
            <div class="font-mono text-xs break-all">{{ item.sidc }}</div>
          </PanelDataGrid>

          <p v-if="entry?.description" class="text-muted-foreground mt-4 text-sm">
            {{ entry.description }}
          </p>

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
        <TabsContent value="4" class="mx-4">
          <ScenarioLayerItemState :item="item" heading="Control measure state" />
        </TabsContent>
        <TabsContent
          v-if="uiStore.debugMode"
          value="5"
          class="prose prose-sm dark:prose-invert mx-4 max-w-none"
        >
          <pre>{{ item }}</pre>
        </TabsContent>
      </ScrollTabs>
    </div>

    <div v-else-if="isMultiMode" class="mt-4 flex flex-col gap-4">
      <Button type="button" variant="outline" size="sm" @click="doDelete()">
        Delete selected
      </Button>
    </div>
  </div>
</template>
