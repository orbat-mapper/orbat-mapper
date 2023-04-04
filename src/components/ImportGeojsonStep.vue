<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
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
            :data="data.features"
            :columns="columns"
            select
            select-all
            v-model:selected="selectedUnits"
          />
        </section>
      </div>

      <footer class="flex flex-shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import type { ImportFormat, ImportSettings } from "@/types/convert";
import { useNotifications } from "@/composables/notifications";
import { useImportStore } from "@/stores/importExportStore";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NUnit } from "@/types/internalModels";
import type { FeatureCollection, Point } from "geojson";
import { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import OrbatGrid from "@/modules/grid/OrbatGrid.vue";
import { ColumnProperties } from "@/modules/grid/gridTypes";
import { OrbatMapperGeoJsonFeature } from "@/lib/milx/types";

interface Props {
  data: FeatureCollection;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const store = useImportStore();
const { state } = scnStore;

interface Form extends ImportSettings {
  format: ImportFormat;
}

const form = ref<Form>({
  format: store.format,
  includeFeatures: false,
  includeUnits: true,
  fileName: "scenario.geojson",
  embedIcons: true,
  useShortName: true,
});

const { send } = useNotifications();
const selectedUnits = ref<OrbatMapperGeoJsonFeature[]>([]);

const columns: ColumnProperties[] = [
  {
    type: "sidc",
    width: 65,
    field: "properties.sidc",
    label: "Icon",
  },
  { type: "text", field: "properties.name", label: "Name" },
];

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
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

const parentUnitId = ref(rootUnitItems.value[0].code as string);

async function onLoad(e: Event) {
  const features = props.data.features;
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = features
    .filter((e) => selectedUnits.value.includes(e as any))
    .map((f) => {
      return {
        id: nanoid(),
        name: f.properties?.name || "",
        sidc: setCharAt(f.properties?.sidc, SID_INDEX, side.standardIdentity),
        subUnits: [],
        _pid: "",
        _gid: "",
        _sid: "",
        location: (f.geometry as Point).coordinates,
      };
    });
  scnStore.groupUpdate(() => {
    units.forEach((unit) => unitActions.addUnit(unit, parentUnitId.value));
  });

  emit("loaded");
}
</script>
