<script setup lang="ts">
import PanelHeading from "@/components/PanelHeading.vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watchEffect } from "vue";
import { Sidc } from "@/symbology/sidc";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  echelonValues,
  HQTFDummyValues,
  standardIdentityValues,
  statusValues,
} from "@/symbology/values";
import type { NUnit } from "@/types/internalModels";
import { useSymbologyData } from "@/composables/symbolData";
import FilterTree, {
  type NestedUnitStatItem,
} from "@/modules/scenarioeditor/FilterTree.vue";
import {
  IconClose,
  IconCollapseAll,
  IconExpandAll,
  IconMapMarker,
  IconMapMarkerMultiple,
  IconMapMarkerOff,
  IconMapMarkerStar,
  IconEye,
  IconEyeOff,
  IconMinusCircleOutline,
  IconMagnifyExpand as ZoomIcon,
} from "@iconify-prerendered/vue-mdi";
import IconButton from "@/components/IconButton.vue";
import { Button } from "@/components/ui/button";
import NewAccordionPanel from "@/components/NewAccordionPanel.vue";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getFullUnitSidc } from "@/symbology/helpers.ts";
import { useUnitActions } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";

const VISIBILITY_INITIAL_LOCATION_KEY = "visibility-initial-location";
const VISIBILITY_CURRENT_LOCATION_KEY = "visibility-current-location";
const VISIBILITY_HAS_LOCATIONS_KEY = "visibility-has-locations";
const VISIBILITY_NO_LOCATIONS_KEY = "visibility-no-locations";
const VISIBILITY_HIDDEN_KEY = "visibility-hidden";
const VISIBILITY_VISIBLE_KEY = "visibility-visible";
const NO_UNIT_STATUS_KEY = "unit-status-none";

const {
  store: { state },
  unitActions,
  geo,
} = injectStrict(activeScenarioKey);

const { symbology, resolveIconLabel, resolveModifierLabel, loadData } =
  useSymbologyData();

// Trigger the lazy symbology load so labels resolve against the selected standard.
loadData();

const sideTree = ref<NestedUnitStatItem[]>([]);
const emtTree = ref<NestedUnitStatItem[]>([]);
const iconTree = ref<NestedUnitStatItem[]>([]);
const modifierTree = ref<NestedUnitStatItem[]>([]);
const statusTree = ref<NestedUnitStatItem[]>([]);
const hqtfdTree = ref<NestedUnitStatItem[]>([]);
const unitStatusTree = ref<NestedUnitStatItem[]>([]);
const sidTree = ref<NestedUnitStatItem[]>([]);
const visibilityTree = ref<NestedUnitStatItem[]>([]);
const { selectedUnitIds } = useSelectedItems();
const { onUnitAction } = useUnitActions();

const excludedKeys = ref<Set<string>>(new Set());
// Add: a click adds a category's units. Narrow: a click keeps only the selected
// units in the category.
type SelectMode = "add" | "narrow";
const selectMode = ref<SelectMode>("add");
const modeOptions: { value: SelectMode; label: string; title: string; help: string }[] = [
  {
    value: "add",
    label: "Add",
    title: "Clicking a category adds its units to the selection",
    help: "Click a category to add or remove its units.",
  },
  {
    value: "narrow",
    label: "Narrow",
    title: "Clicking a category keeps only the selected units in it",
    help: "Click a category to keep only its selected units.",
  },
];
// With nothing selected, narrowing starts from the category itself, as in Add.
const narrowing = computed(
  () => selectMode.value === "narrow" && selectedUnitIds.value.size > 0,
);
const expandedKeys = ref<string[]>([]);
const flatStats = ref<Record<string, number>>({});

const panelsOpen = ref({
  side: false,
  mainIcon: true,
  commandLevel: false,
  unitStatus: false,
  visibility: false,
  identity: false,
  symbolStatus: false,
  hqtfd: false,
  modifiers: false,
});

type FilterSectionId = keyof typeof panelsOpen.value;

type FilterSection = { id: FilterSectionId; label: string; tree: NestedUnitStatItem[] };

// A section is worth showing when clicking one of its rows can select something other
// than every unit.
function isUsefulSection({ tree }: FilterSection) {
  if (!tree.some(({ key }) => flatStats.value[key])) return false;
  const unitCount = Object.keys(state.unitMap).length;
  const [first] = tree;
  return !(
    tree.length === 1 &&
    !first.children?.length &&
    flatStats.value[first.key] === unitCount
  );
}

