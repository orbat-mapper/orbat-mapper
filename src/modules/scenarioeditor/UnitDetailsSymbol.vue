<script setup lang="ts">
import { type NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { Sidc } from "@/symbology/sidc";
import { Dimension, symbolSetToDimension } from "@/symbology/values";
import TextAmpInput from "@/modules/scenarioeditor/TextAmpInput.vue";
import ToggleField from "@/components/ToggleField.vue";
import { type TextAmpKey, textAmpMap } from "@/symbology/milsymbwrapper";
import type { TextAmplifiers } from "@/types/scenarioModels";
import { useSelectedItems } from "@/stores/selectedStore";
import { Button } from "@/components/ui/button";

interface Props {
  unit: NUnit;
  isMultiMode: boolean;
  isLocked?: boolean;
}

const props = defineProps<Props>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  unitActions: { updateUnit, getCombinedSymbolOptions },
  store: { groupUpdate },
} = activeScenario;

const { selectedUnitIds } = useSelectedItems();

const overrideName = ref<boolean>(
  props.unit.textAmplifiers?.uniqueDesignation !== undefined,
);
const textAmplifiers = ref<TextAmplifiers>({ ...(props.unit.textAmplifiers || {}) });

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
    <div>
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
            <MilitarySymbol
              :sidc="displaySymbol"
              :size="75"
              :modifiers="{ frame: true, monoColor: '#7a7575', outlineWidth: 4 }"
            />
          </div>
        </div>
        <footer class="mt-2 flex items-center justify-end gap-2 border-t pt-2">
          <Button size="sm" variant="outline" @click="handleReset" :disabled="isLocked"
            >Reset</Button
          >
          <Button size="sm" variant="secondary" type="submit" :disabled="isLocked"
            >Update</Button
          >
        </footer>
      </form>
    </div>
    <p class="mt-2 text-sm leading-7 font-medium">Preview</p>

    <div class="mt-4 flex justify-center">
      <MilitarySymbol
        :sidc="props.unit.sidc"
        :size="30"
        :options="combinedSymbolOptions"
      />
    </div>
    <pre></pre>
  </section>
</template>
