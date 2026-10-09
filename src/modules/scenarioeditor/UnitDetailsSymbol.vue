<script setup lang="ts">
import { type NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { isEqual } from "es-toolkit";
import { Sidc } from "@/symbology/sidc";
import { Dimension, symbolSetToDimension } from "@/symbology/values";
import TextAmpInput from "@/modules/scenarioeditor/TextAmpInput.vue";
import ToggleField from "@/components/ToggleField.vue";
import { type TextAmpKey, textAmpMap } from "@/symbology/milsymbwrapper";
import type { TextAmplifiers } from "@/types/scenarioModels";
import { Button } from "@/components/ui/button";
import UnitSymbol from "@/components/UnitSymbol.vue";
import { CUSTOM_SYMBOL_PREFIX, CUSTOM_SYMBOL_SLICE } from "@/config/constants.ts";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { Slider } from "@/components/ui/slider";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useUnitEditTargets } from "@/composables/unitEditTargets";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  unitActions: { updateUnit, getCombinedSymbolOptions, addUnitStateEntry },
  store,
  helpers: { getUnitById },
} = activeScenario;
const mapSettings = useMapSettingsStore();
const MIN_MAP_SYMBOL_SIZE = 8;
const MAX_MAP_SYMBOL_SIZE = 120;

const {
  isMultiMode,
  unitIds,
  units: targetUnits,
  editableIds,
  forEachEditableUnit,
} = useUnitEditTargets(() => props.unit.id);

const customSymbol = computed(() => {
  if (props.unit.sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    const symbolId = props.unit.sidc.slice(CUSTOM_SYMBOL_SLICE);
    return activeScenario.store.state.customSymbolMap[symbolId];
  }
});

type TextAmplifierKey = keyof TextAmplifiers;

const overrideName = ref<boolean>(false);
const textAmplifiers = ref<TextAmplifiers>({});
// Fields the user has edited. In multi mode only these are written, so each
// unit keeps its own values for the other fields.
const dirtyTextAmpKeys = ref(new Set<TextAmplifierKey>());
const mixedTextAmpKeys = ref(new Set<TextAmplifierKey>());
let isSyncingTextAmps = false;

const sourceTextAmplifiers = computed(() =>
  targetUnits.value.map((unit) => unit.textAmplifiers),
);

function syncTextAmplifiers() {
  isSyncingTextAmps = true;
  const sources = sourceTextAmplifiers.value.map((amps) => amps ?? {});
  const draft: Record<string, unknown> = {};
  const mixed = new Set<TextAmplifierKey>();
  const keys = new Set(
    sources.flatMap((amps) => Object.keys(amps)),
  ) as Set<TextAmplifierKey>;
  if (isMultiMode.value) keys.delete("uniqueDesignation");
  keys.forEach((key) => {
    const values = new Set(sources.map((amps) => amps[key]));
    if (values.size > 1) {
      mixed.add(key);
    } else {
      draft[key] = sources[0]?.[key];
    }
  });
  textAmplifiers.value = draft as TextAmplifiers;
  mixedTextAmpKeys.value = mixed;
  dirtyTextAmpKeys.value = new Set();
  overrideName.value = !isMultiMode.value && draft.uniqueDesignation !== undefined;
  isSyncingTextAmps = false;
}

// Resync when the selection changes, or when the stored text amplifiers change.
// Units are deep-copied on every update, so compare contents, not references,
// to keep unsaved edits across unrelated updates.
watch(unitIds, syncTextAmplifiers);
watch(
  sourceTextAmplifiers,
  (next, prev) => {
    if (prev && isEqual(next, prev)) return;
    syncTextAmplifiers();
  },
  { immediate: true },
);

function normalizeRotation(rotation: number) {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

const currentRotation = computed(() => {
  const unit = targetUnits.value[0];
  return normalizeRotation(unit?._state?.symbolRotation ?? 0);
});

const hasMixedRotation = computed(() => {
  if (targetUnits.value.length < 2) return false;
  const values = new Set(
    targetUnits.value.map((unit) => normalizeRotation(unit._state?.symbolRotation ?? 0)),
  );
  return values.size > 1;
});

const rotationDraft = ref(0);
const isSyncingRotationDraft = ref(false);
let rotationCommitTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
  [currentRotation, () => store.state.currentTime, () => props.unit.id, unitIds],
  () => {
    isSyncingRotationDraft.value = true;
    rotationDraft.value = currentRotation.value;
    isSyncingRotationDraft.value = false;
  },
  { immediate: true },
);

