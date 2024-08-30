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
import { computed, watch } from "vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { EntityId } from "@/types/base";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useActiveUnitStore } from "@/stores/dragStore";

const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);

const { activeParentId, activeUnitId, resetActiveParent } = useActiveUnitStore();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const sides = computed(() => {
  return state.sides.map((side) => state.getSideById(side));
});

const activeParent = computed(
  () =>
    (activeParentId.value &&
      state.getUnitById(activeParentId.value) &&
      unitActions.expandUnitWithSymbolOptions(state.getUnitById(activeParentId.value))) ||
    null,
);

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

type BreadcrumbItem = {
  name: string;
  items?: ((NSide | NSideGroup | NUnit) & {
    symbolOptions: Record<string, any>;
    sidc: string;
  })[];
  id?: EntityId;
  sidc?: string;
  symbolOptions?: Record<string, any>;
};

const breadcrumbItems = computed((): BreadcrumbItem[] => {
  if (!activeParentId.value) return [];
  const { side, sideGroup, parents } = unitActions.getUnitHierarchy(
    activeParentId.value!,
  );

  parents.push(activeParent.value! as unknown as NUnit);

  try {
    const parentsWithItems = parents.map((uunit) => {
      const parent = state.getUnitById(uunit._pid) ?? state.getSideGroupById(uunit._pid);
      if (!parent) return { name: uunit.name, items: [] };
      return {
        name: uunit.shortName || uunit.name,
        sidc: uunit.sidc || "",
        id: uunit.id,
        symbolOptions: unitActions.getCombinedSymbolOptions(uunit),
        items: parent.subUnits.map((unitId) => ({
          ...state.getUnitById(unitId),
          symbolOptions: unitActions.getCombinedSymbolOptions(state.getUnitById(unitId)),
        })),
      };
    });

    const sideGroups = side.groups.map((group) => state.getSideGroupById(group));
    const res = [
      {
        name: isMobile.value ? "S" : side.name,
        items: sides.value,
        id: side.id,
        sidc: "",
      },
      {
        name: isMobile.value ? "G" : sideGroup.name,
        items: sideGroups,
        id: sideGroup.id,
        sidc: "",
      },
      ...parentsWithItems,
    ];
    if (activeParent.value?.subUnits?.length) {
      res.push({
        sidc: "",
        id: activeUnitId.value!,
        name: "...",
        items: activeParent.value?.subUnits?.map((unit) => {
          return {
            ...state.getUnitById(unit.id),
            symbolOptions: unitActions.getCombinedSymbolOptions(unit as any),
          };
        }),
      });
    }
    return res as BreadcrumbItem[];
  } catch (e) {
    resetActiveParent();
    return [];
  }
});

function onItemClick(entityId: EntityId) {
  let unit = state.getUnitById(entityId);
  const { side, sideGroup, parents } = unitActions.getUnitHierarchy(entityId);

  if (!unit) {
    let id;
    if (sideGroup) {
      id = sideGroup.subUnits[0];
    } else if (side) {
      id = side.groups[0];
    } else {
      const side = state.getSideById(entityId);
      const sideGroup = state.getSideGroupById(side.groups[0]);
      id = sideGroup?.subUnits[0];
    }
    unit = state.getUnitById(id);
  }

  if (unit) {
    activeParentId.value = unit.id;
    activeUnitId.value = unit.id;
    return;
  }

  console.log(side, sideGroup, parents);
}
</script>

<template>
  <ScrollArea class="flex border-b bg-gray-50 p-4 sm:p-3">
    <div class="sm:flex sm:items-center sm:justify-center">
      <Breadcrumb class="w-max">
        <BreadcrumbList>
          <template v-for="(item, index) in breadcrumbItems">
            <BreadcrumbItem class="text-gray-800">
              <DropdownMenu v-if="(item.items?.length ?? 0) >= 1">
                <DropdownMenuTrigger class="flex items-center gap-1">
                  <div class="flex h-6 items-center overflow-clip">
                    <MilitarySymbol
                      v-if="item.sidc"
                      :sidc="item.sidc"
                      :options="item.symbolOptions ?? {}"
                      :size="15"
                      class="w-7"
                    />
                    <span class="">{{ item.name }}</span>
                  </div>
                  <ChevronDown class="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    v-for="subItem in item.items"
                    :key="subItem.id"
                    @select="onItemClick(subItem.id)"
                  >
                    <div class="flex items-center">
                      <span v-if="subItem.sidc" class="flex w-7 items-center">
                        <MilitarySymbol
                          :sidc="subItem.sidc"
                          :options="subItem.symbolOptions" /></span
                      ><span :class="[item.id === subItem.id ? 'font-semibold' : '']">{{
                        subItem.name
                      }}</span>
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
