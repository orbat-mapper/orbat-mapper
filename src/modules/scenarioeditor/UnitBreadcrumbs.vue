<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-vue-next";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import MilitarySymbol from "@/components/NewMilitarySymbol.vue";
import type { NUnit } from "@/types/internalModels";
import type { EntityId } from "@/types/base";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useActiveUnitStore } from "@/stores/dragStore";
import CloseButton from "@/components/CloseButton.vue";
import { useUiStore } from "@/stores/uiStore";
import UnitBreadcrumbItem from "@/modules/scenarioeditor/UnitBreadcrumbItem.vue";
import type { BreadcrumbItemType } from "@/modules/scenarioeditor/types";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { isUnitDragItem } from "@/types/draggables";

const {
  unitActions,
  store: { state },
  helpers: { getUnitById, getSideById, getSideGroupById },
} = injectStrict(activeScenarioKey);

const { activeParentId, activeUnitId, resetActiveParent, activeParent } =
  useActiveUnitStore();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");
const uiSettings = useUiStore();

let isDragged = ref(false);

const sides = computed(() => {
  return state.sides.map((side) => getSideById(side));
});

watch(
  activeUnitId,
  (value, oldValue) => {
    if (value) {
      activeParentId.value = value;
    } else {
      activeParentId.value = activeParent.value?._pid;
    }
  },
  { flush: "sync" },
);

const breadcrumbItems = computed((): BreadcrumbItemType[] => {
  if (!activeParentId.value) return [];
  const { side, sideGroup, parents } = unitActions.getUnitHierarchy(
    activeParentId.value!,
  );

  parents.push(activeParent.value! as unknown as NUnit);

  try {
    const parentsWithItems = parents.map((uunit) => {
      const parent =
        getUnitById(uunit._pid) ??
        getSideGroupById(uunit._pid) ??
        getSideById(uunit._pid);
      if (!parent) return { name: uunit.name, items: [] };
      return {
        name: uunit.shortName || uunit.name,
        sidc: uunit.sidc || "",
        location: Boolean(uunit._state?.location),
        id: uunit.id,
        symbolOptions: unitActions.getCombinedSymbolOptions(uunit),
        items: parent.subUnits.map((unitId) => ({
          ...getUnitById(unitId),
          symbolOptions: unitActions.getCombinedSymbolOptions(getUnitById(unitId)),
          location: Boolean(uunit._state?.location),
        })),
      };
    });

    const sideGroups = side.groups.map((group) => getSideGroupById(group));
    const res = [
      {
        name: isMobile.value ? side.name.slice(0, 2) : side.name,
        items: sides.value,
        id: side.id,
        sidc: "",
      },
      sideGroup
        ? {
            name: isMobile.value ? sideGroup.name.slice(0, 2) : sideGroup.name,
            items: sideGroups,
            id: sideGroup.id,
            sidc: "",
          }
        : null,
      ...parentsWithItems,
    ].filter((i) => i !== null);
    if (activeParent.value?.subUnits?.length) {
      res.push({
        sidc: "",
        id: activeUnitId.value!,
        name: "...",
        items: activeParent.value?.subUnits?.map((unitId) => {
          const unit = getUnitById(unitId);
          return {
            ...getUnitById(unit.id),
            symbolOptions: unitActions.getCombinedSymbolOptions(unit as any),
            location: Boolean(unit._state?.location),
          };
        }),
      });
    }
    return res as BreadcrumbItemType[];
  } catch (e) {
    resetActiveParent();
    return [];
  }
});

function onItemClick(entityId: EntityId) {
  let unit = getUnitById(entityId);
  const { side, sideGroup, parents } = unitActions.getUnitHierarchy(entityId);

  if (!unit) {
    let id;
    if (sideGroup) {
      id = sideGroup.subUnits[0];
    } else {
      const sideGroup = getSideGroupById(side.groups[0]);
      id = side?.subUnits[0] ?? sideGroup?.subUnits[0];
    }
    unit = getUnitById(id);
  }

  if (unit) {
    activeParentId.value = unit.id;
    activeUnitId.value = unit.id;
    return;
  }
}

let cleanup = () => {};

onMounted(() => {
  cleanup = monitorForElements({
    canMonitor: ({ source }) =>
      isUnitDragItem(source.data) && source.data.source === "breadcrumbs",
    onDragStart: () => (isDragged.value = true),
    onDrop: () => (isDragged.value = false),
  });
});

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <ScrollArea
    class="relative flex border-b p-4 sm:p-3"
    :class="isDragged ? 'bg-gray-200' : 'bg-sidebar'"
  >
    <CloseButton
      @click="uiSettings.showOrbatBreadcrumbs = false"
      class="absolute top-2 right-2 hidden sm:block"
    />
    <div class="sm:flex sm:items-center sm:justify-center">
      <Breadcrumb class="w-max">
        <BreadcrumbList>
          <template v-for="(item, index) in breadcrumbItems">
            <BreadcrumbItem class="text-primary">
              <DropdownMenu v-if="(item.items?.length ?? 0) >= 1">
                <DropdownMenuTrigger class="flex items-center gap-1">
                  <UnitBreadcrumbItem :item="item" :key="item.id" />
                  <ChevronDown class="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    v-for="subItem in item.items"
                    :key="subItem.id"
                    @select="onItemClick(subItem.id)"
                  >
                    <div class="text-primary flex items-center">
                      <span v-if="subItem.sidc" class="mr-1.5 flex w-7 items-center">
                        <MilitarySymbol
                          :sidc="subItem.sidc"
                          :options="{
                            ...subItem.symbolOptions,
                            outlineWidth: 8,
                          }" /></span
                      ><span :class="[item.id === subItem.id ? 'font-semibold' : '']">{{
                        subItem.name
                      }}</span
                      ><span v-if="subItem.location" class="text-red-700">&deg;</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span v-else>{{ item.name }}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</template>
