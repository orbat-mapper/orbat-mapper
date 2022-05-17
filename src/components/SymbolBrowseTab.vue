<template>
  <div class="min-h-[30rem] px-0.5">
    <SymbolCodeSelect v-model="symbolSetV" :items="symbolSets" />

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
            @click="iconV = code"
            class="flex w-full flex-col items-center justify-start rounded border border-transparent p-3 hover:border-gray-500"
          >
            <MilSymbol :size="symbolSize" :sidc="sidc" />
            <p
              v-if="entitySubtype && entityType"
              class="mt-1 max-w-full overflow-hidden truncate text-center text-sm text-gray-500"
            >
              {{ entityType }}
            </p>
            <p
              class="mt-1 max-w-full overflow-hidden break-words text-center text-sm font-medium text-gray-900"
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
          @click="mod1V = code"
          class="flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500"
        >
          <MilSymbol :size="symbolSize" :sidc="sidc" />
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
          @click="mod2V = code"
          class="flex w-full flex-col items-center justify-start rounded border border-transparent p-4 hover:border-gray-500"
        >
          <MilSymbol :size="symbolSize" :sidc="sidc" />
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
<script lang="ts">
import MilSymbol from "./MilSymbol.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { computed, defineComponent, PropType } from "vue";
import { useVModel } from "@vueuse/core";
import { SymbolItem } from "../types/constants";
import { groupBy } from "../utils";

export default defineComponent({
  name: "SymbolBrowseTab",
  components: { MilSymbol, SymbolCodeSelect },
  props: {
    iconValue: String,
    symbolSetValue: String,
    mod1Value: String,
    mod2Value: String,
    icons: { type: Array as PropType<SymbolItem[]>, required: true },
    symbolSets: { type: Array as PropType<SymbolItem[]>, required: true },
    mod1Items: { type: Array as PropType<SymbolItem[]>, required: true },
    mod2Items: { type: Array as PropType<SymbolItem[]>, required: true },
    symbolSize: { type: Number, default: 32 },
  },
  emits: [
    "update:iconValue",
    "update:symbolSetValue",
    "update:mod1Value",
    "update:mod2Value",
  ],
  setup(props) {
    const iconV = useVModel(props, "iconValue");
    const symbolSetV = useVModel(props, "symbolSetValue");
    const mod1V = useVModel(props, "mod1Value");
    const mod2V = useVModel(props, "mod2Value");
    const iconsByEntity = computed(() => groupBy(props.icons, "entity"));

    return { iconsByEntity, iconV, symbolSetV, mod1V, mod2V };
  },
});
</script>
