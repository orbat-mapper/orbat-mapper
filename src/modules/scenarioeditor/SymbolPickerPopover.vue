<script setup lang="ts">
import { IconChevronUp, IconPlus as AddSymbolIcon } from "@iconify-prerendered/vue-mdi";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Float } from "@headlessui-float/vue";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  RadioGroup,
  RadioGroupOption,
} from "@headlessui/vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { Ref, ref } from "vue";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { UnitSymbolOptions } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { sidcModalKey } from "@/components/injects";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import PanelButton from "@/components/PanelButton.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { MenuItemData } from "@/components/types";

interface Props {
  symbolOptions: UnitSymbolOptions;
  addUnit: (sidc: string, closePopover?: (ref?: Ref | HTMLElement) => void) => void;
}

const props = defineProps<Props>();

const { getModalSidc } = injectStrict(sidcModalKey);

const { iconItems, customIcon, customSidc, symbolPage } = useToolbarUnitSymbolData();
const store = useMainToolbarStore();

const symbolTabs = ref([
  { title: "Land", sidc: "30031000001211000000", id: "land" },
  { title: "Sea", sidc: "10033000001201000000", id: "sea" },
  { title: "Air", sidc: "30030100001101000000", id: "air" },
]);

const panelItems: MenuItemData[] = [
  { label: "Add symbol to panel", action: () => handleChangeSymbol() },
];

async function handleChangeSymbol(close?: (ref?: Ref | HTMLElement) => void) {
  const newSidcValue = await getModalSidc(customSidc.value, {
    title: "Select symbol",
    hideModifiers: true,
    hideSymbolColor: true,
    symbolOptions: props.symbolOptions,
  });
  if (newSidcValue !== undefined) {
    customIcon.value.code = newSidcValue.sidc;
    props.addUnit(customSidc.value, close);
  }
}
</script>

<template>
  <Popover as="template" v-slot="{ open, close }">
    <Float placement="top" :offset="12" flip shift strategy="fixed">
      <PopoverButton
        title="Select icons"
        class="ml-1 rounded p-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        @click="store.clearToolbar()"
      >
        <IconChevronUp class="h-6 w-6" :class="{ ' scale-150 text-red-800 ': open }" />
      </PopoverButton>
      <PopoverPanel focus v-slot="{ close }">
        <FloatingPanel class="overflow-hidden p-2">
          <header class="-mx-2 -mt-2 flex items-center justify-between border border-b">
            <RadioGroup
              v-model="symbolPage"
              class="isolate flex divide-x divide-gray-200 shadow focus:outline-none"
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
                    'group relative min-w-0  justify-self-center  overflow-hidden bg-white px-4 py-2 hover:bg-gray-50  focus:z-10 focus:outline-none',
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
              @click="addUnit(sidc, close)"
            />
            <PanelSymbolButton
              class=""
              :sidc="customSidc"
              :title="customIcon.text"
              :symbol-options="symbolOptions"
              @click="addUnit(customSidc, close)"
            />
            <PanelButton @click="handleChangeSymbol(close)" title="Add symbol">
              <AddSymbolIcon class="h-5 w-5" />
            </PanelButton>
          </div>
        </FloatingPanel>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
