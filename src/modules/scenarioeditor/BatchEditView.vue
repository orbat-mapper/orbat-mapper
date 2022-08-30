<template>
  <div class="absolute z-10 h-full w-full bg-black bg-opacity-50 sm:p-4">
    <div
      ref="target"
      class="flex h-full w-full flex-col overflow-hidden bg-gray-50 shadow sm:rounded-lg"
    >
      <header
        class="flex flex-shrink-0 items-center justify-between border-b border-gray-300 bg-gray-200 px-4 py-5 sm:px-6"
      >
        <h1 class="text-lg font-semibold text-gray-900">Batch edit</h1>
        <BaseButton @click="doClose()">Close</BaseButton>
      </header>
      <div class="relative min-w-0 max-w-none flex-auto overflow-auto pb-7">
        <table class="w-full table-fixed divide-y divide-gray-300">
          <colgroup>
            <col />
            <col />
            <col class="w-1/4" />
          </colgroup>
          <thead class="bg-gray-100">
            <tr>
              <th
                scope="col"
                class="sticky top-0 z-10 border-b border-gray-300 bg-gray-100 bg-opacity-95 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
              ></th>
              <th
                scope="col"
                class="sticky top-0 z-10 border-b border-gray-300 bg-gray-100 bg-opacity-95 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
              >
                Name
              </th>
              <th
                scope="col"
                class="sticky top-0 z-10 border-b border-gray-300 bg-gray-100 bg-opacity-95 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
              >
                Short name
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 bg-white">
            <template v-for="(item, itemIndex) in items" :key="item.id">
              <tr
                v-if="item.type === 'unit'"
                :class="
                  activeUnit === item.unit
                    ? 'bg-yellow-300 hover:bg-yellow-100'
                    : 'hover:bg-gray-200'
                "
              >
                <td
                  class="flex items-center whitespace-nowrap py-3 text-sm text-gray-900"
                  :style="`padding-left: ${item.level * 1 + 1}rem`"
                >
                  <MilSymbol :sidc="item.unit.sidc" />
                  <span class="ml-2 truncate">{{ item.unit.name }}</span>
                </td>
                <td
                  class="whitespace-nowrap px-3 py-3 text-sm text-gray-500"
                  @click="activateEdit(item.unit, itemIndex, 'name')"
                >
                  <form
                    v-if="activeUnit === item.unit && activeColumn === 'name'"
                    @submit.prevent="onSubmit"
                  >
                    <input
                      type="text"
                      class="-my-3 w-full"
                      :value="item.unit.name"
                      @vnode-mounted="onVMounted"
                      @keydown.tab="onTab(item.unit, itemIndex, 'name')"
                      @keydown.down="onDown(itemIndex)"
                      @keydown.up="onUp(itemIndex)"
                      @input="updateValue"
                    />
                  </form>
                  <span v-else>{{ item.unit.name }}</span>
                </td>
                <td
                  class="whitespace-nowrap px-3 py-3 text-sm text-gray-500"
                  @click="activateEdit(item.unit, itemIndex, 'shortName')"
                >
                  <form
                    v-if="activeUnit === item.unit && activeColumn === 'shortName'"
                    @submit.prevent="onSubmit"
                  >
                    <input
                      type="text"
                      class="-my-3 w-full"
                      :value="item.unit.shortName"
                      @vnode-mounted="onVMounted"
                      @keydown.tab="onTab(item.unit, itemIndex, 'shortName')"
                      @keydown.down="onDown(itemIndex)"
                      @keydown.up="onUp(itemIndex)"
                      @input="updateValue"
                    />
                  </form>
                  <span v-else>{{ item.unit.shortName }}</span>
                </td>
              </tr>

              <tr v-else-if="item.type === 'side'" class="border-t border-gray-200">
                <th
                  colspan="3"
                  scope="colgroup"
                  class="bg-gray-50 px-4 py-2 text-left text-sm font-bold text-gray-900 sm:px-6"
                >
                  {{ item.side.name }}
                </th>
              </tr>

              <tr v-else-if="item.type === 'sidegroup'">
                <td
                  colspan="3"
                  class="sm:pl whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900"
                >
                  {{ item.sideGroup.name }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <footer class="h-12 flex-shrink-0 border-t border-gray-300 bg-gray-200"></footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import BaseButton from "@/components/BaseButton.vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import { computed, ref, VNode } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import MilSymbol from "@/components/MilSymbol.vue";

const router = useRouter();
const uiStore = useUiStore();
const target = ref();
const { hasFocus, activate, deactivate } = useFocusTrap(target, {
  immediate: true,
  allowOutsideClick: true,
  escapeDeactivates: false,
});

const activeUnit = ref<NUnit | null | undefined>();
const activeColumn = ref<"name" | "shortName">();
const activeItemIndex = ref(-1);
const activeScenario = injectStrict(activeScenarioKey);
const editedValue = ref<string | undefined>();
const {
  store: { state },
  unitActions,
} = activeScenario;

const { updateUnit } = unitActions;

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

function sideGroups(side: NSide) {
  return side.groups.map((id) => state.sideGroupMap[id]);
}

function rootUnits(sideGroup: NSideGroup) {
  return sideGroup.subUnits.map((unitId) => state.unitMap[unitId]);
}

interface UnitItem {
  type: "unit";
  id: EntityId;
  unit: NUnit;
  level: number;
}

interface SideItem {
  type: "side";
  id: EntityId;
  side: NSide;
}

interface SideGroupItem {
  type: "sidegroup";
  id: EntityId;
  sideGroup: NSideGroup;
}

type TableItem = SideItem | SideGroupItem | UnitItem;

const items = computed(() => {
  const _items: TableItem[] = [];
  let currentSideGroup: NSideGroup;
  state.sides.forEach((sideId) => {
    _items.push({ type: "side", side: state.sideMap[sideId], id: sideId });
    unitActions.walkSide(sideId, (unit, level, parent, sideGroup) => {
      if (sideGroup !== currentSideGroup) {
        _items.push({ type: "sidegroup", sideGroup, id: sideGroup.id });
        currentSideGroup = sideGroup;
      }
      _items.push({ type: "unit", unit, id: unit.id, level });
    });
  });
  return _items;
});

uiStore.modalOpen = true;
onBeforeRouteLeave(() => {
  uiStore.modalOpen = false;
});

function doClose() {
  router.back();
}

function activateEdit(unit: NUnit, itemIndex: number, column: "name" | "shortName") {
  onSubmit();
  activeUnit.value = unit;
  activeColumn.value = column;
  activeItemIndex.value = itemIndex;
}

function onSubmit(e?: Event) {
  if (activeUnit.value && editedValue.value != undefined) {
    updateUnit(activeUnit.value.id, { [activeColumn.value!]: editedValue.value });
  }

  activeUnit.value = null;
  editedValue.value = undefined;
}

function onTab(unit: NUnit, itemIndex: number, column: "name" | "shortName") {
  if (unit) {
    if (column === "name") {
      activateEdit(unit, itemIndex, "shortName");
    } else {
      activateEdit(unit, itemIndex, "name");
    }
  }
}

function onDown(itemIndex: number) {
  if (!activeUnit.value) return;
  let idx = itemIndex + 1;
  let nextItem = items.value[idx];
  while (nextItem && nextItem.type !== "unit") {
    nextItem = items.value[++idx];
  }
  if (nextItem.type === "unit") {
    activateEdit(nextItem.unit, itemIndex + 1, activeColumn.value!);
  }
}
function onUp(itemIndex: number) {
  if (!activeUnit.value) return;
  let idx = itemIndex - 1;
  let prevItem = items.value[idx];
  while (prevItem && prevItem.type !== "unit") {
    prevItem = items.value[--idx];
  }
  if (prevItem.type === "unit") {
    activateEdit(prevItem.unit, itemIndex - 1, activeColumn.value!);
  }
}

function updateValue(event: Event) {
  editedValue.value = (<HTMLInputElement>event.target).value;
}

const onVMounted = ({ el }: VNode) => el?.focus();
</script>
