<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import {
  ECHELON_PATTERNS,
  ICON_CODE_TO_NAME,
  ICON_PATTERNS,
} from "@/views/texttoorbat/textToOrbat";
import ToggleField from "@/components/ToggleField.vue";

const open = defineModel<boolean>({ default: false });
const searchQuery = ref("");
const showDebug = ref(false);

// Build SIDC for icon patterns (using battalion echelon for display)
function buildIconSidc(entityCode: string): string {
  // Format: 10 + 03 (friendly) + 10 (land unit) + 0 (present) + 0 (not HQ/TF) + 16 (battalion) + entityCode
  return `1003100000${entityCode}`;
}

// Build SIDC for echelon patterns (using infantry as base icon)
function buildEchelonSidc(echelonCode: string): string {
  // Format: 10 + 03 (friendly) + 10 (land unit) + 0 (present) + 0 (not HQ/TF) + echelon + infantry icon
  return `10031000${echelonCode}1211000000`;
}

// Extract keywords from regex pattern for display
function extractKeywords(pattern: RegExp): string[] {
  const source = pattern.source;
  // Remove regex syntax and extract the main keywords
  const cleaned = source
    .replace(/\\b/g, "") // word boundaries
    .replace(/\\s\*/g, " ") // space patterns
    .replace(/\[- ]\??/g, "-") // optional hyphen/space
    .replace(/\(\?:/g, "(") // non-capturing groups
    .replace(/\?/g, "") // optional markers
    .replace(/s\?/g, "(s)") // optional plurals
    .replace(/\\/g, ""); // escape chars

  // Split by | and clean up
  return cleaned
    .replace(/^\(/, "")
    .replace(/\)$/, "")
    .split("|")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

interface PatternEntry {
  label: string;
  keywords: string[];
  sidc: string;
  originalPattern: string;
  constantName?: string;
  code?: string;
}

const echelonEntries = computed<PatternEntry[]>(() => {
  return ECHELON_PATTERNS.map((p) => ({
    label: p.label,
    keywords: extractKeywords(p.pattern),
    sidc: buildEchelonSidc(p.code),
    originalPattern: p.pattern.source,
  }));
});

const iconEntries = computed<PatternEntry[]>(() => {
  return ICON_PATTERNS.map((p) => ({
    label: p.label,
    keywords: extractKeywords(p.pattern),
    sidc: buildIconSidc(p.code),
    originalPattern: p.pattern.source,
    constantName: ICON_CODE_TO_NAME[p.code],
    code: p.code,
  }));
});

const filteredEchelonEntries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return echelonEntries.value;
  return echelonEntries.value.filter(
    (entry) =>
      entry.label.toLowerCase().includes(query) ||
      entry.keywords.some((kw) => kw.toLowerCase().includes(query)),
  );
});

const filteredIconEntries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return iconEntries.value;
  return iconEntries.value.filter(
    (entry) =>
      entry.label.toLowerCase().includes(query) ||
      entry.keywords.some((kw) => kw.toLowerCase().includes(query)),
  );
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="md:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Pattern Mappings</DialogTitle>
        <DialogDescription>
          Keywords recognized for automatic echelon and icon detection
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search patterns..."
            class="w-full md:max-w-sm"
          />
          <ToggleField v-model="showDebug">Show debug details</ToggleField>
        </div>

        <Tabs default-value="icons" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="icons">
              Unit Icons ({{ filteredIconEntries.length }})
            </TabsTrigger>
            <TabsTrigger value="echelons">
              Echelons ({{ filteredEchelonEntries.length }})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="icons" class="mt-4">
            <div class="max-h-[45vh] overflow-y-auto sm:max-h-[60vh]">
              <table class="w-full table-fixed text-sm md:table-auto">
                <thead class="bg-muted sticky top-0">
                  <tr>
                    <th class="p-2 text-left font-medium">Symbol</th>
                    <th class="p-2 text-left font-medium">Type</th>
                    <th class="p-2 text-left font-medium">Recognized Keywords</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="entry in filteredIconEntries"
                    :key="entry.label"
                    class="hover:bg-muted/50"
                  >
                    <td class="p-2">
                      <div class="flex h-10 w-10 items-center justify-center">
                        <NewMilitarySymbol
                          :sidc="entry.sidc"
                          :size="35"
                          :options="{ outlineWidth: 6, outlineColor: 'white' }"
                        />
                      </div>
                    </td>
                    <td class="min-w-0 p-2">
                      <div class="flex flex-col gap-0.5">
                        <span>{{ entry.label }}</span>
                        <template v-if="showDebug">
                          <span
                            v-if="entry.constantName"
                            class="text-muted-foreground text-xs wrap-break-word whitespace-normal"
                          >
                            {{ entry.constantName }}
                          </span>
                          <span
                            v-if="entry.code"
                            class="text-muted-foreground font-mono text-xs tracking-wider break-all whitespace-normal"
                          >
                            {{ entry.code }}
                          </span>
                        </template>
                      </div>
                    </td>
                    <td class="p-2">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="keyword in entry.keywords"
                          :key="keyword"
                          class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {{ keyword }}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="echelons" class="mt-4">
            <div class="max-h-96 overflow-x-auto overflow-y-auto">
              <table class="w-full table-fixed text-sm">
                <thead class="bg-muted sticky top-0">
                  <tr>
                    <th class="p-2 text-left font-medium">Symbol</th>
                    <th class="w-1/3 p-2 text-left font-medium">Echelon</th>
                    <th class="p-2 text-left font-medium">Recognized Keywords</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="entry in filteredEchelonEntries"
                    :key="entry.label"
                    class="hover:bg-muted/50"
                  >
                    <td class="p-2">
                      <div class="flex h-10 w-10 items-center justify-center">
                        <NewMilitarySymbol
                          :sidc="entry.sidc"
                          :size="35"
                          :options="{ outlineWidth: 8, outlineColor: 'white' }"
                        />
                      </div>
                    </td>
                    <td class="min-w-0 p-2">{{ entry.label }}</td>
                    <td class="p-2">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="keyword in entry.keywords"
                          :key="keyword"
                          class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {{ keyword }}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter class="text-muted-foreground mt-2 text-sm">
        Patterns are matched in order; more specific patterns take precedence
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
