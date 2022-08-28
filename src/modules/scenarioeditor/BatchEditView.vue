<template>
  <div class="absolute z-10 h-full w-full bg-black bg-opacity-50 sm:p-4">
    <div
      ref="target"
      class="flex h-full w-full flex-col divide-y divide-gray-200 overflow-hidden bg-gray-50 shadow sm:rounded-lg"
    >
      <header
        class="flex flex-shrink-0 items-center justify-between border-b border-gray-300 bg-gray-200 px-4 py-5 sm:px-6"
      >
        <h1 class="text-lg font-semibold text-gray-900">Batch edit</h1>
        <BaseButton @click="doClose()">Close</BaseButton>
      </header>
      <div
        class="prose relative min-w-0 max-w-none flex-auto overflow-auto px-4 pb-7 sm:px-6"
      >
        <table class="w-full">
          <thead class="sticky top-0 border-gray-300 bg-gray-100">
            <tr>
              <th class="sticky top-0 py-2"></th>
              <th class="sticky top-0 py-2">Name</th>
              <th class="sticky top-0 py-2">Short name</th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="{ type, side, unit, sideGroup, id, level } in items"
              :key="id"
            >
              <tr v-if="unit">
                <td class="flex items-center" :class="`pl-[${level * 1}rem]`">
                  <MilSymbol :sidc="unit.sidc" />
                  <span class="ml-2">{{ unit.name }}</span>
                </td>
                <td>{{ unit.name }}</td>
                <td>{{ unit.shortName }}</td>
              </tr>
              <tr v-else-if="side">
                <td colspan="=3" class="font-bold">{{ side.name }}</td>
              </tr>

              <tr v-else-if="sideGroup">
                <td colspan="=3" class="font-medium">{{ sideGroup.name }}</td>
              </tr>
            </template>
          </tbody>
        </table>
        <!-- Content goes here -->
      </div>
    </div>
    <main></main>
  </div>
</template>

<script setup lang="ts">
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import BaseButton from "@/components/BaseButton.vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import { computed, ref } from "vue";
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

const activeScenario = injectStrict(activeScenarioKey);
const {
  store: { state },
  unitActions,
} = activeScenario;

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
  state.sides.forEach((sideId) => {
    _items.push({ type: "side", side: state.sideMap[sideId], id: sideId });
    unitActions.walkSide(sideId, (unit, level, parent, sideGroup) => {
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
</script>
