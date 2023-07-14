<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { computed, ref } from "vue";
import { RangeRing } from "@/types/scenarioGeoModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { klona } from "klona";
import BaseButton from "@/components/BaseButton.vue";
import { doFocus } from "@/composables/utils";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();

const activeScenario = injectStrict(activeScenarioKey);
const { unitActions } = activeScenario;

const editedRangeRing = ref<RangeRing>({ name: "", range: 0 });
const editedIndex = ref(-1);

const rangeRings = computed(() => {
  return props.unit.rangeRings ?? [];
});

function addRangeRing() {
  unitActions.addRangeRing(props.unit.id, {
    name: "New range ring",
    range: 2000,
  });
  editRing(props.unit.rangeRings!.length - 1);
}

function deleteRing(index: number) {
  unitActions.deleteRangeRing(props.unit.id, index);
}

function editRing(index: number) {
  const ring = props.unit.rangeRings?.[index];
  if (!ring) return;
  editedRangeRing.value = klona(ring);
  editedIndex.value = index;
}

function toggleRingVisibility(ring: RangeRing, index: number) {
  const hidden = !(ring.hidden ?? false);
  unitActions.updateRangeRing(props.unit.id, index, { hidden });
}

function updateRing() {
  if (editedIndex.value < 0 || !editedRangeRing.value) return;
  unitActions.updateRangeRing(props.unit.id, editedIndex.value, editedRangeRing.value);
  editedIndex.value = -1;
  editedRangeRing.value = { name: "", range: 0 };
}
</script>
<template>
  <form @submit.prevent="updateRing()">
    <div class="flex items-center mt-2">
      <div class="flex-auto">
        <h1 class="text-sm font-semibold leading-5 text-gray-900">Range rings</h1>
        <p class="mt-1.5 text-sm text-gray-700">Display range rings around the unit.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          @click="addRangeRing()"
          type="button"
          class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          + Add
        </button>
      </div>
    </div>
    <table v-if="rangeRings.length > 0" class="w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th
            scope="col"
            class="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
          >
            Name
          </th>
          <th
            scope="col"
            class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Range
          </th>
          <th
            scope="col"
            class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900 w-20"
          >
            Visible
          </th>
          <th class="w-0"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr v-for="(ring, index) in rangeRings" :key="ring.name">
          <template v-if="index === editedIndex">
            <td>
              <input
                type="text"
                @vue:mounted="doFocus"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                v-model="editedRangeRing.name"
              />
            </td>
            <td colspan="3" class="">
              <div class="flex items-center">
                <div class="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="price"
                    id="price"
                    class="block w-full rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    v-model="editedRangeRing.range"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <label for="currency" class="sr-only">Currency</label>
                    <select
                      id="range"
                      name="range"
                      class="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    >
                      <option>m</option>
                      <option>km</option>
                      <option>mi</option>
                      <option>nmi</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn-link">Update</button>
                <span class="text-gray-200 mx-1.5" aria-hidden="true">|</span>
                <button type="button" class="btn-link" @click="editedIndex = -1">
                  Cancel
                </button>
              </div>
            </td>
          </template>
          <template v-else>
            <td class="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
              {{ ring.name }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
              {{ ring.range }}
            </td>
            <td class="relative">
              <input
                type="checkbox"
                class="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                :checked="!ring.hidden"
                @change="toggleRingVisibility(ring, index)"
              />
            </td>
            <td class="flex py-2">
              <button type="button" class="btn-link" @click="editRing(index)">
                Edit
              </button>
              <span class="text-gray-200 mx-1.5" aria-hidden="true">|</span>
              <button @click="deleteRing(index)" type="button" class="btn-link">
                Delete
              </button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </form>
</template>