const filterSections = computed(() => {
  const sections: FilterSection[] = [
    { id: "side", label: "Side", tree: sideTree.value },
    { id: "mainIcon", label: "Main unit icon", tree: iconTree.value },
    { id: "commandLevel", label: "Command level", tree: emtTree.value },
    { id: "unitStatus", label: "Unit status", tree: unitStatusTree.value },
    { id: "visibility", label: "Map visibility", tree: visibilityTree.value },
    { id: "identity", label: "Standard identity", tree: sidTree.value },
    { id: "symbolStatus", label: "Symbol status", tree: statusTree.value },
    { id: "hqtfd", label: "HQ / Task force / Dummy", tree: hqtfdTree.value },
    { id: "modifiers", label: "Symbol modifiers", tree: modifierTree.value },
  ];
  return sections.filter(isUsefulSection);
});

// Units the map draws right now: located at the current time and not hidden by
// the unit, its side or its side group.
const visibleOnMapIds = computed(
  () => new Set(geo.everyVisibleUnit.value.map((unit) => unit.id)),
);

const selectedHiddenCount = computed(
  () => [...selectedUnitIds.value].filter((id) => state.unitMap[id]?.isHidden).length,
);
const selectedVisibleCount = computed(
  () => selectedUnitIds.value.size - selectedHiddenCount.value,
);

// Zoom can only fit units with a location at the current time.
const canZoomToSelected = computed(() =>
  [...selectedUnitIds.value].some((id) => !!state.unitMap[id]?._state?.location),
);

function zoomToSelected() {
  const units = [...selectedUnitIds.value].map((id) => state.unitMap[id]).filter(Boolean);
  onUnitAction(units, UnitActions.Zoom);
}

function setSelectedHidden(hidden: boolean) {
  unitActions.setUnitsHidden(selectedUnitIds.value, hidden);
}

const hiddenUnitIds = computed(() =>
  Object.values(state.unitMap)
    .filter((unit) => unit.isHidden)
    .map((unit) => unit.id),
);

function showAllHidden() {
  unitActions.setUnitsHidden(hiddenUnitIds.value, false);
}

const isAnyPanelOpen = computed(() => Object.values(panelsOpen.value).some((v) => v));

function collapseAll() {
  Object.keys(panelsOpen.value).forEach((key) => {
    panelsOpen.value[key as keyof typeof panelsOpen.value] = false;
  });
}

function expandAll() {
  Object.keys(panelsOpen.value).forEach((key) => {
    panelsOpen.value[key as keyof typeof panelsOpen.value] = true;
  });
}

