<script setup lang="ts">
import { computed, h, ref } from "vue";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { NScenarioFeature, NUnit } from "@/types/internalModels";
import type { Feature as GeoJSONFeature, FeatureCollection, Point } from "geojson";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import { featureEach, propReduce } from "@turf/meta";
import { type SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import InputRadio from "@/components/InputRadio.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import AlertWarning from "@/components/AlertWarning.vue";
import { useRootUnits } from "@/composables/scenarioUtils.ts";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import BaseButton from "@/components/BaseButton.vue";

interface Props {
  data: GeoJSONFeature | FeatureCollection;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);

const { unitActions, store: scnStore, geo } = injectStrict(activeScenarioKey);

type GeoJsonImportMode = "units" | "features";

const importMode = ref<GeoJsonImportMode>("features");
const isFeatureMode = computed(() => importMode.value === "features");

const selectedFeatures = ref<GeoJSONFeature[]>([]);

const propertyNames = computed(() =>
  propReduce(
    props.data,
    (acc, properties) => {
      if (properties) Object.keys(properties).forEach((key) => acc.add(key));
      return acc;
    },
    new Set<string>(),
  ),
);

const propertyNameItems = computed(() =>
  Array.from(propertyNames.value).map((key) => ({ label: key, value: key })),
);

const computedColumns = computed((): (ColumnDef<GeoJSONFeature, any> | false)[] => {
  const items = Array.from(propertyNames.value).map(
    (key): ColumnDef<GeoJSONFeature, any> => ({
      accessorFn: (f) => f.properties?.[key] ?? "",
      header: key,
    }),
  );
  return [
    { accessorKey: "geometry.type", id: "geometryType", header: "Geometry" },
    importMode.value === "units" && {
      size: 80,
      header: "Icon",
      enableSorting: false,
      accessorFn: (f) =>
        f.properties?.[symbolColumn.value]?.trim() || "10031000000000000000",
      id: "sidc",
      cell: ({ getValue }) => {
        return h(MilitarySymbol, {
          sidc: getValue(),
          size: 20,
          "data-sidc": getValue(),
        });
      },
    },
    {
      accessorFn: (f) => f.properties?.[nameColumn.value] ?? "Feature",
      id: "name",
      header: "Name",
    },
    { header: "Feature properties", columns: [...items] },
  ];
});

const { rootUnitItems } = useRootUnits();

const geoJSONFeatures = computed((): GeoJSONFeature[] => {
  const extractedFeatures: GeoJSONFeature[] = [];
  featureEach(props.data, (f) => {
    extractedFeatures.push(f);
  });
  // This is a hack to force the computed to re-run when we change column assignments
  // See https://github.com/TanStack/table/issues/5363
  nameColumn.value;
  symbolColumn.value;
  return extractedFeatures;
});

const geoJSONPointFeatures = computed(() => {
  return geoJSONFeatures.value.filter((f) => f.geometry.type === "Point");
});

const existingLayers = computed((): SelectItem[] => {
  return geo.layers.value.map((l) => ({ label: l.name, value: l.id }));
});

function findLikelyNameColumn(columnNames: string[]) {
  // List of common name field variations
  const nameVariations = ["name", "title"];

  // Find and return the first column name that matches any of the name variations
  for (const columnName of columnNames) {
    if (nameVariations.includes(columnName.trim().toLowerCase())) {
      return columnName;
    }
  }

  for (const columnName of columnNames) {
    if (columnName.toLowerCase().includes("name")) {
      return columnName;
    }
  }

  // Fallback: return the first column name if no common name field is found
  return columnNames[0];
}

function findLikelySymbolColumn(columnNames: string[]) {
  // List of common symbol field variations
  const symbolVariations = ["symbol", "sidc"];

  // Find and return the first column name that matches any of the symbol variations
  for (const columnName of columnNames) {
    if (symbolVariations.includes(columnName.trim().toLowerCase())) {
      return columnName;
    }
  }

  for (const columnName of columnNames) {
    if (columnName.toLowerCase().includes("symbol")) {
      return columnName;
    }
  }

  // Fallback: return the first column name if no common symbol field is found
  return columnNames[0];
}

const activeLayer = ref(existingLayers.value[0].value);
const nameColumn = ref(findLikelyNameColumn([...propertyNames.value]));
const symbolColumn = ref(findLikelySymbolColumn([...propertyNames.value]));
const parentUnitId = ref(rootUnitItems.value[0].code as string);

async function onLoad() {
  if (importMode.value === "units") {
    loadAsUnits();
  } else {
    loadAsFeatures();
  }
  emit("loaded");
}

function loadAsUnits() {
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = selectedFeatures.value.map((f) => {
    const sidc = f.properties?.[symbolColumn.value]?.trim() || "10031000000000000000";
    return {
      id: nanoid(),
      name: f.properties?.[nameColumn.value] || "New unit",
      sidc: setCharAt(sidc, SID_INDEX, side.standardIdentity),
      subUnits: [],
      _pid: "",
      _gid: "",
      _sid: "",
      location: (f.geometry as Point).coordinates,
      equipment: [],
      personnel: [],
    };
  });
  scnStore.groupUpdate(() => {
    units.forEach((unit) => unitActions.addUnit(unit, parentUnitId.value));
  });
}

function loadAsFeatures() {
  if (!activeLayer.value) return;
  const features = selectedFeatures.value.map((f): NScenarioFeature => {
    return {
      ...f,
      _pid: activeLayer.value,
      id: nanoid(),
      meta: {
        type: f.geometry.type,
        name: f.properties?.[nameColumn.value] || "New feature",
      },
      style: {},
      properties: {
        // ...(f.properties ?? {}),
      },
    };
  });
  scnStore.groupUpdate(() => {
    features.forEach((feature) => geo.addFeature(feature, feature._pid));
  });
}
</script>
<template>
  <ImportStepLayout
    title="Import GeoJSON"
    subtitle="Import units and features from GeoJSON"
    help-url="https://docs.orbat-mapper.app/guide/import-data"
    has-sidebar
  >
    <template #actions>
      <BaseButton small @click="emit('cancel')" class="flex-1 sm:flex-none"
        >Cancel</BaseButton
      >
      <BaseButton type="submit" primary small @click="onLoad" class="flex-1 sm:flex-none"
        >Import</BaseButton
      >
    </template>

    <template #sidebar>
      <fieldset class="space-y-3">
        <p class="text-foreground text-sm leading-6 font-semibold">Import GeoJSON as</p>
        <MRadioGroup class="flex flex-col gap-2">
          <InputRadio v-model="importMode" value="features">Scenario features</InputRadio>
          <InputRadio v-model="importMode" value="units">Units</InputRadio>
        </MRadioGroup>
      </fieldset>

      <section class="space-y-4">
        <SimpleSelect
          label="Name column"
          :items="propertyNameItems"
          v-model="nameColumn"
        />
        <SimpleSelect
          v-if="!isFeatureMode"
          label="Symbol column"
          :items="propertyNameItems"
          v-model="symbolColumn"
        />
      </section>

      <section class="space-y-4">
        <SimpleSelect
          v-if="isFeatureMode"
          label="Layer"
          description="Which layer should the features be added to?"
          :items="existingLayers"
          v-model="activeLayer"
        />
        <SymbolCodeSelect
          v-else
          label="Parent unit"
          :items="rootUnitItems"
          v-model="parentUnitId"
        />
      </section>
    </template>

    <div class="flex h-full min-h-0 flex-col p-6">
      <p class="text-muted-foreground mb-4 shrink-0 text-sm leading-6">
        Select which features you want to import
      </p>
      <DataGrid
        :data="isFeatureMode ? geoJSONFeatures : geoJSONPointFeatures"
        :columns="computedColumns"
        :row-height="40"
        select
        select-all
        show-global-filter
        v-model:selected="selectedFeatures"
        class="flex-1"
      />
      <AlertWarning
        v-if="!isFeatureMode && geoJSONPointFeatures.length === 0"
        title="No point geometries found"
        class="mt-4 shrink-0"
      >
        A unit must have a point geometry to be imported.
      </AlertWarning>
    </div>
  </ImportStepLayout>
</template>
