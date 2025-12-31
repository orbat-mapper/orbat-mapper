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

import { parseTextToUnits, INDENT_SIZE } from "@/utils/textToOrbat";

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

// Indentation configuration: number of spaces to insert for a tab (from utils)
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

// Remove one indentation level (tab or up to INDENT_SIZE spaces) from selected lines or current line
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

const parsedUnits = computed(() => parseTextToUnits(inputText.value));
</script>
