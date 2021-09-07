<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <SimpleModal v-model="open">
    <SearchModalInput v-model="query" />
    <ToggleField class="my-4" v-model="limitToPosition"
      >Show only units with a position</ToggleField
    >
    <section v-if="unitHits.length">
      <p class="font-medium text-gray-700">Units</p>
      <ul class="space-y-2 mt-2">
        <li v-for="(unit, index) in unitHits">
          <button
            type="button"
            class="
              w-full
              flex
              items-center
              p-2
              rounded
              focus:ring
              hover:bg-red-100 hover:border hover:border-army
            "
            :class="index === currentHitIndex ? 'bg-blue-200' : 'bg-gray-100'"
            @click="onSelect(index)"
          >
            <div class="w-full flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-10 h-10 flex flex-shrink-0">
                  <MilSymbol
                    :size="20"
                    :sidc="unit.sidc"
                    class="inline self-center"
                  />
                </div>
                <p>{{ unit.name }}</p>
              </div>

              <p
                v-if="unit.parent"
                class="text-xs flex self-start text-gray-600"
              >
                <MilSymbol
                  :size="12"
                  :sidc="unit.parent.sidc"
                  class="mr-1 opacity-80"
                />
                {{ unit.parent.name }}
              </p>
            </div>
          </button>
        </li>
      </ul>
    </section>
    <GlobalEvents
      v-if="open"
      @keydown.arrow-down="doKbd('down')"
      @keydown.arrow-up="doKbd('up')"
      @keydown.enter.prevent="onSelect()"
    >
    </GlobalEvents>
  </SimpleModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Fuse from "fuse.js";
import { GlobalEvents } from "vue-global-events";
import SimpleModal from "./SimpleModal.vue";
import { useDebounce, useVModel } from "@vueuse/core";
import SearchModalInput from "./SearchModalInput.vue";
import { useScenarioStore } from "../stores/scenarioStore";
import MilSymbol from "./MilSymbol.vue";
import ToggleField from "./ToggleField.vue";

export default defineComponent({
  name: "SearchModal",
  components: {
    ToggleField,
    MilSymbol,
    SearchModalInput,
    SimpleModal,
    GlobalEvents,
  },
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "select-unit"],
  setup(props, { emit }) {
    const open = useVModel(props, "modelValue");
    const query = ref("");
    const debouncedQuery = useDebounce(query, 200);
    const scenarioStore = useScenarioStore();
    const currentHitIndex = ref(0);
    const limitToPosition = ref(false);
    const fuseRef = computed(
      () =>
        new Fuse(scenarioStore.units, {
          keys: ["name", "shortName"],
          useExtendedSearch: false,
        })
    );

    const unitHits = computed(() => {
      const q = debouncedQuery.value.trim();
      if (!q) return [];
      let re = new RegExp(q, "i");
      // const hits = scenarioStore.units.filter((u) => u.name.search(re) >= 0);
      const hits = fuseRef.value.search(q).map((i) => i.item);
      currentHitIndex.value = 0;
      return hits
        .filter((h) => {
          if (limitToPosition.value)
            return scenarioStore.getUnitById(h.id)?._state?.location;
          return true;
        })
        .slice(0, 10)
        .map((u) => ({
          name: u.name,
          sidc: u.sidc,
          id: u.id,
          parent: u._pid && scenarioStore.getUnitById(u._pid),
        }));
    });

    function doKbd(direction: "up" | "down") {
      const nHits = unitHits.value.length;
      if (direction === "up") {
        if (currentHitIndex.value === 0) {
          currentHitIndex.value = nHits - 1;
        } else currentHitIndex.value = currentHitIndex.value - 1;
      } else if (direction === "down") {
        currentHitIndex.value++;
        if (currentHitIndex.value >= nHits) {
          currentHitIndex.value = 0;
        }
      }
    }

    function onSelect(index?: number) {
      const i = index === undefined ? currentHitIndex.value : index;
      if (!unitHits.value.length) return;
      const unit = unitHits.value[i];
      emit("select-unit", unit.id);
      open.value = false;
    }

    return {
      open,
      query,
      doKbd,
      unitHits,
      currentHitIndex,
      onSelect,
      limitToPosition,
    };
  },
});
</script>
