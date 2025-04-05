<template>
  <div class="flex px-0.5">
    <aside class="hidden w-60 flex-none pr-2 md:block">
      <p class="text-sm leading-7 font-bold text-gray-900">Entity type</p>
      <ul class="space-y-1.5 text-sm font-medium text-gray-600">
        <li
          v-for="[entity, entityIcons] in filteredIconsByEntity"
          class="hover:text-gray-800"
        >
          <a href="#" type="button" @click="goTo(entityIcons[0].code)">{{ entity }}</a>
        </li>
      </ul>
      <p class="mt-4 text-sm leading-7 font-bold text-gray-900">Modifiers</p>
      <ul class="space-y-1.5 text-sm font-medium text-gray-600">
        <li v-if="filteredMod1Items.length" class="hover:text-gray-800">
          <a href="#" type="button" @click="goTo('mod1')">Modifier 1</a>
        </li>
        <li v-if="filteredMod2Items.length" class="hover:text-gray-800">
          <a href="#" type="button" @click="goTo('mod2')">Modifier 2</a>
        </li>
      </ul>
    </aside>
    <div class="flex-auto">
      <div class="relative">
        <MagnifyingGlassIcon
          class="pointer-events-none absolute top-3.5 left-0 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="text"
          class="h-12 w-full border-0 bg-transparent pr-4 pl-7 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
          placeholder="Search symbol set..."
          @keydown.esc="onEsc"
          v-model="searchQuery"
          ref="inputRef"
        />
      </div>
      <SymbolCodeSelect
        v-model="symbolSetValue"
        :items="symbolSets"
        :symbol-options="symbolOptions"
        label="Symbol set"
      />

      <div class="mt-4 max-h-[40vh] overflow-auto sm:max-h-[50vh]">
        <div v-for="[entity, entityIcons] in filteredIconsByEntity" class="relative">
          <h3
            class="sticky top-0 border-t border-b border-gray-200 bg-gray-50 p-2 px-4 text-sm font-medium text-gray-600"
            :id="entity"
          >
            {{ entity }}
          </h3>
          <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
            <button
              type="button"
              v-for="{ sidc, entity, entityType, entitySubtype, code } in entityIcons"
              :key="sidc"
              :id="`scode-${code}`"
              @click="iconValue = code"
              class="flex w-full scroll-m-12 flex-col items-center justify-start rounded border border-transparent p-3 hover:border-gray-500"
            >
              <MilSymbol :size="symbolSize" :sidc="sidc" :modifiers="symbolOptions" />
              <p
                v-if="entitySubtype && entityType"
                class="mt-1 max-w-full truncate overflow-hidden text-center text-sm text-gray-500"
              >
                {{ entityType }}
              </p>
              <p
                class="mt-1 max-w-full overflow-hidden text-center text-sm font-medium break-words"
                :class="code === iconValue ? 'text-red-900' : 'text-gray-900'"
              >
                {{ entitySubtype || entityType || entity }}
              </p>
            </button>
          </div>
        </div>
        <h3
          class="sticky top-0 border-t border-b border-gray-200 bg-gray-50 p-2 px-4 text-sm font-medium text-gray-600"
        >
          Modifier 1
        </h3>
        <div
          id="scode-mod1"
          class="mt-4 grid scroll-m-12 grid-cols-3 gap-x-2 gap-y-4 p-1"
        >
          <button
            type="button"
            v-for="{ sidc, text, code } in filteredMod1Items"
            :key="sidc"
            @click="mod1Value = code"
            class="flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500"
          >
            <MilSymbol :size="symbolSize" :sidc="sidc" :modifiers="symbolOptions" />
            <p
              class="mt-1 max-w-full overflow-hidden text-center text-sm break-words text-gray-900"
            >
              {{ text }}
            </p>
          </button>
        </div>
        <h3
          class="sticky top-0 border-t border-b border-gray-200 bg-gray-50 p-2 px-4 text-sm font-medium text-gray-600"
        >
          Modifier 2
        </h3>
        <div
          id="scode-mod2"
          class="mt-4 grid scroll-m-12 grid-cols-3 gap-x-2 gap-y-4 p-1"
        >
          <button
            type="button"
            v-for="{ sidc, text, code } in filteredMod2Items"
            :key="sidc"
            @click="mod2Value = code"
            class="flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500"
          >
            <MilSymbol :size="symbolSize" :sidc="sidc" :modifiers="symbolOptions" />
            <p
              class="mt-1 max-w-full overflow-hidden text-center text-sm break-words text-gray-900"
            >
              {{ text }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MilSymbol from "./MilSymbol.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { computed, nextTick, onActivated, ref, watch } from "vue";
import { groupBy } from "@/utils";
import { useSymbolItems } from "@/composables/symbolData";
import { UnitSymbolOptions } from "@/types/scenarioModels";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { breakpointsTailwind, useBreakpoints, useDebounce } from "@vueuse/core";

interface Props {
  initialSidc: string;
  symbolSize?: number;
  symbolOptions?: UnitSymbolOptions;
}

const props = withDefaults(defineProps<Props>(), { symbolSize: 32 });
const searchQuery = ref("");
const debouncedQuery = useDebounce(searchQuery, 100);
const inputRef = ref();

const {
  mod1Items,
  mod2Items,
  mod1Value,
  mod2Value,
  symbolSets,
  symbolSetValue,
  icons,
  iconValue,
  csidc,
  isLoaded,
  loadData,
} = useSymbolItems(computed(() => props.initialSidc));

if (!isLoaded.value) loadData();

const emit = defineEmits(["update-sidc"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const filteredIconsByEntity = computed(() => {
  if (!debouncedQuery.value.trim()) return groupBy(icons.value, "entity");
  const query = debouncedQuery.value.toLowerCase();
  const filtered = icons.value.filter((icon) => {
    return (
      icon.entityType?.toLowerCase().includes(query) ||
      icon.entitySubtype?.toLowerCase().includes(query)
    );
  });
  return groupBy(filtered, "entity");
});

const filteredMod1Items = computed(() => {
  if (!debouncedQuery.value.trim()) return mod1Items.value;
  const query = debouncedQuery.value.toLowerCase();
  return mod1Items.value.filter((item) => item.text.toLowerCase().includes(query));
});

const filteredMod2Items = computed(() => {
  if (!debouncedQuery.value.trim()) return mod2Items.value;
  const query = debouncedQuery.value.toLowerCase();
  return mod2Items.value.filter((item) => item.text.toLowerCase().includes(query));
});

watch([mod1Value, mod2Value, iconValue], (value, oldValue) => {
  emit("update-sidc", csidc.value);
});

function goTo(sidc: string) {
  const el = document.getElementById(`scode-${sidc}`);
  if (el) {
    el.scrollIntoView(true);
  }
}

onActivated(() => {
  searchQuery.value = "";
  nextTick(() => {
    if (!isMobile.value) {
      inputRef.value.focus();
    }
    const el = document.getElementById(`scode-${iconValue.value}`);
    if (el) {
      el.scrollIntoView({ block: "center" });
    }
  });
});

function onEsc(e: KeyboardEvent) {
  if (searchQuery.value.length) {
    e.stopPropagation();
    searchQuery.value = "";
  }
}
</script>
