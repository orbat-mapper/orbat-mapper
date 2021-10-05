<template>
  <div class="min-h-[30rem]">
    <SymbolCodeSelect v-model="symbolSetV" :items="symbolSets" />

    <div class="overflow-auto max-h-[40rem] mt-4">
      <div v-for="[entity, entityIcons] in iconsByEntity" class="relative">
        <h3
          class="
            border-t border-b border-gray-200
            text-gray-600 text-sm
            font-medium
            bg-gray-50
            p-2
            px-4
            sticky
            top-0
          "
        >
          {{ entity }}
        </h3>
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
              p-3
              flex flex-col
              items-center
              justify-start
              w-full
              hover:border-gray-500
            "
          >
            <MilSymbol :size="symbolSize" :sidc="sidc" />
            <p
              class="
                mt-1
                text-sm text-center text-gray-900
                max-w-full
                break-words
                overflow-hidden
              "
            >
              {{ entitySubtype || entityType || entity }}
            </p>
          </button>
        </div>
      </div>
      <h3
        class="
          border-t border-b border-gray-200
          text-gray-600 text-sm
          font-medium
          bg-gray-50
          p-2
          px-4
          sticky
          top-0
        "
      >
        Modifier 1
      </h3>
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
          <MilSymbol :size="symbolSize" :sidc="sidc" />
          <p
            class="
              mt-1
              text-sm text-center text-gray-900
              max-w-full
              overflow-hidden
              break-words
            "
          >
            {{ text }}
          </p>
        </button>
      </div>
      <p
        class="
          border-t border-b border-gray-200
          text-gray-600 text-sm
          font-medium
          bg-gray-50
          p-2
          px-4
          sticky
          top-0
        "
      >
        Modifier 2
      </p>
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
          <MilSymbol :size="symbolSize" :sidc="sidc" />
          <p
            class="
              mt-1
              text-sm text-center text-gray-900
              max-w-full
              overflow-hidden
              break-words
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
