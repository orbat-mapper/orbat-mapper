<script setup lang="ts">
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import {
  attachInstruction,
  extractInstruction,
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import type { Input } from "@atlaskit/pragmatic-drag-and-drop/types";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { CircleXIcon } from "lucide-vue-next";
import MilSymbol from "@/components/NewMilitarySymbol.vue";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import {
  ECHELON_CODE_TO_NAME,
  ICON_CODE_TO_NAME,
  serializeParsedUnitToScenarioUnit,
} from "@/views/texttoorbat/textToOrbat.ts";

interface ParsedUnit {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  sidc: string;
  children: ParsedUnit[];
  level: number;
}

const props = defineProps<{
  unit: ParsedUnit;
  level?: number;
  lastInGroup?: boolean;
  showDebug?: boolean;
}>();

const emit = defineEmits<{
  delete: [unitId: string];
}>();

const level = computed(() => props.level ?? 0);

const itemRef = ref<HTMLElement | null>(null);
const dragHandleRef = ref<HTMLElement | null>(null);
const instruction = ref<Instruction | null>(null);
const isDragged = ref(false);
let dndCleanup: () => void = () => {};

const echelonCode = computed(() => props.unit.sidc.substring(8, 10));
const entityCode = computed(() => props.unit.sidc.substring(10, 20));

const echelonVarName = computed(() => {
  return ECHELON_CODE_TO_NAME[echelonCode.value] ?? echelonCode.value;
});

const entityVarName = computed(() => {
  return ICON_CODE_TO_NAME[entityCode.value] ?? entityCode.value;
});

const hasChildren = computed(() => props.unit.children.length > 0);

function getInstructionConfig(input: { input: Input; element: Element }) {
  return attachInstruction(
    { type: "scratchpad-unit", unitId: props.unit.id },
    {
      ...input,
      currentLevel: level.value,
      indentPerLevel: 24,
      block: ["reparent"],
      mode: hasChildren.value
        ? "expanded"
        : props.lastInGroup
          ? "last-in-group"
          : "standard",
    },
  );
}

onMounted(() => {
  if (!itemRef.value || !dragHandleRef.value) return;

  dndCleanup = combine(
    draggable({
      element: dragHandleRef.value,
      getInitialData: () => {
        const serializedUnit = serializeParsedUnitToScenarioUnit(props.unit);
        return {
          type: "application/orbat",
          sourceType: "scratchpad",
          unitId: props.unit.id,
          orbatJson: JSON.stringify([serializedUnit]),
        };
      },
      getInitialDataForExternal: () => {
        const serializedUnit = serializeParsedUnitToScenarioUnit(props.unit);
        return {
          "application/orbat": JSON.stringify([serializedUnit]),
          "text/plain": JSON.stringify([serializedUnit]),
        };
      },
      onDragStart: () => (isDragged.value = true),
      onDrop: () => (isDragged.value = false),
    }),

    dropTargetForElements({
      element: itemRef.value,
      canDrop: ({ source }) => {
        if (source.data.type !== "application/orbat") return false;
        // Don't drop on yourself
        if (source.data.unitId === props.unit.id) return false;
        return true;
      },
      getData: ({ input, element }) => getInstructionConfig({ input, element }),
      onDrag: (args) => {
        instruction.value = extractInstruction(args.self.data);
      },
      onDragLeave: () => {
        instruction.value = null;
      },
      onDrop: () => {
        instruction.value = null;
      },
    }),

    dropTargetForExternal({
      element: itemRef.value,
      canDrop: ({ source }) => source.types.includes("application/orbat"),
      getData: ({ input, element }) => getInstructionConfig({ input, element }),
      onDrag: (args) => {
        instruction.value = extractInstruction(args.self.data);
      },
      onDragLeave: () => {
        instruction.value = null;
      },
      onDrop: () => {
        instruction.value = null;
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});
</script>

<template>
  <li>
    <div
      ref="itemRef"
      class="group/node hover:bg-muted/50 relative flex items-center gap-2 rounded px-2 py-1"
      :class="{ 'opacity-30': isDragged }"
    >
      <span
        ref="dragHandleRef"
        class="cursor-grab active:cursor-grabbing"
        title="Drag unit"
      >
        <MilSymbol
          :sidc="unit.sidc"
          :size="24"
          :options="{ outlineColor: 'white', outlineWidth: 8 }"
        />
      </span>
      <div class="flex min-w-0 flex-1 flex-col">
        <span class="text-sm">{{ unit.name }}</span>
        <span v-if="unit.shortName" class="text-muted-foreground text-xs">{{
          unit.shortName
        }}</span>
        <span v-if="unit.description" class="text-muted-foreground text-xs italic">{{
          unit.description
        }}</span>
      </div>
      <span v-if="showDebug" class="font-mono text-xs text-amber-600 dark:text-amber-400">
        [{{ echelonVarName }} | {{ entityVarName }}]
      </span>
      <button
        class="shrink-0 opacity-0 transition-opacity group-hover/node:opacity-100"
        title="Remove unit"
        @click="emit('delete', unit.id)"
      >
        <CircleXIcon class="text-muted-foreground hover:text-destructive size-4" />
      </button>
      <TreeDropIndicator v-if="instruction" :instruction="instruction" />
    </div>
    <ul v-if="unit.children.length > 0" class="mt-1 ml-6 space-y-1 border-l pl-2">
      <ScratchPadTreeNode
        v-for="(child, index) in unit.children"
        :key="child.id"
        :unit="child"
        :level="level + 1"
        :last-in-group="index === unit.children.length - 1"
        :show-debug="showDebug"
        @delete="emit('delete', $event)"
      />
    </ul>
  </li>
</template>
