<template>
  <div class="bg-background flex h-screen flex-col">
    <header class="bg-muted flex items-center justify-between border-b px-4 py-2">
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon class="size-5" />
        </router-link>
        <h1 class="text-lg font-semibold">Text to ORBAT</h1>
        <span
          class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
          >Experimental</span
        >
      </div>
      <UseDark v-slot="{ isDark, toggleDark }">
        <Button
          variant="ghost"
          size="icon"
          @click="toggleDark()"
          title="Toggle dark mode"
        >
          <SunIcon v-if="isDark" /><MoonStarIcon v-else />
        </Button>
      </UseDark>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <!-- Left side: Text input -->
      <div class="flex w-1/2 flex-col border-r">
        <div class="bg-muted/50 border-b px-4 py-2">
          <h2 class="text-muted-foreground text-sm font-medium">Text Input</h2>
          <p class="text-muted-foreground mt-1 text-xs">
            Enter unit hierarchy using indentation. Each line is a unit name. Use tabs or
            spaces to indicate parent-child relationships.
          </p>
        </div>
        <Textarea
          v-model="inputText"
          class="flex-1 resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
          placeholder="1st Infantry Division
  1st Brigade
    1st Battalion
    2nd Battalion
  2nd Brigade
    3rd Battalion
    4th Battalion
  Artillery Regiment"
          @keydown.tab.prevent="handleTab"
          @keydown.shift.tab.prevent="handleShiftTab"
          @keydown.enter.prevent="handleEnter"
        />
      </div>

      <!-- Right side: ORBAT display -->
      <div class="flex w-1/2 flex-col overflow-hidden">
        <div class="bg-muted/50 border-b px-4 py-2">
          <h2 class="text-muted-foreground text-sm font-medium">Generated ORBAT</h2>
          <p class="text-muted-foreground mt-1 text-xs">
            {{ parsedUnits.length }} top-level unit(s)
          </p>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="parsedUnits.length === 0" class="text-muted-foreground text-center">
            <p>Enter text on the left to generate an ORBAT</p>
          </div>
          <ul v-else class="space-y-2">
            <OrbatTreeNode v-for="unit in parsedUnits" :key="unit.id" :unit="unit" />
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { ArrowLeftIcon, MoonStarIcon, SunIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UseDark } from "@vueuse/components";
import OrbatTreeNode from "@/components/OrbatTreeNode.vue";
import { nanoid } from "nanoid";

interface ParsedUnit {
  id: string;
  name: string;
  sidc: string;
  children: ParsedUnit[];
  level: number;
}

const inputText = ref(
  "1st Infantry Division\n" +
    "  1st Brigade\n" +
    "    1st Battalion\n" +
    "    2nd Battalion\n" +
    "  2nd Brigade\n" +
    "    3rd Battalion\n" +
    "    4th Battalion\n" +
    "  Artillery Regiment",
);

// Indentation configuration: number of spaces to insert for a tab
const INDENT_SIZE = 2;
const INDENT = " ".repeat(INDENT_SIZE);

function handleTab(event: KeyboardEvent) {
  const textarea = event.target as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // Insert spaces (configured by INDENT_SIZE) at cursor position instead of a literal tab
  inputText.value =
    inputText.value.substring(0, start) + INDENT + inputText.value.substring(end);

  // Move cursor after the inserted indent
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + INDENT_SIZE;
  });
}

