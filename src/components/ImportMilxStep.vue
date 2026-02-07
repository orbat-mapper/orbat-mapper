<script setup lang="ts">
import { computed, h, ref } from "vue";
import { useImportStore } from "@/stores/importExportStore";
import type { MilxImportedLayer } from "@/composables/scenarioImport";

import { injectStrict, nanoid, removeUndefined } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { NUnit } from "@/types/internalModels";
import type { Point } from "geojson";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import type { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import type { ImportGeoJsonFeature } from "@/importexport/jsonish/types";
import DataGrid from "@/modules/grid/DataGrid.vue";
import { propReduce } from "@turf/meta";
import { featureCollection } from "@turf/helpers";
import { pick } from "es-toolkit";
import { useRootUnits } from "@/composables/scenarioUtils.ts";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import BaseButton from "@/components/BaseButton.vue";

interface Props {
  data: MilxImportedLayer[];
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore } = injectStrict(activeScenarioKey);
const store = useImportStore();

const selectedUnits = ref<FlatItem[]>([]);

const { rootUnitItems, groupedRootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0]?.code as string);

interface FlatItem extends ImportGeoJsonFeature {
  layerName: string;
}

const data = computed(() => {
  return props.data
    .map((l) =>
      l.features.map((f) => ({
        ...f,
        layerName: l.name,
      })),
    )
    .flat();
});

const propertyNames = computed(() =>
  propReduce(
    featureCollection(data.value),
    (acc, properties) => {
      if (properties) {
        Object.keys(properties.originalProperties).forEach((key) => acc.add(key));
      }
      return acc;
    },
    new Set<string>(),
  ),
);

const convertedPropertyNames = computed(() => {
  const names = propReduce(
    featureCollection(data.value),
    (acc, properties) => {
      if (properties) {
        Object.keys(properties.convertedProperties).forEach((key) => acc.add(key));
      }
      return acc;
    },
    new Set<string>(),
  );
  names.delete("sidc");
  names.delete("name");
  return names;
});

const computedColumns = computed((): ColumnDef<FlatItem, any>[] => {
  const items = Array.from(propertyNames.value).map(
    (key): ColumnDef<FlatItem, any> => ({
      accessorFn: (f) => f.properties?.originalProperties[key] ?? "",
      header: key,
    }),
  );

  const convertedItems = Array.from(convertedPropertyNames.value).map(
    (key): ColumnDef<FlatItem, any> => ({
      //@ts-ignore
      accessorFn: (f) => f.properties?.convertedProperties[key] ?? "",
      header: key,
    }),
  );

  return [
    {
      header: "Converted properties",
      columns: [
        {
          accessorFn: (u) => u.properties?.convertedProperties.sidc,
          header: "Symbol",
          id: "sidc",
          size: 85,
          cell: ({ getValue }) => {
            return h(MilitarySymbol, {
              sidc: getValue(),
              size: 20,
              "data-sidc": getValue(),
            });
          },
        },
        {
          accessorFn: (f) => f.properties?.convertedProperties["name"] ?? "NN",
          id: "name",
          header: "Name",
          size: 200,
        },
        ...convertedItems,
      ],
    },
    {
      accessorFn: (f) => f.layerName,
      id: "layer",
      header: "Layer",
      size: 200,
    },
    { header: "Original properties", columns: [...items] },
  ];
});

const initialTableState: InitialTableState = {
  grouping: ["layer"],
  expanded: true,
};

async function onLoad() {
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = selectedUnits.value.map((f) => {
    const textAmplifiers = removeUndefined(
      pick(f.properties.convertedProperties, [
        "higherFormation",
        "staffComments",
        "additionalInformation",
      ]),
    );
    return {
      id: nanoid(),
      name: f.properties.convertedProperties.name || "",
      sidc: setCharAt(
        f.properties.convertedProperties.sidc,
        SID_INDEX,
        side.standardIdentity,
      ),
      subUnits: [],
      _pid: "",
      _gid: "",
      _sid: "",
      location: (f.geometry as Point).coordinates,
      symbolOptions: f.properties.convertedProperties.fillColor
        ? { fillColor: f.properties.convertedProperties.fillColor }
        : {},
      textAmplifiers,
      reinforcedStatus: f.properties.convertedProperties.reinforcedStatus,
      equipment: [],
      personnel: [],
    };
  });

  scnStore.groupUpdate(() => {
    units.forEach((unit) => unitActions.addUnit(unit, parentUnitId.value));
  });

  if (!store.keepOpen) emit("loaded");
}
</script>
<template>
  <ImportStepLayout
    title="Import MilX"
    subtitle="Import units from MilX layers"
    help-url="https://docs.orbat-mapper.app/guide/import-data"
    has-sidebar
  >
    <template #actions>
      <BaseButton small @click="emit('cancel')" class="flex-1 sm:flex-none"
        >Cancel</BaseButton
      >
      <BaseButton primary small @click="onLoad" class="flex-1 sm:flex-none"
        >Import</BaseButton
      >
    </template>

    <template #sidebar>
      <div class="prose prose-sm dark:prose-invert">
        <p>
          Basic support for importing MilX layers from
          <a href="https://www.map.army/">map.army</a>
        </p>
      </div>

      <SymbolCodeSelect
        label="Parent unit"
        :items="rootUnitItems"
        :groups="groupedRootUnitItems"
        v-model="parentUnitId"
      />
    </template>

    <div class="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        :data="data"
        :columns="computedColumns"
        :initial-state="initialTableState"
        :row-height="40"
        select
        select-all
        show-global-filter
        class="flex-1"
        v-model:selected="selectedUnits"
      />
    </div>
  </ImportStepLayout>
</template>
