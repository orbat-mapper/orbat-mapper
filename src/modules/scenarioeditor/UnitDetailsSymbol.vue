<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { Sidc } from "@/symbology/sidc";
import { Dimension, symbolSetToDimension } from "@/symbology/values";
import TextAmpInput from "@/modules/scenarioeditor/TextAmpInput.vue";
import ToggleField from "@/components/ToggleField.vue";
import { TextAmpKey, textAmpMap, TextAmpValue } from "@/symbology/milsymbwrapper";
import BaseButton from "@/components/BaseButton.vue";
import { TextAmplifiers } from "@/types/scenarioModels";
import { useSelectedItems } from "@/stores/selectedStore";

interface Props {
  unit: NUnit;
  isMultiMode: boolean;
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
  return sidc.toString();
});

const combinedSymbolOptions = computed(() => {
  return {
    ...getCombinedSymbolOptions(props.unit),
    uniqueDesignation: props.unit.shortName || props.unit.name,
    ...textAmplifiers.value,
  };
});

interface TextFieldMeta {
  x: number;
  y: number;
  field: TextAmpKey;
  placeholder?: string;
}

const landUnitFields: TextFieldMeta[] = [
  { x: 3, y: 2, field: "G" },
  { x: 3, y: 3, field: "H" },
  { x: 1, y: 4, field: "T" },
  { x: 3, y: 4, field: "M" },
];

const surfaceFields: TextFieldMeta[] = [
  { x: 3, y: 1, field: "T" },
  { x: 3, y: 4, field: "G" },
];

const subSurfaceFields: TextFieldMeta[] = [
  { x: 3, y: 1, field: "T" },
  { x: 3, y: 4, field: "G" },
];

const airFields: TextFieldMeta[] = [
  { x: 3, y: 1, field: "T" },
  { x: 3, y: 4, field: "G" },
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
            v-for="{ x, y, field, placeholder } in textFields"
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
              @update:model-value="textAmplifiers[textAmpMap[field]] = $event"
              :disabled="!overrideName"
            />
            <TextAmpInput
              v-else
              :placeholder="field || placeholder"
              :model-value="textAmplifiers[textAmpMap[field]]"
              @update:model-value="textAmplifiers[textAmpMap[field]] = $event"
            />
          </div>

          <div
            class="col-start-2 row-span-3 row-start-2 items-center justify-self-center pt-2"
          >
            <MilitarySymbol
              :sidc="displaySymbol"
              :size="75"
              :modifiers="{ frame: true, monoColor: '#7a7575' }"
            />
          </div>
        </div>
        <footer class="mt-2 flex items-center justify-end gap-2 border-t pt-2">
          <BaseButton small @click="handleReset">Reset</BaseButton>
          <BaseButton small type="submit" secondary>Update</BaseButton>
        </footer>
      </form>
    </div>
    <p class="mt-2 text-sm font-medium leading-7">Preview</p>

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
