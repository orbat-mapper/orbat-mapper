<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import {
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxRoot,
} from "reka-ui";
import { ArrowLeftIcon, ChevronRightIcon, MoonStarIcon, SunIcon } from "lucide-vue-next";
import { UseDark } from "@vueuse/components";
import {
  breakpointsTailwind,
  useBreakpoints,
  useDebounce,
  useTitle,
  whenever,
} from "@vueuse/core";
import NProgress from "nprogress";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import SymbolCodeMultilineSelect from "@/components/SymbolCodeMultilineSelect.vue";
import SymbolBrowseTab from "@/components/SymbolBrowseTab.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import SymbolCodeViewer from "@/components/SymbolCodeViewer.vue";
import SymbolFillColorSelect from "@/components/SymbolFillColorSelect.vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";
import BaseButton from "@/components/BaseButton.vue";
import SymbolExportMenu from "@/components/SymbolExportMenu.vue";
import { useSymbolItems } from "@/composables/symbolData";
import {
  type MainIconSearchResult,
  type ModifierOneSearchResult,
  type ModifierTwoSearchResult,
  useSymbologySearch,
} from "@/composables/symbolSearching";
import { defineAsyncComponent } from "vue";
import { Sidc } from "@/symbology/sidc";
import type { UnitSymbolOptions } from "@/types/scenarioModels";

const LegacyConverter = defineAsyncComponent(
  () => import("@/components/LegacyConverter.vue"),
);

const originalTitle = useTitle().value;
useTitle("Symbol Browser");

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const searchQuery = ref("");
const debouncedQuery = useDebounce(searchQuery, 100);
const searchInputRef = ref();

const internalSymbolOptions = ref<UnitSymbolOptions>({});

const combinedSymbolOptions = computed(() => ({
  outlineWidth: 8,
  outlineColor: "rgba(255,255,255,0.80)",
  ...cleanObject(internalSymbolOptions.value || {}),
}));

function cleanObject(obj: any) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") cleanObject(obj[key]);
    else if (obj[key] === "" || obj[key] === null || obj[key] === undefined)
      delete obj[key];
  });
  return obj;
}

const {
  csidc,
  loadData,
  isLoaded,
  sidValue,
  symbolSetValue,
  iconValue,
  statusValue,
  statusItems,
  hqtfdItems,
  hqtfdValue,
  emtValue,
  emtItems,
  mod1Value,
  mod2Value,
  mod1Items,
  mod2Items,
  icons,
  symbolSets,
} = useSymbolItems(ref("10031000001211000000"));
loadData();

whenever(isLoaded, () => NProgress.done(), { immediate: true });

const { search } = useSymbologySearch(sidValue);

const showModifiers = computed(() => {
  return symbolSetValue.value === "10" || symbolSetValue.value === "11";
});

const groupedHits = ref<ReturnType<typeof search>["groups"]>();
const hitCount = ref(0);

watchEffect(() => {
  const { numberOfHits, groups } = search(debouncedQuery.value);
  hitCount.value = numberOfHits;
  groupedHits.value = groups;
});

function onSelect(value: unknown) {
  if (!value || typeof value !== "object" || !("sidc" in value)) return;
  const hit = value as
    | MainIconSearchResult
    | ModifierOneSearchResult
    | ModifierTwoSearchResult;
  const newSidc = new Sidc(hit.sidc);
  symbolSetValue.value = newSidc.symbolSet;
  if (hit.category === "Main icon") {
    iconValue.value = newSidc.mainIcon;
  } else if (hit.category === "Modifier 1") {
    mod1Value.value = newSidc.modifierOne;
  } else if (hit.category === "Modifier 2") {
    mod2Value.value = newSidc.modifierTwo;
  }
}

function clearModifiers() {
  mod1Value.value = "00";
  mod2Value.value = "00";
  emtValue.value = "00";
  hqtfdValue.value = "0";
}

function updateFromBrowseTab(sidc: string) {
  csidc.value = sidc;
}

function updateFromSidcInput(sidc: string) {
  if (!/^\d+$/.test(sidc)) return;
  const oldSidc = new Sidc(csidc.value);
  const ns = new Sidc(sidc);
  ns.standardIdentity = oldSidc.standardIdentity;
  csidc.value = ns.toString();
}
</script>

