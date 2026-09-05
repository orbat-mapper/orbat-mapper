<script setup lang="ts">
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { computed, h, ref, watch } from "vue";
import { klona } from "klona";
import BaseButton from "@/components/BaseButton.vue";
import { createNameToIdMap, injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type {
  CustomSymbol,
  Scenario,
  UnitEquipment,
  UnitPersonnel,
  UnitStatus,
} from "@/types/scenarioModels";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { prepareScenario } from "@/scenariostore/newScenarioStore";
import type { ColumnDef } from "@tanstack/vue-table";
import DataGrid from "@/modules/grid/DataGrid.vue";
import ToggleField from "@/components/ToggleField.vue";
import type { NSupplyCategory } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import { useImportStore } from "@/stores/importExportStore";
import ScenarioImportContribution from "@/components/ScenarioImportContribution.vue";
import { getSupplyClass, getUom } from "@/scenariostore/supplyManipulations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FieldSelect from "@/components/FieldSelect.vue";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import { isScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import type { ScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import type { FeatureId } from "@/types/scenarioGeoModels";
import {
  importScenarioOverlayLayers,
  previewScenarioOverlayReplacement,
} from "@/importexport/importScenarioLayers";

interface Props {
  data: Scenario;
}

const props = defineProps<Props>();
const contributionOptions = ref<HTMLElement | null>(null);
const contributionActions = ref<HTMLElement | null>(null);
const emit = defineEmits(["cancel", "loaded"]);
const activeScenario = injectStrict(activeScenarioKey);
const { unitActions, settings, store: scnStore, time, geo } = activeScenario;
const { loadScenario } = useBrowserScenarios();
const { send } = useNotifications();
const store = useImportStore();

const { state: targetState } = scnStore;

const importMode = ref<
  | "side"
  | "group"
  | "units"
  | "layers"
  | "statuses"
  | "equipment"
  | "personnel"
  | "supplyCategories"
  | "customSymbols"
>("side");
const selectedEquipment = ref<UnitEquipment[]>([]);
const selectedPersonnel = ref<UnitPersonnel[]>([]);
const selectedStatuses = ref<UnitStatus[]>([]);
const selectedSupplyCategories = ref<NSupplyCategory[]>([]);
const selectedCustomSymbols = ref<CustomSymbol[]>([]);
const selectedLayers = ref<ScenarioOverlayLayer[]>([]);
const layerActions = ref<Record<string, "copy" | "replace">>({});
const matchingLayers = computed(() =>
  selectedLayers.value.filter(
    (layer) => targetState.layerStackMap[layer.id]?.kind === "overlay",
  ),
);
watch(matchingLayers, (layers) => {
  for (const layer of layers) layerActions.value[layer.id] ??= "copy";
});
const layerPreviews = computed(() =>
  matchingLayers.value.flatMap((layer) =>
    layerActions.value[layer.id] === "replace"
      ? (previewScenarioOverlayReplacement(importedState.value, targetState, layer.id) ??
        [])
      : [],
  ),
);
const replacementIds = computed(() => layerPreviews.value.map((p) => p.layerId));
function previewItemName(id: FeatureId, removed: boolean) {
  const item = (removed ? targetState : importedState.value).layerItemMap[id];
  return item?.name ? `${item.name} (${id})` : id;
}
const importedState = computed(() => {
  return prepareScenario(klona(props.data));
});

const stats = computed(() => {
  return {
    units: Object.keys(importedState.value.unitMap).length,
    layers: props.data.layerStack.filter(isScenarioOverlayLayer).length,
  };
});

const importedLayers = computed(() =>
  props.data.layerStack.filter(isScenarioOverlayLayer),
);

const currentEquipment = computed(() => {
  return props.data.equipment ?? [];
});

const currentPersonnel = computed(() => {
  return props.data.personnel ?? [];
});

const currentUnitStatuses = computed(() => {
  return props.data.settings?.statuses ?? [];
});

const currentSupplyCategories = computed(() => {
  return Object.values(importedState.value.supplyCategoryMap);
});

const currentCustomIcons = computed(() => {
  return Object.values(importedState.value.customSymbolMap);
});

const sources = [
  { value: "side", label: "Side" },
  {
    value: "group",
    label: "Group",
  },
  { value: "equipment", label: "Equipment" },
  { value: "personnel", label: "Personnel" },
  { value: "statuses", label: "Statuses" },
  {
    value: "supplyCategories",
    label: "Supply",
  },
  {
    value: "customSymbols",
    label: "Symbols",
  },
  { value: "layers", label: "Layers" },
];

const isUnitImport = computed(() =>
  ["side", "group", "units"].includes(importMode.value),
);

const equipmentColumns: ColumnDef<UnitEquipment>[] = [
  {
    accessorFn: (f) => f.name,
    id: "name",
    header: "Name",
    size: 400,
  },
  {
    accessorFn: (f) => f.description,
    id: "description",
    header: "Description",
  },
];

const personnelColumns: ColumnDef<UnitPersonnel>[] = [
  {
    accessorFn: (f) => f.name,
    id: "name",
    header: "Name",
    size: 400,
  },
  {
    accessorFn: (f) => f.description,
    id: "description",
    header: "Description",
  },
];

const statusColumns: ColumnDef<UnitStatus>[] = [
  {
    accessorFn: (f) => f.name,
    id: "name",
    header: "Name",
    size: 400,
  },
  {
    accessorFn: (f) => f.description,
    id: "description",
    header: "Description",
  },
];

const supplyCategoryColumns: ColumnDef<NSupplyCategory>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  {
    id: "class",
    header: "Class",
    accessorFn: (f) => getSupplyClass(f, importedState.value),
  },
  {
    id: "unit",
    header: "Unit",
    accessorFn: (f) => getUom(f, importedState.value),
    size: 80,
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    size: 100,
  },
];

