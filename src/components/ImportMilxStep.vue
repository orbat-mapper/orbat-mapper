<script setup lang="ts">
import { computed, h, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { useImportStore } from "@/stores/importExportStore";
import { MilxImportedLayer } from "@/composables/scenarioImport";

import { injectStrict, nanoid, removeUndefined } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NUnit } from "@/types/internalModels";
import type { Feature as GeoJSONFeature, Point } from "geojson";
import { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import ToggleField from "@/components/ToggleField.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import { OrbatMapperGeoJsonFeature } from "@/importexport/jsonish/types";
import DataGrid from "@/modules/grid/DataGrid.vue";
import { propReduce } from "@turf/turf";
import { featureCollection } from "@turf/helpers";
import { pick } from "es-toolkit";

interface Props {
  data: MilxImportedLayer[];
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const store = useImportStore();
const { state } = scnStore;

const selectedUnits = ref<(string | number)[]>([]);

const rootUnitItems = computed((): SymbolItem[] => {
  return Object.values(state.sideGroupMap)
    .map((value) => value.subUnits)
    .flat()
    .map((e) => state.unitMap[e])
    .map((u) => ({ text: u.name, code: u.id, sidc: u.sidc }));
});

const parentUnitId = ref(rootUnitItems.value[0].code as string);

const columns: ColumnDef<OrbatMapperGeoJsonFeature, any>[] = [
  {
    accessorFn: (u) => u.properties.sidc,
    header: "Symbol",
    id: "sidc",
    size: 85,
    cell: ({ row, getValue, cell }) => {
      return h(MilitarySymbol, {
        sidc: getValue(),
        size: 20,
        "data-sidc": getValue(),
      });
    },
  },
  {
    accessorFn: (f) => f.properties?.["name"] ?? "NN",
    id: "name",
    header: "Name",
    size: 200,
  },
  { accessorFn: (f) => f.properties.layerName, id: "layer", header: "Layer", size: 200 },
];

const data = computed(() => {
  const d = props.data
    .map((l) =>
      l.features.map((f) => ({
        ...f,
        properties: { ...f.properties, layerName: l.name },
      })),
    )
    .flat();
  console.log(featureCollection(d));
  return d;
});

const propertyNames = computed(() =>
  propReduce(
    featureCollection(data.value),
    (acc, properties) => {
      properties && Object.keys(properties).forEach((key) => acc.add(key));
      return acc;
    },
    new Set<string>(),
  ),
);

const computedColumns = computed((): ColumnDef<GeoJSONFeature, any>[] => {
  const items = Array.from(propertyNames.value).map(
    (key): ColumnDef<GeoJSONFeature, any> => ({
      accessorFn: (f) => f.properties?.[key] ?? "",
      header: key,
    }),
  );
  return [
    {
      header: "Converted properties",
      columns: [
        {
          accessorFn: (u) => u.properties?.sidc,
          header: "Symbol",
          id: "sidc",
          size: 85,
          cell: ({ row, getValue, cell }) => {
            return h(MilitarySymbol, {
              sidc: getValue(),
              size: 20,
              "data-sidc": getValue(),
            });
          },
        },
        {
          accessorFn: (f) => f.properties?.["name"] ?? "NN",
          id: "name",
          header: "Name",
          size: 200,
        },
      ],
    },
    {
      accessorFn: (f) => f.properties?.layerName,
      id: "layer",
      header: "Layer",
      size: 200,
    },
    { header: "Feature properties", columns: [...items] },
  ];
});

const initialTableState: InitialTableState = {
  grouping: ["layer"],
  expanded: true,
};

async function onLoad(e: Event) {
  const features = props.data.map((l) => l.features).flat();
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = features
    .filter((e) => selectedUnits.value.includes(e.id!))
    .map((f) => {
      const textAmplifiers = removeUndefined(
        pick(f.properties, ["higherFormation", "staffComments", "additionalInformation"]),
      );
      return {
        id: nanoid(),
        name: f.properties.name || "",
        sidc: setCharAt(f.properties.sidc, SID_INDEX, side.standardIdentity),
        subUnits: [],
        _pid: "",
        _gid: "",
        _sid: "",
        location: (f.geometry as Point).coordinates,
        symbolOptions: f.properties.fillColor
          ? { fillColor: f.properties.fillColor }
          : {},
        textAmplifiers,
        equipment: [],
        personnel: [],
      };
    });

  scnStore.groupUpdate(() => {
    units.forEach((unit) => unitActions.addUnit(unit, parentUnitId.value));
  });

  emit("loaded");
}
</script>
<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
      <div class="flex-auto overflow-auto">
        <div class="prose prose-sm">
          <p>
            Basic support for importing MilX layers from
            <a href="https://www.map.army/">map.army</a>
          </p>
        </div>
        <section class="p-1.5">
          <SymbolCodeSelect
            label="Parent unit"
            :items="rootUnitItems"
            v-model="parentUnitId"
          />
        </section>
        <section class="mt-4">
          <DataGrid
            :data="data"
            :columns="computedColumns"
            :initial-state="initialTableState"
            :row-height="40"
            select
            select-all
            show-global-filter
            class="max-h-[40vh]"
          />
        </section>
      </div>

      <footer class="flex flex-shrink-0 items-center justify-between pt-4">
        <ToggleField v-model="store.keepOpen">Keep dialog open on import</ToggleField>
        <div class="flex items-center space-x-2">
          <BaseButton type="submit" primary small>Import</BaseButton>
          <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
        </div>
      </footer>
    </form>
  </div>
</template>
