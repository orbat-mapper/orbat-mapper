<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, computed } from "vue";
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
import { Button } from "@/components/ui/button";
import NewMilitarySymbol from "@/components/NewMilitarySymbol.vue";
import {
  defaultRegistry,
  parseMappingsFromXlsxWorkbook,
  type MappingRegistry,
} from "./mappingRegistry";
import {
  extractEntityCode,
  extractSymbolSet,
  buildIconSidc as buildTemplateSidc,
} from "./iconRegistry";
import ToggleField from "@/components/ToggleField.vue";
import {
  PlusIcon,
  RotateCcwIcon,
  DownloadIcon,
  UploadIcon,
  PencilIcon,
  XIcon,
  Trash2Icon,
  Undo2Icon,
  Redo2Icon,
  ChevronDownIcon,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveBlobToLocalFile } from "@/utils/files";
import { useNotifications } from "@/composables/notifications";
import { useSidcModal } from "@/composables/modals";

const SymbolPickerModal = defineAsyncComponent(
  () => import("@/components/SymbolPickerModal.vue"),
);

const FRIENDLY_SI = "3";

const open = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    registry?: MappingRegistry;
    registryVersion?: number;
  }>(),
  {
    registry: () => defaultRegistry,
    registryVersion: 0,
  },
);

const emit = defineEmits<{
  mappingsChanged: [];
  mappingsReset: [];
}>();

const { send: sendNotification } = useNotifications();
const searchQuery = ref("");
const showDebug = ref(false);
const isEditing = ref(false);

// ── Add alias state ──────────────────────────────────────────────
const addingAliasKey = ref<string | null>(null);
const newAliasInput = ref("");

// ── Add suffix state ─────────────────────────────────────────────
const addingSuffixKey = ref<string | null>(null);
const newSuffixInput = ref("");

// ── SIDC modal ──────────────────────────────────────────────────
const {
  showSidcModal,
  getModalSidc,
  confirmSidcModal,
  cancelSidcModal,
  initialSidcModalValue,
  sidcModalTitle,
} = useSidcModal();

// ── Add new icon state ───────────────────────────────────────────
const showAddIconForm = ref(false);
const newIconLabel = ref("");
const newIconSidc = ref("");
const newIconAliases = ref("");

// ── Inline edit state ────────────────────────────────────────────
const editingEntryKey = ref<string | null>(null);
const editLabelValue = ref("");
const editCodeValue = ref("");

// ── File input ref ───────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);

// Build display SIDC for icon patterns (with friendly SI)
function buildDisplaySidc(entityCode: string, symbolSet = "10"): string {
  return `100${FRIENDLY_SI}${symbolSet}0000${entityCode}`;
}

// Convert a template SIDC (SI=0) to a display SIDC (SI=friendly)
function templateToDisplaySidc(templateSidc: string): string {
  return templateSidc.substring(0, 3) + FRIENDLY_SI + templateSidc.substring(4);
}

// Convert a display SIDC to a template SIDC (SI=0)
function displayToTemplateSidc(displaySidc: string): string {
  return displaySidc.substring(0, 3) + "0" + displaySidc.substring(4);
}

// Build SIDC for echelon patterns (using infantry as base icon)
function buildEchelonSidc(echelonCode: string): string {
  return `10031000${echelonCode}1211000000`;
}

interface KeywordEntry {
  value: string;
  type: "alias" | "pattern";
  /** Raw alias string or pattern source for deletion */
  raw: string;
}

interface PatternEntry {
  label: string;
  keywords: KeywordEntry[];
  /** Display SIDC (with friendly SI, for rendering the symbol). */
  sidc: string;
  constantName?: string;
  /** For icons: template SIDC (20-char). For echelons: echelon code (2-char). */
  code?: string;
  kind: "icon" | "echelon";
  /** Concatenated suffixes (echelons only). */
  suffixes?: string[];
}