const rotationSliderValue = computed({
  get: (): [number] => [rotationDraft.value],
  set: ([value]) => {
    rotationDraft.value = normalizeRotation(value);
  },
});

function applyRotation() {
  const rotation = normalizeRotation(rotationDraft.value);
  forEachEditableUnit((unitId) =>
    addUnitStateEntry(
      unitId,
      { t: store.state.currentTime, symbolRotation: rotation },
      true,
    ),
  );
}

function cancelScheduledRotationApply() {
  if (rotationCommitTimeout !== null) {
    clearTimeout(rotationCommitTimeout);
    rotationCommitTimeout = null;
  }
}

function scheduleApplyRotation() {
  cancelScheduledRotationApply();
  rotationCommitTimeout = setTimeout(() => {
    rotationCommitTimeout = null;
    applyRotation();
  }, 120);
}

watch(
  rotationDraft,
  (next, prev) => {
    if (isSyncingRotationDraft.value || props.isLocked) return;
    const normalizedNext = normalizeRotation(next);
    const normalizedPrev = normalizeRotation(prev);
    if (Math.abs(normalizedNext - normalizedPrev) < 1e-6) return;
    // Skip when draft already matches effective rotation (e.g. undo/redo sync).
    if (Math.abs(normalizedNext - currentRotation.value) < 1e-6) return;
    scheduleApplyRotation();
  },
  // Run synchronously so the isSyncing guards are still set when syncing
  // from the store, and selection changes never write back.
  { flush: "sync" },
);

function resetRotationDraft() {
  cancelScheduledRotationApply();
  isSyncingRotationDraft.value = true;
  rotationDraft.value = 0;
  isSyncingRotationDraft.value = false;
  applyRotation();
}

onBeforeUnmount(() => {
  cancelScheduledRotationApply();
  cancelScheduledMapSymbolSizeApply();
});

watch(
  overrideName,
  (override) => {
    if (isSyncingTextAmps) return;
    if (override) {
      textAmplifiers.value.uniqueDesignation =
        props.unit.shortName || props.unit.name || "";
    } else {
      delete textAmplifiers.value.uniqueDesignation;
    }
    dirtyTextAmpKeys.value.add("uniqueDesignation");
  },
  { flush: "sync" },
);

const dimension = computed(() => {
  const sidc = new Sidc(props.unit.sidc);
  return symbolSetToDimension[sidc.symbolSet] || Dimension.Unknown;
});

const displaySymbol = computed(() => {
  const sidc = new Sidc(props.unit.sidc);
  sidc.emt = "000";
  sidc.hqtfd = "0";
  if (isMultiMode.value) {
    sidc.mainIcon = "000000";
    sidc.modifierOne = "00";
    sidc.modifierTwo = "00";
  }
  return sidc.toString();
});

const MAX_PREVIEW_UNITS = 6;

function applyTextAmplifierChanges(current: TextAmplifiers = {}): TextAmplifiers {
  const next: Record<string, unknown> = { ...current };
  dirtyTextAmpKeys.value.forEach((key) => {
    const value = textAmplifiers.value[key];
    if (value === undefined || value === "") delete next[key];
    else next[key] = value;
  });
  return next as TextAmplifiers;
}

// In multi mode the preview shows a few of the selected units as they will
// look after Update.
const previewUnits = computed(() => {
  const units = isMultiMode.value
    ? targetUnits.value.slice(0, MAX_PREVIEW_UNITS)
    : [props.unit];
  return units.map((unit) => ({
    id: unit.id,
    sidc: unit._state?.sidc || unit.sidc,
    options: {
      ...getCombinedSymbolOptions(unit),
      uniqueDesignation: unit.shortName || unit.name,
      ...(isMultiMode.value
        ? applyTextAmplifierChanges(unit.textAmplifiers)
        : textAmplifiers.value),
      outlineWidth: 4,
    },
  }));
});

