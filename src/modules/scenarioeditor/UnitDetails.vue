<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  ref,
  useTemplateRef,
  watch,
  watchEffect,
} from "vue";
import {
  IconCrosshairsGps,
  IconEye,
  IconEyeOff,
  IconFileTreeOutline as TreeLocateIcon,
  IconLockOutline,
  IconLockOpenVariantOutline,
  IconMagnifyExpand as ZoomIcon,
  IconPencil as EditIcon,
} from "@iconify-prerendered/vue-mdi";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import { GlobalEvents } from "vue-global-events";
import { inputEventFilter } from "@/components/helpers";
import DescriptionItem from "@/components/DescriptionItem.vue";
import { unrefElement, useToggle } from "@vueuse/core";
import { renderMarkdown } from "@/composables/formatting";
import UnitPanelState from "./UnitPanelState.vue";
import { hideBranchMenuItems, useUnitActions } from "@/composables/scenarioActions";
import { type UnitAction, UnitActions } from "@/types/constants";
import SplitButton from "@/components/SplitButton.vue";
import { type EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey, searchActionsKey, sidcModalKey } from "@/components/injects";
import type { MediaUpdate, NUnit, UnitUpdate } from "@/types/internalModels";
import { formatPosition } from "@/geo/utils";
import IconButton from "@/components/IconButton.vue";
import { useGetMapLocation } from "@/composables/geoMapLocation";

import { useUiStore } from "@/stores/uiStore";
import { setSid } from "@/symbology/helpers";
import { useSelectedItems } from "@/stores/selectedStore";
import { TabsContent } from "@/components/ui/tabs";
import EditableLabel from "@/components/EditableLabel.vue";
import UnitDetailsMapDisplay from "@/modules/scenarioeditor/UnitDetailsMapDisplay.vue";
import { useTabStore } from "@/stores/tabStore";
import { storeToRefs } from "pinia";
import UnitDetailsToe from "@/modules/scenarioeditor/UnitDetailsToe.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { type MenuItemData } from "@/components/types";
import EditMediaForm from "@/modules/scenarioeditor/EditMediaForm.vue";
import EditMetaForm from "@/modules/scenarioeditor/EditMetaForm.vue";
import UnitDetailsProperties from "@/modules/scenarioeditor/UnitDetailsProperties.vue";
import UnitDetailsSymbol from "@/modules/scenarioeditor/UnitDetailsSymbol.vue";
import { Button } from "@/components/ui/button";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getUnitDragItem } from "@/types/draggables.ts";
import UnitSymbol from "@/components/UnitSymbol.vue";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRecordingStore } from "@/stores/recordingStore";
import DetailsPanelHeader from "@/modules/scenarioeditor/DetailsPanelHeader.vue";
import PanelTitle from "@/modules/scenarioeditor/PanelTitle.vue";
import UnitSelectionSummary from "@/modules/scenarioeditor/UnitSelectionSummary.vue";
import { useUnitEditTargets } from "@/composables/unitEditTargets";

const FeatureTransformations = defineAsyncComponent(
  () => import("@/modules/scenarioeditor/FeatureTransformations.vue"),
);

const props = defineProps<{ unitId: EntityId }>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  store,
  helpers: { getUnitById },
  geo: { addUnitPosition },
  unitActions: {
    updateUnit,
    getUnitHierarchy,
    getCombinedSymbolOptions,
    isUnitLocked,
    updateUnitLocked,
  },
} = activeScenario;

const { onUnitSelectHook } = injectStrict(searchActionsKey);

const {
  state: { unitStatusMap },
} = store;
const { unitDetailsTab: selectedTab } = storeToRefs(useTabStore());

const unitName = ref("");
const shortName = ref("");
const isDragged = ref(false);
const elRef = useTemplateRef("elRef");

const tabList = computed(() => {
  const base = [
    // Name, description and initial location can't be set for several units at once
    ...(isMultiMode.value ? [] : [{ label: "Details", value: "0" }]),
    { label: "Map symbol", value: "1" },
    { label: "Unit state", value: "2" },
    { label: "TO&E/S", value: "3" },
    { label: "Map display", value: "4" },
    { label: "Properties", value: "5" },
    { label: "Transform", value: "6" },
  ];
  if (uiStore.debugMode) {
    base.push({ label: "Debug", value: "7" });
  }
  return base;
});