<template>
  <div class="bg-background flex h-screen flex-col">
    <header class="bg-muted flex items-center justify-between border-b px-4 py-2">
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon class="size-5" />
        </router-link>
        <h1 class="text-lg font-semibold">Symbol Browser</h1>
        <span
          class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
          >Experimental</span
        >
      </div>
      <UseDark v-slot="{ isDark, toggleDark }">
        <Button
          variant="ghost"
          size="icon"
          @click="toggleDark()"
          title="Toggle dark mode"
        >
          <SunIcon v-if="isDark" /><MoonStarIcon v-else />
        </Button>
      </UseDark>
    </header>

    <ResizablePanelGroup :direction="isMobile ? 'vertical' : 'horizontal'" class="flex-1">
      <!-- Left panel: Selection controls -->
      <ResizablePanel :default-size="40" :min-size="25">
        <div class="flex h-full flex-col overflow-y-auto p-4">
          <header
            class="@container flex h-20 w-full shrink-0 items-center justify-between"
          >
            <div class="flex items-center gap-1">
              <MilitarySymbol :sidc="csidc" :size="34" :options="combinedSymbolOptions" />
              <SymbolExportMenu :sidc="csidc" :symbol-options="combinedSymbolOptions" />
            </div>
            <SymbolCodeViewer :sidc="csidc" @update="updateFromSidcInput" />
          </header>

          <ComboboxRoot
            :ignore-filter="true"
            :open="hitCount > 0"
            @update:modelValue="onSelect"
          >
            <div class="relative">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="text-muted-foreground absolute top-3.5 left-4 h-5 w-5"
                  aria-hidden="true"
                />
                <ComboboxInput
                  v-model="searchQuery"
                  class="placeholder:text-muted-foreground h-12 w-full border-0 bg-transparent pr-4 pl-11 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  ref="searchInputRef"
                />
              </div>
              <ComboboxContent
                v-if="groupedHits && hitCount > 0"
                class="border-border bg-popover absolute z-50 max-h-80 w-full scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto rounded border p-4 pb-2 shadow-lg"
                :disable-outside-pointer-events="false"
              >
                <ComboboxGroup v-for="[source, hits] in groupedHits" :key="source">
                  <ComboboxLabel class="text-xs font-semibold">{{
                    source
                  }}</ComboboxLabel>
                  <div class="-mx-4 mt-2 text-sm font-medium">
                    <ComboboxItem
                      v-for="item in hits"
                      :key="item.sidc"
                      :value="item"
                      class="even:bg-muted/40 data-[highlighted]:bg-army flex cursor-default items-center px-4 py-2 select-none data-[highlighted]:text-white"
                    >
                      <div class="relative flex w-12 justify-center">
                        <MilitarySymbol
                          :sidc="item.sidc"
                          :size="30"
                          aria-hidden="true"
                          :options="{
                            ...combinedSymbolOptions,
                            outlineColor: 'white',
                            outlineWidth: 4,
                          }"
                        />
                      </div>
                      <p
                        class="ml-3 flex-auto truncate"
                        v-html="item.highlight ? item.highlight : item.text"
                      />
                    </ComboboxItem>
                  </div>
                </ComboboxGroup>
              </ComboboxContent>
            </div>
          </ComboboxRoot>

          <form class="mt-4 space-y-4 p-0.5" v-if="isLoaded" @submit.prevent>
            <SymbolCodeSelect
              v-model="symbolSetValue"
              label="Symbol set"
              :items="symbolSets"
              :symbol-options="combinedSymbolOptions"
            />

            <div class="grid gap-4 sm:grid-cols-2">
              <SymbolCodeSelect
                v-model="statusValue"
                label="Status"
                :items="statusItems"
                :symbol-options="combinedSymbolOptions"
              />
              <SymbolCodeSelect
                v-model="hqtfdValue"
                label="HQ / TF / Dummy"
                :items="hqtfdItems"
                :symbol-options="combinedSymbolOptions"
              />
            </div>
            <SymbolCodeSelect
              v-model="emtValue"
              label="Echelon / Mobility / Towed array"
              :items="emtItems"
              :symbol-options="combinedSymbolOptions"
            />

            <SymbolCodeMultilineSelect
              v-model="iconValue"
              label="Main icon"
              :items="icons"
              :symbol-options="combinedSymbolOptions"
            />
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SymbolCodeSelect
                v-model="mod1Value"
                label="Modifier 1"
                :items="mod1Items"
                :symbol-options="combinedSymbolOptions"
              />
              <SymbolCodeSelect
                v-model="mod2Value"
                label="Modifier 2"
                :items="mod2Items"
                :symbol-options="combinedSymbolOptions"
              />
            </div>
            <div class="flex w-full items-end gap-2">
              <SymbolFillColorSelect
                v-model="internalSymbolOptions.fillColor"
                class="flex-auto"
              />
              <PopoverColorPicker v-model="internalSymbolOptions.fillColor">
                <template #trigger>
                  <Button type="button" variant="outline" size="lg">Custom color</Button>
                </template>
              </PopoverColorPicker>
            </div>
            <div>
              <BaseButton type="button" @click="clearModifiers()"
                >Clear modifiers</BaseButton
              >
            </div>
          </form>

          <Collapsible class="mt-6 border-t pt-4">
            <CollapsibleTrigger
              class="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-sm"
            >
              <ChevronRightIcon
                class="size-4 transition-transform [[data-state=open]>&]:rotate-90"
              />
              Legacy SIDC Converter
            </CollapsibleTrigger>
            <CollapsibleContent>
              <LegacyConverter />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ResizablePanel>

      <ResizableHandle with-handle />

      <!-- Right panel: Browse grid -->
      <ResizablePanel :default-size="60" :min-size="25">
        <div class="h-full p-4">
          <SymbolBrowseTab
            :initial-sidc="csidc"
            :full-height="true"
            @update-sidc="updateFromBrowseTab"
            :symbol-options="combinedSymbolOptions"
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
