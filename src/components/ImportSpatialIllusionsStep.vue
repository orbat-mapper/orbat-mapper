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
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NUnit, NUnitAdd } from "@/types/internalModels";
import { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import {
  mapSpatialIllusionsReinforced,
  SpatialIllusionsOrbat,
} from "@/types/externalModels";
import { EntityId } from "@/types/base";

interface Props {
  data: SpatialIllusionsOrbat;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const { state } = scnStore;

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
  const oob = props.data;

  scnStore.groupUpdate(() => {
    function helper(u: SpatialIllusionsOrbat, parentId: EntityId) {
      const { uniqueDesignation: name = "", sidc, fillColor, stack = 1 } = u.options;

      const newUnit: NUnitAdd = {
        name,
        sidc: setCharAt(sidc, SID_INDEX, side.standardIdentity),
        symbolOptions: { fillColor },
        textAmplifiers: {},
        subUnits: [],
        equipment: [],
        personnel: [],
      };
      if (u.options.reinforced) {
        newUnit.reinforcedStatus = mapSpatialIllusionsReinforced(u.options.reinforced);
      }
      if (u.options.additionalInformation) {
        newUnit.textAmplifiers!.additionalInformation = u.options.additionalInformation;
      }
      for (let i = 0; i < stack; i++) {
        const newUnitId = unitActions.addUnit(newUnit as NUnit, parentId);
        u.subOrganizations?.forEach((subUnit) => helper(subUnit, newUnitId));
      }
    }

    helper(oob, parentUnitId.value);
  });

  emit("loaded");
}
</script>
