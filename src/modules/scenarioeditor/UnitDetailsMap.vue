<script setup lang="ts">
import { computed, ref } from "vue";

import { NUnit } from "@/types/internalModels";
import { RangeRing, RangeRingStyle } from "@/types/scenarioGeoModels";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { klona } from "klona";
import InputGroup from "@/components/InputGroup.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import BaseButton from "@/components/BaseButton.vue";
import { MenuItemData } from "@/components/types";
import { RangeRingAction, RangeRingActions } from "@/types/constants";
import DotsMenu from "@/components/DotsMenu.vue";
import RingStylePopover from "@/modules/scenarioeditor/RingStylePopover.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { useToeActions } from "@/composables/scenarioActions";
import { useSelectedItems } from "@/stores/selectedStore";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
  isMultiMode?: boolean;
}

const props = defineProps<Props>();

const activeScenario = injectStrict(activeScenarioKey);
const { unitActions, store } = activeScenario;
const toeActions = useToeActions();
const { selectedUnitIds } = useSelectedItems();

const editedRangeRing = ref<RangeRing>({
  name: "",
  range: 0,
  uom: "km",
  group: undefined,
});

const originalRangeRing = ref<RangeRing | null>(null);
const editedIndex = ref(-1);

const rangeRings = computed(() => {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    const multiRangeRings: RangeRing[] = [];
    const usedNames = new Set<string>();
    const usedNameCounter = new Map<string, number>();
    for (const unitId of selectedUnitIds.value) {
      const unit = store.state.getUnitById(unitId);
      if (!unit?.rangeRings) continue;
      for (const ring of unit.rangeRings ?? []) {
        usedNameCounter.set(ring.name, (usedNameCounter.get(ring.name) ?? 0) + 1);
        if (usedNames.has(ring.name)) {
          continue;
        }
        usedNames.add(ring.name);
        multiRangeRings.push({ ...ring });
      }
    }
    return multiRangeRings.map((ring) => {
      return { ...ring, _counter: usedNameCounter.get(ring.name) };
    });
  }
  return props.unit.rangeRings ?? [];
});

const groupItems = computed(() => {
  return Object.values(store.state.rangeRingGroupMap).map((g) => ({
    label: g.name,
    value: g.id,
  }));
});

const ringMenuItems = computed((): MenuItemData<RangeRingAction>[] => [
  {
    label: "Edit",
    action: RangeRingActions.Edit,
    disabled: props.isLocked,
  },
  { label: "Delete", action: RangeRingActions.Delete, disabled: props.isLocked },
]);

function addRangeRing() {
  const defaultRing: RangeRing = {
    name: "New range ring " + nanoid(3),
    range: 20,
    uom: "km",
    group: null,
  };
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    store.groupUpdate(() => {
      selectedUnitIds.value.forEach((unitId) => {
        unitActions.addRangeRing(unitId, { ...defaultRing });
      });
    });
  } else {
    unitActions.addRangeRing(props.unit.id, { ...defaultRing });
  }

  editRingByName(defaultRing.name);
}

function getGroupName(ring: RangeRing) {
  if (!ring.group) return "None";
  return store.state.rangeRingGroupMap[ring.group]?.name || "None";
}

function getRingStyle(ring: RangeRing) {
  if (ring.group) {
    const group = store.state.rangeRingGroupMap[ring.group];
    if (group) {
      return group.style || {};
    }
  }
  return ring.style || {};
}

function deleteRing(index: number) {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    const name = rangeRings.value[index].name;
    store.groupUpdate(() => {
      selectedUnitIds.value.forEach((unitId) => {
        unitActions.deleteRangeRingByName(unitId, name);
      });
    });
  } else {
    unitActions.deleteRangeRing(props.unit.id, index);
  }
}

function editRing(index: number) {
  const ring = rangeRings.value[index];
  if (!ring) return;
  editedRangeRing.value = klona(ring);
  originalRangeRing.value = klona(ring);
  editedIndex.value = index;
}

function editRingByName(name: string) {
  const index = rangeRings.value.findIndex((r) => r.name === name);
  if (index >= 0) {
    editRing(index);
  } else {
    editRing(0);
  }
}

function toggleRingVisibility(ring: RangeRing, index: number) {
  const hidden = !(ring.hidden ?? false);
  updateRangeRingOrRings(index, ring.name, { hidden });
}

function updateRangeRingOrRings(
  index: number,
  name: string,
  data: Partial<RangeRing>,
  { addIfNameDoesNotExists = false } = {},
) {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    store.groupUpdate(() => {
      selectedUnitIds.value.forEach((unitId) => {
        unitActions.updateRangeRingByName(unitId, name, data, { addIfNameDoesNotExists });
      });
    });
  } else {
    unitActions.updateRangeRing(props.unit.id, index, data);
  }
}