const selectedTabString = computed({
  get: () =>
    isMultiMode.value && selectedTab.value === 0 ? "1" : selectedTab.value.toString(),
  set: (v) => {
    selectedTab.value = Number(v);
  },
});

const unit = computed(() => {
  return getUnitById(props.unitId);
});

function getStatusName(u: NUnit) {
  const status = u._state?.status || u.status;
  return status ? unitStatusMap[status]?.name : undefined;
}

const {
  isMultiMode,
  unitIds,
  units: selectedUnits,
  editableIds,
  lockedCount,
  forEachEditableUnit,
} = useUnitEditTargets(() => props.unitId);

// One pass over the selection for the header badge and breakdown line
const selectionStats = computed(() => {
  const sideIds = new Set<EntityId>();
  const statusCounts = new Map<string | undefined, number>();
  let onMapCount = 0;
  let hiddenCount = 0;
  for (const u of selectedUnits.value) {
    sideIds.add(u._sid);
    const status = getStatusName(u);
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    if (u._state?.location) onMapCount++;
    if (u.isHidden) hiddenCount++;
  }
  return { sideCount: sideIds.size, statusCounts, onMapCount, hiddenCount };
});

const unitStatus = computed(() => {
  if (!isMultiMode.value) return getStatusName(unit.value);
  const { statusCounts } = selectionStats.value;
  return statusCounts.size === 1 ? [...statusCounts.keys()][0] : "Mixed status";
});

// Tooltip listing how many selected units have each status
const unitStatusTitle = computed(() => {
  if (!isMultiMode.value) return undefined;
  return [...selectionStats.value.statusCounts]
    .map(([name, count]) => `${name ?? "No status"}: ${count}`)
    .join(" · ");
});

// In multi mode, editing is blocked only when every selected unit is locked.
const isLocked = computed(() => editableIds.value.length === 0);

const geoStore = useGeoStore();
const recordingStore = useRecordingStore();
const unitSettings = useUnitSettingsStore();
const { getModalSidc } = injectStrict(sidcModalKey);

const unitMenuItems = computed((): MenuItemData[] => [
  {
    label: "Change symbol",
    action: () => handleChangeSymbol(),
    disabled: isLocked.value,
  },
  ...(isMultiMode.value
    ? []
    : [
        {
          label: "Edit unit data",
          action: () => toggleEditMode(),
          disabled: isLocked.value,
        },
        {
          label: "Add or change image",
          action: () => toggleEditMediaMode(),
          disabled: isLocked.value,
        },
      ]),
  {
    label: isMultiMode.value ? "Remove unit images" : "Remove unit image",
    action: () => removeMedia(),
    disabled: isLocked.value,
  },
  ...hideBranchMenuItems(unit.value).map(({ label, action }) => ({
    label,
    action: () => actionWrapper(action),
  })),
  lockMenuItem.value,
]);

// Units whose side or side group is locked can't be locked or unlocked individually.
const lockTargetIds = computed(() =>
  unitIds.value.filter((id) => !isUnitLocked(id, { excludeUnit: true })),
);

const lockTargetsLocked = computed(() => {
  const targetIds = lockTargetIds.value;
  return targetIds.length > 0 && targetIds.every((id) => getUnitById(id)?.locked);
});

const lockMenuItem = computed((): MenuItemData => {
  const noun = isMultiMode.value ? "units" : "unit";
  return {
    label: lockTargetsLocked.value ? `Unlock ${noun}` : `Lock ${noun}`,
    action: () => setLocked(!lockTargetsLocked.value),
    disabled: lockTargetIds.value.length === 0,
  };
});

// Locked units without a short name have nothing to show or edit there
const showShortName = computed(() => !!unit.value?.shortName || !isLocked.value);

const symbolTooltip = computed(() =>
  isLocked.value ? "Unlock the unit to change its symbol" : "Change symbol",
);

