<template>
  <li>
    <div class="hover:bg-muted/50 flex items-center gap-2 rounded px-2 py-1">
      <MilSymbol :sidc="unit.sidc" :size="24" />
      <span class="text-sm">{{ unit.name }}</span>
      <span class="text-muted-foreground text-xs">({{ echelonLabel }})</span>
    </div>
    <ul v-if="unit.children.length > 0" class="mt-1 ml-6 space-y-1 border-l pl-2">
      <OrbatTreeNode v-for="child in unit.children" :key="child.id" :unit="child" />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MilSymbol from "@/components/MilSymbol.vue";

interface ParsedUnit {
  id: string;
  name: string;
  sidc: string;
  children: ParsedUnit[];
  level: number;
}

const props = defineProps<{
  unit: ParsedUnit;
}>();

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

const echelonLabel = computed(() => {
  // Extract echelon code from SIDC (positions 8-9, 0-indexed)
  const echelonCode = props.unit.sidc.substring(8, 10);
  return echelonCodeLabels[echelonCode] ?? "Unit";
});
</script>
