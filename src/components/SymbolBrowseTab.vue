<template>
  <div class="min-h-[30rem] px-0.5">
    <SymbolCodeSelect
      v-model="symbolSetValue"
      :items="symbolSets"
      :symbol-options="symbolOptions"
    />
    <div class="mt-4 max-h-[40rem] overflow-auto">
      <div v-for="[entity, entityIcons] in iconsByEntity" class="relative">
        <h3
          class="sticky top-0 border-t border-b border-gray-200 bg-gray-50 p-2 px-4 text-sm font-medium text-gray-600"
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
            class="flex w-full flex-col items-center justify-start rounded border border-transparent p-3 hover:border-gray-500"
          >
            <MilSymbol :size="symbolSize" :sidc="sidc" :modifiers="symbolOptions" />
            <p
              v-if="entitySubtype && entityType"
              class="mt-1 max-w-full overflow-hidden truncate text-center text-sm text-gray-500"
            >
              {{ entityType }}
            </p>
            <p
              class="mt-1 max-w-full overflow-hidden break-words text-center text-sm font-medium"
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
      <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
        <button
          type="button"
          v-for="{ sidc, text, code } in mod1Items"
          :key="sidc"
          @click="mod1Value = code"
          class="flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500"
        >
          <MilSymbol :size="symbolSize" :sidc="sidc" :modifiers="symbolOptions" />
          <p
            class="mt-1 max-w-full overflow-hidden break-words text-center text-sm text-gray-900"
          >
            {{ text }}
          </p>
        </button>
      </div>
      <p
        class="sticky top-0 border-t border-b border-gray-200 bg-gray-50 p-2 px-4 text-sm font-medium text-gray-600"
      >
        Modifier 2
      </p>
      <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
        <button
          type="button"
          v-for="{ sidc, text, code } in mod2Items"
          :key="sidc"
          @click="mod2Value = code"
          class="flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500"
        >
          <MilSymbol :size="symbolSize" :sidc="sidc" :modifiers="symbolOptions" />
          <p
            class="mt-1 max-w-full overflow-hidden break-words text-center text-sm text-gray-900"
          >
            {{ text }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MilSymbol from "./MilSymbol.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { computed, nextTick, onActivated, watch } from "vue";
import { groupBy } from "../utils";
import { useSymbolItems } from "../composables/symbolData";
import { UnitSymbolOptions } from "@/types/scenarioModels";

interface Props {
  initialSidc: string;
  symbolSize?: number;
  symbolOptions?: UnitSymbolOptions;
}

const props = withDefaults(defineProps<Props>(), { symbolSize: 32 });

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

const iconsByEntity = computed(() => groupBy(icons.value, "entity"));

watch([mod1Value, mod2Value, iconValue], (value, oldValue) => {
  emit("update-sidc", csidc.value);
});

onActivated(() => {
  nextTick(() => {
    const el = document.getElementById(`scode-${iconValue.value}`);
    if (el) {
      el.scrollIntoView({ block: "center" });
    }
  });
});
</script>