const currentMapSymbolSizeOverride = computed<number | undefined>(() => {
  const unit = targetUnits.value[0];
  const size = unit?.style?.mapSymbolSize;
  return typeof size === "number" ? size : undefined;
});

const hasMixedMapSymbolSizeOverride = computed(() => {
  if (targetUnits.value.length < 2) return false;
  const values = new Set(
    targetUnits.value.map((unit) => {
      const value = unit.style?.mapSymbolSize;
      return typeof value === "number" ? value : "none";
    }),
  );
  return values.size > 1;
});

const mapSymbolSizeDraft = ref(mapSettings.mapIconSize);
const isSyncingMapSymbolSizeDraft = ref(false);
const overrideMapSymbolSize = ref(false);
const isSyncingMapSymbolSizeToggle = ref(false);
let mapSymbolSizeCommitTimeout: ReturnType<typeof setTimeout> | null = null;
const previewSymbolSize = computed(() => {
  return overrideMapSymbolSize.value
    ? clampMapSymbolSize(mapSymbolSizeDraft.value)
    : mapSettings.mapIconSize;
});

watch(
  [
    currentMapSymbolSizeOverride,
    () => mapSettings.mapIconSize,
    () => props.unit.id,
    unitIds,
  ],
  () => {
    isSyncingMapSymbolSizeDraft.value = true;
    isSyncingMapSymbolSizeToggle.value = true;
    overrideMapSymbolSize.value = targetUnits.value.some(
      (unit) => typeof unit.style?.mapSymbolSize === "number",
    );
    mapSymbolSizeDraft.value =
      currentMapSymbolSizeOverride.value ?? mapSettings.mapIconSize;
    isSyncingMapSymbolSizeToggle.value = false;
    isSyncingMapSymbolSizeDraft.value = false;
  },
  { immediate: true },
);

function clampMapSymbolSize(value: number) {
  return Math.max(MIN_MAP_SYMBOL_SIZE, Math.min(MAX_MAP_SYMBOL_SIZE, Math.round(value)));
}

function applyMapSymbolSizeOverride() {
  if (!editableIds.value.length) return;
  const size = clampMapSymbolSize(mapSymbolSizeDraft.value);
  mapSymbolSizeDraft.value = size;

  forEachEditableUnit((unitId) => {
    const unit = getUnitById(unitId);
    if (!unit) return;
    updateUnit(unitId, { style: { ...unit.style, mapSymbolSize: size } });
  });
}

function cancelScheduledMapSymbolSizeApply() {
  if (mapSymbolSizeCommitTimeout !== null) {
    clearTimeout(mapSymbolSizeCommitTimeout);
    mapSymbolSizeCommitTimeout = null;
  }
}

function scheduleApplyMapSymbolSizeOverride() {
  cancelScheduledMapSymbolSizeApply();
  mapSymbolSizeCommitTimeout = setTimeout(() => {
    mapSymbolSizeCommitTimeout = null;
    applyMapSymbolSizeOverride();
  }, 120);
}

function resetMapSymbolSizeOverride() {
  if (!editableIds.value.length) return;
  cancelScheduledMapSymbolSizeApply();

  forEachEditableUnit((unitId) => {
    const unit = getUnitById(unitId);
    if (!unit) return;
    const { mapSymbolSize: _mapSymbolSize, ...styleWithoutMapSymbolSize } =
      unit.style ?? {};
    updateUnit(unitId, { style: styleWithoutMapSymbolSize });
  });
  isSyncingMapSymbolSizeDraft.value = true;
  mapSymbolSizeDraft.value = mapSettings.mapIconSize;
  isSyncingMapSymbolSizeDraft.value = false;
}

watch(
  mapSymbolSizeDraft,
  (next, prev) => {
    if (
      isSyncingMapSymbolSizeDraft.value ||
      props.isLocked ||
      !overrideMapSymbolSize.value
    )
      return;
    const normalizedNext = clampMapSymbolSize(next);
    const normalizedPrev = clampMapSymbolSize(prev);
    if (normalizedNext !== next) {
      mapSymbolSizeDraft.value = normalizedNext;
      return;
    }
    if (normalizedNext === normalizedPrev) return;
    if (normalizedNext === currentMapSymbolSizeOverride.value) return;
    scheduleApplyMapSymbolSizeOverride();
  },
  // Run synchronously so the isSyncing guards are still set when syncing
  // from the store, and selection changes never write back.
  { flush: "sync" },
);

