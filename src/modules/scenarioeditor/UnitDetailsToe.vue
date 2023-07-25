<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { computed, ref, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { UnitEquipment, UnitPersonnel } from "@/types/scenarioModels";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();

const {
  unitActions: { walkSubUnits },
} = injectStrict(activeScenarioKey);

const aggregatedEquipment = ref<UnitEquipment[]>([]);
const aggregatedPersonnel = ref<UnitPersonnel[]>([]);

watch(
  () => props.unit?.id,
  () => {
    const aggEquipment: Record<string, number> = {};
    const aggPersonnel: Record<string, number> = {};
    walkSubUnits(
      props.unit.id,
      (unit) => {
        unit.equipment?.forEach((e) => {
          aggEquipment[e.name] = (aggEquipment[e.name] ?? 0) + e.count;
        });
        unit.personnel?.forEach((p) => {
          aggPersonnel[p.name] = (aggPersonnel[p.name] ?? 0) + p.count;
        });
      },
      { includeParent: true },
    );
    aggregatedEquipment.value = sortBy(
      Object.entries(aggEquipment).map(([name, count]) => ({
        name,
        count,
      })),
      "name",
    );
    aggregatedPersonnel.value = sortBy(
      Object.entries(aggPersonnel).map(([name, count]) => ({
        name,
        count,
      })),
      "name",
    );
  },
  { immediate: true },
);
</script>

<template>
  <div class="prose p-1">
    <table class="mt-2" v-if="aggregatedEquipment.length">
      <thead>
        <tr class="">
          <th class="pl-2">Equipment</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipment in aggregatedEquipment" :key="equipment.name">
          <td class="pl-2">{{ equipment.name }}</td>
          <td class="pr-6 text-right tabular-nums">{{ equipment.count }}</td>
        </tr>
      </tbody>
    </table>

    <table v-if="aggregatedPersonnel.length">
      <thead>
        <tr>
          <th class="pl-2">Personnel</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="personnel in aggregatedPersonnel" :key="personnel.name">
          <td class="pl-2">{{ personnel.name }}</td>
          <td class="pr-6 text-right tabular-nums">{{ personnel.count }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      No data about equipment or personnel available.
    </p>
  </div>
</template>
