<script setup lang="ts">
import { computed, h, ref } from "vue";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { NUnit } from "@/types/internalModels";
import type { Feature as GeoJSONFeature, FeatureCollection, Point } from "geojson";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import UnitTreeSelect from "@/components/UnitTreeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import { type SelectItem } from "@/components/types";
import SimpleSelect from "@/components/SimpleSelect.vue";
import InputRadio from "@/components/InputRadio.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import AlertWarning from "@/components/AlertWarning.vue";
import { useRootUnitIds, useRootUnits } from "@/composables/scenarioUtils.ts";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import BaseButton from "@/components/BaseButton.vue";
import {
  convertGeoJSONFeatureToScenarioFeature,
  findLikelyNameColumn,
  getGeoJSONFeatures,
  getGeoJSONPropertyNames,
  normalizeImportedName,
} from "@/importexport/geojsonScenarioFeatures";
import {
  createUnitTrackStatesFromFeature,
  isAssignableTrackFeature,
} from "@/importexport/unitTrackAssignment";
import { useNotifications } from "@/composables/notifications";

interface Props {
  data: GeoJSONFeature | FeatureCollection;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);

const { unitActions, store: scnStore, geo, time } = injectStrict(activeScenarioKey);

type GeoJsonImportMode = "units" | "features" | "unit-tracks";

const importMode = ref<GeoJsonImportMode>("features");
const isFeatureMode = computed(() => importMode.value === "features");
const isTrackAssignmentMode = computed(() => importMode.value === "unit-tracks");

const selectedFeatures = ref<GeoJSONFeature[]>([]);
const trackAssignmentUnitIds = ref<Record<string, string>>({});

const propertyNames = computed(() => new Set(getGeoJSONPropertyNames(props.data)));

const propertyNameItems = computed(() =>
  Array.from(propertyNames.value).map((key) => ({ label: key, value: key })),
);
const resolvedNameColumn = computed(
  () => nameColumn.value ?? findLikelyNameColumn([...propertyNames.value]),
);
const resolvedSymbolColumn = computed(
  () => symbolColumn.value ?? findLikelySymbolColumn([...propertyNames.value]),
);

