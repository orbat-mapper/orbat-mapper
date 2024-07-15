<script setup lang="ts">
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { useImportStore } from "@/stores/importExportStore";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NScenarioFeature, NUnit } from "@/types/internalModels";
import type { Feature as GeoJSONFeature, FeatureCollection, Point } from "geojson";
import { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import OrbatGrid from "@/modules/grid/OrbatGrid.vue";
import { ColumnProperties } from "@/modules/grid/gridTypes";

import { OrbatMapperGeoJsonFeature } from "@/importexport/jsonish/types";
import { featureEach, propReduce } from "@turf/turf";
import { SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import InputRadio from "@/components/InputRadio.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";

interface Props {
  data: GeoJSONFeature | FeatureCollection;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, geo } = injectStrict(activeScenarioKey);
const store = useImportStore();
const { state } = scnStore;
type GeoJsonImportMode = "units" | "features";

const importMode = ref<GeoJsonImportMode>("features");

const selectedUnits = ref<OrbatMapperGeoJsonFeature[]>([]);
const selectedFeatures = ref<GeoJSONFeature[]>([]);

const columns: ColumnProperties[] = [
  { type: "text", field: "geometry.type", label: "Geometry" },
  {
    type: "sidc",
    width: 65,
    field: "properties.sidc",
    label: "Icon",
  },
  { type: "text", field: "properties.name", label: "Name" },
];

const computedColumns = computed((): ColumnProperties[] => {
  const propertyNames = propReduce(
    props.data,
    (acc, properties) => {
      properties && Object.keys(properties).forEach((key) => acc.add(key));
      return acc;
    },
    new Set<string>(),
  );
  const items = Array.from(propertyNames)
    .filter((key) => key !== "name" && key !== "sidc")
    .map(
      (key): ColumnProperties => ({
        type: "text",
        field: `properties.${key}`,
        label: key,
      }),
    );
  return [{ type: "text", field: "geometry.type", label: "Geometry" }, ...items];
});

const rootUnitItems = computed((): SymbolItem[] => {
  return Object.values(state.sideGroupMap)
    .map((value) => value.subUnits)
    .flat()
    .map((e) => state.unitMap[e])
    .map((u) => ({
      text: u.name,
      code: u.id,
      sidc: u.sidc,
      symbolOptions: unitActions.getCombinedSymbolOptions(u),
    }));
});

const features = computed((): GeoJSONFeature[] => {
  const extractedFeatures: GeoJSONFeature[] = [];
  featureEach(props.data, (f) => {
    extractedFeatures.push(f);
  });
  return extractedFeatures;
});

const existingLayers = computed((): SelectItem[] => {
  return geo.layers.value.map((l) => ({ label: l.name, value: l.id }));
});

const activeLayer = ref(existingLayers.value[0].value);

const parentUnitId = ref(rootUnitItems.value[0].code as string);

async function onLoad(e: Event) {
  if (importMode.value === "units") {
    loadAsUnits();
  } else {
    loadAsFeatures();
  }
  emit("loaded");
}

function loadAsUnits() {
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = selectedUnits.value.map((f) => {
    return {
      id: nanoid(),
      name: f.properties?.name || "",
      sidc: setCharAt(f.properties?.sidc, SID_INDEX, side.standardIdentity),
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
      properties: {
        ...(f.properties ?? {}),
        type: f.geometry.type,
        name: f.properties?.name || "New feature",
      },
    };
  });
  scnStore.groupUpdate(() => {
    features.forEach((feature) => geo.addFeature(feature, feature._pid));
  });
}
</script>
<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
      <fieldset class="flex items-center gap-x-10">
        <p class="flex-none text-sm font-semibold leading-6 text-gray-900">
          Import GeoJSON as
        </p>
        <MRadioGroup class="flex w-full gap-10">
          <InputRadio v-model="importMode" value="features">Scenario features</InputRadio>
          <InputRadio v-model="importMode" value="units">Units</InputRadio>
        </MRadioGroup>
      </fieldset>

      <template v-if="importMode === 'units'">
        <div class="flex-auto overflow-auto">
          <div class="prose prose-sm"></div>
          <section class="p-1.5">
            <SymbolCodeSelect
              label="Parent unit"
              :items="rootUnitItems"
              v-model="parentUnitId"
            />
          </section>
          <section class="mt-4">
            <OrbatGrid
              :data="features"
              :columns="columns"
              select
              select-all
              v-model:selected="selectedUnits"
            />
          </section>
        </div>
      </template>
      <template v-else-if="importMode === 'features'"
        ><div class="">
          <p class="mt-4 text-sm leading-6 text-gray-600">
            Select which features you want to import
          </p>
          <section class="mt-4">
            <OrbatGrid
              :data="features"
              :columns="computedColumns"
              select
              select-all
              v-model:selected="selectedFeatures"
            />
          </section>

          <SimpleSelect
            class="mt-4"
            label="Layer"
            description="Which layer should the features be added to?"
            :items="existingLayers"
            v-model="activeLayer"
          /></div
      ></template>

      <footer class="flex flex-shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>