const customIconColumns: ColumnDef<CustomSymbol>[] = [
  {
    accessorFn: (f) => f.name,
    id: "name",
    header: "Name",
    size: 400,
  },
  {
    id: "src",
    header: "Icon",
    accessorKey: "src",
    enableSorting: false,
    cell: ({ getValue }) => {
      return h("img", {
        width: 32,
        height: 32,
        src: getValue() as string,
      });
    },
    size: 100,
  },
  { id: "id", header: "Id", accessorKey: "id", size: 150 },
  {
    accessorFn: (f) => (f.id in targetState.customSymbolMap ? "Yes" : "No"),
    id: "exists",
    header: "Exists?",
    enableSorting: false,
    size: 90,
  },
];

const layerColumns: ColumnDef<ScenarioOverlayLayer>[] = [
  { accessorKey: "name", id: "name", header: "Name", size: 400 },
  {
    id: "type",
    header: "Type",
    accessorFn: (layer) =>
      layer.specialization === "controlMeasure" ? "Control measures" : "Features",
    size: 180,
  },
  {
    id: "items",
    header: "Items",
    accessorFn: (layer) => layer.items.length,
    size: 90,
  },
];

async function onFormSubmit() {
  let didReplaceLayers = false;
  console.log("import mode", importMode.value);
  if (importMode.value === "equipment") {
    doEquipmentImport(selectedEquipment.value);
  } else if (importMode.value === "personnel") {
    doPersonnelImport(selectedPersonnel.value);
  } else if (importMode.value === "statuses") {
    doStatusImport(selectedStatuses.value);
  } else if (importMode.value === "supplyCategories") {
    doSupplyCategoryImport(selectedSupplyCategories.value);
  } else if (importMode.value === "customSymbols") {
    doCustomSymbolImport(selectedCustomSymbols.value);
  } else if (importMode.value === "layers") {
    didReplaceLayers = replacementIds.value.length > 0;
    scnStore.groupUpdate(
      () => {
        importScenarioOverlayLayers(
          importedState.value,
          targetState,
          geo,
          selectedLayers.value.map((layer) => layer.id),
          { replaceLayerIds: replacementIds.value },
        );
      },
      { label: "batchLayer", value: "scenario-import" },
    );
  }
  time.setCurrentTime(targetState.currentTime);
  targetState.unitStateCounter++;

  send({
    message: didReplaceLayers
      ? "Imported layers. Use Undo to revert the replacement."
      : "Imported data from scenario",
    type: "success",
  });

  if (!store.keepOpen) emit("loaded");
}