watchEffect(() => {
  // Track the lazy symbology data so the trees recompute once it loads and the
  // labels resolve against the selected standard.
  void symbology.value;
  const stats: Record<string, number> = {};
  const sidStatItems: NestedUnitStatItem[] = [];
  const sideStatItems: NestedUnitStatItem[] = [];
  const emtStatItems: NestedUnitStatItem[] = [];
  const iconStatItems: NestedUnitStatItem[] = [];
  const modifierStatItems: NestedUnitStatItem[] = [];
  const statusStatItems: NestedUnitStatItem[] = [];
  const hqtfdStatItems: NestedUnitStatItem[] = [];
  Object.values(state.unitMap).forEach((unit) => {
    const {
      sideKey,
      sideGroupKey,
      emtKey,
      symbolSetKey,
      entityKey,
      entityTypeKey,
      mod1Key,
      mod2Key,
      modSymbolSetKey,
      statusKey,
      hqtfdKey,
      sidKey,
    } = updateUnitStats(unit, stats);

    const iconSidc = new Sidc(currentSidc(unit));
    const originalEmt = iconSidc.emt;
    iconSidc.emt = "00";
    iconSidc.hqtfd = "0";
    iconSidc.standardIdentity = "3";
    iconSidc.entitySubType = "00";
    iconSidc.modifierOne = "00";
    iconSidc.modifierTwo = "00";
    const sidc = iconSidc.toString();
    iconSidc.mainIcon = "000000";
    const sidcSymbolSet = iconSidc.toString();
    iconSidc.emt = originalEmt;
    const sidcEmt = iconSidc.toString();
    if (stats[sideKey] === 1) {
      sideStatItems.push({
        key: sideKey,
        label: getSideLabel(unit._sid),
        sidc: sidc,
      });
    }
    if (stats[sideGroupKey] === 1) {
      const sideItem = sideStatItems.find((item) => item.key === sideKey);
      if (sideItem) {
        const children = sideItem.children || [];
        if (unit._gid)
          children.push({
            key: sideGroupKey,
            label: getSideGroupLabel(unit._gid),
            sidc: "10031000100000000000",
          });

        sideItem.children = children;
        sideItem.sidc = "10031000100000000000";
      }
    }
    if (stats[emtKey] === 1) {
      emtStatItems.push({ key: emtKey, label: getEchelonLabel(emtKey), sidc: sidcEmt });
    }
    if (stats[symbolSetKey] === 1) {
      iconStatItems.push({
        key: symbolSetKey,
        label: resolveIconLabel({ symbolSet: symbolSetKey }),
        sidc: sidcSymbolSet,
      });
    }
    if (modSymbolSetKey && stats[modSymbolSetKey] === 1) {
      modifierStatItems.push({
        key: modSymbolSetKey,
        label: resolveIconLabel({ symbolSet: symbolSetKey }),
        sidc: sidcSymbolSet,
      });
    }
    if (stats[entityKey] === 1) {
      const iconItem = iconStatItems.find((item) => item.key === symbolSetKey);
      if (iconItem) {
        const children = iconItem.children || [];
        children.push({
          key: entityKey,
          label: resolveIconLabel({
            symbolSet: symbolSetKey,
            entity: entityKey.split("-")[1],
          }),
          sidc: sidc,
        });
        iconItem.children = sortBy(children, "label");
      }
    }
    if (stats[entityTypeKey] === 1) {
      const entityItem = iconStatItems
        .find((item) => item.key === symbolSetKey)
        ?.children?.find((item) => item.key === entityKey);
      if (entityItem) {
        const children = entityItem.children || [];
        children.push({
          key: entityTypeKey,
          label: resolveIconLabel({
            symbolSet: symbolSetKey,
            entity: entityKey.split("-")[1],
            entityType: entityTypeKey.split("-")[2],
          }),
          sidc: sidc,
        });
        entityItem.children = sortBy(children, "label");
      }
    }
    if (stats[mod1Key] === 1) {
      const modifierItem = modifierStatItems.find((item) => item.key === modSymbolSetKey);
      if (modifierItem) {
        const children = modifierItem.children || [];
        const sidc = new Sidc(sidcSymbolSet);
        sidc.modifierOne = mod1Key.split("-")[2];

        children.push({
          key: mod1Key,
          label: resolveModifierLabel({
            symbolSet: symbolSetKey,
            mod1: mod1Key.split("-")[2],
          }),
          sidc: sidc.toString(),
        });
        modifierItem.children = sortBy(children, "label");
      }
    }
    if (stats[mod2Key] === 1) {
      const modifierItem = modifierStatItems.find((item) => item.key === modSymbolSetKey);
      if (modifierItem) {
        const children = modifierItem.children || [];
        const sidc = new Sidc(sidcSymbolSet);
        sidc.modifierTwo = mod2Key.split("-")[2];
        children.push({
          key: mod2Key,
          label: resolveModifierLabel({
            symbolSet: symbolSetKey,
            mod2: mod2Key.split("-")[2],
          }),
          sidc: sidc.toString(),
        });
        modifierItem.children = sortBy(children, "label");
      }
    }
    if (stats[statusKey] === 1) {
      const tmpSidc = new Sidc("10031000100000000000");
      const statusCode = statusKey.split("-")[1];
      tmpSidc.status = statusCode;
      statusStatItems.push({
        key: statusKey,
        label: getStatusLabel(statusCode),
        sidc: tmpSidc.toString(),
      });
    }
    if (stats[hqtfdKey] === 1) {
      const tmpSidc = new Sidc("10031000100000000000");
      const hqtfdCode = hqtfdKey.split("-")[1];
      tmpSidc.hqtfd = hqtfdCode;
      hqtfdStatItems.push({
        key: hqtfdKey,
        label: getHqtfdLabel(hqtfdCode),
        sidc: tmpSidc.toString(),
      });
    }

    if (stats[sidKey] === 1) {
      const tmpSidc = new Sidc("10031000000000000000");
      const sidCode = sidKey.split("-")[1];
      tmpSidc.standardIdentity = sidCode;
      sidStatItems.push({
        key: sidKey,
        label: getSidLabel(sidCode),
        sidc: tmpSidc.toString(),
      });
    }
  });

  flatStats.value = stats;
  visibilityTree.value = [
    {
      key: VISIBILITY_CURRENT_LOCATION_KEY,
      label: "Has location at current time",
      icon: IconMapMarker,
    },
    {
      key: VISIBILITY_HAS_LOCATIONS_KEY,
      label: "Has locations",
      icon: IconMapMarkerMultiple,
    },
    {
      key: VISIBILITY_NO_LOCATIONS_KEY,
      label: "No locations at all",
      icon: IconMapMarkerOff,
    },
    {
      key: VISIBILITY_INITIAL_LOCATION_KEY,
      label: "Has initial location",
      icon: IconMapMarkerStar,
    },
    {
      key: VISIBILITY_VISIBLE_KEY,
      label: "Visible on map",
      icon: IconEye,
    },
    {
      key: VISIBILITY_HIDDEN_KEY,
      label: "Hidden on map",
      icon: IconEyeOff,
    },
  ];
  visibilityTree.value.forEach(({ key }) => (stats[key] ||= 0));
  // Statuses in settings order, listing only those some unit has at the current time.
  unitStatusTree.value = [
    ...Object.values(state.unitStatusMap).map((status) => ({
      key: unitStatusKeyFor(status.id),
      label: status.name,
      color: status.color,
    })),
    { key: NO_UNIT_STATUS_KEY, label: "No status" },
  ].filter(({ key }) => stats[key]);
  sideTree.value = sortBy(sideStatItems, "label");
  emtTree.value = sortBy(emtStatItems, "label");
  iconTree.value = sortBy(iconStatItems, "label");
  modifierTree.value = sortBy(
    modifierStatItems.filter((i) => i.children?.length),
    "label",
  );
  statusTree.value = sortBy(statusStatItems, "label");
  hqtfdTree.value = sortBy(hqtfdStatItems, "label");
  sidTree.value = sortBy(sidStatItems, "label");
});

