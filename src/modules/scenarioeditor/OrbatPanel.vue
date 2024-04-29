<template>
  <div class="space-y-4">
    <slot name="header"></slot>
    <OrbatSide
      v-for="side in sides"
      :key="side.id"
      :side="side"
      @unit-action="onUnitAction"
      @unit-click="onUnitClick"
      @unit-drop="onUnitDrop"
      @side-action="onSideAction"
      :hide-filter="hideFilter"
    />
    <OrbatPanelAddSide
      v-if="sides.length < 2"
      :simple="sides.length >= 1"
      class="mt-8"
      @add="addSide()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import OrbatPanelAddSide from "@/components/OrbatPanelAddSide.vue";
import { injectStrict } from "@/utils";
import { activeParentKey, activeScenarioKey } from "@/components/injects";
import OrbatSide from "@/components/OrbatSide.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { SideAction, SideActions } from "@/types/constants";
import { DropTarget } from "@/components/types";
import { useUnitActions } from "@/composables/scenarioActions";
import { useEventBus, useEventListener } from "@vueuse/core";
import { orbatUnitClick } from "@/components/eventKeys";
import { useSelectedItems } from "@/stores/selectedStore";
import { inputEventFilter } from "@/components/helpers";
import { serializeUnit } from "@/scenariostore/io";
import {
  addUnitHierarchy,
  orbatToText,
  parseApplicationOrbat,
} from "@/importexport/convertUtils";
import { EntityId } from "@/types/base";

interface Props {
  hideFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), { hideFilter: false });
const activeScenario = injectStrict(activeScenarioKey);
const { store, unitActions, io } = activeScenario;
const activeParentId = injectStrict(activeParentKey);

const { state } = store;
const { changeUnitParent, addSide } = unitActions;
const bus = useEventBus(orbatUnitClick);

useEventListener(document, "paste", onPaste);
useEventListener(document, "copy", onCopy);
const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const { onUnitAction } = useUnitActions();
const { selectedUnitIds, activeUnitId } = useSelectedItems();

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget,
) {
  changeUnitParent(unit.id, destinationUnit.id, target);
}

function onUnitClick(unit: NUnit, event: MouseEvent) {
  const ids = selectedUnitIds.value;
  if (event.shiftKey) {
    const selectedIds = calculateSelectedUnitIds(unit.id);
    selectedIds.forEach((id) => {
      ids.add(id);
    });
  } else if (event.ctrlKey || event.metaKey) {
    if (ids.has(unit.id)) {
      ids.delete(unit.id);
    } else {
      ids.add(unit.id);
    }
  } else {
    activeUnitId.value = unit.id;
    activeParentId.value = unit.id;
  }
  bus.emit(unit);
}

function calculateSelectedUnitIds(newUnitId: EntityId): EntityId[] {
  const lastSelectedId = [...selectedUnitIds.value].pop();
  if (lastSelectedId === undefined) return [newUnitId];
  const allOpenUnits: EntityId[] = [];
  for (const side of state.sides) {
    unitActions.walkSide(side, (unit) => {
      allOpenUnits.push(unit.id);
      if (!unit._isOpen) return false;
    });
  }
  const lastSelectedIndex = allOpenUnits.indexOf(lastSelectedId);
  const newUnitIndex = allOpenUnits.indexOf(newUnitId);
  if (lastSelectedIndex === -1 || newUnitIndex === -1) return [newUnitId];
  return allOpenUnits.slice(
    Math.min(lastSelectedIndex, newUnitIndex),
    Math.max(lastSelectedIndex, newUnitIndex) + 1,
  );
}

function onSideAction(side: NSide, action: SideAction) {
  if (action === SideActions.Delete) {
    unitActions.deleteSide(side.id);
  } else if (action === SideActions.MoveDown) {
    unitActions.reorderSide(side.id, "down");
  } else if (action === SideActions.MoveUp) {
    unitActions.reorderSide(side.id, "up");
  } else if (action === SideActions.Add) {
    addSide();
  }
}

function getUnitIdFromElement(element: Element | null | undefined): string | undefined {
  if (element?.tagName == "LI" && element?.id.startsWith("ou-")) {
    return element.id.slice(3);
  }
}

function onCopy(c: ClipboardEvent) {
  if (!inputEventFilter(c)) return;

  const target = document.activeElement as HTMLElement;
  const unitId = getUnitIdFromElement(target.closest('li[id^="ou-"]'));

  // only copy if an ORBAT item has focus
  if (!unitId) return;

  const serializedUnits = [...selectedUnitIds.value].map((id) =>
    serializeUnit(id, state, { newId: true }),
  );
  c.clipboardData?.setData("application/orbat", io.stringifyObject(serializedUnits));

  const txt = serializedUnits.map((unit) => orbatToText(unit).join("")).join("");
  c.clipboardData?.setData("text/plain", txt);

  c.preventDefault();
}

function onPaste(e: ClipboardEvent) {
  if (!inputEventFilter(e)) return;
  const target = document.activeElement as HTMLElement;

  const parentId = getUnitIdFromElement(target.closest('li[id^="ou-"]'));
  // only paste if an ORBAT item has focus
  if (!parentId || !e.clipboardData?.types.includes("application/orbat")) return;
  const pastedOrbat = parseApplicationOrbat(
    e.clipboardData?.getData("application/orbat"),
  );
  pastedOrbat?.forEach((unit) => addUnitHierarchy(unit, parentId, activeScenario));
  unitActions.getUnitById(parentId)._isOpen = true;

  e.preventDefault();
}
</script>