function doEquipmentImport(selectedEquipment: UnitEquipment[]) {
  const nameToIdMap = createNameToIdMap(targetState.equipmentMap);
  scnStore.groupUpdate(() => {
    for (const equipment of selectedEquipment) {
      if (nameToIdMap.has(equipment.name)) {
        continue;
      }
      unitActions.addEquipment(equipment);
    }
  });
}

function doPersonnelImport(selectedPersonnel: UnitPersonnel[]) {
  const nameToIdMap = createNameToIdMap(targetState.personnelMap);

  scnStore.groupUpdate(() => {
    for (const personnel of selectedPersonnel) {
      if (nameToIdMap.has(personnel.name)) {
        continue;
      }
      unitActions.addPersonnel(personnel);
    }
  });
}

function doStatusImport(selectedStatuses: UnitStatus[]) {
  const nameToIdMap = createNameToIdMap(targetState.unitStatusMap);
  scnStore.groupUpdate(() => {
    for (const status of selectedStatuses) {
      if (nameToIdMap.has(status.name)) {
        continue;
      }
      unitActions.addUnitStatus(status);
    }
  });
}

function doCustomSymbolImport(selectedCustomSymbols: CustomSymbol[]) {
  console.log("Importing custom symbols", selectedCustomSymbols);
  scnStore.groupUpdate(() => {
    for (const symbol of selectedCustomSymbols) {
      settings.addCustomSymbol(symbol);
    }
  });
}

