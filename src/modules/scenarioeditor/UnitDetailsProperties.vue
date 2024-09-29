<script setup lang="ts">
import { NUnit, UnitPropertyUpdate } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { SpeedUnitOfMeasure, UnitProperty } from "@/types/scenarioModels";
import PropertyInput from "@/components/PropertyInput.vue";
import { computed, ref } from "vue";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();
const showMax = ref(false);
const showAverage = ref(false);

const activeScenario = injectStrict(activeScenarioKey);
const { unitActions, store } = activeScenario;

const maxSpeed = computed(() => {
  const v = props.unit.properties?.maxSpeed;
  if (v === undefined) return "Not set";
  return formatSpeed(v);
});

const averageSpeed = computed(() => {
  const v = props.unit.properties?.averageSpeed;
  if (v === undefined) return "Not set";
  return formatSpeed(v);
});

function formatSpeed({ value, uom }: { value: number; uom: SpeedUnitOfMeasure }): string {
  switch (uom) {
    case "km/h":
      return value.toFixed(1) + " km/h";
    case "knots":
      return value.toFixed(1) + " knots";
    case "mph":
      return value.toFixed(1) + " mph";
    case "ft/s":
      return value.toFixed(1) + " ft/s";
    default:
      return value.toFixed(1) + " m/s";
  }
}

function updateMaxSpeed(data: UnitPropertyUpdate) {
  showMax.value = false;
  // @ts-ignore
  if (isNaN(data.value)) return;
  if (data.value === null || data.value === "" || data.value === undefined) {
    unitActions.updateUnitProperties(props.unit.id, {
      maxSpeed: undefined,
    });
    return;
  }
  unitActions.updateUnitProperties(props.unit.id, {
    maxSpeed: data as UnitProperty,
  });
}

function updateAverageSpeed(data: UnitPropertyUpdate) {
  showAverage.value = false;
  // @ts-ignore
  if (isNaN(data.value)) return;
  if (data.value === null || data.value === "" || data.value === undefined) {
    unitActions.updateUnitProperties(props.unit.id, {
      averageSpeed: undefined,
    });
    return;
  } else {
    unitActions.updateUnitProperties(props.unit.id, {
      averageSpeed: data as UnitProperty,
    });
  }
}
</script>
<template>
  <section class="prose mt-4">
    <table class="w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th>Unit property</th>
          <th class="w-36">Value</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr>
          <td>Average speed</td>
          <td
            class="flex cursor-pointer items-center justify-start"
            @click="showAverage = true"
          >
            <PropertyInput
              v-if="!isLocked && showAverage"
              class="w-32"
              :property="props.unit.properties?.averageSpeed"
              @update-value="updateAverageSpeed"
            />
            <span v-else>{{ averageSpeed }}</span>
          </td>
        </tr>
        <tr>
          <td>Maximum speed</td>
          <td
            class="flex cursor-pointer items-center justify-start"
            @click="showMax = true"
          >
            <PropertyInput
              v-if="!isLocked && showMax"
              class="w-32"
              @update-value="updateMaxSpeed"
            />
            <span v-else>{{ maxSpeed }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
