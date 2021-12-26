<template>
  <div class="space-y-4 pb-4">
    <p class="text-sm text-gray-600">Level specific options.</p>
    <div v-if="currentLevel !== null" class="space-y-6">
      <header class="flex items-start">{{ currentLevel }}</header>
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
  name: "OrbatChartSettingsLevel",
  components: { PlainButton, MilSymbol, ToggleField, SimpleSelect, InputGroup },
  setup() {
    const options = useChartSettingsStore();
    const selectedElement = useSelectedChartElementStore();
    const specificOptions = useSpecificChartOptionsStore();
    const currentLevel = computed(() => selectedElement.level);
    const elementOptions = computed(() => {
      return currentLevel.value !== null && specificOptions.level[currentLevel.value];
    });

    const mergedOptions = computed(() => {
      return {
        ...options.$state,
        ...(elementOptions.value || {}),
        // ...specificOptions.levelGroup,
      };
    });

    function setValue(name: string, value: any) {
      const opts = { ...(elementOptions.value || {}), [name]: value };
      if (currentLevel.value !== null) specificOptions.level[currentLevel.value] = opts;
    }

    function clearSpecificOptions() {
      if (currentLevel.value !== null) specificOptions.level[currentLevel.value] = {};
    }

    const usedOptions = computed(() => new Set(Object.keys(elementOptions.value || {})));
    const fontWeightItems = enum2Items(FontWeight);
    const fontStyleItems = enum2Items(FontStyle);

    return {
      options,
      currentLevel,
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