const computedColumns = computed((): (ColumnDef<GeoJSONFeature, unknown> | false)[] => {
  const items = Array.from(propertyNames.value).map(
    (key): ColumnDef<GeoJSONFeature, unknown> => ({
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
        (resolvedSymbolColumn.value
          ? f.properties?.[resolvedSymbolColumn.value]?.trim()
          : undefined) || "10031000000000000000",
      id: "sidc",
      cell: ({ getValue }) => {
        return h(MilitarySymbol, {
          sidc: String(getValue()),
          size: 20,
          "data-sidc": String(getValue()),
        });
      },
    },
    {
      accessorFn: (f) =>
        normalizeImportedName(
          resolvedNameColumn.value ? f.properties?.[resolvedNameColumn.value] : undefined,
          "Feature",
        ),
      id: "name",
      header: "Name",
    },
    { header: "Feature properties", columns: [...items] },
  ];
});

const { rootUnitItems, groupedRootUnitItems } = useRootUnits();
const { rootUnitIds } = useRootUnitIds();

const geoJSONFeatures = computed((): GeoJSONFeature[] => {
  // This is a hack to force the computed to re-run when we change column assignments
  // See https://github.com/TanStack/table/issues/5363
  void resolvedNameColumn.value;
  void resolvedSymbolColumn.value;
  return getGeoJSONFeatures(props.data) ?? [];
});

const geoJSONPointFeatures = computed(() => {
  return geoJSONFeatures.value.filter((f) => f.geometry?.type === "Point");
});

const geoJSONTrackFeatures = computed(() => {
  return geoJSONFeatures.value.filter(isAssignableTrackFeature);
});

const existingLayers = computed((): SelectItem[] => {
  return geo.layerItemsLayers.value.map((l) => ({ label: l.name, value: l.id }));
});

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
const parentUnitId = ref<string | undefined>(rootUnitItems.value[0]?.code as string | undefined);
const { send } = useNotifications();

async function onLoad() {
  if (importMode.value === "units") {
    loadAsUnits();
  } else if (importMode.value === "unit-tracks") {
    loadAsUnitTracks();
  } else {
    loadAsFeatures();
  }
  emit("loaded");
}

function loadAsUnits() {
  if (!parentUnitId.value) return;
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = selectedFeatures.value.map((f) => {
    const sidc =
      (resolvedSymbolColumn.value
        ? f.properties?.[resolvedSymbolColumn.value]?.trim()
        : undefined) || "10031000000000000000";
    return {
      id: nanoid(),
      name: normalizeImportedName(
        resolvedNameColumn.value ? f.properties?.[resolvedNameColumn.value] : undefined,
        "New unit",
      ),
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
  const targetParentId = parentUnitId.value;
  scnStore.groupUpdate(() => {
    units.forEach((unit) => unitActions.addUnit(unit, targetParentId));
  });
}

function loadAsFeatures() {
  const features = getSelectedScenarioFeatures();
  scnStore.groupUpdate(() => {
    features.forEach((feature) => geo.addFeature(feature, feature._pid));
  });
}

function loadAsUnitTracks() {
  const trackFeatures = selectedFeatures.value.filter(isAssignableTrackFeature);
  if (!trackFeatures.length) return;

  let stateCount = 0;
  let skippedPointCount = 0;
  scnStore.groupUpdate(() => {
    getSelectedScenarioFeatures().forEach((feature) =>
      geo.addFeature(feature, feature._pid),
    );
    trackFeatures.forEach((feature) => {
      const unitId = getTrackAssignmentUnitId(feature);
      if (!unitId) return;
      const unit = scnStore.state.unitMap[unitId];
      const result = createUnitTrackStatesFromFeature(
        feature,
        scnStore.state.currentTime,
        {
          addStartPosition: !unit?.location && !unit?._state?.location,
        },
      );
      skippedPointCount += result.skippedPoints;
      result.states.forEach((state) => {
        unitActions.addUnitStateEntry(unitId, state, true);
        stateCount++;
      });
    });
  });

  if (stateCount > 0) {
    time.setCurrentTime(scnStore.state.currentTime);
  }
  const skippedMessage = skippedPointCount
    ? ` ${skippedPointCount} route points were skipped.`
    : "";
  send({
    message: `Assigned ${stateCount} track positions to unit.${skippedMessage}`,
    type: stateCount ? "success" : "warning",
  });
}

function getSelectedScenarioFeatures() {
  if (!activeLayer.value) return [];
  return selectedFeatures.value
    .map((feature) =>
      convertGeoJSONFeatureToScenarioFeature(feature, activeLayer.value, {
        nameColumn: resolvedNameColumn.value,
      }),
    )
    .filter((feature) => !!feature);
}

function getFeatureKey(feature: GeoJSONFeature): string {
  const index = geoJSONFeatures.value.indexOf(feature);
  if (index >= 0) return String(index);
  return `${feature.geometry?.type ?? "feature"}-${selectedFeatures.value.indexOf(feature)}`;
}

function getTrackAssignmentUnitId(feature: GeoJSONFeature): string | undefined {
  return (
    trackAssignmentUnitIds.value[getFeatureKey(feature)] ?? rootUnitItems.value[0]?.code
  );
}

function setTrackAssignmentUnitId(feature: GeoJSONFeature, unitId: string | null) {
  if (!unitId) return;
  trackAssignmentUnitIds.value[getFeatureKey(feature)] = unitId;
}

function getFeatureName(feature: GeoJSONFeature): string {
  return normalizeImportedName(
    resolvedNameColumn.value ? feature.properties?.[resolvedNameColumn.value] : undefined,
    "Track/route",
  );
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
          <InputRadio v-model="importMode" value="unit-tracks"
            >Assign tracks/routes to unit</InputRadio
          >
        </MRadioGroup>
      </fieldset>

      <section v-if="!isTrackAssignmentMode" class="space-y-4">
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
          v-if="isFeatureMode || isTrackAssignmentMode"
          label="Layer"
          description="Which layer should the features be added to?"
          :items="existingLayers"
          v-model="activeLayer"
        />
        <template v-else>
          <SymbolCodeSelect
            label="Parent unit"
            :items="rootUnitItems"
            :groups="groupedRootUnitItems"
            v-model="parentUnitId"
          />
        </template>
      </section>

      <section v-if="isTrackAssignmentMode" class="space-y-4">
        <p class="text-foreground text-sm leading-6 font-semibold">Track assignments</p>
        <p v-if="!selectedFeatures.length" class="text-muted-foreground text-sm">
          Select tracks or routes to choose target units.
        </p>
        <UnitTreeSelect
          v-for="feature in selectedFeatures.filter(isAssignableTrackFeature)"
          :key="getFeatureKey(feature)"
          :label="getFeatureName(feature)"
          :units="rootUnitIds"
          :unit-map="scnStore.state.unitMap"
          :model-value="getTrackAssignmentUnitId(feature)"
          @update:model-value="(unitId) => setTrackAssignmentUnitId(feature, unitId)"
        />
      </section>
    </template>

    <div class="flex h-full min-h-0 flex-col p-6">
      <p class="text-muted-foreground mb-4 shrink-0 text-sm leading-6">
        Select which features you want to import
      </p>
      <DataGrid
        :data="
          isTrackAssignmentMode
            ? geoJSONTrackFeatures
            : isFeatureMode
              ? geoJSONFeatures
              : geoJSONPointFeatures
        "
        :columns="computedColumns"
        :row-height="40"
        select
        select-all
        show-global-filter
        v-model:selected="selectedFeatures"
        class="flex-1"
      />
      <AlertWarning
        v-if="importMode === 'units' && geoJSONPointFeatures.length === 0"
        title="No point geometries found"
        class="mt-4 shrink-0"
      >
        A unit must have a point geometry to be imported.
      </AlertWarning>
      <AlertWarning
        v-if="isTrackAssignmentMode && geoJSONTrackFeatures.length === 0"
        title="No line geometries found"
        class="mt-4 shrink-0"
      >
        A unit track must have a LineString or MultiLineString geometry to be assigned.
      </AlertWarning>
    </div>
  </ImportStepLayout>
</template>