const selectedStats = computed(() => {
  const stats: Record<string, number> = {};
  selectedUnitIds.value.forEach((unitId) => {
    updateUnitStats(unitId, stats);
  });
  return stats;
});

// Per category: the units a click would add, skipping excluded categories.
const addableStats = computed(() => {
  if (!excludedKeys.value.size) return flatStats.value;
  const stats: Record<string, number> = {};
  Object.values(state.unitMap).forEach((unit) => {
    const keys = createKeys(unit);
    if (!isExcluded(keyList(keys))) updateUnitStats(unit, stats, keys);
  });
  return stats;
});

function updateUnitStats(
  unitOrUnitId: string | NUnit,
  stats: Record<string, number>,
  precomputedKeys?: ReturnType<typeof createKeys>,
) {
  const unit =
    typeof unitOrUnitId === "string" ? state.unitMap[unitOrUnitId] : unitOrUnitId;
  const keys = precomputedKeys ?? createKeys(unit);
  const {
    symbolSetKey,
    entityKey,
    entityTypeKey,
    emtKey,
    sideKey,
    sideGroupKey,
    mod1Key,
    mod2Key,
    modSymbolSetKey,
    statusKey,
    unitStatusKey,
    hqtfdKey,
    sidKey,
    initialLocationKey,
    currentLocationKey,
    hasLocationsKey,
    noLocationsKey,
    hiddenKey,
    visibleKey,
  } = keys;
  stats[symbolSetKey] = (stats[symbolSetKey] || 0) + 1;
  stats[entityKey] = (stats[entityKey] || 0) + 1;
  stats[entityTypeKey] = (stats[entityTypeKey] || 0) + 1;
  stats[emtKey] = (stats[emtKey] || 0) + 1;
  stats[sideKey] = (stats[sideKey] || 0) + 1;
  stats[sideGroupKey] = (stats[sideGroupKey] || 0) + 1;
  stats[statusKey] = (stats[statusKey] || 0) + 1;
  stats[unitStatusKey] = (stats[unitStatusKey] || 0) + 1;
  stats[sidKey] = (stats[sidKey] || 0) + 1;
  for (const key of [
    modSymbolSetKey,
    initialLocationKey,
    currentLocationKey,
    hasLocationsKey,
    noLocationsKey,
    hiddenKey,
    visibleKey,
  ]) {
    if (key) stats[key] = (stats[key] || 0) + 1;
  }
  if (!hqtfdKey.endsWith("0")) stats[hqtfdKey] = (stats[hqtfdKey] || 0) + 1;
  if (!mod1Key.endsWith("00")) stats[mod1Key] = (stats[mod1Key] || 0) + 1;
  if (!mod2Key.endsWith("00")) stats[mod2Key] = (stats[mod2Key] || 0) + 1;
  return keys;
}

