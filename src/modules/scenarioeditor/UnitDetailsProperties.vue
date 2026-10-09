<script setup lang="ts">
import type { NUnit, UnitPropertyUpdate } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { SpeedUnitOfMeasure, UnitProperty } from "@/types/scenarioModels";
import PropertyInput from "@/components/PropertyInput.vue";
import { computed, ref } from "vue";
import { isEqual } from "es-toolkit";
import { useUnitEditTargets } from "@/composables/unitEditTargets";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();
const showMax = ref(false);
const showAverage = ref(false);

const { unitActions } = injectStrict(activeScenarioKey);
const { units, forEachEditableUnit } = useUnitEditTargets(() => props.unit.id);

type SpeedKey = "maxSpeed" | "averageSpeed";

const maxSpeed = computed(() => formatProperty("maxSpeed"));
const averageSpeed = computed(() => formatProperty("averageSpeed"));

function formatProperty(key: SpeedKey) {
  const values = units.value.map((unit) => unit.properties?.[key]);
  const v = values[0];
  if (values.some((other) => !isEqual(other, v))) return "Mixed";
  if (v === undefined) return "Not set";
  return formatSpeed(v);
}

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

function updateSpeed(key: SpeedKey, data: UnitPropertyUpdate) {
  if (key === "maxSpeed") showMax.value = false;
  else showAverage.value = false;
  if (isNaN(Number(data.value))) return;
  const isEmpty = data.value === null || data.value === "" || data.value === undefined;
  const value = isEmpty ? undefined : (data as UnitProperty);
  forEachEditableUnit((unitId) =>
    unitActions.updateUnitProperties(unitId, { [key]: value }),
  );
}
</script>
<template>
  <section class="prose text-foreground dark:prose-invert mt-4">
    <table class="divide-border w-full divide-y">
      <thead>
        <tr>
          <th>Unit property</th>
          <th class="w-36">Value</th>
        </tr>
      </thead>
      <tbody class="divide-border divide-y">
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
              @update-value="updateSpeed('averageSpeed', $event)"
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
              @update-value="updateSpeed('maxSpeed', $event)"
            />
            <span v-else>{{ maxSpeed }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
