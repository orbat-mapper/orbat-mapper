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
import BaseButton from "@/components/BaseButton.vue";
import { createNameToIdMap, injectStrict, moveItemMutable } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type {
  CustomSymbol,
  Scenario,
  SideGroup,
  Unit,
  UnitEquipment,
  UnitPersonnel,
  UnitStatus,
  UnitSymbolOptions,
} from "@/types/scenarioModels";
import { mapReinforcedStatus2Field } from "@/types/scenarioModels";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import type { SelectItem } from "@/components/types";
import { prepareScenario } from "@/scenariostore/newScenarioStore";
import type { CellContext, ColumnDef } from "@tanstack/vue-table";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import ToggleField from "@/components/ToggleField.vue";
import type { NSideGroup, NSupplyCategory, NUnit } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { useImportStore } from "@/stores/importExportStore";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import dayjs from "dayjs";
import InlineAlertWarning from "@/components/InlineAlertWarning.vue";
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

interface Props {
  data: Scenario;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const activeScenario = injectStrict(activeScenarioKey);
const { unitActions, settings, store: scnStore, time } = activeScenario;
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
const unitImportMode = ref<"units-only" | "units-and-state" | "state-only">(
  "units-and-state",
);
const stateMergeMode = ref<"replace" | "add_new">("replace");
const sideMergeMode = ref<"replace" | "add_new">("replace");
const groupMergeMode = ref<"replace" | "add_new">("add_new");
const selectedItems = ref<(Unit | SideGroup)[]>([]);
const selectedEquipment = ref<UnitEquipment[]>([]);
const selectedPersonnel = ref<UnitPersonnel[]>([]);
const selectedStatuses = ref<UnitStatus[]>([]);
const selectedSupplyCategories = ref<NSupplyCategory[]>([]);
const selectedCustomSymbols = ref<CustomSymbol[]>([]);
const importedState = computed(() => {
  return prepareScenario(props.data);
});

const fmt = useTimeFormatStore();

function getCombinedSymbolOptions(
  unitOrSideGroup: NUnit | NSideGroup,
  ignoreUnit = false,
): UnitSymbolOptions {
  if (!unitOrSideGroup) return {};
  const state = importedState.value;
  let _sid, _gid, reinforcedReduced;
  if ("sidc" in unitOrSideGroup) {
    _sid = unitOrSideGroup._sid;
    _gid = unitOrSideGroup._gid;
    reinforcedReduced = mapReinforcedStatus2Field(unitOrSideGroup.reinforcedStatus);
  } else {
    _sid = unitOrSideGroup._pid;
    _gid = unitOrSideGroup.id;
    ignoreUnit = true;
  }
  return {
    ...(state.sideMap[_sid!]?.symbolOptions || {}),
    ...(state.sideGroupMap[_gid!]?.symbolOptions || {}),
    ...(ignoreUnit ? {} : unitOrSideGroup.symbolOptions || {}),
    ...(ignoreUnit ? {} : { reinforcedReduced: reinforcedReduced ?? "" }),
  };
}

const stats = computed(() => {
  return {
    units: Object.keys(importedState.value.unitMap).length,
  };
});

const importedSides = computed((): SelectItem[] => {
  return importedState.value.sides
    .map((id) => importedState.value.sideMap[id])
    .map((side) => {
      return {
        label: side.name,
        value: side.id,
      };
    });
});

const targetSides = computed((): SelectItem[] => {
  return targetState.sides
    .map((id) => targetState.sideMap[id])
    .map((side) => {
      return {
        label: side.name,
        value: side.id,
      };
    });
});

const importedSideGroups = computed(() => {
  const sideId = selectedSourceSideId.value;
  if (!sideId) return [];
  const side = importedState.value.sideMap[sideId];
  if (!side) return [];
  return side.groups
    .map((id) => importedState.value.sideGroupMap[id])
    .map((sideGroup) => {
      return {
        label: sideGroup.name,
        value: sideGroup.id,
      };
    });
});

const selectedSourceSideId = ref(importedSides.value[0]?.value as string);
const selectedTargetSideId = ref(targetSides.value[0]?.value as string);
const selectedSourceSideGroupId = ref(importedSideGroups.value[0]?.value as string);

const selectedSourceSide = computed(() => {
  return props.data.sides.find((s) => s.id === selectedSourceSideId.value);
});

const currentData = computed(() => {
  const s = props.data.sides.find((s) => s.id === selectedSourceSideId.value);

  if (importMode.value === "side") {
    return [...(s?.groups ?? []), ...(s?.subUnits ?? [])];
  }

  const sg = s?.groups.find((g) => g.id === selectedSourceSideGroupId.value);
  return sg?.subUnits ?? [];
});

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

const isSettingsImport = computed(() =>
  ["statuses", "equipment", "personnel", "supplyCategories", "customSymbols"].includes(
    importMode.value,
  ),
);

const hasExistingUnits = computed(() => {
  return selectedItems.value.some((item) => item.id in targetState.unitMap);
});

const hasExistingSide = computed(() => {
  return selectedSourceSideId.value in targetState.sideMap;
});

const hasExistingSideGroup = computed(() => {
  return selectedSourceSideGroupId.value in targetState.sideGroupMap;
});

const wantsToImportState = computed(
  () =>
    unitImportMode.value === "units-and-state" || unitImportMode.value === "state-only",
);

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
];

