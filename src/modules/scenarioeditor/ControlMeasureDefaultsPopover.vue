<script setup lang="ts">
/**
 * The defaults a newly drawn control measure is born with: identity, colour mode,
 * status, and — for the kinds the styling UI lets you author — colour and fill pattern.
 *
 * Session-sticky Pinia UI state, never scenario data (ADR-0006): changing a default
 * changes nothing that already exists, and nothing here is persisted into a scenario.
 * The controls are the same component the details panel uses, so "what a new graphic
 * looks like" and "what this graphic looks like" cannot drift apart.
 */
import { IconPaletteOutline as DefaultsIcon } from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import ControlMeasureStyleSettings from "@/modules/scenarioeditor/ControlMeasureStyleSettings.vue";
import type { ControlMeasureStyleUpdate } from "@/modules/scenarioeditor/controlMeasureStyleOptions";

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });

const store = useControlMeasureToolStore();
const { defaults } = storeToRefs(store);

function updateDefaults(data: ControlMeasureStyleUpdate) {
  store.setDefaults(data);
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <MainToolbarButton
        :title="
          disabled
            ? 'Control measures are not supported by this map engine'
            : 'Control measure defaults'
        "
        :disabled="disabled"
      >
        <DefaultsIcon class="size-5" />
      </MainToolbarButton>
    </PopoverTrigger>
    <PopoverContent :avoid-collisions="true">
      <header class="text-sm font-bold">New control measures</header>
      <PanelDataGrid class="mt-4">
        <ControlMeasureStyleSettings
          :measure-style="defaults.style"
          :standard-identity="defaults.standardIdentity"
          :color-mode="defaults.colorMode"
          :status="defaults.status"
          @update="updateDefaults"
        />
      </PanelDataGrid>
    </PopoverContent>
  </Popover>
</template>