const setLocationTooltip = computed(() => {
  if (isLocked.value) return "Unlock the unit to set its location";
  if (!recordingStore.isRecordingLocation)
    return "Turn on Unit position in Rec to set location";
  return "Set unit location";
});

const lockButtonTitle = computed(() =>
  lockMenuItem.value.disabled
    ? isMultiMode.value
      ? "Locked with their sides or side groups"
      : "Locked with its side or side group"
    : lockMenuItem.value.label,
);

watchEffect((onCleanup) => {
  const el = unrefElement(elRef.value) as HTMLElement | null;
  if (!el) return;
  const dndFunction = draggable({
    element: el,
    getInitialData: () => getUnitDragItem({ unit: unit.value }, "detailsPanel"),
    onDragStart: () => (isDragged.value = true),
    onDrop: () => (isDragged.value = false),
    canDrag: () => !isUnitLocked(unit.value.id),
    // onGenerateDragPreview({ nativeSetDragImage }) {
    //   setCustomNativeDragPreview({
    //     getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
    //     render: ({ container }) => {
    //       return render(
    //         h(UnitSymbol, {
    //           sidc: unit.value.sidc,
    //           options: combinedSymbolOptions.value,
    //           size: 25,
    //         }),
    //         container,
    //       );
    //     },
    //     nativeSetDragImage,
    //   });
    // },
  });

  onCleanup(() => dndFunction());
});

watch(
  () => unit.value?.name,
  () => {
    unitName.value = unit.value?.name;
  },
  { immediate: true },
);

watch(
  () => unit.value?.shortName,
  () => {
    shortName.value = unit.value?.shortName || "";
  },
  { immediate: true },
);

watch(
  () => unitSettings.editHistory,
  (v) => {
    if (v && !unitSettings.showHistory) {
      unitSettings.showHistory = true;
    }
  },
);

const combinedSymbolOptions = computed(() => {
  return { ...getCombinedSymbolOptions(unit.value), outlineWidth: 8 };
});

const unitSidc = computed(() => unit.value._state?.sidc || unit.value.sidc);

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  onGetLocation,
} = useGetMapLocation(() => geoStore.mapAdapter);
const uiStore = useUiStore();
const { selectedUnitIds, clear: clearSelection } = useSelectedItems();

// In multi mode the toggle shows units only when every selected unit is hidden.
const isHiddenOnMap = computed(() =>
  isMultiMode.value
    ? selectedUnits.value.every((u) => u.isHidden)
    : !!unit.value.isHidden,
);

const selectionBreakdown = computed(() => {
  const { sideCount, onMapCount, hiddenCount } = selectionStats.value;
  const parts = [
    `${sideCount} ${sideCount === 1 ? "side" : "sides"}`,
    `${onMapCount} on map`,
  ];
  if (unitStatus.value) parts.push(unitStatus.value);
  if (lockedCount.value) parts.push(`${lockedCount.value} locked`);
  if (hiddenCount) parts.push(`${hiddenCount} hidden`);
  return parts.join(" · ");
});

onGetLocation((location) => addUnitPosition(props.unitId, location));
const isEditMode = ref(false);
const toggleEditMode = useToggle(isEditMode);

const isEditMediaMode = ref(false);
const toggleEditMediaMode = useToggle(isEditMediaMode);

const onFormSubmit = (unitUpdate: UnitUpdate) => {
  updateUnit(props.unitId, unitUpdate);
  toggleEditMode();
};

function removeMedia() {
  forEachEditableUnit((unitId) => updateUnit(unitId, { media: [] }));
}

function setLocked(locked: boolean) {
  lockTargetIds.value.forEach((unitId) => updateUnitLocked(unitId, locked));
}

const hDescription = computed(() => renderMarkdown(unit.value.description || ""));
const hasPosition = computed(() => Boolean(unit.value._state?.location));
const media = computed(() => {
  const { media } = unit.value;
  if (!media || isMultiMode.value) return;
  return media[0];
});

watch(
  isEditMode,
  (v) => {
    if (!v) return;
    isEditMediaMode.value = false;
    selectedTab.value = 0;
  },
  { immediate: true },
);

watch(isEditMediaMode, (v) => {
  if (!v) return;
  isEditMode.value = false;
  selectedTab.value = 0;
});

