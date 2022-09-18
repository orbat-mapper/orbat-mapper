<template>
  <div class="relative flex min-h-0 flex-auto">
    <div
      ref="target"
      class="flex h-full w-full flex-col overflow-hidden bg-gray-50 shadow sm:rounded-lg"
    >
      <header
        class="flex flex-shrink-0 items-center justify-between border-b border-gray-300 bg-gray-200 px-4 py-3 sm:px-6"
      >
        <div class="w-full sm:w-auto">
          <FilterQueryInput class="" v-model="filterQuery" />
        </div>
      </header>
      <div class="relative min-w-0 max-w-none flex-auto overflow-auto pb-7">
        <table class="w-full table-fixed">
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
                  <button
                    v-if="item.unit.subUnits.length"
                    @click="item.unit._isOpen = !item.unit._isOpen"
                    tabindex="-1"
                  >
                    <ChevronRightIcon
                      class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
                      :class="{
                        'rotate-90': item.unit._isOpen,
                      }"
                    />
                  </button>
                  <MilSymbol
                    :sidc="item.unit.sidc"
                    :class="{ 'ml-6': !item.unit.subUnits.length }"
                  />
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
                <td
                  colspan="3"
                  class="bg-gray-200 px-4 py-2 text-left text-sm font-bold text-gray-900 sm:px-6"
                >
                  {{ item.side.name }}
                </td>
              </tr>

              <tr v-else-if="item.type === 'sidegroup'">
                <td colspan="3" class="sticky top-12 z-10">
                  <div
                    class="flex items-center whitespace-nowrap border-b bg-emerald-50 py-2 pr-3 text-sm font-medium text-gray-900"
                  >
                    <button
                      tabindex="-1"
                      @click="toggleSideGroup(item.sideGroup)"
                      class="flex items-center"
                    >
                      <ChevronRightIcon
                        class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
                        :class="{
                          'rotate-90': sgOpen.get(item.sideGroup) ?? true,
                        }"
                      />

                      <span>{{ item.sideGroup.name }}</span>
                    </button>
                    <BaseButton
                      small
                      class="ml-2"
                      tabindex="-1"
                      @click="expandSideGroup(item.sideGroup)"
                      >Expand/collapse</BaseButton
                    >
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <footer class="h-12 flex-shrink-0 border-t border-gray-300 bg-gray-200"></footer>
    </div>

    <!--    <GlobalEvents @keydown.tab="onTabTest" />-->
  </div>
</template>

<script setup lang="ts">
import { onStartTyping, useDebounce } from "@vueuse/core";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import BaseButton from "@/components/BaseButton.vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import { computed, ref, VNode } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import MilSymbol from "@/components/MilSymbol.vue";
import FilterQueryInput from "@/components/FilterQueryInput.vue";
import { TableItem } from "@/modules/scenarioeditor/types";
import { filterUnits, NOrbatItemData } from "@/composables/filtering";
import { NWalkSideCallback } from "@/scenariostore/unitManipulations";

const router = useRouter();
const uiStore = useUiStore();
const target = ref();

const activeUnit = ref<NUnit | null | undefined>();
const activeColumn = ref<"name" | "shortName">();
const activeItemIndex = ref(-1);
const activeScenario = injectStrict(activeScenarioKey);
const editedValue = ref<string | undefined>();
const {
  store: { state },
  unitActions,
} = activeScenario;

const sgOpen = ref(new Map<NSideGroup, boolean>());

const { updateUnit } = unitActions;
const filterQuery = ref("");
const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

function sideGroups(side: NSide) {
  return side.groups.map((id) => state.sideGroupMap[id]);
}

function rootUnits(sideGroup: NSideGroup) {
  return sideGroup.subUnits.map((unitId) => state.unitMap[unitId]);
}

const debouncedFilterQuery = useDebounce(filterQuery, 250);

interface SideItem {
  side: NSide;
  children: SideGroupItem[];
}
interface SideGroupItem {
  sideGroup: NSideGroup;
  children: NOrbatItemData[];
}

const filteredOrbat = computed(() => {
  const sideList: SideItem[] = [];
  state.sides
    .map((id) => state.sideMap[id])
    .forEach((side) => {
      const sideGroupList: SideGroupItem[] = [];
      side.groups
        .map((id) => state.sideGroupMap[id])
        .forEach((sideGroup) => {
          const filteredUnits = filterUnits(
            sideGroup.subUnits,
            state.unitMap,
            debouncedFilterQuery.value
          );
          if (filteredUnits.length) {
            sideGroupList.push({ sideGroup, children: filteredUnits });
          }
        });
      if (sideGroupList.length) {
        sideList.push({ side, children: sideGroupList });
      }
    });
  return sideList;
});

const items = computed(() => {
  const _items: TableItem[] = [];
  let currentSideGroup: NSideGroup;
  filteredOrbat.value.forEach(({ side, children: sideGroups }) => {
    _items.push({ type: "side", side, id: side.id });
    sideGroups.forEach((sg) => {
      const { sideGroup } = sg;
      _items.push({ type: "sidegroup", sideGroup, id: sideGroup.id });
      if (!(sgOpen.value.get(sideGroup) ?? true)) return;
      walkSideGroupItem(sg, (unit, level, parent, sideGroup) => {
        _items.push({ type: "unit", unit, id: unit.id, level });
        if (unit.subUnits.length && unit._isOpen === false) return false;
      });
    });
  });
  return _items;
});

function walkSideGroupItem(
  sideGroupItem: SideGroupItem,
  callback: NWalkSideCallback,
  s = state
) {
  let level = 0;

  function helper({ unit, children }: NOrbatItemData, parent: NUnit | NSideGroup) {
    const r = callback(unit, level, parent, sideGroupItem.sideGroup);
    if (r !== undefined) return r;
    if (children.length) {
      level += 1;
      for (const subUnitId of children) {
        helper(subUnitId, unit);
      }
      level -= 1;
    }
  }

  for (const unitId of sideGroupItem.children) {
    const r = helper(unitId, sideGroupItem.sideGroup);
    if (r === true) break;
  }
}

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

function onTabTest(e: Event) {
  console.log("Tabbiong", e);
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
  if (nextItem?.type === "unit") {
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
  if (prevItem?.type === "unit") {
    activateEdit(prevItem.unit, itemIndex - 1, activeColumn.value!);
  }
}

function updateValue(event: Event) {
  editedValue.value = (<HTMLInputElement>event.target).value;
}

const onVMounted = ({ el }: VNode) => el?.focus();

onStartTyping((e) => {
  // console.log("Start typing", e);
});

const expandMap = new WeakSet<NSideGroup>();

function expandSideGroup(sideGroup: NSideGroup) {
  let open = true;
  if (expandMap.has(sideGroup)) {
    open = false;
    expandMap.delete(sideGroup);
  } else {
    expandMap.add(sideGroup);
    sgOpen.value.set(sideGroup, true);
  }

  sideGroup.subUnits.forEach((unitId) => {
    unitActions.walkSubUnits(unitId, (unit) => (unit._isOpen = open), {
      includeParent: true,
    });
  });
}

function toggleSideGroup(sideGroup: NSideGroup) {
  sgOpen.value.set(sideGroup, !(sgOpen.value.get(sideGroup) ?? true));
}
</script>
