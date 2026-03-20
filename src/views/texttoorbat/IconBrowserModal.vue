<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { ICON_PATTERNS } from "@/views/texttoorbat/textToOrbat";
import { extractEntityCode } from "@/views/texttoorbat/iconRegistry";

const open = defineModel<boolean>({ default: false });
const searchQuery = ref("");

interface IconEntry {
  name: string;
  code: string;
  entityCode: string;
  sidc: string;
}

function friendlyNameFromVar(varName: string) {
  return varName
    .replace(/^ICON_/, "")
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

const icons: IconEntry[] = Object.values(
  ICON_PATTERNS.reduce<Record<string, IconEntry>>((acc, pattern) => {
    // pattern.code is the full 20-char template SIDC for icons
    const key = `${pattern.code}:${pattern.name}`;
    if (acc[key]) return acc;

    // Build display SIDC: replace SI position (index 3) with friendly "3"
    const displaySidc = pattern.code.substring(0, 3) + "3" + pattern.code.substring(4);

    acc[key] = {
      name: pattern.label ?? friendlyNameFromVar(pattern.name),
      code: pattern.name,
      entityCode: extractEntityCode(pattern.code),
      sidc: displaySidc,
    };
    return acc;
  }, {}),
).sort((a, b) => a.name.localeCompare(b.name));

const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return icons;
  return icons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(query) ||
      icon.code.toLowerCase().includes(query) ||
      icon.entityCode.toLowerCase().includes(query),
  );
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="md:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Icon mappings</DialogTitle>
        <DialogDescription>
          Browse available ICON_XXX entity codes and their symbols
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or code..."
          class="w-full"
        />

        <div class="grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
          <div
            v-for="icon in filteredIcons"
            :key="icon.sidc"
            class="hover:bg-muted flex flex-col items-center gap-2 rounded border p-3 transition-colors"
          >
            <div class="flex h-12 w-12 items-center justify-center">
              <NewMilitarySymbol
                :sidc="icon.sidc"
                :size="40"
                :options="{ outlineWidth: 8, outlineColor: 'white' }"
              />
            </div>
            <div class="text-center text-sm">
              <div class="truncate" :title="icon.name">
                {{ icon.name }}
              </div>
              <div class="font-mono text-xs leading-6 text-amber-600 dark:text-amber-400">
                {{ icon.code.slice(5) }}
              </div>
              <div class="font-mono text-sm tracking-wider">
                {{ icon.entityCode }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="text-muted-foreground mt-2 text-sm"
        >Showing {{ filteredIcons.length }} of {{ icons.length }} icons</DialogFooter
      >
    </DialogContent>
  </Dialog>
</template>
