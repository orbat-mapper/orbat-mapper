<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  dropTargetForExternal,
  monitorForExternal,
} from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { Trash2Icon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ScratchPadTreeNode from "@/views/texttoorbat/ScratchPadTreeNode.vue";
import type { Unit } from "@/types/scenarioModels";
import type { ParsedUnit } from "@/views/texttoorbat/textToOrbat.ts";

const props = defineProps<{
  modelValue: Unit[];
}>();

const emit = defineEmits<{
  "update:modelValue": [units: Unit[]];
}>();

const dropZoneRef = ref<HTMLElement | null>(null);
const isOverDropZone = ref(false);
let dndCleanup: () => void = () => {};

function unitToParsedUnit(unit: Unit, level = 0): ParsedUnit {
  return {
    id: unit.id,
    name: unit.name,
    shortName: unit.shortName,
    description: unit.description,
    sidc: unit.sidc,
    children: (unit.subUnits ?? []).map((c) => unitToParsedUnit(c, level + 1)),
    level,
  };
}

const parsedUnits = computed(() =>
  props.modelValue.map((unit) => unitToParsedUnit(unit)),
);

function handleClearAll() {
  emit("update:modelValue", []);
}

function handleDeleteUnit(unitId: string) {
  const tree = cloneTree(props.modelValue);
  removeUnit(tree, unitId);
  emit("update:modelValue", tree);
}

// --- Tree manipulation helpers ---

function cloneTree(units: Unit[]): Unit[] {
  return JSON.parse(JSON.stringify(units));
}

/** Find a unit and its parent's subUnits array + index */
function findUnit(units: Unit[], id: string): { list: Unit[]; index: number } | null {
  for (let i = 0; i < units.length; i++) {
    if (units[i].id === id) return { list: units, index: i };
    if (units[i].subUnits) {
      const found = findUnit(units[i].subUnits!, id);
      if (found) return found;
    }
  }
  return null;
}

/** Remove a unit from the tree and return it */
function removeUnit(units: Unit[], id: string): Unit | null {
  const found = findUnit(units, id);
  if (!found) return null;
  return found.list.splice(found.index, 1)[0];
}

/** Insert units relative to a target based on instruction type */
function applyInstruction(
  tree: Unit[],
  targetId: string,
  newUnits: Unit[],
  instructionType: string,
) {
  const target = findUnit(tree, targetId);
  if (!target) return;

  if (instructionType === "reorder-above") {
    target.list.splice(target.index, 0, ...newUnits);
  } else if (instructionType === "reorder-below") {
    target.list.splice(target.index + 1, 0, ...newUnits);
  } else if (instructionType === "make-child") {
    const targetUnit = target.list[target.index];
    if (!targetUnit.subUnits) targetUnit.subUnits = [];
    targetUnit.subUnits.push(...newUnits);
  }
}

function handleDrop(
  targetId: string,
  instructionType: string,
  sourceUnits: Unit[],
  sourceUnitId?: string,
) {
  const tree = cloneTree(props.modelValue);

  // If reordering within the scratch pad, remove the source first
  if (sourceUnitId) {
    removeUnit(tree, sourceUnitId);
  }

  applyInstruction(tree, targetId, sourceUnits, instructionType);
  emit("update:modelValue", tree);
}

function handleRootDrop(sourceUnits: Unit[], sourceUnitId?: string) {
  const tree = cloneTree(props.modelValue);

  if (sourceUnitId) {
    removeUnit(tree, sourceUnitId);
  }

  tree.push(...sourceUnits);
  emit("update:modelValue", tree);
}

function parseOrbatJson(raw: string): Unit[] | null {
  try {
    return JSON.parse(raw);
  } catch {
    console.error("Failed to parse dropped ORBAT data");
    return null;
  }
}

onMounted(() => {
  if (!dropZoneRef.value) return;

  dndCleanup = combine(
    // Root-level drop target (empty area / fallback when no tree node is hit)
    dropTargetForElements({
      element: dropZoneRef.value,
      canDrop: ({ source }) => source.data.type === "application/orbat",
      onDragEnter: () => (isOverDropZone.value = true),
      onDragLeave: () => (isOverDropZone.value = false),
      onDrop: () => (isOverDropZone.value = false),
    }),
    dropTargetForExternal({
      element: dropZoneRef.value,
      canDrop: ({ source }) => source.types.includes("application/orbat"),
      onDragEnter: () => (isOverDropZone.value = true),
      onDragLeave: () => (isOverDropZone.value = false),
      onDrop: () => (isOverDropZone.value = false),
    }),

    // Monitor for internal element drags (handles all drops on tree nodes + root)
    monitorForElements({
      canMonitor: ({ source }) => source.data.type === "application/orbat",
      onDrop: ({ location, source }) => {
        const targets = location.current.dropTargets;
        const raw = source.data.orbatJson;
        if (typeof raw !== "string") return;
        const units = parseOrbatJson(raw);
        if (!units) return;

        // Check if this is a scratch pad internal reorder
        const isScratchpadSource = source.data.sourceType === "scratchpad";
        const sourceUnitId = isScratchpadSource
          ? (source.data.unitId as string)
          : undefined;

        // Find the innermost tree-node drop target
        const treeTarget = targets.find((t) => t.data.type === "scratchpad-unit");

        if (treeTarget) {
          const instruction = extractInstruction(treeTarget.data);
          if (!instruction || instruction.type === "instruction-blocked") return;

          const targetId = treeTarget.data.unitId as string;
          handleDrop(targetId, instruction.type, units, sourceUnitId);
        } else {
          // Dropped on root area (no specific tree node)
          const rootTarget = targets.find((t) => t.element === dropZoneRef.value);
          if (!rootTarget) return;
          handleRootDrop(units, sourceUnitId);
        }
      },
    }),

    // Monitor for external drops (cross-tab)
    monitorForExternal({
      canMonitor: ({ source }) => source.types.includes("application/orbat"),
      onDrop: ({ location, source }) => {
        const targets = location.current.dropTargets;
        const raw = source.getStringData("application/orbat");
        if (!raw) return;
        const units = parseOrbatJson(raw);
        if (!units) return;

        const treeTarget = targets.find((t) => t.data.type === "scratchpad-unit");

        if (treeTarget) {
          const instruction = extractInstruction(treeTarget.data);
          if (!instruction || instruction.type === "instruction-blocked") return;

          const targetId = treeTarget.data.unitId as string;
          handleDrop(targetId, instruction.type, units);
        } else {
          const rootTarget = targets.find((t) => t.element === dropZoneRef.value);
          if (!rootTarget) return;
          handleRootDrop(units);
        }
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
      <div class="flex items-center gap-2">
        <h2 class="text-muted-foreground text-sm font-medium">Scratch Pad</h2>
        <span
          v-if="modelValue.length > 0"
          class="text-muted-foreground rounded bg-amber-500/20 px-1.5 py-0.5 text-xs"
        >
          {{ modelValue.length }}
        </span>
      </div>
      <Button
        v-if="modelValue.length > 0"
        variant="ghost"
        size="sm"
        @click="handleClearAll"
        title="Clear all saved units"
      >
        <Trash2Icon class="mr-1 size-4" />
        Clear
      </Button>
    </div>
    <div
      ref="dropZoneRef"
      class="flex-1 overflow-y-auto p-4 transition-colors"
      :class="{
        'border-primary bg-primary/5 border-2 border-dashed': isOverDropZone,
      }"
    >
      <div
        v-if="parsedUnits.length === 0 && !isOverDropZone"
        class="text-muted-foreground flex h-full items-center justify-center text-center text-sm"
      >
        <p>Drop units here to save them for later</p>
      </div>
      <ul v-else class="space-y-1">
        <ScratchPadTreeNode
          v-for="(unit, index) in parsedUnits"
          :key="unit.id"
          :unit="unit"
          :level="0"
          :last-in-group="index === parsedUnits.length - 1"
          @delete="handleDeleteUnit"
        />
      </ul>
    </div>
  </div>
</template>