watch(
  isGetLocationActive,
  (isActive) => {
    uiStore.getLocationActive = isActive;
  },
  { immediate: true },
);

const { onUnitAction } = useUnitActions();

function actionWrapper(action: UnitAction) {
  if (isMultiMode.value) {
    onUnitAction(selectedUnits.value, action);
    return;
  }
  onUnitAction(unit.value, action);
}

function updateMedia(mediaUpdate: MediaUpdate) {
  if (!mediaUpdate) return;
  const { media = [] } = unit.value;
  const newMedia = { ...media[0], ...mediaUpdate };
  updateUnit(props.unitId, { media: [newMedia] });
  isEditMediaMode.value = false;
}

const buttonItems = computed(() => [
  {
    label: "Duplicate",
    onClick: () => actionWrapper(UnitActions.Clone),
    disabled: isLocked.value,
  },
  {
    label: "Duplicate (with state)",
    onClick: () => actionWrapper(UnitActions.CloneWithState),
    disabled: isLocked.value,
  },
  {
    label: "Duplicate hierarchy",
    onClick: () => actionWrapper(UnitActions.CloneWithSubordinates),
    disabled: isLocked.value,
  },
  {
    label: "Duplicate hierarchy (with state)",
    onClick: () => actionWrapper(UnitActions.CloneWithSubordinatesAndState),
    disabled: isLocked.value,
  },
  {
    label: "Move up",
    onClick: () => actionWrapper(UnitActions.MoveUp),
    disabled: isLocked.value,
  },
  {
    label: "Move down",
    onClick: () => actionWrapper(UnitActions.MoveDown),
    disabled: isLocked.value,
  },
  {
    label: "Create subordinate",
    onClick: () => actionWrapper(UnitActions.AddSubordinate),
    disabled: isLocked.value,
  },
  {
    label: "Zoom",
    onClick: () => actionWrapper(UnitActions.Zoom),
  },
  {
    label: "Pan",
    onClick: () => actionWrapper(UnitActions.Pan),
    disabled: !hasPosition.value,
  },
  {
    label: "Delete",
    onClick: () => actionWrapper(UnitActions.Delete),
    disabled: isLocked.value,
  },
  {
    label: "Clear state",
    onClick: () => actionWrapper(UnitActions.ClearState),
    disabled: isLocked.value,
  },
]);

async function handleChangeSymbol() {
  if (isLocked.value) return;
  const newSidcValue = await getModalSidc(unit.value.sidc, {
    symbolOptions: unit.value.symbolOptions,
    inheritedSymbolOptions: getCombinedSymbolOptions(unit.value, true),
    reinforcedStatus: unit.value.reinforcedStatus,
  });
  if (newSidcValue !== undefined) {
    const { sidc, symbolOptions = {}, reinforcedStatus } = newSidcValue;
    if (isMultiMode.value) {
      forEachEditableUnit((unitId) => {
        const { side } = getUnitHierarchy(unitId);
        const dataUpdate: UnitUpdate = {
          sidc: setSid(sidc, side.standardIdentity),
          symbolOptions,
        };
        if (reinforcedStatus) dataUpdate.reinforcedStatus = reinforcedStatus;
        updateUnit(unitId, dataUpdate, { doUpdateUnitState: true });
      });
    } else {
      const dataUpdate: UnitUpdate = { sidc, symbolOptions };
      if (reinforcedStatus) dataUpdate.reinforcedStatus = reinforcedStatus;
      updateUnit(props.unitId, dataUpdate, { doUpdateUnitState: true });
    }
  }
}

