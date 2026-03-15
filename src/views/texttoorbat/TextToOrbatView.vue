<script setup lang="ts">
import { nanoid } from "nanoid";
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  GripIcon,
  MapIcon,
  MoonStarIcon,
  SunIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UseDark } from "@vueuse/components";
import { breakpointsTailwind, useBreakpoints, useTitle } from "@vueuse/core";
import OrbatTreeNode from "@/views/texttoorbat/OrbatTreeNode.vue";
import TextToOrbatEditor from "@/views/texttoorbat/TextToOrbatEditor.vue";
import ToggleField from "@/components/ToggleField.vue";
import IconBrowserModal from "@/views/texttoorbat/IconBrowserModal.vue";
import PatternMappingModal from "@/views/texttoorbat/PatternMappingModal.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  convertParsedUnitsToOrbatMapperScenario,
  convertParsedUnitsToSpatialIllusions,
  parseTextToUnits,
  type ParsedUnit,
} from "@/views/texttoorbat/textToOrbat.ts";
import { useNotifications } from "@/composables/notifications";
import { saveBlobToLocalFile } from "@/utils/files";
import { useScenario } from "@/scenariostore";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { useIndexedDb } from "@/scenariostore/localdb";
import type { Unit } from "@/types/scenarioModels";

const originalTitle = useTitle().value;
useTitle("Text to ORBAT");

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("sm");

const showDebug = ref(false);
const enableAutocomplete = ref(true);
const showIconBrowser = ref(false);
const showPatternMapping = ref(false);
const isOpeningScenario = ref(false);
const isCopyingToClipboard = ref(false);

const inputText = ref(
  "1st Infantry Division\n" +
    "  1st Brigade\n" +
    "    1st Tank Battalion\n" +
    "    2nd Art Battalion\n" +
    "  2nd Cdo Btn\n" +
    "    3rd RA\n" +
    "    4th Eng \n" +
    "  Artillery Coy",
);

const parsedUnits = computed(() => parseTextToUnits(inputText.value));
const spatialIllusionsOrbat = computed(() =>
  convertParsedUnitsToSpatialIllusions(parsedUnits.value),
);
const orbatMapperScenario = computed(() =>
  convertParsedUnitsToOrbatMapperScenario(parsedUnits.value),
);
const { send: sendNotification } = useNotifications();
const router = useRouter();
const { scenario } = useScenario();

function serializeParsedUnitForClipboard(unit: ParsedUnit): Unit {
  return {
    id: nanoid(),
    name: unit.name,
    sidc: unit.sidc,
    subUnits: unit.children.map((child) => serializeParsedUnitForClipboard(child)),
  };
}

function buildClipboardUnits(): Unit[] {
  return parsedUnits.value.map((unit) => serializeParsedUnitForClipboard(unit));
}

function handleOrbatDragStart(event: DragEvent) {
  if (parsedUnits.value.length === 0 || !event.dataTransfer) {
    event.preventDefault();
    return;
  }

  const serializedJson = JSON.stringify(buildClipboardUnits());
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("application/orbat", serializedJson);
  event.dataTransfer.setData("text/plain", serializedJson);
}

