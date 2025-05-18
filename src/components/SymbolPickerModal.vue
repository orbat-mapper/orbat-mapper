<template>
  <NewSimpleModal
    v-model="open"
    :dialog-title="dialogTitle"
    @cancel="emit('cancel')"
    class="md:max-w-(--breakpoint-md) lg:max-w-(--breakpoint-lg)"
  >
    <div class="flex h-full flex-col" @keyup.ctrl.enter="onSubmit">
      <header class="mt-4 flex h-20 w-full items-center justify-between">
        <MilitarySymbol :sidc="csidc" :size="34" :options="finalSymbolOptions" />
        <SymbolCodeViewer :sidc="csidc" @update="updateFromSidcInput" />
      </header>

      <TabView class="flex-auto" v-model:current-tab="currentTab">
        <TabItem
          label="Select"
          v-slot="{ isActive }"
          class="max-h-[50vh] overflow-auto sm:max-h-[60vh]"
        >
          <Combobox @update:modelValue="onSelect">
            <div class="relative">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  class="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  @change="searchQuery = $event.target.value"
                  ref="searchInputRef"
                  @vue:mounted="doFocus"
                />
              </div>
              <ComboboxOptions
                v-if="groupedHits && hitCount > 0"
                class="absolute z-50 max-h-80 w-full scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto rounded border border-gray-400 bg-white p-4 pb-2 shadow-lg"
              >
                <li v-for="[source, hits] in groupedHits">
                  <h2 class="text-xs font-semibold text-gray-900">{{ source }}</h2>
                  <ul class="-mx-4 mt-2 text-sm font-medium text-gray-700">
                    <ComboboxOption
                      v-for="item in hits"
                      :key="item.sidc"
                      :value="item"
                      as="template"
                      v-slot="{ active }"
                    >
                      <li
                        :class="[
                          'flex cursor-default items-center px-4 py-2 select-none',
                          active ? 'bg-army text-white' : 'even:bg-gray-100',
                        ]"
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
                      </li>
                    </ComboboxOption>
                  </ul>
                </li>
              </ComboboxOptions></div
          ></Combobox>

          <form
            class="space-y-4 p-0.5"
            @submit.prevent="onSubmit"
            v-if="isLoaded"
            @keydown.ctrl.enter.exact="onSubmit"
            @keydown.meta.enter.exact="onSubmit"
          >
            <div class="flex w-full items-end gap-1">
              <SymbolCodeSelect
                class="flex-auto"
                v-model="symbolSetValue"
                label="Symbol set"
                :items="symbolSets"
                :symbol-options="combinedSymbolOptions"
              />
              <div class="mr-1 hidden flex-none sm:block">
                <BaseButton class="py-4" @click="currentTab = 1">Browse</BaseButton>
              </div>
            </div>

            <template v-if="!hideModifiers">
              <div class="grid gap-4 sm:grid-cols-2" v-if="showReinforcedStatus">
                <SymbolCodeSelect
                  v-model="statusValue"
                  label="Status"
                  :items="statusItems"
                  :symbol-options="combinedSymbolOptions"
                />
                <SymbolCodeSelect
                  v-model="reinforcedReducedValue"
                  label="Reinforced / Reduced"
                  :items="reinforcedReducedItems"
                  :symbol-options="combinedSymbolOptions"
                />
              </div>
              <SymbolCodeSelect
                v-else
                v-model="statusValue"
                label="Status"
                :items="statusItems"
                :symbol-options="combinedSymbolOptions"
              />

              <SymbolCodeSelect
                v-model="hqtfdValue"
                label="Headquaters / Task force / Dummy"
                :items="hqtfdItems"
                :symbol-options="combinedSymbolOptions"
              />
              <SymbolCodeSelect
                v-model="emtValue"
                label="Echelon / Mobility / Towed array"
                :items="emtItems"
                :symbol-options="combinedSymbolOptions"
              />
            </template>

            <SymbolCodeMultilineSelect
              v-model="iconValue"
              label="Main icon"
              :items="icons"
              :symbol-options="combinedSymbolOptions"
            />
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
            <SymbolFillColorSelect
              v-if="!hideSymbolColor"
              v-model="internalSymbolOptions.fillColor"
              :default-fill-color="inheritedSymbolOptions?.fillColor"
            />
          </form>
        </TabItem>
        <TabItem label="Browse" v-slot="{ isActive }">
          <keep-alive>
            <SymbolBrowseTab
              v-if="isActive"
              :initial-sidc="csidc"
              @update-sidc="updateFromBrowseTab"
              :symbol-options="combinedSymbolOptions"
            />
          </keep-alive>
        </TabItem>
        <TabItem label="Legacy" v-slot="{ isActive }">
          <keep-alive>
            <LegacyConverter v-if="isActive" />
          </keep-alive>
        </TabItem>
      </TabView>
      <div class="flex shrink-0 justify-end space-x-2 pt-4">
        <SecondaryButton type="button" @click="clearModifiers()" class=""
          >Clear modifiers
        </SecondaryButton>
        <PrimaryButton @click="onSubmit()" class="">Select symbol </PrimaryButton>
      </div>
    </div>
  </NewSimpleModal>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch, watchEffect } from "vue";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";

