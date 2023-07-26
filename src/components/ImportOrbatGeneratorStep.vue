<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] min-h-[25rem] flex-col">
      <div class="flex-auto overflow-auto">
        <div class="prose prose-sm"></div>
        <section class="p-1.5">
          <SymbolCodeSelect
            label="Parent unit"
            :items="rootUnitItems"
            v-model="parentUnitId"
          />
        </section>
        <section class="mt-4"></section>
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
import { useNotifications } from "@/composables/notifications";
import { useImportStore } from "@/stores/importExportStore";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NUnit, NUnitAdd } from "@/types/internalModels";
import { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import type { OrbatGeneratorOrbat } from "@/types/externalModels";
import { EntityId } from "@/types/base";

interface Props {
  data: OrbatGeneratorOrbat;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const store = useImportStore();
const { state } = scnStore;

const { send } = useNotifications();

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
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);
  const oob = sortBy(
    props.data.map((u) => {
      const [sidc, level, xPosition, name, subTitle, color] = u;
      return {
        sidc,
        level,
        xPosition,
        name,
        subTitle,
        color,
        sortKey: level + xPosition,
      };
    }),
    "sortKey",
  );

  const parentMap: Record<string, EntityId> = {};

  scnStore.groupUpdate(() => {
    oob.forEach((u) => {
      const { sidc, level, xPosition, name, subTitle: description, color, sortKey } = u;
      const newUnit: NUnitAdd = {
        name,
        description,
        sidc: setCharAt(sidc, SID_INDEX, side.standardIdentity),
        symbolOptions: { fillColor: color },
        subUnits: [],
        equipment: [],
        personnel: [],
      };
      const parentSortKey = `1${xPosition}`;
      const newUnitId = unitActions.addUnit(
        newUnit as NUnit,
        parentMap[parentSortKey] || parentMap["00"] || parentUnitId.value,
      );
      parentMap[sortKey] = newUnitId;
    });
  });

  emit("loaded");
}
</script>