watch(
  overrideMapSymbolSize,
  (override) => {
    if (isSyncingMapSymbolSizeToggle.value || props.isLocked) return;
    cancelScheduledMapSymbolSizeApply();
    if (override) {
      mapSymbolSizeDraft.value = clampMapSymbolSize(mapSymbolSizeDraft.value);
      applyMapSymbolSizeOverride();
    } else {
      resetMapSymbolSizeOverride();
    }
  },
  // Run synchronously so the isSyncing guards are still set when syncing
  // from the store, and selection changes never write back.
  { flush: "sync" },
);

interface TextFieldMeta {
  x: number;
  y: number;
  field: TextAmpKey;
  placeholder?: string;
  title?: string;
}

const landUnitFields: TextFieldMeta[] = [
  { x: 3, y: 2, field: "G", title: "Staff Comments" },
  { x: 3, y: 3, field: "H", title: "Additional Information" },
  { x: 1, y: 4, field: "T", title: "Unique Designation" },
  { x: 3, y: 4, field: "M", title: "Higher Formation" },
];

const surfaceFields: TextFieldMeta[] = [
  { x: 3, y: 1, field: "T", title: "Unique Designation" },
  { x: 3, y: 4, field: "G", title: "Staff Comments" },
];

const subSurfaceFields: TextFieldMeta[] = [
  { x: 3, y: 1, field: "T", title: "Unique Designation" },
  { x: 3, y: 4, field: "G", title: "Staff Comments" },
];

const airFields: TextFieldMeta[] = [
  { x: 3, y: 1, field: "T", title: "Unique Designation" },
  { x: 3, y: 4, field: "G", title: "Staff Comments" },
];

const textFields = computed(() => {
  if (dimension.value === Dimension.SeaSurface) {
    return surfaceFields;
  } else if (dimension.value === Dimension.SeaSubsurface) {
    return subSurfaceFields;
  } else if (dimension.value === Dimension.Air) {
    return airFields;
  }
  return landUnitFields;
});

function onSubmit() {
  if (isMultiMode.value) {
    if (!dirtyTextAmpKeys.value.size) return;
    forEachEditableUnit((id) => {
      const unit = getUnitById(id);
      if (!unit) return;
      updateUnit(id, { textAmplifiers: applyTextAmplifierChanges(unit.textAmplifiers) });
    });
  } else {
    updateUnit(props.unit.id, { textAmplifiers: { ...textAmplifiers.value } });
  }
}

function handleReset() {
  forEachEditableUnit((id) => updateUnit(id, { textAmplifiers: {} }));
}

function setTextAmpValue(field: TextAmpKey, value: string | number | undefined) {
  const key = textAmpMap[field] as keyof TextAmplifiers;
  if (key === undefined) return;

  (textAmplifiers.value as Record<string, unknown>)[key] = value;
  dirtyTextAmpKeys.value.add(key);
}

