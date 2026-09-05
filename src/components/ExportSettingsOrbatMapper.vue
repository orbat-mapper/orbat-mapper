<script setup lang="ts">
import { type OrbatMapperExportSettings } from "@/types/importExport.ts";
import { computed, ref, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import { nanoid } from "@/utils";
import { buildRecipientScenario } from "@/importexport/export/recipientScenario";
import { suggestExportNames } from "@/importexport/export/exportNames";
import type { Unit } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import FieldSelect from "@/components/FieldSelect.vue";
import InputGroup from "@/components/InputGroup.vue";

const form = defineModel<OrbatMapperExportSettings>({ required: true });

const {
  io,
  store: { state },
} = injectStrict(activeScenarioKey);

// Existing persisted export settings predate layer selection. Start those users with
// every layer selected, preserving the export behavior they had before this option.
if (form.value.layerIds === undefined) form.value.layerIds = [...state.layerStack];

if (form.value.emptySideIds === undefined) form.value.emptySideIds = [];

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const layers = computed(() => {
  return state.layerStack.map((id) => state.layerStackMap[id]).filter(Boolean);
});

const automaticScenarioName = ref(
  !form.value.scenarioName || form.value.scenarioName === state.info.name,
);
const automaticFileName = ref(
  !form.value.fileName || form.value.fileName === "scenario.json",
);
const suggestedNames = computed(() =>
  suggestExportNames(state.info.name, sides.value, state.layerStack, form.value),
);
watch(
  suggestedNames,
  (names) => {
    if (automaticScenarioName.value) form.value.scenarioName = names.scenarioName;
    if (automaticFileName.value) form.value.fileName = names.fileName;
  },
  { immediate: true },
);

interface ExportPreset {
  id: string;
  name: string;
  sideGroups: string[];
  emptySideIds?: string[];
  layerIds: NonNullable<OrbatMapperExportSettings["layerIds"]>;
  scenarioName?: string;
  fileName: string;
}
const presets = useLocalStorage<ExportPreset[]>(
  computed(() => `orbatmapper:export-presets:${state.id}`),
  [],
);
const presetItems = computed(() => [
  { label: "Custom selection", value: "custom" },
  ...presets.value.map((preset) => ({ label: preset.name, value: preset.id })),
]);
const selectedPreset = ref("custom");
const hasSelectedPreset = computed(() =>
  presets.value.some((preset) => preset.id === selectedPreset.value),
);
const presetName = ref("");
const notice = ref("");
function savePreset(replace = false) {
  if (!presetName.value.trim()) return;
  const preset: ExportPreset = {
    id: replace ? selectedPreset.value : nanoid(),
    name: presetName.value.trim(),
    sideGroups: [...form.value.sideGroups],
    emptySideIds: [...(form.value.emptySideIds ?? [])],
    layerIds: [...(form.value.layerIds ?? state.layerStack)],
    scenarioName: form.value.scenarioName,
    fileName: form.value.fileName,
  };
  presets.value = [...presets.value.filter((p) => p.id !== preset.id), preset];
  selectedPreset.value = preset.id;
  notice.value = `Saved ${preset.name}.`;
}
function loadPreset() {
  const preset = presets.value.find((p) => p.id === selectedPreset.value);
  if (!preset) return;
  automaticScenarioName.value = false;
  automaticFileName.value = false;
  const groups = preset.sideGroups.filter((id) => state.sideGroupMap[id]);
  const emptySides = (preset.emptySideIds ?? []).filter(
    (id) => state.sideMap[id]?.groups.length === 0,
  );
  const layers = preset.layerIds.filter((id) => state.layerStackMap[id]);
  form.value = {
    ...form.value,
    sideGroups: groups,
    emptySideIds: emptySides,
    layerIds: layers,
    scenarioName: preset.scenarioName,
    fileName: preset.fileName,
  };
  presetName.value = preset.name;
  notice.value =
    groups.length !== preset.sideGroups.length ||
    emptySides.length !== (preset.emptySideIds ?? []).length ||
    layers.length !== preset.layerIds.length
      ? "Some saved selections no longer exist or are no longer empty and were omitted. Review the selection."
      : `Loaded ${preset.name}.`;
}
function deletePreset() {
  presets.value = presets.value.filter((p) => p.id !== selectedPreset.value);
  selectedPreset.value = "custom";
  notice.value = "Preset deleted. Current export selections are unchanged.";
}
const showPreview = ref(false);
const preview = computed(() =>
  showPreview.value ? buildRecipientScenario(io.toObject(), form.value) : undefined,
);
const scenarioData = computed(() => {
  if (!preview.value) return {};
  return Object.fromEntries(
    Object.entries(preview.value).filter(
      ([key]) => !["sides", "layerStack"].includes(key),
    ),
  );
});
function countUnits(units: Unit[]): number {
  return units.reduce((total, unit) => total + 1 + countUnits(unit.subUnits ?? []), 0);
}

function toggleSide(sideId: string) {
  const groups = state.sideMap[sideId].groups;
  if (!groups.length) {
    const selected = form.value.emptySideIds ?? [];
    form.value.emptySideIds = selected.includes(sideId)
      ? selected.filter((id) => id !== sideId)
      : [...selected, sideId];
    return;
  }
  if (form.value.sideGroups.some((g) => groups.includes(g))) {
    form.value.sideGroups = form.value.sideGroups.filter((g) => !groups.includes(g));
  } else {
    form.value.sideGroups.push(...groups);
  }
}
</script>

<template>
  <section class="prose prose-sm dark:prose-invert">
    <p>Export partial scenario</p>
  </section>
  <fieldset class="flex flex-col gap-4">
    <details aria-label="Export presets">
      <summary class="text-muted-foreground cursor-pointer text-sm">
        Export presets<span v-if="hasSelectedPreset">
          · {{ presets.find((preset) => preset.id === selectedPreset)?.name }}</span
        >
      </summary>
      <div class="mt-3 flex max-w-lg flex-col gap-3">
        <FieldSelect
          label="Saved preset"
          v-model="selectedPreset"
          :items="presetItems"
          @update:model-value="loadPreset"
        />
        <InputGroup
          label="Preset name"
          v-model="presetName"
          placeholder="Blue contacts update"
        />
        <div class="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="!presetName.trim()"
            @click="savePreset()"
            >Save as new preset</Button
          >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="!hasSelectedPreset || !presetName.trim()"
            @click="savePreset(true)"
            >Update preset</Button
          >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="!hasSelectedPreset"
            @click="deletePreset"
            >Delete preset</Button
          >
        </div>
        <p class="text-muted-foreground text-sm">
          Presets are saved in this browser for this scenario. New groups and layers must
          be selected explicitly.
        </p>
        <p role="status" class="text-sm">{{ notice }}</p>
      </div>
    </details>
    <InputGroupTemplate label="Select which sides and groups you want to export">
      <div class="divide-y">
        <div v-for="v in sides" :key="v.id" class="grid grid-cols-4 gap-4 py-3">
          <button
            type="button"
            class="flex text-sm font-medium"
            @click="toggleSide(v.id)"
          >
            {{ v.name }}
          </button>

          <InputCheckbox
            v-if="!v.groups.length"
            label="Include side"
            :value="v.id"
            v-model="form.emptySideIds"
          />
          <InputCheckbox
            v-for="g in v.groups"
            :label="state.sideGroupMap[g].name"
            :value="g"
            :key="g"
            v-model="form.sideGroups"
          />
        </div>
      </div>
    </InputGroupTemplate>
    <InputGroupTemplate label="Select which layers you want to export">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputCheckbox
          v-for="layer in layers"
          :key="layer.id"
          :label="layer.name"
          :description="
            layer.kind === 'overlay' && layer.specialization === 'controlMeasure'
              ? 'Control measures'
              : undefined
          "
          :value="layer.id"
          v-model="form.layerIds"
        />
      </div>
      <p v-if="!layers.length" class="text-muted-foreground text-sm">
        This scenario has no layers.
      </p>
    </InputGroupTemplate>
    <InputGroup
      label="Scenario name"
      v-model="form.scenarioName"
      @update:model-value="automaticScenarioName = false"
    />
    <InputGroup
      label="Name of downloaded file"
      v-model="form.fileName"
      @update:model-value="automaticFileName = false"
    />
    <section class="space-y-3 rounded-md border p-4" aria-label="Recipient preview">
      <Button
        type="button"
        variant="outline"
        :aria-expanded="showPreview"
        @click="showPreview = !showPreview"
        >{{ showPreview ? "Hide recipient preview" : "Preview recipient data" }}</Button
      >
      <template v-if="preview">
        <h3 class="font-semibold">{{ preview.name }}</h3>
        <p class="text-sm">
          This is the data included in the downloaded file, including hidden items and
          stored histories. Map visibility does not remove data from the export.
        </p>
        <details>
          <summary class="cursor-pointer">Inspect complete recipient data</summary>
          <pre class="max-h-96 overflow-auto text-xs break-all whitespace-pre-wrap">{{
            JSON.stringify(preview, null, 2)
          }}</pre>
        </details>
        <h4 class="font-medium">Included sides and groups</h4>
        <p v-if="!preview.sides.length" class="text-sm">No sides or groups included.</p>
        <template v-for="side in preview.sides" :key="side.id">
          <p v-if="!side.groups.length" class="text-sm">{{ side.name }} — no groups</p>
          <details v-for="group in side.groups" :key="group.id">
            <summary class="cursor-pointer">
              {{ side.name }} / {{ group.name }} — {{ countUnits(group.subUnits) }} units
            </summary>
            <pre class="max-h-72 overflow-auto text-xs break-all whitespace-pre-wrap">{{
              JSON.stringify(group, null, 2)
            }}</pre>
          </details>
        </template>
        <h4 class="font-medium">Included layers</h4>
        <p v-if="!preview.layerStack.length" class="text-sm">No layers included.</p>
        <details v-for="layer in preview.layerStack" :key="layer.id">
          <summary class="cursor-pointer">{{ layer.name }} ({{ layer.kind }})</summary>
          <pre class="max-h-72 overflow-auto text-xs break-all whitespace-pre-wrap">{{
            JSON.stringify(layer, null, 2)
          }}</pre>
        </details>
        <h4 class="font-medium">Scenario-wide data</h4>
        <p class="text-sm">
          Descriptions, events, templates, catalogs and settings are retained regardless
          of group and layer selection. Inspect these for information the recipient should
          not receive.
        </p>
        <details v-for="(value, key) in scenarioData" :key="key">
          <summary class="cursor-pointer">{{ key }}</summary>
          <pre class="max-h-72 overflow-auto text-xs break-all whitespace-pre-wrap">{{
            JSON.stringify(value, null, 2)
          }}</pre>
        </details>
        <p class="text-muted-foreground text-sm">
          The download receives a new scenario ID and export timestamp.
        </p>
      </template>
    </section>
  </fieldset>
</template>