// The symbol code at the current time, so timed changes such as a unit becoming
// damaged or destroyed are picked up.
function currentSidc(unit: NUnit) {
  return getFullUnitSidc(unit._state?.sidc || unit.sidc);
}

function createKeys(unit: NUnit) {
  const sidc = new Sidc(currentSidc(unit));
  const sidKey = `sid-${sidc.standardIdentity}`;
  const symbolSetKey = `${sidc.symbolSet}`;
  const entityKey = `${sidc.symbolSet}-${sidc.entity}`;
  const entityTypeKey = `${sidc.symbolSet}-${sidc.entity}-${sidc.entityType}`;
  const emtKey = `emt-${sidc.emt}`;
  const sideKey = `side-${unit._sid}`;
  const sideGroupKey = `side-${unit._sid}-${unit._gid}`;
  // Only units with a modifier belong to the symbol set's row under Symbol modifiers.
  const hasModifier = sidc.modifierOne !== "00" || sidc.modifierTwo !== "00";
  const modSymbolSetKey = hasModifier ? `mod-${sidc.symbolSet}` : undefined;
  const mod1Key = `mod1-${symbolSetKey}-${sidc.modifierOne}`;
  const mod2Key = `mod2-${symbolSetKey}-${sidc.modifierTwo}`;
  const statusKey = `status-${sidc.status}`;
  const hqtfdKey = `hqtfd-${sidc.hqtfd}`;
  const unitStatusId = unit._state?.status || unit.status;
  const unitStatusKey =
    unitStatusId && state.unitStatusMap[unitStatusId]
      ? unitStatusKeyFor(unitStatusId)
      : NO_UNIT_STATUS_KEY;
  const hasInitialLocation = Boolean(unit.location);
  const hasCurrentLocation = Boolean(unit._state?.location);
  const hasAnyStateLocation = Boolean(unit.state?.some((s) => !!s.location));
  const hasLocations = hasInitialLocation || hasAnyStateLocation;
  const hasNoLocations = !hasLocations;
  const initialLocationKey = hasInitialLocation
    ? VISIBILITY_INITIAL_LOCATION_KEY
    : undefined;
  const currentLocationKey = hasCurrentLocation
    ? VISIBILITY_CURRENT_LOCATION_KEY
    : undefined;
  const hasLocationsKey = hasLocations ? VISIBILITY_HAS_LOCATIONS_KEY : undefined;
  const noLocationsKey = hasNoLocations ? VISIBILITY_NO_LOCATIONS_KEY : undefined;
  const hiddenKey = unit.isHidden ? VISIBILITY_HIDDEN_KEY : undefined;
  const visibleKey = visibleOnMapIds.value.has(unit.id)
    ? VISIBILITY_VISIBLE_KEY
    : undefined;
  return {
    sidKey,
    symbolSetKey,
    entityKey,
    entityTypeKey,
    emtKey,
    sideKey,
    sideGroupKey,
    modSymbolSetKey,
    mod1Key,
    mod2Key,
    statusKey,
    unitStatusKey,
    hqtfdKey,
    initialLocationKey,
    currentLocationKey,
    hasLocationsKey,
    noLocationsKey,
    hiddenKey,
    visibleKey,
  };
}

// Every category key the unit belongs to.
function unitKeys(unit: NUnit): string[] {
  return keyList(createKeys(unit));
}

function keyList(keys: ReturnType<typeof createKeys>): string[] {
  return Object.values(keys).filter((key): key is string => !!key);
}

function isExcluded(keys: string[]) {
  return keys.some((key) => excludedKeys.value.has(key));
}

// Selects every unit that is not currently selected, skipping excluded categories.
function invertSelection() {
  const inverted = Object.values(state.unitMap)
    .filter((unit) => !selectedUnitIds.value.has(unit.id) && !isExcluded(unitKeys(unit)))
    .map((unit) => unit.id);
  selectedUnitIds.value.clear();
  inverted.forEach((id) => selectedUnitIds.value.add(id));
}

