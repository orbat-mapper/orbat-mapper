<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { NUnit, NUnitAdd } from "@/types/internalModels";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import type { OrbatGeneratorOrbat } from "@/types/externalModels";
import type { EntityId } from "@/types/base";
import { useRootUnits } from "@/composables/scenarioUtils.ts";
import ImportStepLayout from "@/components/ImportStepLayout.vue";

interface Props {
  data: OrbatGeneratorOrbat;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore } = injectStrict(activeScenarioKey);

const { rootUnitItems, groupedRootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0].code as string);

async function onLoad() {
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
      const { sidc, xPosition, name, subTitle: description, color, sortKey } = u;
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

<template>
  <ImportStepLayout
    title="Import from Orbat Generator"
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
      <SymbolCodeSelect
        label="Parent unit"
        :items="rootUnitItems"
        :groups="groupedRootUnitItems"
        v-model="parentUnitId"
      />
    </template>

    <div class="p-6">
      <p class="text-muted-foreground text-sm">
        Import ORBAT generated with
        <a
          href="https://www.orbatgenerator.com/"
          target="_blank"
          class="text-accent-foreground underline"
          >Order of Battle Generator</a
        >.
      </p>
    </div>
  </ImportStepLayout>
</template>