// Insert a newline and preserve leading indentation of the current line
function handleEnter(event: KeyboardEvent) {
  const textarea = event.target as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = inputText.value;

  // Find start index of the current line
  const lastNewline = val.lastIndexOf("\n", start - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

  // Extract the text from lineStart up to cursor to detect leading whitespace
  const lineSlice = val.substring(lineStart, start);
  const indentMatch = lineSlice.match(/^[\t ]*/);
  const indent = indentMatch ? indentMatch[0] : "";

  // Replace selection with newline + indent
  inputText.value = val.substring(0, start) + "\n" + indent + val.substring(end);

  // Place cursor after the inserted indent
  nextTick(() => {
    const pos = start + 1 + indent.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
  });
}

// Remove one indentation level (tab or up to indentSize spaces) from selected lines or current line
function handleShiftTab(event: KeyboardEvent) {
  const textarea = event.target as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = inputText.value;

  // Determine the range of full lines to operate on
  const selLineStart =
    val.lastIndexOf("\n", start - 1) === -1 ? 0 : val.lastIndexOf("\n", start - 1) + 1;
  let selLineEndIdx = val.indexOf("\n", end);
  if (selLineEndIdx === -1) selLineEndIdx = val.length;

  const originalMiddle = val.substring(selLineStart, selLineEndIdx);
  const origLines = originalMiddle.split("\n");

  const removedPerLine: number[] = [];
  const newLines: string[] = origLines.map((line, idx) => {
    if (line.length === 0) {
      removedPerLine[idx] = 0;
      return line;
    }
    if (line.startsWith("\t")) {
      // If the text contains literal tabs (from older content), remove a single tab
      removedPerLine[idx] = 1;
      return line.substring(1);
    }
    // count leading spaces
    const match = line.match(/^[ ]*/);
    const leadingSpaces = match ? match[0].length : 0;
    const remove = Math.min(leadingSpaces, INDENT_SIZE);
    removedPerLine[idx] = remove;
    return line.substring(remove);
  });

  const newMiddle = newLines.join("\n");
  inputText.value =
    val.substring(0, selLineStart) + newMiddle + val.substring(selLineEndIdx);

  // Calculate cursor/selection adjustment
  // Find cursor line index and column within originalMiddle
  const posWithin = start - selLineStart;
  let pos = 0;
  let cursorLine = origLines.length - 1;
  let cursorCol = 0;
  for (let i = 0; i < origLines.length; i++) {
    const l = origLines[i].length;
    if (posWithin <= pos + l) {
      cursorLine = i;
      cursorCol = posWithin - pos;
      break;
    }
    pos += l + 1; // +1 for newline
  }

  const removedBeforeCursor =
    removedPerLine.slice(0, cursorLine).reduce((a, b) => a + b, 0) +
    Math.min(removedPerLine[cursorLine] ?? 0, cursorCol);
  const totalRemoved = removedPerLine.reduce((a, b) => a + b, 0);

  const newStart = Math.max(0, start - removedBeforeCursor);
  const newEnd = Math.max(newStart, end - totalRemoved);

  nextTick(() => {
    textarea.selectionStart = newStart;
    textarea.selectionEnd = newEnd;
  });
}

// Standard identity for friendly units
const FRIENDLY_SI = "3";
// Symbol set for land units
const UNIT_SYMBOL_SET = "10";

// Echelon codes mapped to common unit type keywords
const ECHELON_PATTERNS: { pattern: RegExp; code: string }[] = [
  // Army Group / Front
  { pattern: /\b(army\s*group|front|theater)\b/i, code: "24" },
  // Army
  { pattern: /\b(army)\b/i, code: "23" },
  // Corps
  { pattern: /\b(corps|mef)\b/i, code: "22" },
  // Division
  { pattern: /\b(division|div)\b/i, code: "21" },
  // Brigade
  { pattern: /\b(brigade|bde|bgde)\b/i, code: "18" },
  // Regiment / Group
  { pattern: /\b(regiment|regt|rgmt|group|grp)\b/i, code: "17" },
  // Battalion / Squadron
  { pattern: /\b(battalion|btn|bn|squadron|sqdn|sqn)\b/i, code: "16" },
  // Company / Battery / Troop
  { pattern: /\b(company|coy|co|battery|btry|bty|troop|trp)\b/i, code: "15" },
  // Platoon / Detachment
  { pattern: /\b(platoon|plt|pl|detachment|det)\b/i, code: "14" },
  // Section
  { pattern: /\b(section|sect|sec)\b/i, code: "13" },
  // Squad
  { pattern: /\b(squad|sqd)\b/i, code: "12" },
  // Team / Crew
  { pattern: /\b(team|tm|crew)\b/i, code: "11" },
];

// Echelon hierarchy for inferring child echelons (from largest to smallest)
const ECHELON_HIERARCHY = [
  "24", // Army Group
  "23", // Army
  "22", // Corps
  "21", // Division
  "18", // Brigade
  "17", // Regiment
  "16", // Battalion
  "15", // Company
  "14", // Platoon
  "13", // Section
  "12", // Squad
  "11", // Team
];

function getNextLowerEchelon(parentEchelon: string): string {
  const idx = ECHELON_HIERARCHY.indexOf(parentEchelon);
  if (idx === -1 || idx >= ECHELON_HIERARCHY.length - 1) {
    return "00"; // Unspecified
  }
  return ECHELON_HIERARCHY[idx + 1];
}

function getEchelonCodeFromName(name: string): string {
  for (const { pattern, code } of ECHELON_PATTERNS) {
    if (pattern.test(name)) {
      return code;
    }
  }
  // Default: unspecified echelon
  return "00";
}

function getEchelonCode(level: number): string {
  // Map hierarchy level to echelon (simplified) - used as fallback
  if (level < ECHELON_HIERARCHY.length) {
    return ECHELON_HIERARCHY[level];
  }
  return ECHELON_HIERARCHY[ECHELON_HIERARCHY.length - 1];
}

function buildSidc(level: number, name: string, parentEchelon?: string): string {
  // Build a 2525D SIDC: 10 (version) + 0 (context) + 3 (friendly) + 10 (land unit)
  // + 0 (status) + 0 (HQ/TF) + echelon + 000000 (entity) + 00 (modifiers)
  const version = "10";
  const context = "0";
  const si = FRIENDLY_SI;
  const symbolSet = UNIT_SYMBOL_SET;
  const status = "0";
  const hqtfd = "0";

  // Try to detect echelon from name first
  let echelon = getEchelonCodeFromName(name);

  // If not detected from name, infer from parent echelon
  if (echelon === "00" && parentEchelon && parentEchelon !== "00") {
    echelon = getNextLowerEchelon(parentEchelon);
  }

  // If still not determined, fall back to level-based
  if (echelon === "00") {
    echelon = getEchelonCode(level);
  }

  const entity = "000000";
  const modifiers = "0000";

  return (
    version + context + si + symbolSet + status + hqtfd + echelon + entity + modifiers
  );
}

function parseTextToUnits(text: string): ParsedUnit[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const result: ParsedUnit[] = [];
  const stack: { unit: ParsedUnit; indent: number; echelon: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const name = trimmed.trim();

    if (!name) continue;

    // Determine the level based on indentation
    let level = 0;
    if (stack.length > 0) {
      // Find parent based on indentation
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      level = stack.length;
    }

    // Get parent's echelon if available
    const parentEchelon = stack.length > 0 ? stack[stack.length - 1].echelon : undefined;
    const sidc = buildSidc(level, name, parentEchelon);
    // Extract the echelon code from the generated SIDC (positions 8-9)
    const unitEchelon = sidc.substring(8, 10);

    const unit: ParsedUnit = {
      id: nanoid(),
      name,
      sidc,
      children: [],
      level,
    };

    if (stack.length === 0) {
      result.push(unit);
    } else {
      stack[stack.length - 1].unit.children.push(unit);
    }

    stack.push({ unit, indent, echelon: unitEchelon });
  }

  return result;
}

const parsedUnits = computed(() => parseTextToUnits(inputText.value));
</script>
