<template>
  <div class="min-h-[30rem]">
    <SymbolCodeSelect
      v-model="symbolSetV"
      label="Symbol set"
      :items="symbolSets"
    />

    <div class="overflow-auto max-h-[40rem] mt-2">
      <div v-for="[entity, entityIcons] in iconsByEntity" class="relative">
        <p class="text-gray-900 font-medium bg-gray-200 p-2 sticky top-0">
          {{ entity }}
        </p>
        <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
          <button
            type="button"
            v-for="{
              sidc,
              entity,
              entityType,
              entitySubtype,
              code,
            } in entityIcons"
            :key="sidc"
            @click="iconV = code"
            class="
              border border-transparent
              rounded
              p-4
              flex flex-col
              items-center
              justify-start
              w-full
              hover:border-gray-500
            "
          >
            <MilSymbol :size="32" :sidc="sidc" />
            <p
              class="
                mt-1
                text-sm text-center text-gray-900
                max-w-full
                overflow-hidden
              "
            >
              {{ entitySubtype || entityType || entity }}
            </p>
          </button>
        </div>
      </div>
      <p>Modifier 1</p>
      <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
        <button
          type="button"
          v-for="{ sidc, text, code } in mod1Items"
          :key="sidc"
          @click="mod1V = code"
          class="
            border border-transparent
            rounded
            p-4
            flex flex-col
            items-center
            justify-start
            w-full
            hover:border-gray-500
          "
        >
          <MilSymbol :size="32" :sidc="sidc" />
          <p
            class="
              mt-1
              text-sm text-center text-gray-900
              max-w-full
              overflow-hidden
            "
          >
            {{ text }}
          </p>
        </button>
      </div>
      <p>Modifier 2</p>
      <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
        <button
          type="button"
          v-for="{ sidc, text, code } in mod2Items"
          :key="sidc"
          @click="mod2V = code"
          class="
            border border-transparent
            rounded
            p-4
            flex flex-col
            items-center
            justify-start
            w-full
            hover:border-gray-500
          "
        >
          <MilSymbol :size="32" :sidc="sidc" />
          <p
            class="
              mt-1
              text-sm text-center text-gray-900
              max-w-full
              overflow-hidden
            "
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
