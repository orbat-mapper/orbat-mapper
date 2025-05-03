<script setup lang="ts">
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ref } from "vue";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { type UnitSymbolOptions } from "@/types/scenarioModels";

interface Props {
  symbolOptions: UnitSymbolOptions;
  selectEchelon: (sidc: string) => void;
}

const props = defineProps<Props>();
const isOpen = ref(false);

const { echelonSidc, emtItems } = useToolbarUnitSymbolData();

const onSelect = (sidc: string) => {
  props.selectEchelon(sidc);
  isOpen.value = false;
};
</script>
<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <PanelSymbolButton
        :size="20"
        :sidc="echelonSidc || ''"
        :symbol-options="symbolOptions"
        title="Select echelon"
      />
    </PopoverTrigger>
    <PopoverContent
      class="grid grid-cols-5 justify-items-center gap-2 p-2"
      align="center"
      side="top"
      :sideOffset="10"
    >
      <PanelSymbolButton
        class="self-end"
        v-for="{ sidc, text } in emtItems"
        :key="sidc"
        :sidc="sidc"
        :title="text"
        :symbol-options="symbolOptions"
        @click="onSelect(sidc)"
      />
    </PopoverContent>
  </Popover>
</template>