function displayAlias(alias: string): string {
  return alias
    .replace(/\\s\*/g, " ")
    .replace(/\\s\+/g, " ")
    .replace(/\\s/g, " ")
    .replace(/\\\./g, "")
    .replace(/\[\- ]\?/g, "-")
    .replace(/\[- ]\?/g, "-")
    .replace(/\(\?:/g, "(")
    .replace(/\(\?[:!=<].*?\)/g, "")
    .replace(/\(\?:|\(|\)|\?|\+|\*|\{.*?\}/g, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\|/g, " ")
    .replace(/\\/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayPatternSource(source: string): string {
  return source
    .replace(/\\b/g, "")
    .replace(/\\s\*/g, " ")
    .replace(/\[- ]\??/g, "-")
    .replace(/\(\?:/g, "(")
    .replace(/\?/g, "")
    .replace(/\\/g, "")
    .trim();
}

const echelonEntries = computed<PatternEntry[]>(() => {
  void props.registryVersion;
  const grouped = new Map<string, PatternEntry>();

  for (const def of props.registry.echelonDefinitions) {
    const existing = grouped.get(def.code);
    const aliasKeywords: KeywordEntry[] = (def.aliases ?? []).map((a) => ({
      value: displayAlias(a),
      type: "alias" as const,
      raw: a,
    }));
    const patternKeywords: KeywordEntry[] = (def.patterns ?? []).map((p) => ({
      value: displayPatternSource(p.source),
      type: "pattern" as const,
      raw: p.source,
    }));
    const keywords = [...aliasKeywords, ...patternKeywords];
    const suffixes = [...(def.concatenatedSuffixes ?? [])];

    if (existing) {
      const seen = new Set(existing.keywords.map((k) => k.raw));
      for (const kw of keywords) {
        if (!seen.has(kw.raw)) {
          existing.keywords.push(kw);
          seen.add(kw.raw);
        }
      }
      const existingSuffixes = new Set(existing.suffixes ?? []);
      for (const s of suffixes) {
        if (!existingSuffixes.has(s)) {
          existing.suffixes = [...(existing.suffixes ?? []), s];
        }
      }
    } else {
      grouped.set(def.code, {
        label: def.label,
        keywords,
        sidc: buildEchelonSidc(def.code),
        code: def.code,
        kind: "echelon" as const,
        suffixes: suffixes.length > 0 ? suffixes : undefined,
      });
    }
  }

  return [...grouped.values()];
});

const iconEntries = computed<PatternEntry[]>(() => {
  void props.registryVersion;
  const grouped = new Map<string, PatternEntry>();

  for (const def of props.registry.iconDefinitions) {
    const groupKey = def.sidc;
    const aliasKeywords: KeywordEntry[] = (def.aliases ?? []).map((a) => ({
      value: displayAlias(a),
      type: "alias" as const,
      raw: a,
    }));
    const patternKeywords: KeywordEntry[] = (def.patterns ?? []).map((p) => ({
      value: displayPatternSource(p.source),
      type: "pattern" as const,
      raw: p.source,
    }));
    const keywords = [...aliasKeywords, ...patternKeywords];
    const existing = grouped.get(groupKey);

    if (!existing) {
      grouped.set(groupKey, {
        label: def.label,
        keywords,
        sidc: templateToDisplaySidc(def.sidc),
        constantName: def.name,
        code: def.sidc,
        kind: "icon" as const,
      });
      continue;
    }

    const seen = new Set(existing.keywords.map((k) => k.raw));
    for (const kw of keywords) {
      if (!seen.has(kw.raw)) {
        existing.keywords.push(kw);
        seen.add(kw.raw);
      }
    }
  }

  return [...grouped.values()];
});

const filteredEchelonEntries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return echelonEntries.value;
  return echelonEntries.value.filter(
    (entry) =>
      entry.label.toLowerCase().includes(query) ||
      entry.constantName?.toLowerCase().includes(query) ||
      entry.code?.toLowerCase().includes(query) ||
      entry.keywords.some((kw) => kw.value.toLowerCase().includes(query)) ||
      entry.suffixes?.some((s) => s.toLowerCase().includes(query)),
  );
});

const filteredIconEntries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return iconEntries.value;
  return iconEntries.value.filter(
    (entry) =>
      entry.label.toLowerCase().includes(query) ||
      entry.constantName?.toLowerCase().includes(query) ||
      entry.code?.toLowerCase().includes(query) ||
      entry.keywords.some((kw) => kw.value.toLowerCase().includes(query)),
  );
});

// ── Actions ──────────────────────────────────────────────────────

function startAddAlias(entry: PatternEntry) {
  addingAliasKey.value = `${entry.kind}:${entry.code}`;
  newAliasInput.value = "";
}

function cancelAddAlias() {
  addingAliasKey.value = null;
  newAliasInput.value = "";
}

function submitAddAlias(entry: PatternEntry) {
  const alias = newAliasInput.value.trim();
  if (!alias || !entry.code) return;

  if (entry.kind === "icon") {
    props.registry.extendIcon(entry.code, [alias]);
  } else {
    props.registry.extendEchelon(entry.code, [alias]);
  }
  emit("mappingsChanged");
  cancelAddAlias();
}

function startAddSuffix(entry: PatternEntry) {
  addingSuffixKey.value = `${entry.kind}:${entry.code}`;
  newSuffixInput.value = "";
}

function cancelAddSuffix() {
  addingSuffixKey.value = null;
  newSuffixInput.value = "";
}

function submitAddSuffix(entry: PatternEntry) {
  const suffix = newSuffixInput.value.trim().toLowerCase();
  if (!suffix || !entry.code) return;
  props.registry.addEchelonSuffix(entry.code, suffix);
  emit("mappingsChanged");
  cancelAddSuffix();
}

function deleteSuffix(entry: PatternEntry, suffix: string) {
  if (!entry.code) return;
  props.registry.removeEchelonSuffix(entry.code, suffix);
  emit("mappingsChanged");
}

function deleteKeyword(entry: PatternEntry, keyword: KeywordEntry) {
  if (!entry.code) return;

  if (entry.kind === "icon") {
    if (keyword.type === "alias") {
      props.registry.removeIconAlias(entry.code, keyword.raw);
    } else {
      props.registry.removeIconPattern(entry.code, keyword.raw);
    }
  } else {
    if (keyword.type === "alias") {
      props.registry.removeEchelonAlias(entry.code, keyword.raw);
    }
  }
  emit("mappingsChanged");
}

function deleteEntry(entry: PatternEntry) {
  if (!entry.code) return;
  if (entry.kind === "icon") {
    props.registry.removeIcon(entry.code);
  } else {
    props.registry.clearEchelonAliases(entry.code);
  }
  emit("mappingsChanged");
}

function entryKey(entry: PatternEntry): string {
  return `${entry.kind}:${entry.code}`;
}

function startEditEntry(entry: PatternEntry) {
  editingEntryKey.value = entryKey(entry);
  editLabelValue.value = entry.label;
  editCodeValue.value = entry.kind === "icon" ? (entry.code ?? "") : (entry.code ?? "");
}

function cancelEditEntry() {
  editingEntryKey.value = null;
}

function submitEditEntry(entry: PatternEntry) {
  const label = editLabelValue.value.trim();
  if (!label || !entry.code) return;

  if (entry.kind === "icon") {
    const newSidc = editCodeValue.value !== entry.code ? editCodeValue.value : undefined;
    props.registry.updateIcon(entry.code, {
      label,
      ...(newSidc && { sidc: newSidc }),
    });
  } else {
    props.registry.updateEchelon(entry.code, { label });
  }
  emit("mappingsChanged");
  editingEntryKey.value = null;
}

async function pickNewIconSidc() {
  const result = await getModalSidc(newIconSidc.value || "10031000001211000000", {
    title: "Pick icon symbol",
    hideSymbolColor: true,
    hideCustomSymbols: true,
  });
  if (result) {
    newIconSidc.value = displayToTemplateSidc(result.sidc);
  }
}

async function pickEditSidc(entry: PatternEntry) {
  if (!entry.code) return;
  const result = await getModalSidc(templateToDisplaySidc(entry.code), {
    title: "Pick icon symbol",
    hideSymbolColor: true,
    hideCustomSymbols: true,
  });
  if (result) {
    editCodeValue.value = displayToTemplateSidc(result.sidc);
  }
}

function submitNewIcon() {
  const label = newIconLabel.value.trim();
  const sidc = newIconSidc.value;
  const aliases = newIconAliases.value
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!label || !sidc || aliases.length === 0) return;

  props.registry.addIcon({
    name: label.toUpperCase().replace(/\s+/g, "_"),
    sidc,
    label,
    aliases,
  });
  emit("mappingsChanged");
  showAddIconForm.value = false;
  newIconLabel.value = "";
  newIconSidc.value = "";
  newIconAliases.value = "";
}

