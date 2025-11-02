<script setup lang="ts">
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
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
import { useImportStore } from "@/stores/importExportStore";
import type { NSideGroup, NSupplyCategory, NUnit } from "@/types/internalModels";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import InputRadio from "@/components/InputRadio.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";
import { useNotifications } from "@/composables/notifications";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import dayjs from "dayjs";
import InlineAlertWarning from "@/components/InlineAlertWarning.vue";
import { getSupplyClass, getUom } from "@/scenariostore/supplyManipulations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FieldSelect from "@/components/FieldSelect.vue";

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
const unitImportMode = ref<"units-only" | "units-and-state" | "state-only">("state-only");
const stateMergeMode = ref<"replace" | "add_new">("replace");
const sideMergeMode = ref<"replace" | "add_new">("replace");
const groupMergeMode = ref<"replace" | "add_new">("add_new");
const selectUnits = ref(false);
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
  return importedState.value.sideMap[selectedSourceSideId.value].groups
    .map((id) => importedState.value.sideGroupMap[id])
    .map((sideGroup) => {
      return {
        label: sideGroup.name,
        value: sideGroup.id,
      };
    });
});

const selectedSourceSideId = ref(importedSides.value[0].value as string);
const selectedTargetSideId = ref(targetSides.value[0].value as string);
const selectedSourceSideGroupId = ref(importedSideGroups.value[0].value as string);
const currentData = computed(() => {
  const s = props.data.sides.find((s) => s.id === selectedSourceSideId.value);

  if (importMode.value === "side") {
    return s?.groups ?? [];
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

const sources: SelectItem[] = [
  { value: "side", label: "Side" },
  { value: "group", label: "Group" },
  { value: "equipment", label: "Equipment categories" },
  { value: "personnel", label: "Personnel categories" },
  { value: "statuses", label: "Unit statuses" },
  { value: "supplyCategories", label: "Supply Categories" },
  { value: "customSymbols", label: "Custom symbols" },
];

watch(selectedSourceSideId, (newSide) => {
  const side = importedState.value.sideMap[newSide];
  selectedSourceSideGroupId.value = side.groups[0];
});

function renderExpandCell({ getValue, row }: CellContext<Unit, string>) {
  let symbolOptions: Record<string, any> = getCombinedSymbolOptions(
    importedState.value.unitMap[row.original.id],
  );
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
      header: ({ table, column }) => {
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
                "size-6 transform transition-transform text-gray-500",
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
    cell: ({ row, getValue, cell }) => {
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

async function onFormSubmit(e: Event) {
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
  } else if (importMode.value === "side") {
    doSideImport(selectedSourceSideId.value);
  } else if (importMode.value === "group") {
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
  let createNewId = sideAlreadyExists && sideMergeMode.value === "add_new";

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
      nextSideId && unitActions.moveSide(addedSideId, nextSideId, "above");
    }
    for (const group of currentData.value) {
      const groupId = group.id;
      const importedGroup = importedState.value.sideGroupMap[groupId];
      const addedGroupId = unitActions.addSideGroup(
        addedSideId,
        { ...importedGroup, _isNew: false },
        {
          newId: createNewId,
        },
      );
      if (!group.subUnits || !addedGroupId) continue;
      for (const unit of group.subUnits) {
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
  <div class="">
    <form @submit.prevent="onFormSubmit" class="mt-4 flex max-h-[80vh] flex-col">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Import scenario data</FieldLegend>
          <div class="flex items-center gap-4">
            <FieldDescription>
              Select which parts of the loaded scenario you want to import into the
              current scenario.
            </FieldDescription>
            <Button type="button" variant="outline" @click="loadScenario(data)"
              >Load as new scenario instead</Button
            >
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{{ data.name }}</CardTitle>
              <CardDescription>{{ data.description }}</CardDescription>
            </CardHeader>
            <CardContent class="text-sm">Units: {{ stats.units }}</CardContent>
          </Card>
        </FieldSet>
        <FieldSeparator> Source </FieldSeparator>
        <FieldSet>
          <FieldLabel>Which parts of the scenario do you want to import?</FieldLabel>
          <RadioGroup v-model="importMode" class="grid gap-y-3 sm:grid-cols-4">
            <Field
              v-for="{ value, label } in sources"
              :key="value"
              orientation="horizontal"
            >
              <RadioGroupItem :id="value.toString()" :value />
              <FieldLabel :for="value" class="font-normal">
                {{ label }}
              </FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>

        <template v-if="!isSettingsImport">
          <div class="grid grid-cols-2 gap-4">
            <FieldSelect
              label="Side"
              :items="importedSides"
              v-model="selectedSourceSideId"
            />
            <FieldSelect
              v-if="importMode === 'group' || importMode === 'units'"
              label="Side group"
              v-model="selectedSourceSideGroupId"
              :items="importedSideGroups"
            />
          </div>
          <FieldDescription v-if="hasExistingSide"
            >This side exists in the target scenario</FieldDescription
          >
        </template>

        <div class="mt-2 flex items-center justify-between">
          <ToggleField
            v-if="importMode === 'units'"
            v-model="selectUnits"
            class="flex-0 shrink-0"
            disabled
            >Select individual units</ToggleField
          >
        </div>
        <template v-if="!isSettingsImport">
          <DataGrid
            :key="selectedSourceSideGroupId"
            :data="currentData"
            :columns="computedColumns"
            :row-height="40"
            class="mt-4 max-h-[40vh]"
            :get-sub-rows="(row) => row.subUnits ?? row.groups"
            :select="selectUnits"
            select-all
            v-model:selected="selectedItems"
            no-indeterminate
          />

          <fieldset>
            <InlineAlertWarning v-if="hasExistingUnits"
              >There are units in the source scenario that exists in the target scenario.
            </InlineAlertWarning>
            <InlineAlertWarning v-if="importMode === 'group' && hasExistingSideGroup"
              >The selected group exists in the target scenario.
            </InlineAlertWarning>
            <PanelSubHeading class="mt-4">What do you want to import?</PanelSubHeading>
            <MRadioGroup class="mt-2 flex w-full items-center gap-5">
              <InputRadio v-model="unitImportMode" :value="'units-only'"
                >Only units
              </InputRadio>
              <InputRadio v-model="unitImportMode" value="units-and-state"
                >Units and state
              </InputRadio>
              <InputRadio
                v-if="hasExistingUnits"
                v-model="unitImportMode"
                value="state-only"
                >State (only for existing units)
              </InputRadio>
              <span v-else class="text-sm text-gray-500"
                >There are no source units that exists in the target scenario.</span
              >
            </MRadioGroup>
          </fieldset>

          <FieldSeparator> Target </FieldSeparator>
          <fieldset
            v-if="
              hasExistingSide && importMode === 'side' && unitImportMode !== 'state-only'
            "
          >
            <PanelSubHeading class="mt-4"
              >The side you want to import already exists. What do you want to do?
            </PanelSubHeading>
            <MRadioGroup class="mt-2 flex w-full gap-5">
              <InputRadio v-model="sideMergeMode" value="replace"
                >Overwrite existing side
              </InputRadio>
              <InputRadio v-model="sideMergeMode" value="add_new"
                >Import as new side
              </InputRadio>
            </MRadioGroup>
          </fieldset>
          <fieldset
            v-if="
              hasExistingSideGroup &&
              importMode === 'group' &&
              unitImportMode !== 'state-only'
            "
          >
            <PanelSubHeading class="mt-4"
              >The group you want to import already exists. What do you want to do?
            </PanelSubHeading>
            <MRadioGroup class="mt-2 flex w-full gap-5">
              <InputRadio v-model="groupMergeMode" value="replace"
                >Overwrite existing group
              </InputRadio>
              <InputRadio v-model="groupMergeMode" value="add_new"
                >Import as new group
              </InputRadio>
            </MRadioGroup>
          </fieldset>
          <FieldSelect
            v-if="
              importMode === 'group' &&
              unitImportMode !== 'state-only' &&
              groupMergeMode !== 'replace'
            "
            label="Target side"
            :items="targetSides"
            v-model="selectedTargetSideId"
          >
          </FieldSelect>
          <template
            v-if="
              hasExistingUnits && wantsToImportState && unitImportMode == 'state-only'
            "
          >
            <PanelSubHeading class="mt-4"
              >State import options for existing units
            </PanelSubHeading>
            <MRadioGroup class="mt-2 flex w-full gap-5">
              <InputRadio v-model="stateMergeMode" value="replace"
                >Overwrite existing state
              </InputRadio>
              <InputRadio v-model="stateMergeMode" value="add_new"
                >Add only new state
              </InputRadio>
            </MRadioGroup>
          </template>
        </template>
        <template v-else-if="importMode === 'equipment'">
          <PanelSubHeading class="mt-4">Equipment categories</PanelSubHeading>
          <DataGrid
            :data="currentEquipment"
            :columns="equipmentColumns"
            :row-height="40"
            v-model:selected="selectedEquipment"
            select
            select-all
            class="mt-4 max-h-[40vh]"
          />
        </template>
        <template v-else-if="importMode === 'personnel'">
          <PanelSubHeading class="mt-4">Personnel categories</PanelSubHeading>
          <DataGrid
            :data="currentPersonnel"
            :columns="personnelColumns"
            :row-height="40"
            v-model:selected="selectedPersonnel"
            select
            select-all
            class="mt-4 max-h-[40vh]"
          />
        </template>
        <template v-else-if="importMode === 'statuses'">
          <PanelSubHeading class="mt-4">Unit statuses</PanelSubHeading>
          <DataGrid
            :data="currentUnitStatuses"
            :columns="statusColumns"
            :row-height="40"
            v-model:selected="selectedStatuses"
            select
            select-all
            class="mt-4 max-h-[40vh]"
          />
        </template>
        <template v-else-if="importMode === 'supplyCategories'">
          <PanelSubHeading class="mt-4">Supply categories</PanelSubHeading>
          <DataGrid
            :data="currentSupplyCategories"
            :columns="supplyCategoryColumns"
            :row-height="40"
            v-model:selected="selectedSupplyCategories"
            select
            select-all
            class="mt-4 max-h-[40vh]"
          />
        </template>
        <Field v-else-if="importMode === 'customSymbols'">
          <FieldLabel>Custom symbols</FieldLabel>
          <DataGrid
            :data="currentCustomIcons"
            :columns="customIconColumns"
            :row-height="40"
            v-model:selected="selectedCustomSymbols"
            select
            select-all
            class="max-h-[40vh]"
          />
        </Field>
      </FieldGroup>
      <footer
        class="flex shrink-0 flex-col justify-between gap-3 pt-4 sm:flex-row sm:items-center"
      >
        <ToggleField v-model="store.keepOpen">Keep dialog open</ToggleField>
        <div class="flex items-center gap-2">
          <BaseButton type="submit" primary small>Import</BaseButton>
          <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
        </div>
      </footer>
    </form>
  </div>
</template>
