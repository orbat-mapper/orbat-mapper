<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  CircleXIcon,
  GripIcon,
  MapIcon,
  MoonStarIcon,
  SlidersHorizontalIcon,
  SunIcon,
  WandSparklesIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import SplitButton from "@/components/SplitButton.vue";
import type { ButtonGroupItem } from "@/components/types";
import { UseDark } from "@vueuse/components";
import { breakpointsTailwind, useBreakpoints, useTitle } from "@vueuse/core";
import OrbatTreeNode from "@/views/texttoorbat/OrbatTreeNode.vue";
import TextToOrbatEditor from "@/views/texttoorbat/TextToOrbatEditor.vue";
import ToggleField from "@/components/ToggleField.vue";
import PatternMappingModal from "@/views/texttoorbat/PatternMappingModal.vue";
import ScratchPad from "@/views/texttoorbat/ScratchPad.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  applyGeneratedShortNamesToText,
  clearAllShortNames,
  convertParsedUnitsToOrbatMapperScenario,
  convertParsedUnitsToSpatialIllusions,
  generateMissingShortNamesWithOptions,
  parseTextToUnits,
  serializeParsedUnitsToScenarioUnits,
  type CommaFieldOrder,
} from "@/views/texttoorbat/textToOrbat.ts";
import { storeToRefs } from "pinia";
import { useTextToOrbatStore } from "@/views/texttoorbat/textToOrbatStore";
import { defaultRegistry } from "@/views/texttoorbat/mappingRegistry";
import { BUILTIN_ECHELON_DEFINITIONS } from "@/views/texttoorbat/echelonRegistry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MilSymbol from "@/components/MilSymbol.vue";
import { useNotifications } from "@/composables/notifications";
import { saveBlobToLocalFile } from "@/utils/files";
import { useScenario } from "@/scenariostore";
import type { Unit } from "@/types/scenarioModels";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { useIndexedDb } from "@/scenariostore/localdb";

const sidItems = [
  { code: "3", text: "Friend", sidc: "10031000000000000000" },
  { code: "6", text: "Hostile", sidc: "10061000000000000000" },
  { code: "4", text: "Neutral", sidc: "10041000000000000000" },
  { code: "1", text: "Unknown", sidc: "10011000000000000000" },
];

const echelonItems = BUILTIN_ECHELON_DEFINITIONS.map((def) => ({
  code: def.code,
  label: def.label,
  sidc: `10031000${def.code}1211000000`,
}));

const originalTitle = useTitle().value;
useTitle("Text to ORBAT");

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("sm");

const store = useTextToOrbatStore();
const {
  enableAutocomplete,
  matchInputCase,
  useCommaSeparator,
  commaFieldOrder,
  standardIdentity,
  defaultStartingEchelon,
  shortNameMaxLength,
  shortNameUppercase,
  shortNameAllowWhitespace,
  shortNameForceLength,
  showScratchPad,
  scratchPadUnits,
  registryVersion,
} = storeToRefs(store);
const { handleMappingsChanged, handleMappingsReset } = store;

const showPatternMapping = ref(false);
const isOpeningScenario = ref(false);
const isCopyingToClipboard = ref(false);

const inputText = ref(`# sample ORBAT
1st Infantry Division
  1st Brigade
    # use |, // or [] for metadata
    1st // tank bn
    2nd Art [bty]
  2nd Cdo Btn
    3rd RA
    4th Eng
  Artillery Coy
  # enable "Split fields" to use commas
  A, Alpha Company, Main assault element
`);

const parsedUnits = computed(() => {
  void registryVersion.value;
  return parseTextToUnits(inputText.value, {
    registry: defaultRegistry,
    useCommaSeparator: useCommaSeparator.value,
    commaFieldOrder: commaFieldOrder.value as CommaFieldOrder,
    standardIdentity: standardIdentity.value,
    defaultStartingEchelon: defaultStartingEchelon.value,
  });
});
const spatialIllusionsOrbat = computed(() =>
  convertParsedUnitsToSpatialIllusions(parsedUnits.value),
);
const orbatMapperScenario = computed(() =>
  convertParsedUnitsToOrbatMapperScenario(parsedUnits.value, standardIdentity.value),
);
const { send: sendNotification } = useNotifications();
const router = useRouter();
const { scenario } = useScenario();