function selectByKey(key: string) {
  Object.values(state.unitMap).forEach((unit) => {
    const keys = unitKeys(unit);
    if (keys.includes(key) && !isExcluded(keys)) selectedUnitIds.value.add(unit.id);
  });
}

function clearByKey(key: string) {
  selectedUnitIds.value.forEach((unitId) => {
    const unit = state.unitMap[unitId];
    if (unit && unitKeys(unit).includes(key)) selectedUnitIds.value.delete(unitId);
  });
}

function getEchelonLabel(echelon: string) {
  if (echelon.startsWith("emt-")) {
    const [, nechelon] = echelon.split("-");
    return echelonValues.find((v) => v.code === nechelon)?.text || echelon;
  }
  return echelonValues.find((v) => v.code === echelon)?.text || echelon;
}

function unitStatusKeyFor(statusId: string) {
  return `unit-status-${statusId}`;
}

function getStatusLabel(code: string) {
  return statusValues.find((v) => v.code === code)?.text || code;
}

function getHqtfdLabel(code: string) {
  return HQTFDummyValues.find((v) => v.code === code)?.text || code;
}

function getSidLabel(code: string) {
  return standardIdentityValues.find((v) => v.code === code)?.text || code;
}

function getSideLabel(sideId: string) {
  return state.sideMap[sideId]?.name || sideId;
}

function getSideGroupLabel(sideGroupId: string) {
  return state.sideGroupMap[sideGroupId]?.name || sideGroupId;
}

// Keeps only the selected units that belong to the category.
function narrowByKey(key: string) {
  selectedUnitIds.value.forEach((unitId) => {
    const unit = state.unitMap[unitId];
    if (!unit || !unitKeys(unit).includes(key)) selectedUnitIds.value.delete(unitId);
  });
}

function onSelect(event: CustomEvent<{ value: { key: string } }>) {
  const key = event.detail.value.key as string;

  if (narrowing.value) {
    // Narrowing to a category with no selected units would clear the selection.
    if (selectedStats.value[key]) narrowByKey(key);
  } else if (selectedStats.value[key]) {
    clearByKey(key);
  } else {
    selectByKey(key);
  }
}

function parentKeys(items: NestedUnitStatItem[]): string[] {
  return items.flatMap((item) =>
    item.children?.length ? [item.key, ...parentKeys(item.children)] : [],
  );
}

const iconParentKeys = computed(() => parentKeys(iconTree.value));
const allIconsExpanded = computed(() =>
  iconParentKeys.value.every((key) => expandedKeys.value.includes(key)),
);