function getTextAmpPlaceholder(field: TextAmpKey) {
  const key = textAmpMap[field] as TextAmplifierKey;
  return mixedTextAmpKeys.value.has(key) && !dirtyTextAmpKeys.value.has(key)
    ? "Mixed"
    : field;
}
</script>
<template>
  <section class="-mx-4 sm:mx-0">
    <div v-if="!customSymbol">
      <header class="my-4 flex items-center justify-between">
        <p />
        <ToggleField v-if="!isMultiMode" v-model="overrideName"
          >Override name</ToggleField
        >
      </header>
      <form @submit.prevent="onSubmit">
        <div class="grid grid-cols-3 grid-rows-5">
          <p class="col-start-1 row-start-1 h-9"></p>
          <div
            v-for="{ x, y, field, placeholder, title } in textFields"
            :key="field"
            :style="{ 'grid-row-start': y, 'grid-column-start': x }"
          >
            <TextAmpInput
              v-if="field == 'T'"
              :placeholder="field || placeholder"
              :model-value="
                isMultiMode
                  ? 'Unit name'
                  : !overrideName
                    ? unit.shortName || unit.name
                    : textAmplifiers.uniqueDesignation
              "
              @update:model-value="setTextAmpValue(field, $event)"
              :disabled="isLocked || isMultiMode || !overrideName"
              :title="title"
            />
            <TextAmpInput
              v-else
              :placeholder="getTextAmpPlaceholder(field)"
              :model-value="textAmplifiers[textAmpMap[field]]"
              @update:model-value="setTextAmpValue(field, $event)"
              :disabled="isLocked"
              :title="title"
            />
          </div>

          <div
            class="col-start-2 row-span-3 row-start-2 items-center justify-self-center pt-2"
          >
            <NewMilitarySymbol
              :sidc="displaySymbol"
              class="text-muted-foreground"
              :size="75"
              :modifiers="{
                frame: true,
                monoColor: 'currentColor',
              }"
            />
          </div>
        </div>
        <footer class="mt-2 flex items-center justify-end gap-2 border-t pt-2">
          <Button
            size="sm"
            type="button"
            variant="outline"
            @click="handleReset"
            :disabled="isLocked"
            >Reset</Button
          >
          <Button
            size="sm"
            variant="secondary"
            type="submit"
            :disabled="isLocked || (isMultiMode && !dirtyTextAmpKeys.size)"
            >Update</Button
          >
        </footer>
      </form>
    </div>
    <p v-else class="text-muted-foreground mt-4 text-sm">
      Text amplifiers are not available for custom symbols.
    </p>
    <p class="mt-2 text-sm leading-7 font-medium">Preview</p>

    <div class="mt-4 flex flex-wrap items-end justify-center gap-4">
      <UnitSymbol
        v-for="previewUnit in previewUnits"
        :key="previewUnit.id"
        :sidc="previewUnit.sidc"
        :size="previewSymbolSize"
        :options="previewUnit.options"
      />
    </div>
    <p
      v-if="isMultiMode && targetUnits.length > previewUnits.length"
      class="text-muted-foreground mt-2 text-center text-xs"
    >
      Showing {{ previewUnits.length }} of {{ targetUnits.length }} selected units
    </p>
    <PanelDataGrid class="mt-6">
      <div class="col-span-2 mt-2 font-semibold">Map symbol size</div>
      <ToggleField class="col-span-2" v-model="overrideMapSymbolSize"
        >Override size</ToggleField
      >
      <div class="self-center">Size</div>
      <div>
        <NumberInputGroup
          v-model="mapSymbolSizeDraft"
          :min="MIN_MAP_SYMBOL_SIZE"
          :max="MAX_MAP_SYMBOL_SIZE"
          :step="1"
          :disabled="isLocked || !overrideMapSymbolSize"
        />
      </div>

      <div v-if="hasMixedMapSymbolSizeOverride" class="col-span-2 text-xs text-amber-700">
        Mixed values in current selection.
      </div>
      <div class="col-span-2 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="isLocked || !overrideMapSymbolSize"
          @click="resetMapSymbolSizeOverride"
        >
          Reset
        </Button>
      </div>
    </PanelDataGrid>

    <PanelDataGrid class="mt-6">
      <div class="col-span-2 mt-2 font-semibold">Rotation</div>
      <div class="leading-tight">Angle (deg)</div>
      <div>
        <NumberInputGroup
          v-model="rotationDraft"
          :min="0"
          :max="360"
          :step="1"
          :disabled="isLocked"
        />
      </div>
      <div>Adjust</div>
      <div class="pt-3">
        <Slider
          v-model="rotationSliderValue"
          :min="0"
          :max="360"
          :step="1"
          :disabled="isLocked"
        />
      </div>
      <div v-if="hasMixedRotation" class="col-span-2 text-xs text-amber-700">
        Mixed values in current selection.
      </div>
      <div class="col-span-2 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="isLocked"
          @click="resetRotationDraft"
        >
          Reset
        </Button>
      </div>
    </PanelDataGrid>
  </section>
</template>
