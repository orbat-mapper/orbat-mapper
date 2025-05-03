<script setup lang="ts">
import { IconChevronUp, IconPlus as AddSymbolIcon } from "@iconify-prerendered/vue-mdi";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { RadioGroup, RadioGroupOption } from "@headlessui/vue";
import { ref } from "vue";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { sidcModalKey } from "@/components/injects";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import PanelButton from "@/components/PanelButton.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import type { MenuItemData } from "@/components/types.ts";
import { Button } from "@/components/ui/button";

interface Props {
  symbolOptions: UnitSymbolOptions;
  addUnit: (sidc: string) => void;
}

const props = defineProps<Props>();

const { getModalSidc } = injectStrict(sidcModalKey);

const { iconItems, customIcon, customSidc, symbolPage } = useToolbarUnitSymbolData();
const store = useMainToolbarStore();

const isOpen = ref(false);
const symbolTabs = ref([
  { title: "Land", sidc: "30031000001211000000", id: "land" },
  { title: "Sea", sidc: "10033000001201000000", id: "sea" },
  { title: "Air", sidc: "30030100001101000000", id: "air" },
]);

const panelItems: MenuItemData[] = [
  { label: "Add symbol to panel", action: () => handleChangeSymbol() },
];

async function handleChangeSymbol() {
  const newSidcValue = await getModalSidc(customSidc.value, {
    title: "Select symbol",
    hideModifiers: true,
    hideSymbolColor: true,
    symbolOptions: props.symbolOptions,
  });
  if (newSidcValue !== undefined) {
    customIcon.value.code = newSidcValue.sidc;
    props.addUnit(customSidc.value);
    isOpen.value = false;
  }
}

function onAddUnit(sidc: string) {
  props.addUnit(sidc);
  isOpen.value = false;
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger title="Select icons" @click="store.clearToolbar()" as-child>
      <Button variant="ghost" size="icon">
        <IconChevronUp class="size-6" :class="{ 'scale-150 text-red-800': isOpen }" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="overflow-hidden p-2"
      align="center"
      side="top"
      :sideOffset="10"
    >
      <header class="-mx-2 -mt-2 flex items-center justify-between border border-b">
        <RadioGroup
          v-model="symbolPage"
          class="isolate flex divide-x divide-gray-200 shadow-sm focus:outline-hidden"
        >
          <RadioGroupOption
            as="template"
            v-for="{ id, sidc, title } in symbolTabs"
            :key="id"
            v-slot="{ checked, active }"
            :value="id"
          >
            <div
              :class="[
                checked ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                'group relative min-w-0 justify-self-center overflow-hidden bg-white px-4 py-2 hover:bg-gray-50 focus:z-10 focus:outline-hidden',
              ]"
            >
              <MilitarySymbol
                :sidc="sidc"
                :title="title"
                :size="15"
                :options="{
                  monoColor: checked ? 'black' : 'black',
                  strokeWidth: 8,
                }"
              />
              <span
                aria-hidden="true"
                :class="[
                  checked ? 'bg-army' : 'bg-transparent',
                  'absolute inset-x-0 bottom-0 h-0.5',
                ]"
              />
            </div>
          </RadioGroupOption>
        </RadioGroup>
        <DotsMenu :items="panelItems" class="" />
      </header>
      <div class="mt-3 grid h-20 grid-cols-5 place-items-center items-center gap-2">
        <PanelSymbolButton
          class=""
          v-for="{ sidc, text } in iconItems"
          :key="sidc"
          :sidc="sidc"
          :title="text"
          :symbol-options="symbolOptions"
          @click="onAddUnit(sidc)"
        />
        <PanelSymbolButton
          class=""
          :sidc="customSidc"
          :title="customIcon.text"
          :symbol-options="symbolOptions"
          @click="onAddUnit(customSidc)"
        />
        <PanelButton @click="handleChangeSymbol()" title="Add symbol">
          <AddSymbolIcon class="h-5 w-5" />
        </PanelButton>
      </div>
    </PopoverContent>
  </Popover>
</template>
