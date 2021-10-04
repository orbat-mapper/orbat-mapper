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
    </div>
  </div>
</template>
<script lang="ts">
import MilSymbol from "./MilSymbol.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { computed, defineComponent, PropType } from "vue";
import { useVModel } from "@vueuse/core";
import { SymbolItem } from "../types/constants";

export default defineComponent({
  name: "SymbolBrowseTab",
  components: { MilSymbol, SymbolCodeSelect },
  props: {
    iconValue: String,
    symbolSetValue: String,
    icons: { type: Array as PropType<SymbolItem[]>, required: true },
    symbolSets: { type: Array as PropType<SymbolItem[]>, required: true },
  },
  emits: ["update:iconValue", "update:symbolSetValue"],
  setup(props) {
    const iconV = useVModel(props, "iconValue");
    const symbolSetV = useVModel(props, "symbolSetValue");
    const iconsByEntity = computed(() => {
      const mm = new Map();
      props.icons.forEach((v) => {
        const l = mm.get(v.entity) || [];
        l.push(v);
        mm.set(v.entity, l);
      });

      return mm;
    });

    return { iconsByEntity, iconV, symbolSetV };
  },
});
</script>