function doSupplyCategoryImport(selectedSupplyCategories: NSupplyCategory[]) {
  const supplyCategoryNameToIdMap = createNameToIdMap(targetState.supplyCategoryMap);
  const supplyClassNameToIdMap = createNameToIdMap(targetState.supplyClassMap);
  const supplyUomNameToIdMap = createNameToIdMap(targetState.supplyUomMap);

  scnStore.groupUpdate(() => {
    for (const supplyCategory of selectedSupplyCategories) {
      // skip supply categories with same name as existing ones
      if (supplyCategoryNameToIdMap.has(supplyCategory.name)) {
        continue;
      }
      let supplyClassId = supplyCategory.supplyClass;
      // check if supply class exists
      const supplyClass =
        importedState.value.supplyClassMap[supplyCategory.supplyClass ?? ""];
      if (supplyClass) {
        supplyClassId = supplyClassNameToIdMap.get(supplyClass.name)!;

        if (!supplyClassId) {
          supplyClassId = unitActions.addSupplyClass(supplyClass);
        }
      }
      // check if uom exists
      let uomId = supplyCategory.uom;
      const uom = importedState.value.supplyUomMap[supplyCategory.uom ?? ""];
      if (uom) {
        uomId = supplyUomNameToIdMap.get(uom.name);
        if (!uomId) {
          uomId = unitActions.addSupplyUom(uom);
        }
      }

      unitActions.addSupplyCategory({
        ...supplyCategory,
        supplyClass: supplyClassId,
        uom: uomId,
      });
    }
  });
}
</script>
<template>
  <ImportStepLayout
    title="Import scenario data"
    subtitle="Import data from another Orbat Mapper scenario"
    help-url="https://docs.orbat-mapper.app/guide/import-data"
    has-sidebar
  >
    <template #actions>
      <ToggleField v-model="store.keepOpen" class="mr-4">Keep dialog open</ToggleField>
      <BaseButton small @click="emit('cancel')" class="flex-1 sm:flex-none"
        >Cancel</BaseButton
      >
      <div v-show="isUnitImport" ref="contributionActions" />
      <BaseButton
        v-if="!isUnitImport"
        primary
        small
        @click="onFormSubmit"
        class="flex-1 sm:flex-none"
        >Import</BaseButton
      >
    </template>

    <template #sidebar>
      <!-- Source Scenario Section -->
      <Card>
        <CardHeader class="py-3">
          <CardTitle class="text-sm">{{ data.name }}</CardTitle>
          <CardDescription v-if="data.description" class="text-xs">{{
            data.description
          }}</CardDescription>
        </CardHeader>
        <CardContent class="flex items-center justify-between gap-2 py-2">
          <span class="text-muted-foreground text-xs">
            {{ stats.units }} units · {{ stats.layers }} layers
          </span>
          <Button
            type="button"
            variant="link"
            size="sm"
            @click="loadScenario(data)"
            class="h-auto p-0 text-xs"
            >Open as new scenario</Button
          >
        </CardContent>
      </Card>

      <!-- Import Type Selection -->
      <FieldGroup>
        <FieldSet>
          <FieldLabel>Import type</FieldLabel>
          <FieldDescription>Select the type of data to import.</FieldDescription>
          <RadioGroup v-model="importMode" class="mt-2 grid grid-cols-2 gap-2">
            <FieldLabel v-for="{ value, label } in sources" :key="value">
              <Field orientation="horizontal">
                <RadioGroupItem :id="value" :value="value" class="mt-1" />
                <FieldContent>
                  <FieldTitle>{{ label }}</FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>

      <div v-show="isUnitImport" ref="contributionOptions" />
      <FieldGroup v-if="importMode === 'layers' && matchingLayers.length">
        <FieldSelect
          v-for="layer in matchingLayers"
          :key="layer.id"
          v-model="layerActions[layer.id]"
          :label="layer.name"
          :items="[
            { value: 'copy', label: 'Import as a separate copy' },
            { value: 'replace', label: 'Replace existing layer' },
          ]"
          description="Matched by layer ID."
        />
      </FieldGroup>
    </template>

    <!-- Main content: Data grids -->
    <div class="flex h-full min-h-0 flex-col p-6">
      <ScenarioImportContribution
        v-if="isUnitImport"
        :data="data"
        :options-target="contributionOptions"
        :actions-target="contributionActions"
        :mode="importMode === 'side' ? 'side' : 'group'"
        @applied="!store.keepOpen && emit('loaded')"
      />

      <template v-else-if="importMode === 'layers'">
        <section
          v-if="layerPreviews.length"
          aria-label="Layer replacement preview"
          class="mb-4 max-h-64 shrink-0 overflow-auto"
        >
          <p>
            Replacement preview: incoming properties and all contents replace the existing
            layer, including lock state and history. Missing items are removed. Undo
            reverts the whole import in one step.
          </p>
          <details v-for="preview in layerPreviews" :key="preview.layerId" class="mt-2">
            <summary>
              {{ preview.name }} ({{ preview.layerId }}):
              {{ preview.added.length }} added, {{ preview.changed.length }} changed,
              {{ preview.removed.length }} removed,
              {{ preview.unchanged.length }} unchanged
            </summary>
            <div v-for="kind in ['added', 'changed', 'removed'] as const" :key="kind">
              <p>{{ kind }}</p>
              <ul class="list-inside list-disc">
                <li v-for="id in preview[kind]" :key="id">
                  {{ previewItemName(id, kind === "removed") }}
                </li>
              </ul>
            </div>
          </details>
        </section>
        <DataGrid
          :data="importedLayers"
          :columns="layerColumns"
          :row-height="40"
          v-model:selected="selectedLayers"
          select
          select-all
          class="flex-1"
        />
      </template>

      <template v-else-if="importMode === 'equipment'">
        <DataGrid
          :data="currentEquipment"
          :columns="equipmentColumns"
          :row-height="40"
          v-model:selected="selectedEquipment"
          select
          select-all
          class="flex-1"
        />
      </template>

      <template v-else-if="importMode === 'personnel'">
        <DataGrid
          :data="currentPersonnel"
          :columns="personnelColumns"
          :row-height="40"
          v-model:selected="selectedPersonnel"
          select
          select-all
          class="flex-1"
        />
      </template>

      <template v-else-if="importMode === 'statuses'">
        <DataGrid
          :data="currentUnitStatuses"
          :columns="statusColumns"
          :row-height="40"
          v-model:selected="selectedStatuses"
          select
          select-all
          class="flex-1"
        />
      </template>

      <template v-else-if="importMode === 'supplyCategories'">
        <DataGrid
          :data="currentSupplyCategories"
          :columns="supplyCategoryColumns"
          :row-height="40"
          v-model:selected="selectedSupplyCategories"
          select
          select-all
          class="flex-1"
        />
      </template>

      <template v-else-if="importMode === 'customSymbols'">
        <DataGrid
          :data="currentCustomIcons"
          :columns="customIconColumns"
          :row-height="40"
          v-model:selected="selectedCustomSymbols"
          select
          select-all
          class="flex-1"
        />
      </template>
    </div>
  </ImportStepLayout>
</template>
