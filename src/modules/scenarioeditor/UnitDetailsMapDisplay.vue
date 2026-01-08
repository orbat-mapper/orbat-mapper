<script setup lang="ts">
import { computed, ref } from "vue";

import type { NUnit } from "@/types/internalModels";
import type { RangeRing, RangeRingStyle } from "@/types/scenarioGeoModels";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { klona } from "klona";
import InputGroup from "@/components/InputGroup.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import type { MenuItemData } from "@/components/types";
import { type RangeRingAction, RangeRingActions } from "@/types/constants";
import DotsMenu from "@/components/DotsMenu.vue";
import RingStylePopover from "@/modules/scenarioeditor/RingStylePopover.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { useToeActions } from "@/composables/scenarioActions";
import { useSelectedItems } from "@/stores/selectedStore";
import PanelHeading from "@/components/PanelHeading.vue";
import ToggleField from "@/components/ToggleField.vue";
import { useMapViewStore } from "@/stores/mapViewStore";
import ZoomSelector from "@/components/ZoomSelector.vue";
import { type VisibilityStyleSpec } from "@/geo/simplestyle";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { Button } from "@/components/ui/button";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
  isMultiMode?: boolean;
}

const props = defineProps<Props>();

const activeScenario = injectStrict(activeScenarioKey);
const {
  unitActions,
  store,
  helpers: { getUnitById },
} = activeScenario;
const toeActions = useToeActions();
const { selectedUnitIds } = useSelectedItems();
const mapView = useMapViewStore();

const editedRangeRing = ref<RangeRing>({
  name: "",
  range: 0,
  uom: "km",
  group: undefined,
});

const originalRangeRing = ref<RangeRing | null>(null);
const editedIndex = ref(-1);

const marker = computed((): Partial<VisibilityStyleSpec> => {
  const { style = {} } = props.unit;
  return {
    limitVisibility: style["limitVisibility"] ?? false,
    minZoom: style["minZoom"] ?? 0,
    maxZoom: style["maxZoom"] ?? 24,
  };
});

const range = computed({
  get: (): [number, number] => [marker.value.minZoom ?? 0, marker.value.maxZoom ?? 24],
  set: (v) => {
    updateVisibilityStyle({ minZoom: +v[0], maxZoom: +v[1] });
  },
});

const limitVisibility = computed({
  get: () => marker.value.limitVisibility,
  set: (v) => updateVisibilityStyle({ limitVisibility: v }),
});

const rangeRings = computed(() => {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    const multiRangeRings: RangeRing[] = [];
    const usedNames = new Set<string>();
    const usedNameCounter = new Map<string, number>();
    for (const unitId of selectedUnitIds.value) {
      const unit = getUnitById(unitId);
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
    name: "New range ring-3 " + nanoid(3),
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

function updateVisibilityStyle(style: Partial<VisibilityStyleSpec>) {
  if (props.isMultiMode && selectedUnitIds.value.size > 1) {
    unitActions.batchUpdateUnitStyle([...selectedUnitIds.value], style);
  } else {
    const unit = getUnitById(props.unit.id);
    if (!unit) return;
    const unitStyle = props.unit.style ?? {};
    const newStyle = { ...unitStyle, ...style };
    unitActions.updateUnit(props.unit.id, { style: newStyle });
  }
}
</script>
<template>
  <PanelDataGrid class="mt-4">
    <div class="col-span-2 mt-2 -mb-6 font-semibold">Visibility</div>
    <div class="self-end">Limit</div>
    <ToggleField class="mt-4" v-model="limitVisibility" />
    <template v-if="limitVisibility">
      <div>Zoom levels</div>
      <ZoomSelector v-model="range" class="mt-4 flex-auto" />
    </template>
  </PanelDataGrid>
  <div class="mt-4 flex items-center justify-between">
    <PanelHeading>Range rings</PanelHeading>

    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <Button @click="addRangeRing()" type="button" :disabled="isLocked" size="sm">
        + Add
      </Button>
    </div>
  </div>
  <table v-if="rangeRings.length > 0" class="w-full divide-y divide-gray-300">
    <thead>
      <tr>
        <th
          scope="col"
          class="text-foreground py-3.5 pr-3 pl-4 text-left text-sm font-semibold whitespace-nowrap sm:pl-0"
        >
          Name
        </th>
        <th
          scope="col"
          class="text-foreground px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap"
        >
          Range
        </th>
        <th
          scope="col"
          class="text-foreground w-20 px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap"
        >
          Visible
        </th>
        <th
          scope="col"
          class="text-foreground w-20 px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap"
        >
          Group
        </th>
        <th class="w-0"></th>
      </tr>
    </thead>
    <tbody class="bg-background divide-y divide-gray-200">
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
              class="bg-muted/50 mt-2 grid grid-cols-2 gap-4 rounded border border-gray-300 p-2 py-4"
            >
              <InputGroup
                class="col-span-2"
                autofocus
                label="Name"
                v-model="editedRangeRing.name"
                :disabled="isLocked"
              />
              <InputGroupTemplate label="Range" v-slot="{ id }" class="col-span-1">
                <div class="relative rounded-md shadow-xs">
                  <input
                    type="text"
                    :id="id"
                    class="text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background ring-input focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border-0 py-1.5 pr-20 ring-1 outline-hidden ring-inset focus-visible:ring-[3px] sm:text-sm sm:leading-6"
                    v-model="editedRangeRing.range"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <label for="currency" class="sr-only">Currency</label>
                    <select
                      id="range"
                      name="range"
                      v-model="editedRangeRing.uom"
                      class="text-muted-foreground dark:bg-muted focus-visible:ring-ring h-full rounded-md border-0 bg-transparent py-0 pr-7 pl-2 outline-hidden focus-visible:ring-2 sm:text-sm"
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
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  @click="toeActions.goToAddGroup()"
                >
                  + Add new group
                </Button>
                <div>
                  <Button type="submit" variant="secondary" size="sm">Update</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    class="ml-2"
                    @click="editedIndex = -1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </td>
        </template>
        <template v-else>
          <td class="text-foreground py-2 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
            {{ ring.name }}
            <span v-if="ring._counter" class="text-muted-foreground"
              >({{ ring._counter }})</span
            >
          </td>
          <td class="text-foreground px-2 py-2 text-sm font-medium whitespace-nowrap">
            {{ ring.range }} <span class="text-foreground">{{ ring.uom || "km" }}</span>
          </td>
          <td class="relative">
            <input
              type="checkbox"
              class="text-primary focus:ring-ring absolute top-1/2 left-6 -mt-2 h-4 w-4 rounded border-gray-300 disabled:opacity-50"
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
