<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
      <div class="flex-auto overflow-auto">
        <div class="prose prose-sm">
          <p v-if="isMilx">
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
          <ImportSelectItems :layers="data" v-model:selected="selectedUnits" select-all />
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
import { MilxImportedLayer } from "@/composables/scenarioImport";

import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NUnit } from "@/types/internalModels";
import type { Point } from "geojson";
import { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import ImportSelectItems from "@/components/ImportSelectItems.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";

interface Props {
  data: MilxImportedLayer[];
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
const selectedUnits = ref<(string | number)[]>([]);

const isMilx = computed(() => form.value.format === "milx");

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const rootUnitItems = computed((): SymbolItem[] => {
  return Object.values(state.sideGroupMap)
    .map((value) => value.subUnits)
    .flat()
    .map((e) => state.unitMap[e])
    .map((u) => ({ text: u.name, code: u.id, sidc: u.sidc }));
});

const parentUnitId = ref(rootUnitItems.value[0].code as string);

async function onLoad(e: Event) {
  const features = props.data.map((l) => l.features).flat();
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);

  const units: NUnit[] = features
    .filter((e) => selectedUnits.value.includes(e.id!))
    .map((f) => {
      return {
        id: nanoid(),
        name: f.properties.name || "",
        sidc: setCharAt(f.properties.sidc, SID_INDEX, side.standardIdentity),
        subUnits: [],
        _pid: "",
        location: (f.geometry as Point).coordinates,
      };
    });
  scnStore.groupUpdate(() => {
    units.forEach((unit) => unitActions.addUnit(unit, parentUnitId.value));
  });

  emit("loaded");
}
</script>