function locateInOrbat() {
  onUnitSelectHook.trigger({ unitId: props.unitId, options: { noZoom: true } });
}
</script>
<template>
  <div v-if="unit" class="@container" :key="unit.id">
    <DetailsPanelHeader :media="media" density="compact">
      <template v-if="!isMultiMode" #leading>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="focus-visible:ring-ring/50 inline-flex w-16 justify-start rounded-md outline-none focus-visible:ring-[3px]"
              :class="isLocked ? 'cursor-not-allowed' : 'hover:bg-accent'"
              :aria-label="symbolTooltip"
              :aria-disabled="isLocked"
              @click="handleChangeSymbol()"
              ref="elRef"
            >
              <UnitSymbol
                class="w-16"
                :sidc="unitSidc"
                :size="34"
                :options="combinedSymbolOptions"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>{{ symbolTooltip }}</TooltipContent>
        </Tooltip>
      </template>
      <template v-if="!isMultiMode" #title>
        <EditableLabel
          v-model="unitName"
          @update-value="updateUnit(unitId, { name: $event })"
          class="relative z-10 bg-transparent"
          :disabled="isLocked"
        />
      </template>
      <template v-else #title>
        <PanelTitle> {{ selectedUnitIds.size }} units selected </PanelTitle>
      </template>
      <!-- Locked units can't add a short name, so skip an empty row for them -->
      <template v-if="!isMultiMode && (showShortName || unitStatus)" #subtitle>
        <div class="flex min-w-0 items-center gap-2">
          <div class="min-w-0 flex-1">
            <EditableLabel
              v-if="showShortName"
              v-model="shortName"
              @update-value="updateUnit(unitId, { shortName: $event })"
              text-class="text-sm text-muted-foreground placeholder:text-muted-foreground/50 placeholder:italic"
              placeholder="Add short name"
              :disabled="isLocked"
            />
          </div>
          <Badge
            v-if="unitStatus"
            variant="outline"
            class="text-muted-foreground shrink-0"
            >{{ unitStatus }}</Badge
          >
        </div>
      </template>
      <template v-if="isMultiMode || isLocked" #trailing>
        <!-- A single unit is locked from the menu; the slot only renders this while it's locked -->
        <IconButton
          v-if="!isMultiMode"
          :tooltip="lockButtonTitle"
          :disabled="lockMenuItem.disabled"
          @click="setLocked(false)"
        >
          <IconLockOutline class="size-5" aria-hidden="true" />
        </IconButton>
        <Button
          v-else
          type="button"
          size="sm"
          variant="outline"
          @click="clearSelection()"
        >
          Clear
        </Button>
      </template>
      <template v-if="isMultiMode" #summary>
        <p class="text-muted-foreground text-sm" :title="unitStatusTitle">
          {{ selectionBreakdown
          }}<template v-if="lockedCount && !isLocked">, skipped when editing</template>
        </p>
        <UnitSelectionSummary :units="selectedUnits" />
      </template>
      <template #actions>
        <div class="flex min-w-0 flex-1 items-center gap-0.5">
          <!-- View actions first, then edit actions -->
          <IconButton
            size="icon-sm"
            tooltip="Zoom to"
            @click="actionWrapper(UnitActions.Zoom)"
          >
            <ZoomIcon class="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton
            size="icon-sm"
            v-if="!isMultiMode"
            tooltip="Show in ORBAT"
            @click="locateInOrbat()"
          >
            <TreeLocateIcon class="size-5" aria-hidden="true" />
          </IconButton>
          <!-- aria-pressed:bg-accent keeps hidden and locked states visible at a glance -->
          <IconButton
            size="icon-sm"
            class="aria-pressed:bg-accent"
            :tooltip="isHiddenOnMap ? 'Hidden on map. Click to show' : 'Hide on map'"
            :aria-pressed="isHiddenOnMap"
            @click="actionWrapper(isHiddenOnMap ? UnitActions.Show : UnitActions.Hide)"
          >
            <IconEyeOff v-if="isHiddenOnMap" class="size-5" aria-hidden="true" />
            <IconEye v-else class="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton
            size="icon-sm"
            v-if="isMultiMode"
            class="aria-pressed:bg-accent"
            :tooltip="lockButtonTitle"
            :aria-pressed="isLocked"
            :disabled="lockMenuItem.disabled"
            @click="setLocked(!lockTargetsLocked)"
          >
            <IconLockOutline v-if="isLocked" class="size-5" aria-hidden="true" />
            <IconLockOpenVariantOutline v-else class="size-5" aria-hidden="true" />
          </IconButton>
          <!-- These only make sense for a single unit -->
          <template v-if="!isMultiMode">
            <Separator orientation="vertical" class="mx-0.5 h-5!" />
            <IconButton
              size="icon-sm"
              :tooltip="isLocked ? 'Unlock the unit to edit it' : 'Edit unit'"
              :disabled="isLocked"
              @click="toggleEditMode()"
            >
              <EditIcon class="size-5" aria-hidden="true" />
            </IconButton>
            <IconButton
              size="icon-sm"
              :tooltip="setLocationTooltip"
              :disabled="isLocked || !recordingStore.isRecordingLocation"
              @click="startGetLocation()"
            >
              <IconCrosshairsGps class="size-5" aria-hidden="true" />
            </IconButton>
          </template>
          <SplitButton
            class="ml-1 min-w-0"
            triggerClass="max-w-24"
            button-class="px-3"
            menu-label="More quick actions"
            :items="buttonItems"
            v-model:active-item="uiStore.activeItem"
          />
        </div>
        <DotsMenu :items="unitMenuItems" label="Unit options" />
      </template>
    </DetailsPanelHeader>
    <div class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTabString" class="">
        <TabsContent value="0" class="mx-4 pt-4">
          <section class="relative" v-if="!isMultiMode">
            <EditMetaForm
              v-if="isEditMode"
              :item="unit"
              @update="onFormSubmit"
              @cancel="toggleEditMode()"
            />
            <EditMediaForm
              v-else-if="isEditMediaMode"
              :media="media"
              @cancel="toggleEditMediaMode()"
              @update="updateMedia"
            />
            <!-- Name and short name are edited in the header, so they aren't repeated here -->
            <div v-else-if="!isMultiMode" class="mb-4 space-y-4">
              <p
                v-if="!unit.externalUrl && !unit.description && !unit.location"
                class="text-muted-foreground text-sm"
              >
                No external URL, description or initial location.
              </p>
              <DescriptionItem
                v-if="unit.externalUrl"
                label="External URL"
                dd-class="truncate"
                ><a
                  target="_blank"
                  draggable="false"
                  class="underline"
                  :href="unit.externalUrl"
                  >{{ unit.externalUrl }}</a
                ></DescriptionItem
              >
              <DescriptionItem v-if="unit.description" label="Description">
                <div class="prose prose-sm dark:prose-invert" v-html="hDescription"></div>
              </DescriptionItem>

              <DescriptionItem v-if="unit.location" label="Initial location">
                <div class="flex items-center justify-between">
                  <p>{{ formatPosition(unit.location) }}</p>
                  <IconButton
                    tooltip="Pan to initial location"
                    @click="geoStore.panToLocation(unit.location)"
                  >
                    <IconCrosshairsGps class="h-5 w-5" aria-hidden="true" />
                  </IconButton>
                </div>
              </DescriptionItem>
            </div>
          </section>
          <p v-else class="p-2 pt-4 text-sm">Multi edit mode not supported yet.</p>
        </TabsContent>
        <TabsContent value="1" class="mx-4">
          <UnitDetailsSymbol :unit="unit" :key="unit.id" :is-locked="isLocked" />
        </TabsContent>
        <TabsContent value="2" class="mx-4">
          <UnitPanelState :unit="unit" :is-locked="isLocked" />
        </TabsContent>
        <TabsContent value="3" class="mx-4">
          <UnitDetailsToe :unit="unit" :is-locked="isLocked" />
        </TabsContent>
        <TabsContent value="4" class="mx-4">
          <UnitDetailsMapDisplay :unit="unit" :is-locked="isLocked" />
        </TabsContent>
        <TabsContent value="5" class="mx-4">
          <UnitDetailsProperties :unit="unit" :is-locked="isLocked" />
        </TabsContent>
        <TabsContent value="6" class="mx-4">
          <FeatureTransformations class="mt-4" unitMode />
        </TabsContent>

        <TabsContent
          value="7"
          v-if="uiStore.debugMode"
          class="prose prose-sm dark:prose-invert mx-4 max-w-none"
        >
          <pre>{{ unit }}</pre>
        </TabsContent>
      </ScrollTabs>
    </div>
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.e="toggleEditMode()"
    />
  </div>
</template>
