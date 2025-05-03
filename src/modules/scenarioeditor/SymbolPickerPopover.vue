<script setup lang="ts">
import { IconChevronUp, IconPlus as AddSymbolIcon } from "@iconify-prerendered/vue-mdi";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ref } from "vue";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { sidcModalKey } from "@/components/injects";
import DotsMenu from "@/components/DotsMenu.vue";
import type { MenuItemData } from "@/components/types.ts";
import { Button } from "@/components/ui/button";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";

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
      class="p-2 px-1"
      align="center"
      side="top"
      :sideOffset="10"
      @keydown.esc.stop="isOpen = false"
    >
      <Tabs v-model="symbolPage" class="w-full">
        <TabsList class="border-border flex h-10 w-full">
          <TabsTrigger
            v-for="{ id, title, sidc } in symbolTabs"
            :key="id"
            :value="id"
            :title="title"
          >
            <NewMilitarySymbol
              :sidc="sidc"
              :title="title"
              :size="15"
              class="size-6"
              :options="{
                monoColor: 'currentColor',
                strokeWidth: 8,
              }"
            />
          </TabsTrigger>
          <DotsMenu :items="panelItems" class="" />
        </TabsList>
      </Tabs>

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
        <Button
          variant="ghost"
          size="icon"
          type="button"
          @click="handleChangeSymbol()"
          title="Add symbol"
        >
          <AddSymbolIcon class="size-5" />
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
