<script setup lang="ts">
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Float } from "@headlessui-float/vue";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { Ref } from "vue";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { UnitSymbolOptions } from "@/types/scenarioModels";

interface Props {
  symbolOptions: UnitSymbolOptions;
  selectEchelon: (sidc: string, closePopover: (ref?: Ref | HTMLElement) => void) => void;
}

const props = defineProps<Props>();

const { echelonSidc, emtItems } = useToolbarUnitSymbolData();
</script>
<template>
  <Popover as="template">
    <Float placement="top" :offset="12" flip shift strategy="fixed">
      <PopoverButton as="template">
        <PanelSymbolButton
          :size="20"
          :sidc="echelonSidc || ''"
          :symbol-options="symbolOptions"
          title="Select echelon"
        />
      </PopoverButton>
      <PopoverPanel focus v-slot="{ close }">
        <FloatingPanel class="grid grid-cols-5 justify-items-center gap-2 p-2">
          <PanelSymbolButton
            class="self-end"
            v-for="{ sidc, text } in emtItems"
            :key="sidc"
            :sidc="sidc"
            :title="text"
            :symbol-options="symbolOptions"
            @click="selectEchelon(sidc, close)"
          />
        </FloatingPanel>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