// Toggles every expandable main icon node, leaving the other trees as they are.
function toggleAllIcons() {
  const iconKeys = new Set(iconParentKeys.value);
  const otherKeys = expandedKeys.value.filter((key) => !iconKeys.has(key));
  expandedKeys.value = allIconsExpanded.value ? otherKeys : [...otherKeys, ...iconKeys];
}
</script>
<template>
  <div class="flex min-h-full flex-col px-4">
    <header class="flex h-12 items-center justify-between py-2">
      <PanelHeading>Select by category</PanelHeading>
      <div class="flex items-center space-x-1">
        <IconButton
          v-if="isAnyPanelOpen"
          title="Collapse all sections"
          @click="collapseAll()"
        >
          <IconCollapseAll class="h-5 w-5" />
        </IconButton>
        <IconButton v-else title="Expand all sections" @click="expandAll()">
          <IconExpandAll class="h-5 w-5" />
        </IconButton>
      </div>
    </header>
    <!-- Both texts share one grid cell, so switching mode doesn't shift the layout. -->
    <div class="text-muted-foreground grid pb-2 text-xs">
      <p
        v-for="option in modeOptions"
        :key="option.value"
        class="col-start-1 row-start-1"
        :class="{ invisible: selectMode !== option.value }"
        :aria-hidden="selectMode !== option.value"
      >
        {{ option.help }} Uses the current scenario time.
      </p>
    </div>
    <div
      class="bg-sidebar border-border sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2"
    >
      <!-- A segmented control for the mode, apart from the selection actions. -->
      <ToggleGroup
        type="single"
        size="sm"
        :spacing="0.5"
        class="bg-muted rounded-lg p-0.5"
        aria-label="What clicking a category does"
        :model-value="selectMode"
        @update:model-value="(value) => value && (selectMode = value as SelectMode)"
      >
        <ToggleGroupItem
          v-for="option in modeOptions"
          :key="option.value"
          :value="option.value"
          :title="option.title"
          class="text-muted-foreground hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground h-7 px-3 hover:bg-transparent data-[state=on]:shadow-sm"
          >{{ option.label }}</ToggleGroupItem
        >
      </ToggleGroup>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          title="Select all units that are not selected, skipping excluded categories"
          @click="invertSelection()"
          >Invert</Button
        >
        <Button
          variant="outline"
          size="sm"
          title="Clear the selection"
          :disabled="!selectedUnitIds.size"
          @click="selectedUnitIds.clear()"
          >Clear</Button
        >
      </div>
      <!-- Exclusions change what a click adds, so they stay in view while scrolling. -->
      <p
        v-if="excludedKeys.size"
        class="text-muted-foreground flex basis-full items-center gap-1 text-xs"
      >
        <IconMinusCircleOutline class="size-4" />
        {{ excludedKeys.size }}
        {{ excludedKeys.size === 1 ? "category" : "categories" }} excluded ·
        <button
          type="button"
          class="text-foreground underline-offset-2 hover:underline"
          title="Stop excluding categories"
          @click="excludedKeys.clear()"
        >
          Clear
        </button>
      </p>
    </div>
    <Button
      v-if="hiddenUnitIds.length"
      variant="outline"
      size="sm"
      class="my-2 self-start"
      title="Show every hidden unit on the map"
      @click="showAllHidden()"
      ><IconEye class="size-4" />Show all hidden
      <Badge variant="secondary">{{ hiddenUnitIds.length }}</Badge></Button
    >
    <p v-if="!filterSections.length" class="text-muted-foreground py-4 text-sm">
      No categories to select from.
    </p>
    <NewAccordionPanel
      v-for="section in filterSections"
      :key="section.id"
      :label="section.label"
      v-model="panelsOpen[section.id]"
    >
      <template v-if="section.id === 'mainIcon'" #header
        ><Button
          variant="ghost"
          size="sm"
          class="text-muted-foreground h-7 px-2 text-xs"
          :title="
            allIconsExpanded ? 'Collapse every icon group' : 'Expand every icon group'
          "
          @click.stop="toggleAllIcons()"
          >{{ allIconsExpanded ? "Collapse all" : "Expand all" }}</Button
        ></template
      >
      <FilterTree
        :tree="section.tree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :addableStats="addableStats"
        :excludedKeys="excludedKeys"
        :narrowing="narrowing"
        :selectedCount="selectedUnitIds.size"
        @select="onSelect"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
    <footer
      v-if="selectedUnitIds.size"
      class="border-border bg-sidebar sticky bottom-0 z-10 -mx-4 mt-auto flex min-h-12 items-center gap-2 border-t px-4 py-2"
    >
      <div class="flex flex-col text-sm leading-tight whitespace-nowrap">
        <span class="font-medium">{{ selectedUnitIds.size }} selected</span>
        <span v-if="selectedHiddenCount" class="text-muted-foreground text-xs"
          >{{ selectedHiddenCount }} hidden</span
        >
      </div>
      <div class="ml-auto flex flex-wrap items-center justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          :title="
            canZoomToSelected
              ? 'Zoom the map to the selected units'
              : 'No selected unit has a location at the current time'
          "
          :disabled="!canZoomToSelected"
          @click="zoomToSelected()"
          ><ZoomIcon class="size-4" />Zoom to</Button
        >
        <Button
          v-if="selectedVisibleCount"
          variant="outline"
          size="sm"
          title="Hide the selected units on the map"
          @click="setSelectedHidden(true)"
          ><IconEyeOff class="size-4" />Hide</Button
        >
        <Button
          v-if="selectedHiddenCount"
          variant="outline"
          size="sm"
          title="Show the selected units on the map"
          @click="setSelectedHidden(false)"
          ><IconEye class="size-4" />Show</Button
        >
        <Button
          variant="ghost"
          size="icon-sm"
          title="Clear the selection"
          aria-label="Clear the selection"
          @click="selectedUnitIds.clear()"
          ><IconClose class="size-4"
        /></Button>
      </div>
    </footer>
  </div>
</template>