function handleClearInput() {
  inputText.value = "";
}

function buildClipboardUnits() {
  return serializeParsedUnitsToScenarioUnits(parsedUnits.value);
}

function handleGenerateShortNames() {
  if (parsedUnits.value.length === 0) {
    return;
  }

  const units = serializeParsedUnitsToScenarioUnits(parsedUnits.value);
  const result = generateMissingShortNamesWithOptions(units, {
    maxLength: shortNameMaxLength.value,
    uppercase: shortNameUppercase.value,
    allowWhitespace: shortNameAllowWhitespace.value,
    forceLength: shortNameForceLength.value,
  });

  if (result.generatedCount === 0) {
    sendNotification({ message: "All units already have short names" });
    return;
  }

  useCommaSeparator.value = true;
  commaFieldOrder.value = "name,shortName,description";
  inputText.value = applyGeneratedShortNamesToText(
    inputText.value,
    parsedUnits.value,
    result.units,
  ).text;
  sendNotification({
    message: `Generated ${result.generatedCount} short name${result.generatedCount === 1 ? "" : "s"}`,
  });
}

function handleClearShortNames() {
  if (parsedUnits.value.length === 0) {
    return;
  }

  const units = serializeParsedUnitsToScenarioUnits(parsedUnits.value);
  const result = applyGeneratedShortNamesToText(
    inputText.value,
    parsedUnits.value,
    clearAllShortNames(units),
  );

  if (result.updatedCount === 0) {
    sendNotification({ message: "No short names to clear" });
    return;
  }

  useCommaSeparator.value = true;
  commaFieldOrder.value = "name,shortName,description";
  inputText.value = result.text;
  sendNotification({
    message: `Cleared ${result.updatedCount} short name${result.updatedCount === 1 ? "" : "s"}`,
  });
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

const splitButtonItems = computed<ButtonGroupItem[]>(() => [
  {
    label: "Open scenario",
    onClick: handleOpenScenario,
    disabled: parsedUnits.value.length === 0 || isOpeningScenario.value,
  },
  {
    label: "Copy to clipboard",
    onClick: handleCopyToClipboard,
    disabled: parsedUnits.value.length === 0 || isCopyingToClipboard.value,
  },
  {
    label: "Export to Battle Staff Tools",
    onClick: handleDownloadSpatialIllusions,
    disabled: parsedUnits.value.length === 0,
  },
  {
    label: "Export as ORBAT Mapper Scenario",
    onClick: handleDownloadOrbatMapperScenario,
    disabled: parsedUnits.value.length === 0,
  },
]);

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
            <div class="mt-2 flex flex-wrap items-center gap-2">
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
                :disabled="inputText.length === 0"
                @click="handleClearInput"
                title="Clear input"
              >
                <CircleXIcon class="mr-1 size-4" />
                Clear
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" title="Settings">
                    <SlidersHorizontalIcon class="mr-1 size-4" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem v-model="enableAutocomplete" @select.prevent>
                    Autocomplete
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    v-model="matchInputCase"
                    :disabled="!enableAutocomplete"
                    @select.prevent
                  >
                    Match input case
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem v-model="useCommaSeparator" @select.prevent>
                    Split fields
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuRadioGroup v-model="commaFieldOrder">
                    <DropdownMenuRadioItem
                      value="name,shortName,description"
                      :disabled="!useCommaSeparator"
                      @select.prevent
                    >
                      name, short name, description
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="shortName,name,description"
                      :disabled="!useCommaSeparator"
                      @select.prevent
                    >
                      short name, name, description
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Short names</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent class="min-w-56">
                      <DropdownMenuCheckboxItem
                        v-model="shortNameUppercase"
                        @select.prevent
                      >
                        Uppercase output
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        v-model="shortNameAllowWhitespace"
                        @select.prevent
                      >
                        Allow whitespace
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        v-model="shortNameForceLength"
                        @select.prevent
                      >
                        Force length
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Max length</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        :model-value="String(shortNameMaxLength)"
                        @update:model-value="shortNameMaxLength = Number($event)"
                      >
                        <DropdownMenuRadioItem value="3" @select.prevent>
                          3
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="4" @select.prevent>
                          4
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="6" @select.prevent>
                          6
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="8" @select.prevent>
                          8
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="10" @select.prevent>
                          10
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="12" @select.prevent>
                          12
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        :disabled="parsedUnits.length === 0"
                        @select="handleClearShortNames"
                      >
                        Clear all short names
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Starting echelon</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup v-model="defaultStartingEchelon">
                        <DropdownMenuRadioItem
                          v-for="ech in echelonItems"
                          :key="ech.code"
                          :value="ech.code"
                          @select.prevent
                        >
                          <MilSymbol
                            :sidc="ech.sidc"
                            :size="20"
                            :modifiers="{ outlineColor: 'white', outlineWidth: 4 }"
                          />
                          {{ ech.label }}
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                :disabled="parsedUnits.length === 0"
                @click="handleGenerateShortNames"
              >
                <WandSparklesIcon class="mr-1 size-4" />
                Generate short names
              </Button>
              <a
                href="https://docs.orbat-mapper.app/guide/text-to-orbat"
                target="_blank"
                rel="noopener"
                class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2"
              >
                <BookOpenIcon class="size-3.5" />
                Documentation
                <ExternalLinkIcon class="size-3" />
              </a>
            </div>
          </div>
          <TextToOrbatEditor
            v-model="inputText"
            :enable-autocomplete="enableAutocomplete"
            :match-input-case="matchInputCase"
            :registry="defaultRegistry"
            :registry-version="registryVersion"
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
        <ResizablePanelGroup v-if="showScratchPad" direction="vertical" class="h-full">
          <ResizablePanel :default-size="60" :min-size="20">
            <div class="flex h-full flex-col overflow-hidden">
              <div
                class="bg-muted/50 flex items-center justify-between gap-4 overflow-x-auto border-b px-4 py-2"
              >
                <div class="shrink-0">
                  <h2 class="text-muted-foreground hidden text-sm font-medium lg:inline">
                    Generated ORBAT
                  </h2>
                </div>
                <div class="flex shrink-0 items-center gap-2">
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
                      <SelectItem
                        v-for="sid in sidItems"
                        :key="sid.code"
                        :value="sid.code"
                      >
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
                    v-if="!isMobile"
                    size="sm"
                    variant="outline"
                    :disabled="parsedUnits.length === 0"
                    draggable="true"
                    @dragstart="handleOrbatDragStart"
                    title="Drag ORBAT into scenario"
                  >
                    <GripIcon class="mr-1 size-4" />
                    Drag
                  </Button>

                  <ToggleField v-model="showScratchPad">Scratch Pad</ToggleField>
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
                  />
                </ul>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle with-handle />
          <ResizablePanel :default-size="40" :min-size="15">
            <ScratchPad v-model="scratchPadUnits" />
          </ResizablePanel>
        </ResizablePanelGroup>

        <div v-else class="flex h-full flex-col overflow-hidden">
          <div
            class="bg-muted/50 flex items-center justify-between gap-4 overflow-x-auto border-b px-4 py-2"
          >
            <div class="shrink-0">
              <h2 class="text-muted-foreground hidden text-sm font-medium lg:inline">
                Generated ORBAT
              </h2>
            </div>
            <div class="flex shrink-0 items-center gap-2">
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
                v-if="!isMobile"
                size="sm"
                variant="outline"
                :disabled="parsedUnits.length === 0"
                draggable="true"
                @dragstart="handleOrbatDragStart"
                title="Drag ORBAT into scenario"
              >
                <GripIcon class="mr-1 size-4" />
                Drag
              </Button>
              <ToggleField v-model="showScratchPad">Scratch Pad</ToggleField>
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
              <OrbatTreeNode v-for="unit in parsedUnits" :key="unit.id" :unit="unit" />
            </ul>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>

  <PatternMappingModal
    v-model="showPatternMapping"
    :registry="defaultRegistry"
    :registry-version="registryVersion"
    @mappings-changed="handleMappingsChanged"
    @mappings-reset="handleMappingsReset"
  />
</template>
