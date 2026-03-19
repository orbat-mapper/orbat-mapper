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
import { useRouter } from "vue-router";
import { Redo2Icon, Trash2Icon, Undo2Icon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import SplitButton from "@/components/SplitButton.vue";
import type { ButtonGroupItem } from "@/components/types";
import ScratchPadTreeNode from "@/views/texttoorbat/ScratchPadTreeNode.vue";
import type { Unit } from "@/types/scenarioModels";
import type { ParsedUnit } from "@/views/texttoorbat/textToOrbat.ts";
import {
  convertParsedUnitsToOrbatMapperScenario,
  convertParsedUnitsToSpatialIllusions,
  serializeParsedUnitsToScenarioUnits,
} from "@/views/texttoorbat/textToOrbat.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MilSymbol from "@/components/MilSymbol.vue";
import { setSid } from "@/symbology/helpers";
import { useLocalStorage } from "@vueuse/core";
import { useNotifications } from "@/composables/notifications";
import { saveBlobToLocalFile } from "@/utils/files";
import { useScenario } from "@/scenariostore";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { useIndexedDb } from "@/scenariostore/localdb";

const sidItems = [
  { code: "3", text: "Friend", sidc: "10031000000000000000" },
  { code: "6", text: "Hostile", sidc: "10061000000000000000" },
  { code: "4", text: "Neutral", sidc: "10041000000000000000" },
  { code: "1", text: "Unknown", sidc: "10011000000000000000" },
];

const props = defineProps<{
  modelValue: Unit[];
}>();

const emit = defineEmits<{
  "update:modelValue": [units: Unit[]];
}>();

const standardIdentity = useLocalStorage("scratchPadSI", "3");

const dropZoneRef = ref<HTMLElement | null>(null);
const isOverDropZone = ref(false);
let dndCleanup: () => void = () => {};

// --- Undo/Redo ---

const undoStack = ref<Unit[][]>([]);
const redoStack = ref<Unit[][]>([]);
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

function commitChange(newValue: Unit[]) {
  undoStack.value.push(cloneTree(props.modelValue));
  redoStack.value = [];
  emit("update:modelValue", newValue);
}

function undo() {
  if (!canUndo.value) return;
  redoStack.value.push(cloneTree(props.modelValue));
  emit("update:modelValue", undoStack.value.pop()!);
}

function redo() {
  if (!canRedo.value) return;
  undoStack.value.push(cloneTree(props.modelValue));
  emit("update:modelValue", redoStack.value.pop()!);
}

function handleKeydown(event: KeyboardEvent) {
  const mod = event.metaKey || event.ctrlKey;
  if (!mod || event.key.toLowerCase() !== "z") return;

  if (event.shiftKey) {
    if (canRedo.value) {
      event.preventDefault();
      event.stopPropagation();
      redo();
    }
  } else {
    if (canUndo.value) {
      event.preventDefault();
      event.stopPropagation();
      undo();
    }
  }
}

function unitToParsedUnit(unit: Unit, level = 0): ParsedUnit {
  return {
    id: unit.id,
    name: unit.name,
    shortName: unit.shortName,
    description: unit.description,
    sidc: setSid(unit.sidc, standardIdentity.value),
    children: (unit.subUnits ?? []).map((c) => unitToParsedUnit(c, level + 1)),
    level,
  };
}

const parsedUnits = computed(() =>
  props.modelValue.map((unit) => unitToParsedUnit(unit)),
);

const { send: sendNotification } = useNotifications();
const router = useRouter();
const { scenario } = useScenario();
const isOpeningScenario = ref(false);
const isCopyingToClipboard = ref(false);
const isEmpty = computed(() => props.modelValue.length === 0);

async function handleOpenScenario() {
  if (isEmpty.value || isOpeningScenario.value) return;
  isOpeningScenario.value = true;
  try {
    const payload = convertParsedUnitsToOrbatMapperScenario(
      parsedUnits.value,
      standardIdentity.value,
    );
    scenario.value.io.loadFromObject(payload);
    scenario.value.store.clearUndoRedoStack?.();
    const { addScenario } = await useIndexedDb();
    const storedScenario = scenario.value.io.serializeToObject();
    const scenarioId = await addScenario(storedScenario, storedScenario.id);
    await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
    sendNotification({ message: "Scenario opened in editor" });
  } catch (error) {
    sendNotification({ message: "Failed to open scenario", type: "error" });
    console.error(error);
  } finally {
    isOpeningScenario.value = false;
  }
}

async function handleCopyToClipboard() {
  if (isEmpty.value || isCopyingToClipboard.value) return;
  isCopyingToClipboard.value = true;
  try {
    const serializedJson = JSON.stringify(
      serializeParsedUnitsToScenarioUnits(parsedUnits.value),
    );
    if (
      typeof ClipboardItem !== "undefined" &&
      typeof navigator.clipboard?.write === "function"
    ) {
      const clipboardItem = new ClipboardItem({
        "text/plain": new Blob([serializedJson], { type: "text/plain" }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } else if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(serializedJson);
    } else {
      throw new Error("Clipboard API unavailable");
    }
    sendNotification({ message: "ORBAT copied to clipboard" });
  } catch (error) {
    sendNotification({ message: "Failed to copy ORBAT to clipboard", type: "error" });
    console.error(error);
  } finally {
    isCopyingToClipboard.value = false;
  }
}

async function handleExportSpatialIllusions() {
  if (isEmpty.value) return;
  try {
    const payload = convertParsedUnitsToSpatialIllusions(parsedUnits.value);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    await saveBlobToLocalFile(blob, "spatial-illusions-orbat.json", {
      mimeTypes: ["application/json"],
      extensions: [".json"],
    });
    sendNotification({ message: "Spatial Illusions JSON ready for download" });
  } catch (error) {
    sendNotification({
      message: "Failed to download Spatial Illusions JSON",
      type: "error",
    });
    console.error(error);
  }
}

async function handleExportOrbatMapper() {
  if (isEmpty.value) return;
  try {
    const payload = convertParsedUnitsToOrbatMapperScenario(
      parsedUnits.value,
      standardIdentity.value,
    );
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    await saveBlobToLocalFile(blob, "orbat-mapper-scenario.json", {
      mimeTypes: ["application/json"],
      extensions: [".json"],
    });
    sendNotification({ message: "ORBAT Mapper scenario ready for download" });
  } catch (error) {
    sendNotification({
      message: "Failed to download ORBAT Mapper scenario",
      type: "error",
    });
    console.error(error);
  }
}

const splitButtonItems = computed<ButtonGroupItem[]>(() => [
  {
    label: "Open scenario",
    onClick: handleOpenScenario,
    disabled: isEmpty.value || isOpeningScenario.value,
  },
  {
    label: "Copy to clipboard",
    onClick: handleCopyToClipboard,
    disabled: isEmpty.value || isCopyingToClipboard.value,
  },
  {
    label: "Export to Battle Staff Tools",
    onClick: handleExportSpatialIllusions,
    disabled: isEmpty.value,
  },
  {
    label: "Export as ORBAT Mapper Scenario",
    onClick: handleExportOrbatMapper,
    disabled: isEmpty.value,
  },
]);

function handleClearAll() {
  commitChange([]);
}

function handleDeleteUnit(unitId: string) {
  const tree = cloneTree(props.modelValue);
  removeUnit(tree, unitId);
  commitChange(tree);
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

/** Check if targetId is a descendant of the unit with ancestorId */
function isDescendant(units: Unit[], ancestorId: string, targetId: string): boolean {
  const found = findUnit(units, ancestorId);
  if (!found) return false;
  const ancestor = found.list[found.index];
  return !!findUnit(ancestor.subUnits ?? [], targetId);
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
  // Don't allow dropping a unit onto itself or its own descendants
  if (sourceUnitId) {
    if (sourceUnitId === targetId) return;
    if (isDescendant(props.modelValue, sourceUnitId, targetId)) return;
  }

  const tree = cloneTree(props.modelValue);

  // If reordering within the scratch pad, remove the source first
  if (sourceUnitId) {
    removeUnit(tree, sourceUnitId);
  }

  applyInstruction(tree, targetId, sourceUnits, instructionType);
  commitChange(tree);
}

function handleRootDrop(sourceUnits: Unit[], sourceUnitId?: string) {
  const tree = cloneTree(props.modelValue);

  if (sourceUnitId) {
    removeUnit(tree, sourceUnitId);
  }

  tree.push(...sourceUnits);
  commitChange(tree);
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
  <div
    class="flex h-full flex-col overflow-hidden outline-none"
    tabindex="-1"
    @keydown="handleKeydown"
  >
    <div
      class="bg-muted/50 flex items-center justify-between gap-4 overflow-x-auto border-b px-4 py-2"
    >
      <div class="flex shrink-0 items-center gap-2">
        <h2 class="text-muted-foreground text-sm font-medium">Scratch Pad</h2>
        <span
          v-if="modelValue.length > 0"
          class="text-muted-foreground rounded bg-amber-500/20 px-1.5 py-0.5 text-xs"
        >
          {{ modelValue.length }}
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <Select v-model="standardIdentity">
          <SelectTrigger class="h-7 w-auto gap-1 text-xs">
            <div class="flex items-center gap-1">
              <MilSymbol
                :sidc="'100' + standardIdentity + '1000000000000000'"
                :size="16"
                :modifiers="{ outlineColor: 'white', outlineWidth: 4 }"
              />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="sid in sidItems" :key="sid.code" :value="sid.code">
              <div class="flex items-center gap-2">
                <MilSymbol
                  :sidc="sid.sidc"
                  :size="20"
                  :modifiers="{ outlineColor: 'white', outlineWidth: 4 }"
                />
                <span>{{ sid.text }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <SplitButton :items="splitButtonItems" static />
        <Button
          variant="ghost"
          size="icon"
          class="size-7"
          :disabled="!canUndo"
          title="Undo (Ctrl+Z)"
          @click="undo"
        >
          <Undo2Icon class="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-7"
          :disabled="!canRedo"
          title="Redo (Ctrl+Shift+Z)"
          @click="redo"
        >
          <Redo2Icon class="size-4" />
        </Button>
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
