<script setup lang="ts">
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import NewSelect from "@/components/NewSelect.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { computed, ref, watchEffect } from "vue";
import type { NewSelectItem } from "@/components/types.ts";
import type {
  TransformationOperation,
  TransformationType,
} from "@/geo/transformations.ts";
import type { Units } from "@turf/helpers";
import { storeToRefs } from "pinia";
import { useTransformSettingsStore } from "@/stores/transformStore.ts";
import { Slider } from "@/components/ui/slider";

type TransformFormProperties = {
  unitMode?: boolean;
};

const props = withDefaults(defineProps<TransformFormProperties>(), {
  unitMode: false,
});

const currentOp = defineModel<TransformationOperation | null>();

const { transformation, bufferOptions, simplifyOptions } = storeToRefs(
  useTransformSettingsStore(),
);

const sliderValue = computed({
  get() {
    return [simplifyOptions.value.tolerance ?? 0];
  },
  set([value]) {
    simplifyOptions.value.tolerance = value;
  },
});

const transformationOptions = computed((): NewSelectItem<TransformationType>[] => {
  return [
    {
      label: "Buffer",
      value: "buffer",
      description: "Calculates a buffer for input features for a given radius.",
    },
    { label: "Bounding box", value: "boundingBox" },
    { label: "Convex hull", value: "convexHull" },
    { label: "Concave hull", value: "concaveHull" },
    { label: "Center (absolute)", value: "center" },
    { label: "Center of mass", value: "centerOfMass" },
    { label: "Centroid", value: "centroid" },
    { label: "Explode", value: "explode" },
    { label: "Simplify", value: "simplify", disabled: props.unitMode },
    { label: "Smooth", value: "smooth", disabled: props.unitMode },
  ];
});

const unitItems: NewSelectItem<Units>[] = [
  { label: "Kilometers", value: "kilometers" },
  { label: "Meters", value: "meters" },
  { label: "Miles", value: "miles" },
  { label: "Feet", value: "feet" },
  { label: "Nautical miles", value: "nauticalmiles" },
];

watchEffect(() => {
  if (transformation.value === "buffer") {
    const { radius, units, steps } = bufferOptions.value;
    currentOp.value = {
      transform: "buffer",
      options: { radius, units, steps },
    };
  } else if (transformation.value === "boundingBox") {
    currentOp.value = { transform: "boundingBox", options: {} };
  } else if (transformation.value === "convexHull") {
    currentOp.value = { transform: "convexHull", options: {} };
  } else if (transformation.value === "concaveHull") {
    currentOp.value = { transform: "concaveHull", options: {} };
  } else if (transformation.value === "simplify") {
    const { tolerance } = simplifyOptions.value;
    currentOp.value = { transform: "simplify", options: { tolerance } };
  } else if (transformation.value === "smooth") {
    currentOp.value = { transform: "smooth", options: {} };
  } else if (transformation.value === "center") {
    currentOp.value = { transform: "center", options: {} };
  } else if (transformation.value === "centerOfMass") {
    currentOp.value = { transform: "centerOfMass", options: {} };
  } else if (transformation.value === "centroid") {
    currentOp.value = { transform: "centroid", options: {} };
  } else if (transformation.value === "explode") {
    currentOp.value = { transform: "explode", options: {} };
  } else {
    currentOp.value = null;
  }
});

function onSubmit() {
  // Handle form submission logic here
  console.log("Form submitted with transformation:", transformation.value);
}
</script>
<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <NewSelect
      label="Transformation"
      :items="transformationOptions"
      v-model="transformation"
    />

    <div v-if="transformation === 'buffer'">
      <PanelSubHeading>Buffer options</PanelSubHeading>
      <div class="mt-2 grid grid-cols-2 gap-4">
        <div class="col-span-1">
          <NumberInputGroup label="Radius" v-model.number="bufferOptions.radius" />
        </div>
        <NewSelect label="Units" :items="unitItems" v-model="bufferOptions.units" />
        <NumberInputGroup label="Steps" v-model.number="bufferOptions.steps" />
      </div>
    </div>
    <div v-else-if="transformation === 'simplify'">
      <PanelSubHeading>Simplify</PanelSubHeading>
      <div class="mt-4 grid grid-cols-1 gap-4">
        <InputGroupTemplate label="Tolerance">
          <Slider
            v-model="sliderValue"
            :min="0"
            :max="0.15"
            :step="0.00001"
            class="mt-4"
          />
        </InputGroupTemplate>
      </div>
    </div>
  </form>
</template>
