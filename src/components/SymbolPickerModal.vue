<template>
  <SimpleModal v-model="open" :dialog-title="dialogTitle" @cancel="emit('cancel')">
    <div class="flex h-full flex-col">
      <header class="mt-4 h-20 w-16">
        <MilSymbol :sidc="csidc" :size="34" />
      </header>

      <TabView class="flex-auto">
        <TabItem label="Select" v-slot="{ isActive }">
          <SearchModalInput
            class="pb-3"
            placeholder="Search for symbol"
            v-model="searchQuery"
            @keydown.tab="onTab"
            @keydown.esc="onEsc"
            @keydown.enter.prevent="!hitsIsOpen && onSubmit()"
            focus
          />

          <div class="relative" v-if="hits?.length && hitsIsOpen" ref="hitsRef">
            <ul
              class="absolute z-10 mt-1 max-h-56 w-full divide-y divide-gray-100 overflow-auto rounded-md border border-gray-400 bg-white py-1 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <li
                v-for="(item, index) in hits"
                class="flex cursor-default items-center p-2 py-3 text-sm hover:bg-gray-200"
                tabindex="-1"
                :class="{ 'bg-gray-200': index === currentIndex }"
                :key="item.sidc"
                :id="item.sidc"
                @click="onSelect(index)"
              >
                <p class="flex h-7 w-9 flex-shrink-0 justify-center">
                  <MilSymbol :size="25" :sidc="item.sidc" />
                </p>
                <span class="ml-3 text-sm" v-html="item.highlight"></span>
              </li>
            </ul>
          </div>
          <form class="space-y-4 px-0.5" @submit.prevent="onSubmit" v-if="isLoaded">
            <!--      <input type="text" :value="sidc" />-->
            <SymbolCodeSelect
              v-model="symbolSetValue"
              label="Symbol set"
              :items="symbolSets"
            />
            <SymbolCodeSelect v-model="statusValue" label="Status" :items="statusItems" />
            <SymbolCodeSelect
              v-model="hqtfdValue"
              label="Headquaters / Task force / Dummy"
              :items="hqtfdItems"
            />
            <SymbolCodeSelect
              v-model="emtValue"
              label="Echelon / Mobility / Towed array"
              :items="emtItems"
            />
            <SymbolCodeMultilineSelect
              v-model="iconValue"
              label="Main icon"
              :items="icons"
            />
            <SymbolCodeSelect v-model="mod1Value" label="Modifier 1" :items="mod1Items" />
            <SymbolCodeSelect v-model="mod2Value" label="Modifier 2" :items="mod2Items" />

            <div style="min-height: 14rem" class="flex justify-end py-4">
              <div class=""></div>
            </div>
          </form>
          <GlobalEvents
            v-if="isActive && hits?.length && hitsIsOpen"
            @keydown.arrow-down="doKbd('down')"
            @keydown.page-down="doKbd('pagedown')"
            @keydown.arrow-up="doKbd('up')"
            @keydown.page-up="doKbd('pageup')"
            @keydown.enter.prevent="onSelect()"
          >
          </GlobalEvents>
        </TabItem>
        <TabItem label="Browse" v-slot="{ isActive }">
          <keep-alive>
            <SymbolBrowseTab
              v-if="isActive"
              :initial-sidc="csidc"
              @update-sidc="updateFromBrowseTab"
            />
          </keep-alive>
        </TabItem>
        <TabItem label="Legacy" v-slot="{ isActive }">
          <keep-alive>
            <LegacyConverter v-if="isActive" />
          </keep-alive>
        </TabItem>
      </TabView>
      <div class="flex flex-shrink-0 justify-end space-x-2 pt-4">
        <SecondaryButton type="button" @click="clearModifiers()" class=""
          >Clear modifiers
        </SecondaryButton>
        <PrimaryButton type="button" @click="onSubmit()" class=""
          >Select symbol
        </PrimaryButton>
      </div>
    </div>
  </SimpleModal>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch, watchEffect } from "vue";