async function handleCopyToClipboard() {
  if (parsedUnits.value.length === 0 || isCopyingToClipboard.value) {
    return;
  }

  isCopyingToClipboard.value = true;

  try {
    const serializedUnits = buildClipboardUnits();
    const serializedJson = JSON.stringify(serializedUnits);

    if (
      typeof ClipboardItem !== "undefined" &&
      typeof navigator.clipboard?.write === "function"
    ) {
      const clipboardItem = new ClipboardItem({
        // Async clipboard writes only support a limited MIME set, so keep the
        // ORBAT JSON in text/plain for paste compatibility with OrbatPanel.
        "text/plain": new Blob([serializedJson], {
          type: "text/plain",
        }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } else if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(serializedJson);
    } else {
      throw new Error("Clipboard API unavailable");
    }

    sendNotification({ message: "ORBAT copied to clipboard" });
  } catch (error) {
    sendNotification({
      message: "Failed to copy ORBAT to clipboard",
      type: "error",
    });
    console.error(error);
  } finally {
    isCopyingToClipboard.value = false;
  }
}

async function handleDownloadSpatialIllusions() {
  if (parsedUnits.value.length === 0) {
    return;
  }

  try {
    const payload = spatialIllusionsOrbat.value;
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

async function handleDownloadOrbatMapperScenario() {
  if (parsedUnits.value.length === 0) {
    return;
  }

  try {
    const payload = orbatMapperScenario.value;
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

async function handleOpenScenario() {
  if (parsedUnits.value.length === 0 || isOpeningScenario.value) {
    return;
  }

  isOpeningScenario.value = true;

  try {
    const payload = orbatMapperScenario.value;
    scenario.value.io.loadFromObject(payload);
    scenario.value.store.clearUndoRedoStack?.();

    const { addScenario } = await useIndexedDb();
    const storedScenario = scenario.value.io.serializeToObject();
    const scenarioId = await addScenario(storedScenario, storedScenario.id);

    await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
    sendNotification({ message: "Scenario opened in editor" });
  } catch (error) {
    sendNotification({
      message: "Failed to open scenario",
      type: "error",
    });
    console.error(error);
  } finally {
    isOpeningScenario.value = false;
  }
}

onUnmounted(() => {
  useTitle(originalTitle);
});
</script>

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

    <!-- Resizable panels - vertical on mobile, horizontal on desktop -->
    <ResizablePanelGroup :direction="isMobile ? 'vertical' : 'horizontal'" class="flex-1">
      <!-- Left/Top: Text input -->
      <ResizablePanel :default-size="50" :min-size="20">
        <div class="flex h-full min-h-0 flex-col">
          <div class="bg-muted/50 border-b px-4 py-2">
            <h2 class="text-muted-foreground text-sm font-medium">Text Input</h2>
            <p class="text-muted-foreground mt-1 text-xs">
              Enter unit hierarchy using indentation.
              <span class="hidden sm:inline"
                >Each line is a unit name. Use tabs or spaces to indicate parent-child
                relationships. Echelon abbreviations can be contiguous (e.g., 2bn)</span
              >.
            </p>
            <div class="mt-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                @click="showPatternMapping = true"
                title="View pattern mappings"
              >
                <MapIcon class="mr-1 size-4" />
                Patterns
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="showIconBrowser = true"
                title="Browse icon codes"
              >
                <BookOpenIcon class="mr-1 size-4" />
                Icons
              </Button>
              <ToggleField v-model="enableAutocomplete">Autocomplete</ToggleField>
            </div>
          </div>
          <TextToOrbatEditor
            v-model="inputText"
            :enable-autocomplete="enableAutocomplete"
            class="flex-1"
            placeholder="1st Infantry Division
  1st Brigade
    2bn
    2nd Battalion
  2nd Brigade
    3rd Battalion
    4th Battalion
  Artillery Regiment"
          />
        </div>
      </ResizablePanel>

      <ResizableHandle with-handle />

      <!-- Right/Bottom: ORBAT display -->
      <ResizablePanel :default-size="50" :min-size="20">
        <div class="flex h-full flex-col overflow-hidden">
          <div class="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
            <div>
              <h2 v-if="!isMobile" class="text-muted-foreground text-sm font-medium">
                Generated ORBAT
              </h2>
              <p v-if="!isMobile" class="text-muted-foreground mt-1 text-xs">
                {{ parsedUnits.length }} top-level unit(s)
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button
                size="sm"
                :disabled="parsedUnits.length === 0 || isOpeningScenario"
                @click="handleOpenScenario"
                title="Open in Scenario Editor"
              >
                <ExternalLinkIcon class="mr-1 size-4" />
                Open
              </Button>
              <Button
                size="sm"
                variant="outline"
                :disabled="parsedUnits.length === 0 || isCopyingToClipboard"
                @click="handleCopyToClipboard"
                title="Copy ORBAT to clipboard"
              >
                <CopyIcon class="mr-1 size-4" />
                Copy
              </Button>
              <Button
                v-if="!isMobile"
                size="sm"
                variant="outline"
                :disabled="parsedUnits.length === 0"
                draggable="true"
                @dragstart="handleOrbatDragStart"
                title="Drag ORBAT into scenario"
              >
                <GripIcon class="mr-1 size-4" />
                Drag into scenario
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    :disabled="parsedUnits.length === 0"
                    title="Download ORBAT formats"
                  >
                    <DownloadIcon class="mr-1 size-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="handleDownloadSpatialIllusions">
                    Battle Staff Tools JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleDownloadOrbatMapperScenario">
                    ORBAT Mapper Scenario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ToggleField v-model="showDebug">Debug info</ToggleField>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <div
              v-if="parsedUnits.length === 0"
              class="text-muted-foreground text-center"
            >
              <p>Enter text on the left to generate an ORBAT</p>
            </div>
            <ul v-else class="space-y-2">
              <OrbatTreeNode
                v-for="unit in parsedUnits"
                :key="unit.id"
                :unit="unit"
                :show-debug="showDebug"
              />
            </ul>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>

  <IconBrowserModal v-model="showIconBrowser" />
  <PatternMappingModal v-model="showPatternMapping" />
</template>
