<script setup lang="ts">
import { type NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Sidc } from "@/symbology/sidc";
import { Dimension, symbolSetToDimension } from "@/symbology/values";
import TextAmpInput from "@/modules/scenarioeditor/TextAmpInput.vue";
import ToggleField from "@/components/ToggleField.vue";
import { type TextAmpKey, textAmpMap } from "@/symbology/milsymbwrapper";
import type { TextAmplifiers } from "@/types/scenarioModels";
import { useSelectedItems } from "@/stores/selectedStore";
import { Button } from "@/components/ui/button";
import UnitSymbol from "@/components/UnitSymbol.vue";
import { CUSTOM_SYMBOL_PREFIX, CUSTOM_SYMBOL_SLICE } from "@/config/constants.ts";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { Slider } from "@/components/ui/slider";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

interface Props {
  unit: NUnit;
  isMultiMode: boolean;
  isLocked?: boolean;
}

const props = defineProps<Props>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  unitActions: { updateUnit, getCombinedSymbolOptions, addUnitStateEntry, isUnitLocked },
  store,
  helpers: { getUnitById },
} = activeScenario;
const { groupUpdate } = store;
const mapSettings = useMapSettingsStore();
const MIN_MAP_SYMBOL_SIZE = 8;
const MAX_MAP_SYMBOL_SIZE = 120;

const { selectedUnitIds } = useSelectedItems();

const customSymbol = computed(() => {
  if (props.unit.sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    const symbolId = props.unit.sidc.slice(CUSTOM_SYMBOL_SLICE);
    return activeScenario.store.state.customSymbolMap[symbolId];
  }
});

const overrideName = ref<boolean>(
  props.unit.textAmplifiers?.uniqueDesignation !== undefined,
);
const textAmplifiers = ref<TextAmplifiers>({ ...(props.unit.textAmplifiers || {}) });

function normalizeRotation(rotation: number) {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

const rotationUnits = computed(() => {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    return [...selectedUnitIds.value]
      .map((unitId) => getUnitById(unitId))
      .filter((unit): unit is NUnit => !!unit);
  }
  return [props.unit];
});

const currentRotation = computed(() => {
  const unit = rotationUnits.value[0];
  return normalizeRotation(unit?._state?.symbolRotation ?? 0);
});

const hasMixedRotation = computed(() => {
  if (rotationUnits.value.length < 2) return false;
  const values = new Set(
    rotationUnits.value.map((unit) =>
      normalizeRotation(unit._state?.symbolRotation ?? 0),
    ),
  );
  return values.size > 1;
});

const rotationDraft = ref(0);
const isSyncingRotationDraft = ref(false);
let rotationCommitTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
  [currentRotation, () => store.state.currentTime, () => props.unit.id, selectedUnitIds],
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

function getRotationTargetIds() {
  const ids =
    props.isMultiMode && selectedUnitIds.value.size > 1
      ? [...selectedUnitIds.value]
      : [props.unit.id];
  return ids.filter((id) => !isUnitLocked(id));
}

function applyRotation() {
  const rotation = normalizeRotation(rotationDraft.value);
  const targetIds = getRotationTargetIds();
  if (!targetIds.length) return;
  store.groupUpdate(() => {
    targetIds.forEach((unitId) => {
      addUnitStateEntry(
        unitId,
        { t: store.state.currentTime, symbolRotation: rotation },
        true,
      );
    });
  });
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

watch(rotationDraft, (next, prev) => {
  if (isSyncingRotationDraft.value || props.isLocked) return;
  const normalizedNext = normalizeRotation(next);
  const normalizedPrev = normalizeRotation(prev);
  if (Math.abs(normalizedNext - normalizedPrev) < 1e-6) return;
  // Skip when draft already matches effective rotation (e.g. undo/redo sync).
  if (Math.abs(normalizedNext - currentRotation.value) < 1e-6) return;
  scheduleApplyRotation();
});

function resetRotationDraft() {
  cancelScheduledRotationApply();
  rotationDraft.value = 0;
  applyRotation();
}

onBeforeUnmount(() => {
  cancelScheduledRotationApply();
  cancelScheduledMapSymbolSizeApply();
});

watch(overrideName, (override) => {
  if (override) {
    textAmplifiers.value.uniqueDesignation =
      props.unit.shortName || props.unit.name || "";
  } else {
    delete textAmplifiers.value.uniqueDesignation;
  }
});

const dimension = computed(() => {
  const sidc = new Sidc(props.unit.sidc);
  return symbolSetToDimension[sidc.symbolSet] || Dimension.Unknown;
});

const displaySymbol = computed(() => {
  const sidc = new Sidc(props.unit.sidc);
  sidc.emt = "000";
  sidc.hqtfd = "0";
  if (props.isMultiMode) {
    sidc.mainIcon = "000000";
    sidc.modifierOne = "00";
    sidc.modifierTwo = "00";
  }
  return sidc.toString();
});

const combinedSymbolOptions = computed(() => {
  return {
    ...getCombinedSymbolOptions(props.unit),
    uniqueDesignation: props.unit.shortName || props.unit.name,
    ...textAmplifiers.value,
    outlineWidth: 4,
  };
});

const mapSymbolSizeUnits = computed(() => {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    return [...selectedUnitIds.value]
      .map((unitId) => getUnitById(unitId))
      .filter((unit): unit is NUnit => !!unit);
  }
  return [props.unit];
});