watch(selectedSourceSideId, (newSide) => {
  const side = importedState.value.sideMap[newSide];
  selectedSourceSideGroupId.value = side.groups[0];
});

watch(hasExistingUnits, (exists) => {
  if (!exists && unitImportMode.value === "state-only") {
    unitImportMode.value = "units-and-state";
  }
});

function renderExpandCell({ getValue, row }: CellContext<Unit, string>) {
  const symbolOptions: UnitSymbolOptions & { customSymbolMap?: Record<string, unknown> } =
    getCombinedSymbolOptions(importedState.value.unitMap[row.original.id]);
  symbolOptions.customSymbolMap = importedState.value.customSymbolMap ?? {};

  return h(OrbatCellRenderer, {
    value: getValue(),
    sidc: row.original.sidc,
    expanded: row.getIsExpanded(),
    level: row.depth,
    canExpand: row.getCanExpand(),
    onToggle: row.getToggleExpandedHandler(),
    symbolOptions,
  });
}

const computedColumns = computed((): (ColumnDef<Unit> | false)[] => {
  return [
    {
      accessorFn: (f) => f.name,
      id: "name",
      cell: renderExpandCell,
      header: ({ table }) => {
        return h(
          "button",
          {
            type: "button",
            title: "Expand/collapse all",
            onClick: table.getToggleAllRowsExpandedHandler(),
            class: "flex items-center gap-2",
          },
          [
            h(ChevronRightIcon, {
              class: [
                "size-6 transform transition-transform text-muted-foreground",
                table.getIsAllRowsExpanded() ? "rotate-90" : "",
              ],
            }),
            "Name",
          ],
        );
      },
      enableGlobalFilter: false,
      size: 350,
      enableSorting: false,
    },
    {
      accessorFn: (f) =>
        f.state?.length
          ? fmt.trackFormatter.format(+new Date(f.state[f.state.length - 1].t)) +
            ` (${f.state.length})`
          : "",
      id: "t",
      header: "Last state entry",
      enableSorting: false,
      size: 235,
    },
    {
      accessorFn: (f) =>
        f.id in targetState.unitMap || f.id in targetState.sideGroupMap ? "Yes" : "No",
      id: "exists",
      header: "Exists?",
      enableSorting: false,
      size: 90,
    },

    {
      accessorFn: (f) => {
        if (!f.state?.length) return "";
        const existingUnit = targetState.unitMap[f.id];
        if (!existingUnit) return "";
        if (!existingUnit.state?.length) return "";
        const lastTimestamp = existingUnit.state[existingUnit.state.length - 1].t;
        const lastSourceTimestamp = f.state[f.state.length - 1].t;
        const diff = +new Date(lastSourceTimestamp) - lastTimestamp;
        if (diff === 0) return "";
        return dayjs.duration(diff).toISOString();
      },

      id: "diff",
      header: "Diff",
      enableSorting: false,
    },
  ];
});

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

// check that the item is a unit
function isUnit(item: Unit | SideGroup): item is Unit {
  return "sidc" in item;
}