function handleReset() {
  if (!window.confirm("Reset all mappings to defaults? Custom changes will be lost.")) {
    return;
  }
  props.registry.resetToDefaults();
  emit("mappingsReset");
  sendNotification({ message: "Mappings reset to defaults" });
}

async function handleExportJson() {
  const data = props.registry.exportMappings();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  try {
    await saveBlobToLocalFile(blob, "text-to-orbat-mappings.json", {
      mimeTypes: ["application/json"],
      extensions: [".json"],
    });
    sendNotification({ message: "Mappings exported as JSON" });
  } catch {
    // user cancelled
  }
}

async function handleExportXlsx() {
  const { xlsxWrite, xlsxUtils } = await import("@/extlib/xlsx-lazy");
  const { zipSync, unzipSync } = await import("fflate");
  const wb = xlsxUtils.book_new();
  const iconRows = props.registry.exportIconRows();
  const echelonRows = props.registry.exportEchelonRows();
  xlsxUtils.book_append_sheet(wb, xlsxUtils.json_to_sheet(iconRows), "Icons");
  xlsxUtils.book_append_sheet(wb, xlsxUtils.json_to_sheet(echelonRows), "Echelons");

  const readmeRows = [
    {
      Section: "Overview",
      Description:
        "This spreadsheet contains pattern mappings used by the Text to ORBAT feature. Edit the Icons and Echelons sheets and re-import the file to update your mappings.",
    },
    { Section: "", Description: "" },
    {
      Section: "Icons sheet",
      Description:
        "Each row maps a military symbol (identified by its 20-character SIDC code) to keywords that the parser recognizes.",
    },
    {
      Section: "Echelons sheet",
      Description:
        "Each row maps an echelon level (identified by a 2-character code) to keywords that the parser recognizes.",
    },
    { Section: "", Description: "" },
    {
      Section: "Aliases",
      Description:
        'Comma-separated list of regular expressions matched as whole words (case-insensitive). Simple keywords like "infantry, inf, foot" work as-is, but you can also use regex syntax for flexible matching — e.g. "mech\\s+inf" matches "mech inf" with any amount of whitespace, and "anti[- ]?tank" matches "anti-tank", "anti tank", or "antitank".',
    },
    {
      Section: "Patterns",
      Description:
        "Comma-separated list of regular expressions for cases where whole-word, case-insensitive matching is not enough. Unlike aliases, patterns are matched exactly as written (case-sensitive by default, no automatic word boundaries).",
    },
    {
      Section: "Patterns (flags)",
      Description:
        'To specify regex flags on a pattern, append them after a trailing slash: "pattern/i" for case-insensitive. Without a slash, patterns are matched as-is.',
    },
    { Section: "", Description: "" },
    {
      Section: "Concatenated Suffixes",
      Description:
        '(Echelons only) Comma-separated suffixes that can be appended to unit names to indicate echelon, e.g. "bn, btl" so that "infantry bn" is recognized as battalion-level.',
    },
  ];
  const readmeSheet = xlsxUtils.json_to_sheet(readmeRows);
  readmeSheet["!cols"] = [{ wch: 24 }, { wch: 80 }];
  xlsxUtils.book_append_sheet(wb, readmeSheet, "README");

  // Generate XLSX buffer, then patch styles to add wrapText for the README sheet
  const buf = xlsxWrite(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const patched = applyWrapTextToReadmeSheet(new Uint8Array(buf), unzipSync, zipSync);

  await saveBlobToLocalFile(
    new Blob([patched as unknown as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "text-to-orbat-mappings.xlsx",
    {
      mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      extensions: [".xlsx"],
    },
  );
  sendNotification({ message: "Mappings exported as XLSX" });
}

/**
 * Patch an XLSX buffer to add a wrapText cell style and apply it to
 * all data cells (row >= 2) in the last worksheet (the README sheet).
 */
function applyWrapTextToReadmeSheet(
  xlsxBuf: Uint8Array,
  unzipFn: (data: Uint8Array) => Record<string, Uint8Array>,
  zipFn: (data: Record<string, Uint8Array>) => Uint8Array,
): Uint8Array {
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  const files = unzipFn(xlsxBuf);

  // Add a second cellXf with wrapText alignment to styles.xml
  const stylesKey = "xl/styles.xml";
  if (files[stylesKey]) {
    let xml = dec.decode(files[stylesKey]);
    xml = xml.replace(
      /<cellXfs count="1">([\s\S]*?)<\/cellXfs>/,
      '<cellXfs count="2">$1<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs>',
    );
    files[stylesKey] = enc.encode(xml);
  }

  // Find the last worksheet (README is appended last)
  const sheetKeys = Object.keys(files)
    .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
    .sort();
  const readmeSheetKey = sheetKeys[sheetKeys.length - 1];
  if (readmeSheetKey && files[readmeSheetKey]) {
    let xml = dec.decode(files[readmeSheetKey]);
    // Apply s="1" (wrapText style) to all cells in data rows (row >= 2)
    xml = xml.replace(/<c r="([A-Z]+)(\d+)"/g, (match, col, row) => {
      return parseInt(row) >= 2 ? `${match} s="1"` : match;
    });
    files[readmeSheetKey] = enc.encode(xml);
  }

  return zipFn(files);
}

function handleImportClick() {
  fileInputRef.value?.click();
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const isXlsx = file.name.toLowerCase().endsWith(".xlsx");
    if (isXlsx) {
      const { readSpreadsheet } = await import("@/extlib/xlsx-read-lazy");
      const { xlsxUtils } = await import("@/extlib/xlsx-lazy");
      const buffer = await file.arrayBuffer();
      const wb = readSpreadsheet(buffer, { type: "array" });
      const data = parseMappingsFromXlsxWorkbook(wb, (sheet) =>
        xlsxUtils.sheet_to_json(sheet as any),
      );
      props.registry.importMappings(data);
    } else {
      const text = await file.text();
      const data = JSON.parse(text);
      if (typeof data !== "object" || data === null) throw new Error("Invalid format");
      props.registry.importMappings(data);
    }
    emit("mappingsChanged");
    sendNotification({ message: "Mappings imported" });
  } catch {
    sendNotification({ message: "Failed to import mappings", type: "error" });
  }

  // Reset the input so the same file can be re-imported
  input.value = "";
}

// ── Undo / Redo ──────────────────────────────────────────────────

const canUndo = computed(() => {
  void props.registryVersion;
  return props.registry.canUndo;
});

const canRedo = computed(() => {
  void props.registryVersion;
  return props.registry.canRedo;
});

function handleUndo() {
  if (props.registry.undo()) {
    emit("mappingsChanged");
  }
}

function handleRedo() {
  if (props.registry.redo()) {
    emit("mappingsChanged");
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    handleUndo();
  } else if (mod && e.key === "z" && e.shiftKey) {
    e.preventDefault();
    handleRedo();
  } else if (mod && e.key === "y") {
    e.preventDefault();
    handleRedo();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="md:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Pattern Mappings</DialogTitle>
        <DialogDescription>
          Keywords recognized for automatic echelon and icon detection. You can add custom
          aliases or new icon mappings.
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
          <div class="flex items-center gap-2">
            <ToggleField v-model="isEditing">
              <PencilIcon class="mr-1 inline size-3" />Edit
            </ToggleField>
            <ToggleField v-model="showDebug">Show debug details</ToggleField>
          </div>
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
            <!-- Add new icon form -->
            <div v-if="isEditing && showAddIconForm" class="mb-4 rounded-md border p-3">
              <h3 class="mb-2 text-sm font-medium">Add Custom Icon Mapping</h3>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  v-model="newIconLabel"
                  placeholder="Label (e.g. Drone)"
                  class="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  class="h-8 text-sm"
                  @click="pickNewIconSidc"
                >
                  <template v-if="newIconSidc">
                    <NewMilitarySymbol
                      :sidc="templateToDisplaySidc(newIconSidc)"
                      :size="20"
                      :options="{ outlineWidth: 4, outlineColor: 'white' }"
                    />
                    <span class="ml-1 font-mono text-xs">{{
                      extractEntityCode(newIconSidc)
                    }}</span>
                  </template>
                  <template v-else>Pick symbol...</template>
                </Button>
                <Input
                  v-model="newIconAliases"
                  placeholder="Aliases (comma-separated)"
                  class="h-8 text-sm sm:col-span-2"
                />
              </div>
              <div class="mt-2 flex items-center justify-end">
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    @click="showAddIconForm = false"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    :disabled="
                      !newIconLabel.trim() || !newIconSidc || !newIconAliases.trim()
                    "
                    @click="submitNewIcon"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div
              v-if="isEditing && !showAddIconForm"
              class="mb-2 flex items-center justify-end"
            >
              <Button
                size="sm"
                variant="outline"
                type="button"
                @click="showAddIconForm = true"
              >
                <PlusIcon class="mr-1 size-4" />
                Add custom icon
              </Button>
            </div>

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
                    :key="entry.sidc"
                    class="hover:bg-muted/50"
                  >
                    <td class="p-2">
                      <div class="flex items-center gap-1">
                        <div class="flex h-10 w-10 items-center justify-center">
                          <NewMilitarySymbol
                            :sidc="entry.sidc"
                            :size="35"
                            :options="{ outlineWidth: 6, outlineColor: 'white' }"
                          />
                        </div>
                        <Button
                          v-if="isEditing"
                          size="icon"
                          variant="ghost"
                          class="text-destructive hover:text-destructive size-6 shrink-0"
                          type="button"
                          title="Remove mapping"
                          @click="deleteEntry(entry)"
                        >
                          <Trash2Icon class="size-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td class="min-w-0 p-2">
                      <div
                        v-if="isEditing && editingEntryKey === entryKey(entry)"
                        class="flex flex-col gap-1"
                      >
                        <Input
                          v-model="editLabelValue"
                          class="h-7 text-sm"
                          placeholder="Label"
                          @keydown.enter="submitEditEntry(entry)"
                          @keydown.escape="cancelEditEntry"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          class="h-7 text-xs"
                          @click="pickEditSidc(entry)"
                        >
                          <NewMilitarySymbol
                            :sidc="templateToDisplaySidc(editCodeValue || entry.code!)"
                            :size="18"
                            :options="{ outlineWidth: 4, outlineColor: 'white' }"
                          />
                          <span class="ml-1 font-mono">{{
                            extractEntityCode(editCodeValue || entry.code!)
                          }}</span>
                        </Button>
                        <div class="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            class="h-6 px-2 text-xs"
                            type="button"
                            @click="cancelEditEntry"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            class="h-6 px-2 text-xs"
                            type="button"
                            :disabled="!editLabelValue.trim()"
                            @click="submitEditEntry(entry)"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                      <div v-else class="flex flex-col gap-0.5">
                        <span
                          :class="isEditing && 'cursor-pointer hover:underline'"
                          @click="isEditing && startEditEntry(entry)"
                        >
                          {{ entry.label }}
                        </span>
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
                      <div class="flex flex-wrap items-center gap-1">
                        <span
                          v-for="keyword in entry.keywords"
                          :key="`${keyword.type}-${keyword.raw}`"
                          class="inline-flex items-center gap-0.5"
                          :class="
                            keyword.type === 'pattern'
                              ? 'rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-xs text-amber-900 shadow-sm dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
                              : 'rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          "
                        >
                          <span
                            v-if="keyword.type === 'pattern'"
                            class="mr-1 text-[10px] uppercase"
                          >
                            regex
                          </span>
                          {{ keyword.value }}
                          <button
                            v-if="isEditing"
                            type="button"
                            class="ml-0.5 rounded-full p-0 hover:opacity-70"
                            title="Remove keyword"
                            @click="deleteKeyword(entry, keyword)"
                          >
                            <XIcon class="size-3" />
                          </button>
                        </span>
                        <template v-if="isEditing">
                          <template v-if="addingAliasKey === `icon:${entry.code}`">
                            <Input
                              v-model="newAliasInput"
                              class="h-6 w-28 text-xs"
                              placeholder="new alias"
                              @keydown.enter="submitAddAlias(entry)"
                              @keydown.escape="cancelAddAlias"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              class="size-6"
                              type="button"
                              @click="submitAddAlias(entry)"
                            >
                              <PlusIcon class="size-3" />
                            </Button>
                          </template>
                          <Button
                            v-else
                            size="icon"
                            variant="ghost"
                            class="size-6"
                            type="button"
                            title="Add alias"
                            @click="startAddAlias(entry)"
                          >
                            <PlusIcon class="size-3" />
                          </Button>
                        </template>
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
                    <th class="w-1/4 p-2 text-left font-medium">Echelon</th>
                    <th class="p-2 text-left font-medium">Recognized Keywords</th>
                    <th class="w-1/4 p-2 text-left font-medium">Suffixes</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="entry in filteredEchelonEntries"
                    :key="entry.label"
                    class="hover:bg-muted/50"
                  >
                    <td class="p-2">
                      <div class="flex items-center gap-1">
                        <div class="flex h-10 w-10 items-center justify-center">
                          <NewMilitarySymbol
                            :sidc="entry.sidc"
                            :size="35"
                            :options="{ outlineWidth: 8, outlineColor: 'white' }"
                          />
                        </div>
                        <Button
                          v-if="isEditing"
                          size="icon"
                          variant="ghost"
                          class="text-destructive hover:text-destructive size-6 shrink-0"
                          type="button"
                          title="Remove mapping"
                          @click="deleteEntry(entry)"
                        >
                          <Trash2Icon class="size-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td class="min-w-0 p-2">
                      <div
                        v-if="isEditing && editingEntryKey === entryKey(entry)"
                        class="flex flex-col gap-1"
                      >
                        <Input
                          v-model="editLabelValue"
                          class="h-7 text-sm"
                          placeholder="Label"
                          @keydown.enter="submitEditEntry(entry)"
                          @keydown.escape="cancelEditEntry"
                        />
                        <div class="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            class="h-6 px-2 text-xs"
                            type="button"
                            @click="cancelEditEntry"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            class="h-6 px-2 text-xs"
                            type="button"
                            :disabled="!editLabelValue.trim()"
                            @click="submitEditEntry(entry)"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                      <span
                        v-else
                        :class="isEditing && 'cursor-pointer hover:underline'"
                        @click="isEditing && startEditEntry(entry)"
                      >
                        {{ entry.label }}
                      </span>
                    </td>
                    <td class="p-2">
                      <div class="flex flex-wrap items-center gap-1">
                        <span
                          v-for="keyword in entry.keywords"
                          :key="`${keyword.type}-${keyword.raw}`"
                          class="inline-flex items-center gap-0.5"
                          :class="
                            keyword.type === 'pattern'
                              ? 'rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-xs text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                              : 'rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200'
                          "
                        >
                          <span
                            v-if="keyword.type === 'pattern'"
                            class="mr-1 text-[10px] uppercase"
                          >
                            regex
                          </span>
                          {{ keyword.value }}
                          <button
                            v-if="isEditing"
                            type="button"
                            class="ml-0.5 rounded-full p-0 hover:opacity-70"
                            title="Remove keyword"
                            @click="deleteKeyword(entry, keyword)"
                          >
                            <XIcon class="size-3" />
                          </button>
                        </span>
                        <template v-if="isEditing">
                          <template v-if="addingAliasKey === `echelon:${entry.code}`">
                            <Input
                              v-model="newAliasInput"
                              class="h-6 w-28 text-xs"
                              placeholder="new alias"
                              @keydown.enter="submitAddAlias(entry)"
                              @keydown.escape="cancelAddAlias"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              class="size-6"
                              type="button"
                              @click="submitAddAlias(entry)"
                            >
                              <PlusIcon class="size-3" />
                            </Button>
                          </template>
                          <Button
                            v-else
                            size="icon"
                            variant="ghost"
                            class="size-6"
                            type="button"
                            title="Add alias"
                            @click="startAddAlias(entry)"
                          >
                            <PlusIcon class="size-3" />
                          </Button>
                        </template>
                      </div>
                    </td>
                    <td class="p-2">
                      <div class="flex flex-wrap items-center gap-1">
                        <span
                          v-for="suffix in entry.suffixes ?? []"
                          :key="suffix"
                          class="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        >
                          {{ suffix }}
                          <button
                            v-if="isEditing"
                            type="button"
                            class="ml-0.5 rounded-full p-0 hover:opacity-70"
                            title="Remove suffix"
                            @click="deleteSuffix(entry, suffix)"
                          >
                            <XIcon class="size-3" />
                          </button>
                        </span>
                        <template v-if="isEditing">
                          <template
                            v-if="addingSuffixKey === `echelon:${entry.code}`"
                          >
                            <Input
                              v-model="newSuffixInput"
                              class="h-6 w-20 text-xs"
                              placeholder="e.g. bn"
                              @keydown.enter="submitAddSuffix(entry)"
                              @keydown.escape="cancelAddSuffix"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              class="size-6"
                              type="button"
                              @click="submitAddSuffix(entry)"
                            >
                              <PlusIcon class="size-3" />
                            </Button>
                          </template>
                          <Button
                            v-else
                            size="icon"
                            variant="ghost"
                            class="size-6"
                            type="button"
                            title="Add suffix"
                            @click="startAddSuffix(entry)"
                          >
                            <PlusIcon class="size-3" />
                          </Button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-muted-foreground text-sm">
          Patterns are matched in order; more specific patterns take precedence.
        </span>
        <div class="flex flex-wrap gap-2">
          <Button
            size="icon"
            variant="ghost"
            class="size-8"
            type="button"
            title="Undo (Ctrl+Z)"
            :disabled="!canUndo"
            @click="handleUndo"
          >
            <Undo2Icon class="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            class="size-8"
            type="button"
            title="Redo (Ctrl+Shift+Z)"
            :disabled="!canRedo"
            @click="handleRedo"
          >
            <Redo2Icon class="size-4" />
          </Button>
          <Button size="sm" variant="ghost" type="button" @click="handleReset">
            <RotateCcwIcon class="mr-1 size-4" />
            Reset
          </Button>
          <Button size="sm" variant="outline" type="button" @click="handleImportClick">
            <UploadIcon class="mr-1 size-4" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button size="sm" variant="outline" type="button">
                <DownloadIcon class="mr-1 size-4" />
                Export
                <ChevronDownIcon class="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="handleExportJson">
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleExportXlsx">
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <input
    ref="fileInputRef"
    type="file"
    accept=".json,.xlsx"
    class="hidden"
    @change="handleImportFile"
  />
  <SymbolPickerModal
    v-if="showSidcModal"
    :initial-sidc="initialSidcModalValue"
    :dialog-title="sidcModalTitle"
    hide-symbol-color
    hide-custom-symbols
    @update:sidc="confirmSidcModal($event)"
    @cancel="cancelSidcModal"
  />
</template>