function updateRing() {
  if (editedIndex.value < 0 || !editedRangeRing.value) return;
  const { name, range, uom, group } = editedRangeRing.value;

  updateRangeRingOrRings(
    editedIndex.value,
    originalRangeRing.value?.name ?? name,
    {
      name,
      range: +range,
      uom,
      group,
    },
    { addIfNameDoesNotExists: true },
  );
  editedIndex.value = -1;
  editedRangeRing.value = { name: "", range: 0, uom: "km", group: null };
  originalRangeRing.value = null;
}

function updateRingStyle(ring: RangeRing, index: number, style: Partial<RangeRingStyle>) {
  if (ring.group) {
    const group = store.state.rangeRingGroupMap[ring.group];
    if (group) {
      unitActions.updateRangeRingGroup(ring.group, { style });
    }
  }
  updateRangeRingOrRings(index, ring.name, { style });
}

function onRangeRingAction(action: RangeRingAction, index: number) {
  switch (action) {
    case RangeRingActions.Edit:
      editRing(index);
      break;
    case RangeRingActions.Delete:
      deleteRing(index);
      break;
  }
}
</script>
<template>
  <div class="mt-2 flex items-center">
    <div class="flex-auto">
      <h1 class="text-sm font-semibold leading-5 text-gray-900">Range rings</h1>
      <!--      <p class="mt-1.5 text-sm text-red-700">Work in progress!</p>-->
    </div>
    <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
      <button
        @click="addRangeRing()"
        type="button"
        :disabled="isLocked"
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
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
          class="w-20 whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
        >
          Visible
        </th>
        <th
          scope="col"
          class="w-20 whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
        >
          Group
        </th>
        <th class="w-0"></th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-white">
      <tr
        v-for="(ring, index) in rangeRings"
        :key="ring.name"
        @dblclick="!isLocked && editRing(index)"
        class="group"
      >
        <template v-if="index === editedIndex">
          <td colspan="5">
            <form
              @submit.prevent.stop="updateRing()"
              class="mt-2 grid grid-cols-2 gap-4 rounded border border-gray-300 bg-gray-50 p-2 py-4"
            >
              <InputGroup
                class="col-span-2"
                autofocus
                label="Name"
                v-model="editedRangeRing.name"
                :disabled="isLocked"
              />
              <InputGroupTemplate label="Range" v-slot="{ id }" class="col-span-1">
                <div class="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    :id="id"
                    class="block w-full rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    v-model="editedRangeRing.range"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <label for="currency" class="sr-only">Currency</label>
                    <select
                      id="range"
                      name="range"
                      v-model="editedRangeRing.uom"
                      class="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    >
                      <option>m</option>
                      <option>km</option>
                      <option>mi</option>
                      <option>nmi</option>
                    </select>
                  </div>
                </div>
              </InputGroupTemplate>
              <SimpleSelect
                add-none
                class="col-span-1"
                label="Group"
                v-model="editedRangeRing.group"
                :items="groupItems"
              />

              <div class="col-span-2 flex items-center justify-between">
                <button type="button" class="btn-link" @click="toeActions.goToAddGroup()">
                  + Add new group
                </button>
                <div>
                  <BaseButton type="submit" secondary small>Update</BaseButton>
                  <BaseButton small type="button" class="ml-2" @click="editedIndex = -1">
                    Cancel
                  </BaseButton>
                </div>
              </div>
            </form>
          </td>
        </template>
        <template v-else>
          <td class="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
            {{ ring.name }}
            <span v-if="ring._counter" class="text-gray-500">({{ ring._counter }})</span>
          </td>
          <td class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
            {{ ring.range }} <span class="text-gray-800">{{ ring.uom || "km" }}</span>
          </td>
          <td class="relative">
            <input
              type="checkbox"
              class="absolute left-6 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
              :checked="!ring.hidden"
              @change="toggleRingVisibility(ring, index)"
              :disabled="isLocked"
            />
          </td>
          <td class="px-2 text-sm">{{ getGroupName(ring) }}</td>
          <td class="flex items-center">
            <RingStylePopover
              :ring-style="getRingStyle(ring)"
              @update="updateRingStyle(ring, index, $event)"
              :disabled="isLocked"
            />
            <DotsMenu
              class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
              :items="ringMenuItems"
              @action="onRangeRingAction($event, index)"
              portal
            />
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>