async function onFormSubmit() {
  const selectedUnitIds = new Set(selectedItems.value.filter(isUnit).map((u) => u.id));
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
  } else if (unitImportMode.value === "state-only") {
    doStateOnlyImport(selectedUnitIds);
  } else if (importMode.value === "side" && selectedSourceSideId.value) {
    doSideImport(selectedSourceSideId.value);
  } else if (importMode.value === "group" && selectedSourceSideGroupId.value) {
    doGroupImport(selectedSourceSideGroupId.value);
  }
  time.setCurrentTime(targetState.currentTime);
  targetState.unitStateCounter++;

  send({
    message: "Imported data from scenario",
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

function doStateOnlyImport(selectedUnitIds: Set<string>) {
  scnStore.groupUpdate(() => {
    for (const importedUnitId of selectedUnitIds) {
      const importedUnit = importedState.value.unitMap[importedUnitId];
      if (!importedUnit || !importedUnit.state?.length) {
        continue;
      }
      const existingUnit = targetState.unitMap[importedUnit.id];
      if (!existingUnit) {
        continue;
      }
      if (stateMergeMode.value === "replace" || !existingUnit.state?.length) {
        unitActions.setUnitState(existingUnit.id, importedUnit.state);
      } else {
        const lastTimestamp = existingUnit.state[existingUnit.state.length - 1].t;
        const newStates = importedUnit.state.filter((s) => s.t > lastTimestamp);
        if (newStates.length) {
          unitActions.setUnitState(existingUnit.id, [
            ...existingUnit.state,
            ...newStates,
          ]);
        }
      }
    }
  });
}

function doSideImport(importedSideId: string) {
  const sideAlreadyExists = hasExistingSide.value;

  const importedSide = importedState.value.sideMap[importedSideId];
  const createNewId = sideAlreadyExists && sideMergeMode.value === "add_new";

  scnStore.groupUpdate(() => {
    let deletedSideIndex = -1;
    if (sideAlreadyExists && sideMergeMode.value === "replace") {
      deletedSideIndex = targetState.sides.findIndex((id) => id === importedSideId);
      unitActions.deleteSide(importedSideId);
    }

    const addedSideId = unitActions.addSide(importedSide, {
      addDefaultGroup: false,
      markAsNew: false,
      newId: createNewId,
    });
    if (deletedSideIndex !== -1) {
      const nextSideId = targetState.sides[deletedSideIndex + 1];
      if (nextSideId) unitActions.moveSide(addedSideId, nextSideId, "above");
    }
    for (const item of currentData.value) {
      if (isUnit(item)) {
        addUnitHierarchy(item, addedSideId, activeScenario, {
          newIds: createNewId,
          includeState: unitImportMode.value === "units-and-state",
          sourceState: importedState.value,
        });
        continue;
      }
      const groupId = item.id;
      const importedGroup = importedState.value.sideGroupMap[groupId];
      const addedGroupId = unitActions.addSideGroup(
        addedSideId,
        { ...importedGroup, _isNew: false },
        {
          newId: createNewId,
        },
      );
      if (!item.subUnits || !addedGroupId) continue;
      for (const unit of item.subUnits) {
        addUnitHierarchy(unit, addedGroupId, activeScenario, {
          newIds: createNewId,
          includeState: unitImportMode.value === "units-and-state",
          sourceState: importedState.value,
        });
      }
    }
  });
}

function doGroupImport(importedGroupId: string) {
  const importedGroup = importedState.value.sideGroupMap[importedGroupId];
  const targetSideId = selectedTargetSideId.value;
  if (!importedGroup) return;
  const groupAlreadyExists = importedGroupId in targetState.sideGroupMap;
  const createNewId = groupAlreadyExists && groupMergeMode.value === "add_new";

  scnStore.groupUpdate(() => {
    let deletedGroupIndex = -1;
    if (groupAlreadyExists && groupMergeMode.value === "replace") {
      deletedGroupIndex = targetState.sideMap[targetSideId].groups.findIndex(
        (id) => id === importedGroupId,
      );
      unitActions.deleteSideGroup(importedGroupId);
    }

    const importedGroup = importedState.value.sideGroupMap[importedGroupId];
    const addedGroupId = unitActions.addSideGroup(
      targetSideId,
      { ...importedGroup, _isNew: false },
      {
        newId: createNewId,
      },
    );
    if (!addedGroupId) return;
    if (deletedGroupIndex !== -1) {
      scnStore.update((s) => {
        const groups = s.sideMap[targetSideId].groups;
        moveItemMutable(groups, groups.length - 1, deletedGroupIndex);
      });
    }

    for (const unit of currentData.value as Unit[]) {
      addUnitHierarchy(unit, addedGroupId, activeScenario, {
        newIds: createNewId,
        includeState: unitImportMode.value === "units-and-state",
        sourceState: importedState.value,
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
      <BaseButton primary small @click="onFormSubmit" class="flex-1 sm:flex-none"
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
          <span class="text-muted-foreground text-xs">{{ stats.units }} units</span>
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

      <!-- Source Selection (for unit imports) -->
      <template v-if="!isSettingsImport">
        <!-- Import Content Options -->
        <FieldSet>
          <FieldLabel>Content to import</FieldLabel>
          <RadioGroup v-model="unitImportMode" class="mt-2 flex flex-col gap-2">
            <FieldLabel for="units-only">
              <Field orientation="horizontal">
                <RadioGroupItem id="units-only" value="units-only" />
                <FieldContent>
                  <FieldTitle>Units only</FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>
            <FieldLabel for="units-and-state">
              <Field orientation="horizontal">
                <RadioGroupItem id="units-and-state" value="units-and-state" />
                <FieldContent>
                  <FieldTitle>Units with state</FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>
            <FieldLabel v-if="hasExistingUnits" for="state-only">
              <Field orientation="horizontal">
                <RadioGroupItem id="state-only" value="state-only" />
                <FieldContent>
                  <FieldTitle>State only (update existing)</FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>

        <!-- Conflict Resolution Section -->
        <FieldSet v-if="hasExistingSide || hasExistingSideGroup || hasExistingUnits">
          <FieldLabel>Conflict resolution</FieldLabel>

          <!-- Side conflict -->
          <div
            v-if="
              hasExistingSide && importMode === 'side' && unitImportMode !== 'state-only'
            "
            class="space-y-2"
          >
            <InlineAlertWarning class="text-xs"
              >Side "{{ selectedSourceSide?.name }}" already exists.</InlineAlertWarning
            >
            <RadioGroup v-model="sideMergeMode" class="flex flex-col gap-2">
              <FieldLabel for="side-replace">
                <Field orientation="horizontal">
                  <RadioGroupItem id="side-replace" value="replace" />
                  <FieldContent>
                    <FieldTitle>Replace existing</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel for="side-add_new">
                <Field orientation="horizontal">
                  <RadioGroupItem id="side-add_new" value="add_new" />
                  <FieldContent>
                    <FieldTitle>Create new side</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
          </div>

          <!-- Group conflict -->
          <div
            v-if="
              hasExistingSideGroup &&
              importMode === 'group' &&
              unitImportMode !== 'state-only'
            "
            class="space-y-2"
          >
            <InlineAlertWarning class="text-xs"
              >Group already exists in target scenario.</InlineAlertWarning
            >
            <RadioGroup v-model="groupMergeMode" class="flex flex-col gap-2">
              <FieldLabel for="group-replace">
                <Field orientation="horizontal">
                  <RadioGroupItem id="group-replace" value="replace" />
                  <FieldContent>
                    <FieldTitle>Replace existing</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel for="group-add_new">
                <Field orientation="horizontal">
                  <RadioGroupItem id="group-add_new" value="add_new" />
                  <FieldContent>
                    <FieldTitle>Create new group</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
            <FieldSelect
              v-if="groupMergeMode !== 'replace'"
              label="Target side"
              :items="targetSides"
              v-model="selectedTargetSideId"
            />
          </div>

          <!-- Unit conflicts (state import) -->
          <div
            v-if="
              hasExistingUnits && wantsToImportState && unitImportMode == 'state-only'
            "
            class="space-y-2"
          >
            <InlineAlertWarning class="text-xs"
              >Some units exist in both scenarios.</InlineAlertWarning
            >
            <RadioGroup v-model="stateMergeMode" class="flex flex-col gap-2">
              <FieldLabel for="state-replace">
                <Field orientation="horizontal">
                  <RadioGroupItem id="state-replace" value="replace" />
                  <FieldContent>
                    <FieldTitle>Replace existing state</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel for="state-add_new">
                <Field orientation="horizontal">
                  <RadioGroupItem id="state-add_new" value="add_new" />
                  <FieldContent>
                    <FieldTitle>Add new state only</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
          </div>
        </FieldSet>
      </template>
    </template>

    <!-- Main content: Data grids -->
    <div class="flex h-full min-h-0 flex-col p-6">
      <template v-if="!isSettingsImport">
        <div class="mb-4 flex gap-4">
          <FieldSelect
            class="w-64"
            label="Side"
            :items="importedSides"
            v-model="selectedSourceSideId"
          />
          <FieldSelect
            v-if="importMode === 'group' || importMode === 'units'"
            class="w-64"
            label="Group"
            v-model="selectedSourceSideGroupId"
            :items="importedSideGroups"
          />
        </div>
        <DataGrid
          :key="selectedSourceSideGroupId"
          :data="currentData"
          :columns="computedColumns"
          :row-height="40"
          class="flex-1"
          :get-sub-rows="(row) => row.subUnits ?? row.groups"
          select-all
          v-model:selected="selectedItems"
          no-indeterminate
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
