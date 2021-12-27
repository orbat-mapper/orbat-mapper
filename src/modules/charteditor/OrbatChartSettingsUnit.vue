<template>
  <div class="space-y-4 pb-4">
    <p class="text-sm text-gray-600">Unit specific options.</p>
    <div v-if="currentUnit" class="space-y-6">
      <header class="flex items-start">
        <div class="flex-shrink-0 w-16 h-20">
          <MilSymbol :sidc="currentUnit.sidc" :size="34" />
        </div>
        <div>
          <p class="font-medium text-gray-700 pt-2">{{ currentUnit.name }}</p>
          <p class="text-sm text-gray-500">{{ currentUnit.shortName }}</p>
        </div>
      </header>
      <PlainButton @click="clearSpecificOptions()">Clear settings</PlainButton>

      <InputGroup
        label="Symbol size"
        type="number"
        :model-value="mergedOptions.symbolSize"
        @update:model-value="setValue('symbolSize', $event)"
        :class="!usedOptions.has('symbolSize') && 'sepia-[50%]'"
      />

      <InputGroup
        label="Font size"
        type="number"
        :model-value="mergedOptions.fontSize"
        @update:model-value="setValue('fontSize', $event)"
        :class="!usedOptions.has('fontSize') && 'sepia-[50%]'"
      />

      <SimpleSelect
        label="Font weight"
        :model-value="mergedOptions.fontWeight"
        @update:model-value="setValue('fontWeight', $event)"
        :extra-class="!usedOptions.has('fontWeight') && 'sepia-[50%]'"
        :items="fontWeightItems"
      />
      <SimpleSelect
        label="Font style"
        :model-value="mergedOptions.fontStyle"
        @update:model-value="setValue('fontStyle', $event)"
        :extra-class="!usedOptions.has('fontStyle') && 'sepia-[50%]'"
        :items="fontStyleItems"
      />
      <InputGroup
        label="Label offset"
        type="number"
        :model-value="mergedOptions.labelOffset"
        @update:model-value="setValue('labelOffset', $event)"
        :class="!usedOptions.has('labelOffset') && 'sepia-[50%]'"
      />
      <ToggleField
        :model-value="mergedOptions.useShortName"
        @update:model-value="setValue('useShortName', $event)"
        :class="!usedOptions.has('useShortName') && 'sepia-[50%]'"
        >Use short unit names
      </ToggleField>
    </div>
  </div>
</template>

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import {
  useChartSettingsStore,
  useMergedChartOptionsStore,
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import ToggleField from "../../components/ToggleField.vue";
import { computed, defineComponent, reactive, ref } from "vue";
import MilSymbol from "../../components/MilSymbol.vue";
import PlainButton from "../../components/PlainButton.vue";
import { enum2Items } from "../../utils";
import { FontStyle, FontWeight } from "./orbatchart";

export default defineComponent({
  name: "OrbatChartSettingsUnit",
  components: { PlainButton, MilSymbol, ToggleField, SimpleSelect, InputGroup },
  setup() {
    const currentUnitNode = useSelectedChartElementStore();
    const specificOptions = useSpecificChartOptionsStore();
    const currentUnit = computed(() => currentUnitNode.node?.unit);

    const elementOptions = computed(() => {
      return currentUnit.value && specificOptions.unit[currentUnit.value.id];
    });

    const mOptions = useMergedChartOptionsStore();

    const mergedOptions = computed(() => {
      return mOptions.unit;
    });

    function setValue(name: string, value: any) {
      const opts = { ...(elementOptions.value || {}), [name]: value };
      if (currentUnit.value) specificOptions.unit[currentUnit.value.id] = opts;
    }

    function clearSpecificOptions() {
      if (currentUnit.value) specificOptions.unit[currentUnit.value.id] = {};
    }

    const usedOptions = computed(() => new Set(Object.keys(elementOptions.value || {})));
    const fontWeightItems = enum2Items(FontWeight);
    const fontStyleItems = enum2Items(FontStyle);

    return {
      currentUnit,
      mergedOptions,
      setValue,
      usedOptions,
      clearSpecificOptions,
      fontWeightItems,
      fontStyleItems,
    };
  },
});
</script>
