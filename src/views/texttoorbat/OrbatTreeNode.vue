<script setup lang="ts">
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { computed, onMounted, onUnmounted, ref } from "vue";
import MilSymbol from "@/components/NewMilitarySymbol.vue";
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
  showDebug?: boolean;
}>();

const dragHandleRef = ref<HTMLElement | null>(null);
let dndCleanup: () => void = () => {};

// Map echelon codes (from SIDC positions 8-9) to labels
const echelonCodeLabels: Record<string, string> = {
  "00": "Unspecified",
  "11": "Team/Crew",
  "12": "Squad",
  "13": "Section",
  "14": "Platoon",
  "15": "Company",
  "16": "Battalion",
  "17": "Regiment",
  "18": "Brigade",
  "21": "Division",
  "22": "Corps",
  "23": "Army",
  "24": "Army Group",
  "25": "Region",
  "26": "Command",
};

const echelonCode = computed(() => props.unit.sidc.substring(8, 10));
const entityCode = computed(() => props.unit.sidc.substring(10, 20));

const echelonLabel = computed(() => {
  return echelonCodeLabels[echelonCode.value] ?? "Unit";
});

const echelonVarName = computed(() => {
  return ECHELON_CODE_TO_NAME[echelonCode.value] ?? echelonCode.value;
});

const entityVarName = computed(() => {
  return ICON_CODE_TO_NAME[entityCode.value] ?? entityCode.value;
});

onMounted(() => {
  if (!dragHandleRef.value) return;

  dndCleanup = draggable({
    element: dragHandleRef.value,
    getInitialData: () => {
      const serializedUnit = serializeParsedUnitToScenarioUnit(props.unit);
      return {
        type: "application/orbat",
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
  });
});

onUnmounted(() => {
  dndCleanup();
});
</script>

<template>
  <li>
    <div class="hover:bg-muted/50 flex items-center gap-2 rounded px-2 py-1">
      <span
        ref="dragHandleRef"
        class="cursor-grab active:cursor-grabbing"
        title="Drag unit into scenario"
      >
        <MilSymbol
          :sidc="unit.sidc"
          :size="24"
          :options="{ outlineColor: 'white', outlineWidth: 8 }"
        />
      </span>
      <div class="flex flex-col">
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
    </div>
    <ul v-if="unit.children.length > 0" class="mt-1 ml-6 space-y-1 border-l pl-2">
      <OrbatTreeNode
        v-for="child in unit.children"
        :key="child.id"
        :unit="child"
        :show-debug="showDebug"
      />
    </ul>
  </li>
</template>