import MilSymbol from "./MilSymbol.vue";
import PrimaryButton from "./PrimaryButton.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { onClickOutside, useDebounce, useVModel, whenever } from "@vueuse/core";
import SimpleModal from "./SimpleModal.vue";
import SymbolCodeMultilineSelect from "./SymbolCodeMultilineSelect.vue";
import { useSymbolItems } from "@/composables/symbolData";
import NProgress from "nprogress";
import SearchModalInput from "./SearchModalInput.vue";
import { GlobalEvents } from "vue-global-events";
import TabView from "./TabView.vue";
import TabItem from "./TabItem.vue";
import SymbolBrowseTab from "./SymbolBrowseTab.vue";
import SecondaryButton from "./SecondaryButton.vue";
import * as fuzzysort from "fuzzysort";
import { htmlTagEscape } from "@/utils";

const LegacyConverter = defineAsyncComponent(
  () => import("@/components/LegacyConverter.vue")
);

interface Props {
  isVisible?: boolean;
  sidc?: string;
  dialogTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
  dialogTitle: "Symbol picker",
});
const emit = defineEmits(["update:isVisible", "update:sidc", "cancel"]);

const open = useVModel(props, "isVisible");
const searchQuery = ref("");
const debouncedQuery = useDebounce(searchQuery, 100);
const currentIndex = ref(-1);
const hitsIsOpen = ref(false);
const hitsRef = ref(null);

onClickOutside(hitsRef, (event) => (hitsIsOpen.value = false));

const {
  csidc,
  loadData,
  isLoaded,
  searchSymbolRef,

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
} = useSymbolItems(computed(() => props.sidc || ""));
loadData();

whenever(isLoaded, () => NProgress.done(), { immediate: true });

const hits = computed(() => {
  const h = fuzzysort.go(debouncedQuery.value, searchSymbolRef.value || [], {
    key: "text",
    limit: 20,
  });
  return h.map((e) => {
    const { obj, ...rest } = e;
    return {
      ...obj,
      highlight: fuzzysort.highlight({ ...rest, target: htmlTagEscape(rest.target) }),
      sidc: "100" + sidValue.value + e.obj.symbolSet + "0000" + e.obj.code + "0000",
    };
  });
});

watch(hits, (v) => {
  if (!v?.length) return;
  hitsIsOpen.value = true;
  currentIndex.value = 0;
});

const onTab = (event: KeyboardEvent) => {
  if (hitsIsOpen.value) {
    event.stopPropagation();
    event.preventDefault();
  }
};

const onSubmit = () => {
  emit("update:sidc", csidc.value);
  open.value = false;
};

function onEsc(e: KeyboardEvent) {
  if (hitsIsOpen.value) {
    hitsIsOpen.value = false;
    e.stopPropagation();
  }
}

function doKbd(direction: "up" | "down" | "pagedown" | "pageup") {
  const nHits = hits?.value?.length || 0;
  if (direction === "up") {
    if (currentIndex.value === 0) {
      currentIndex.value = nHits - 1;
    } else currentIndex.value = currentIndex.value - 1;
  } else if (direction === "down") {
    currentIndex.value++;
    if (currentIndex.value >= nHits) {
      currentIndex.value = 0;
    }
  } else if (direction === "pagedown") {
    currentIndex.value += 3;
    if (currentIndex.value >= nHits) {
      currentIndex.value = nHits - 1;
    }
  } else if (direction === "pageup") {
    currentIndex.value -= 3;
    if (currentIndex.value < 0) currentIndex.value = 0;
  }
}

function onSelect(index?: number) {
  const i = index === undefined ? currentIndex.value : index;
  if (!hits?.value?.length) return;
  const symbol = hits.value[i];
  symbolSetValue.value = symbol.symbolSet;
  iconValue.value = symbol.code;
  hitsIsOpen.value = false;
}

watchEffect(() => {
  if (!hits?.value?.length || currentIndex.value < 0) return;
  nextTick(() =>
    document
      .getElementById(hits.value![currentIndex.value].sidc)
      ?.scrollIntoView?.({ block: "nearest" })
  );
});

function clearModifiers() {
  mod1Value.value = "00";
  mod2Value.value = "00";
  emtValue.value = "00";
  hqtfdValue.value = "0";
}

function updateFromBrowseTab(sidc: string) {
  csidc.value = sidc;
}
</script>
