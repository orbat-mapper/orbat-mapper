<template>
  <h3 class="font-medium text-gray-900 mt-6">Unit state</h3>
  <ul class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
    <li v-for="(s, index) in state" class="py-4 flex items-center">
      <div class="flex-auto min-w-0 text-sm flex flex-col">
        <p class="text-gray-500 font-medium">
          {{ formatDateString(s.t, scenarioStore.timeZone) }}
        </p>
        <p>{{ formatPosition(s.coordinates) }}</p>
      </div>

      <div class="flex-shrink-0 px-4">
        <button
          type="button"
          @click="deleteState(index)"
          class="
            inline-flex
            items-center
            p-1
            border border-transparent
            rounded-full
            shadow-sm
            text-white
            bg-indigo-300
            hover:bg-indigo-700
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-indigo-500
          "
        >
          <XIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Unit } from "../types/models";
import { formatDateString, formatPosition } from "../geo/utils";
import { XIcon } from "@heroicons/vue/solid";
import { useScenarioStore } from "../stores/scenarioStore";

export default defineComponent({
  name: "UnitPanelState",
  props: { unit: { type: Object as PropType<Unit>, required: true } },
  components: { XIcon },
  setup(props) {
    const scenarioStore = useScenarioStore();
    const state = computed(() => props.unit.state);

    const deleteState = (index: number) => {
      scenarioStore.deleteUnitStateEntry(props.unit, index);
    };

    return {
      formatPosition,
      formatDateString,
      deleteState,
      scenarioStore,
      state,
    };
  },
});
</script>

<style scoped></style>