import PrimaryButton from "./PrimaryButton.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import {
  breakpointsTailwind,
  useBreakpoints,
  useDebounce,
  useVModel,
  whenever,
} from "@vueuse/core";
import SymbolCodeMultilineSelect from "./SymbolCodeMultilineSelect.vue";
import { useSymbolItems } from "@/composables/symbolData";
import NProgress from "nprogress";
import TabView from "./TabView.vue";
import TabItem from "./TabItem.vue";
import SymbolBrowseTab from "./SymbolBrowseTab.vue";
import SecondaryButton from "./SecondaryButton.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import {
  mapReinforcedStatus2Field,
  type ReinforcedStatus,
  type UnitSymbolOptions,
} from "@/types/scenarioModels";
import SymbolFillColorSelect from "@/components/SymbolFillColorSelect.vue";
import SymbolCodeViewer from "@/components/SymbolCodeViewer.vue";
import { Sidc } from "@/symbology/sidc";
import {
  type MainIconSearchResult,
  type ModifierOneSearchResult,
  type ModifierTwoSearchResult,
  useSymbologySearch,
} from "@/composables/symbolSearching";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { doFocus } from "@/composables/utils";
import BaseButton from "@/components/BaseButton.vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";

const LegacyConverter = defineAsyncComponent(
  () => import("@/components/LegacyConverter.vue"),
);

interface Props {
  isVisible?: boolean;
  sidc?: string;
  dialogTitle?: string;
  hideModifiers?: boolean;
  hideSymbolColor?: boolean;
  inheritedSymbolOptions?: UnitSymbolOptions;
  symbolOptions?: UnitSymbolOptions;
  initialTab?: number;
  reinforcedStatus?: ReinforcedStatus;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
  dialogTitle: "Symbol picker",
  hideModifiers: false,
  hideSymbolColor: false,
});
const emit = defineEmits(["update:isVisible", "update:sidc", "cancel"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const searchInputRef = ref();
const open = useVModel(props, "isVisible");
const searchQuery = ref("");
const debouncedQuery = useDebounce(searchQuery, 100);
const currentTab = ref(props.initialTab ?? 0);

const groupedHits = ref<ReturnType<typeof search>["groups"]>();

const hitCount = ref(0);

const internalSymbolOptions = ref<UnitSymbolOptions>({
  ...(props.symbolOptions || {}),
});

const combinedSymbolOptions = computed(() => ({
  ...(props.inheritedSymbolOptions || {}),
  ...cleanObject(internalSymbolOptions.value || {}),
}));

const finalSymbolOptions = computed(() => ({
  ...combinedSymbolOptions.value,
  ...cleanObject({
    reinforcedReduced: mapReinforcedStatus2Field(reinforcedReducedValue.value),
  }),
}));

// remove empty values in object
const cleanObject = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") cleanObject(obj[key]);
    else if (obj[key] === "" || obj[key] === null || obj[key] === undefined)
      delete obj[key];
  });
  return obj;
};

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
  reinforcedReducedItems,
  reinforcedReducedValue,
} = useSymbolItems(
  computed(() => props.sidc || ""),
  props.reinforcedStatus,
);
loadData();

whenever(isLoaded, () => NProgress.done(), { immediate: true });

const { search } = useSymbologySearch(sidValue);

const showReinforcedStatus = computed(() => {
  return symbolSetValue.value === "10" || symbolSetValue.value === "11";
});

watchEffect(() => {
  const { numberOfHits, groups } = search(debouncedQuery.value);
  hitCount.value = numberOfHits;
  groupedHits.value = groups;
});

const onSubmit = () => {
  emit("update:sidc", {
    sidc: csidc.value,
    reinforcedStatus: reinforcedReducedValue.value,
    symbolOptions: internalSymbolOptions.value.fillColor
      ? { fillColor: internalSymbolOptions.value.fillColor }
      : {},
  });
  open.value = false;
};

function onSelect(
  hit: MainIconSearchResult | ModifierOneSearchResult | ModifierTwoSearchResult,
) {
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
  if (!/^\d+$/.test(sidc)) {
    return;
  }
  const oldSidc = new Sidc(csidc.value);
  const ns = new Sidc(sidc);
  ns.standardIdentity = oldSidc.standardIdentity;

  csidc.value = ns.toString();
}

watch(currentTab, async (v) => {
  if (v === 0 && !isMobile.value) {
    await nextTick();
    searchInputRef.value?.el.focus();
  }
});
</script>