const currentMapSymbolSizeOverride = computed<number | undefined>(() => {
  const unit = mapSymbolSizeUnits.value[0];
  const size = unit?.style?.mapSymbolSize;
  return typeof size === "number" ? size : undefined;
});

const hasMixedMapSymbolSizeOverride = computed(() => {
  if (mapSymbolSizeUnits.value.length < 2) return false;
  const values = new Set(
    mapSymbolSizeUnits.value.map((unit) => {
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
    selectedUnitIds,
  ],
  () => {
    isSyncingMapSymbolSizeDraft.value = true;
    isSyncingMapSymbolSizeToggle.value = true;
    overrideMapSymbolSize.value = mapSymbolSizeUnits.value.some(
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

function getMapSymbolSizeTargetIds() {
  const ids =
    props.isMultiMode && selectedUnitIds.value.size > 1
      ? [...selectedUnitIds.value]
      : [props.unit.id];
  return ids.filter((id) => !isUnitLocked(id));
}

function applyMapSymbolSizeOverride() {
  const targetIds = getMapSymbolSizeTargetIds();
  if (!targetIds.length) return;
  const size = clampMapSymbolSize(mapSymbolSizeDraft.value);
  mapSymbolSizeDraft.value = size;

  groupUpdate(() => {
    targetIds.forEach((unitId) => {
      const unit = getUnitById(unitId);
      if (!unit) return;
      const unitStyle = unit.style ?? {};
      updateUnit(unitId, {
        style: {
          ...unitStyle,
          mapSymbolSize: size,
        },
      });
    });
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
  const targetIds = getMapSymbolSizeTargetIds();
  if (!targetIds.length) return;
  cancelScheduledMapSymbolSizeApply();

  groupUpdate(() => {
    targetIds.forEach((unitId) => {
      const unit = getUnitById(unitId);
      if (!unit) return;
      const unitStyle = unit.style ?? {};
      const { mapSymbolSize: _mapSymbolSize, ...styleWithoutMapSymbolSize } = unitStyle;
      updateUnit(unitId, {
        style: styleWithoutMapSymbolSize,
      });
    });
  });
  isSyncingMapSymbolSizeDraft.value = true;
  mapSymbolSizeDraft.value = mapSettings.mapIconSize;
  isSyncingMapSymbolSizeDraft.value = false;
}

watch(mapSymbolSizeDraft, (next, prev) => {
  if (isSyncingMapSymbolSizeDraft.value || props.isLocked || !overrideMapSymbolSize.value)
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
});

watch(overrideMapSymbolSize, (override) => {
  if (isSyncingMapSymbolSizeToggle.value || props.isLocked) return;
  cancelScheduledMapSymbolSizeApply();
  if (override) {
    mapSymbolSizeDraft.value = clampMapSymbolSize(mapSymbolSizeDraft.value);
    applyMapSymbolSizeOverride();
  } else {
    resetMapSymbolSizeOverride();
  }
});

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
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    groupUpdate(() => {
      selectedUnitIds.value.forEach((id) => {
        updateUnit(id, { textAmplifiers: { ...textAmplifiers.value } });
      });
    });
  } else {
    updateUnit(props.unit.id, { textAmplifiers: { ...textAmplifiers.value } });
  }
}

function handleReset() {
  textAmplifiers.value = {};
  overrideName.value = false;
  onSubmit();
}

function setTextAmpValue(field: TextAmpKey, value: string | number | undefined) {
  const key = textAmpMap[field] as keyof TextAmplifiers;
  if (key === undefined) return;

  //@ts-ignore
  textAmplifiers.value[key] = value;
}
</script>
<template>
  <section class="-mx-4 sm:mx-0">
    <div v-if="!customSymbol">
      <header class="my-4 flex items-center justify-between">
        <p />
        <ToggleField v-model="overrideName">Override name</ToggleField>
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
                !overrideName
                  ? isMultiMode
                    ? '...'
                    : unit.shortName || unit.name
                  : textAmplifiers.uniqueDesignation
              "
              @update:model-value="setTextAmpValue(field, $event)"
              :disabled="isLocked || !overrideName"
              :title="title"
            />
            <TextAmpInput
              v-else
              :placeholder="field || placeholder"
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
          <Button size="sm" variant="secondary" type="submit" :disabled="isLocked"
            >Update</Button
          >
        </footer>
      </form>
    </div>
    <p v-else class="text-muted-foreground mt-4 text-sm">
      Text amplifiers are not available for custom symbols.
    </p>
    <p class="mt-2 text-sm leading-7 font-medium">Preview</p>

    <div class="mt-4 flex justify-center">
      <UnitSymbol
        :sidc="props.unit.sidc"
        :size="previewSymbolSize"
        :options="combinedSymbolOptions"
      />
    </div>
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
