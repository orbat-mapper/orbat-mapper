<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">Unit specific options.</p>
    <div v-if="currentUnit">
      <header class="flex items-start">
        <div class="flex-shrink-0 w-16 h-20">
          <MilSymbol :sidc="currentUnit.sidc" :size="34" />
        </div>
        <div>
          <p class="font-medium text-gray-700 pt-2">{{ currentUnit.name }}</p>
          <p class="text-sm text-gray-500">{{ currentUnit.shortName }}</p>
        </div>
      </header>
    </div>

    <InputGroup
      label="Symbol size"
      type="number"
      :model-value="mergedOptions.symbolSize"
      @update:model-value="setValue('symbolSize', $event)"
      :class="!usedOptions.has('symbolSize') && 'sepia-[50%]'"
    />

    <!--    <InputGroup-->
    <!--      label="Font size"-->
    <!--      type="number"-->
    <!--      :model-value="mergedOptions.fontSize"-->
    <!--      @update:model-value="setValue('fontSize', $event)"-->
    <!--      :class="!usedOptions.has('fontSize') && 'sepia-[50%]'"-->
    <!--    />-->
    <ToggleField
      :model-value="mergedOptions.useShortName"
      @update:model-value="setValue('useShortName', $event)"
      :class="!usedOptions.has('useShortName') && 'sepia-[50%]'"
      >Use short unit names</ToggleField
    >
  </div>
</template>

<script lang="ts">
import InputGroup from "../../components/InputGroup.vue";
import {
  useChartSettingsStore,
  useSelectedChartUnitStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";
import SimpleSelect from "../../components/SimpleSelect.vue";
import ToggleField from "../../components/ToggleField.vue";
import { computed, defineComponent, reactive, ref } from "vue";
import MilSymbol from "../../components/MilSymbol.vue";

export default defineComponent({
  name: "OrbatChartSettingsUnit",
  components: { MilSymbol, ToggleField, SimpleSelect, InputGroup },
  props: {},
  setup(props) {
    const options = useChartSettingsStore();
    const currentUnitNode = useSelectedChartUnitStore();
    const specificOptions = useSpecificChartOptionsStore();
    const currentUnit = computed(() => currentUnitNode.node?.unit);
    const unitOptions = computed(() => {
      return currentUnit.value && specificOptions.unit[currentUnit.value.id];
    });

    const mergedOptions = computed(() => {
      return {
        ...options.$state,
        // ...specificOptions.level,
        // ...specificOptions.levelGroup,
        ...unitOptions.value,
      };
    });

    function setValue(name: string, value: any) {
      const opts = { ...(unitOptions.value || {}), [name]: value };
      if (currentUnit.value) specificOptions.unit[currentUnit.value.id] = opts;
    }

    const usedOptions = computed(() => new Set(Object.keys(unitOptions.value || {})));

    return { options, currentUnit, mergedOptions, setValue, usedOptions };
  },
});
</script>
