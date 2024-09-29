<template>
  <div class="space-y-4 pt-2">
    <slot name="header" />
    <OrbatSide
      v-for="side in sides"
      :key="side.id"
      :side="side"
      @unit-action="onUnitAction"
      @unit-click="onUnitClick"
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
import { computed, nextTick, onMounted, onUnmounted } from "vue";
import OrbatPanelAddSide from "@/components/OrbatPanelAddSide.vue";
import { injectStrict, triggerPostMoveFlash } from "@/utils";
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
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { isSideDragItem, isSideGroupDragItem, isUnitDragItem } from "@/types/draggables";

import {
  extractInstruction,
  Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

interface Props {
  hideFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), { hideFilter: false });
const activeScenario = injectStrict(activeScenarioKey);
const { store, unitActions, io, time } = activeScenario;
const activeParentId = injectStrict(activeParentKey);

const { state, groupUpdate } = store;
const { changeUnitParent, addSide } = unitActions;
const bus = useEventBus(orbatUnitClick);

useEventListener(document, "paste", onPaste);
useEventListener(document, "copy", onCopy);
const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const { onUnitAction } = useUnitActions();
const { selectedUnitIds, activeUnitId } = useSelectedItems();

let dndCleanup: () => void = () => {};
onMounted(() => {
  dndCleanup = monitorForElements({
    canMonitor: ({ source }) =>
      isUnitDragItem(source.data) ||
      isSideGroupDragItem(source.data) ||
      isSideDragItem(source.data),
    onDrop: ({ source, location }) => {
      const destination = location.current.dropTargets[0];
      if (!destination) {
        return;
      }
      const instruction = extractInstruction(destination.data);
      const sourceData = source.data;
      const destinationData = destination.data;
      if (!instruction) return;
      const isDuplicateAction =
        location.initial.input.ctrlKey || location.initial.input.metaKey;
      const isDuplicateState = isDuplicateAction && location.initial.input.altKey;
      if (isUnitDragItem(sourceData) && !isSideDragItem(destinationData)) {
        const target = mapInstructionToTarget(instruction);
        if (isUnitDragItem(destinationData)) {
          onUnitDrop(sourceData.unit, destinationData.unit, target, {
            isDuplicateAction,
            isDuplicateState,
          });
          if (instruction.type === "make-child") {
            destinationData.unit._isOpen = true;
          }
        } else if (isSideGroupDragItem(destinationData)) {
          onUnitDrop(sourceData.unit, destinationData.sideGroup, target, {
            isDuplicateAction,
            isDuplicateState,
          });
        }
        const unitId = sourceData.unit.id;
        nextTick(() => {
          const el = document.getElementById(`ou-${unitId}`);
          if (el) {
            triggerPostMoveFlash(el);
          }
        });
      } else if (isSideGroupDragItem(sourceData)) {
        const target = mapInstructionToTarget(instruction);
        if (isSideGroupDragItem(destinationData)) {
          unitActions.changeSideGroupParent(
            sourceData.sideGroup.id,
            destinationData.sideGroup.id,
            target,
          );
          nextTick(() => {
            const el = document.getElementById(`osg-${sourceData.sideGroup.id}`);
            if (el) {
              triggerPostMoveFlash(el);
            }
          });
        } else if (isSideDragItem(destinationData)) {
          unitActions.changeSideGroupParent(
            sourceData.sideGroup.id,
            destinationData.side.id,
            "on",
          );
          nextTick(() => {
            const el = document.getElementById(`os-${sourceData.sideGroup.id}`);
            if (el) {
              triggerPostMoveFlash(el);
            }
          });
        }
      } else if (isSideDragItem(sourceData)) {
        const target = mapInstructionToTarget(instruction);
        if (isSideDragItem(destinationData)) {
          unitActions.moveSide(sourceData.side.id, destinationData.side.id, target);
          nextTick(() => {
            const el = document.getElementById(`os-${sourceData.side.id}`);
            if (el) {
              triggerPostMoveFlash(el);
            }
          });
        }
      }
    },
  });
});

onUnmounted(() => {
  dndCleanup();
});

function mapInstructionToTarget(instruction: Instruction): DropTarget {
  if (instruction.type === "make-child") {
    return "on";
  } else if (instruction.type === "reorder-above") {
    return "above";
  } else {
    return "below";
  }
}

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget,

  options: { isDuplicateAction?: boolean; isDuplicateState?: boolean } = {},
) {
  const isDuplicateAction = options.isDuplicateAction ?? false;
  const isDuplicateState = options.isDuplicateState ?? false;
  groupUpdate(() => {
    let unitId = unit.id;
    if (isDuplicateAction) {
      unitId = unitActions.cloneUnit(unit.id, {
        includeSubordinates: true,
        includeState: isDuplicateState,
      })!;
    }
    changeUnitParent(unitId, destinationUnit.id, target);
  });
  if (isDuplicateState) {
    time.setCurrentTime(state.currentTime);
  }
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
  } else if (action === SideActions.Lock) {
    unitActions.updateSide(side.id, { locked: true }, { noUndo: true });
  } else if (action === SideActions.Unlock) {
    unitActions.updateSide(side.id, { locked: false }, { noUndo: true });
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
