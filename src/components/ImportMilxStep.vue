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
import ToggleField from "@/components/ToggleField.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import type { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import type { ImportGeoJsonFeature } from "@/importexport/jsonish/types";
import DataGrid from "@/modules/grid/DataGrid.vue";
import { propReduce } from "@turf/meta";
import { featureCollection } from "@turf/helpers";
import { pick } from "es-toolkit";
import { Button } from "@/components/ui/button";
import { useRootUnits } from "@/composables/scenarioUtils.ts";

interface Props {
  data: MilxImportedLayer[];
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const store = useImportStore();

const selectedUnits = ref<FlatItem[]>([]);

const { rootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0].code as string);

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
      properties &&
        Object.keys(properties.originalProperties).forEach((key) => acc.add(key));
      return acc;
    },
    new Set<string>(),
  ),
);

const convertedPropertyNames = computed(() => {
  const names = propReduce(
    featureCollection(data.value),
    (acc, properties) => {
      properties &&
        Object.keys(properties.convertedProperties).forEach((key) => acc.add(key));
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
          cell: ({ row, getValue, cell }) => {
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

async function onLoad(e: Event) {
  const features = props.data.map((l) => l.features).flat();
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
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
      <div class="flex-auto overflow-auto">
        <div class="prose prose-sm dark:prose-invert">
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
            v-model:selected="selectedUnits"
          />
        </section>
      </div>

      <footer class="flex shrink-0 items-center justify-between pt-4">
        <ToggleField v-model="store.keepOpen">Keep dialog open on import</ToggleField>
        <div class="flex items-center space-x-2">
          <Button type="submit" size="sm">Import</Button>
          <Button variant="outline" size="sm" @click="emit('cancel')">Cancel</Button>
        </div>
      </footer>
    </form>
  </div>
</template>
