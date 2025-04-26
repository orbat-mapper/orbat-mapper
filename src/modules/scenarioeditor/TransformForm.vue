<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Trash2Icon } from "lucide-vue-next";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import NewSelect from "@/components/NewSelect.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import { computed, ref, watchEffect } from "vue";
import type { NewSelectItem } from "@/components/types.ts";
import type {
  BufferOptions,
  SimplifyOptions,
  TransformationOperation,
  TransformationType,
} from "@/geo/transformations.ts";
import type { Units } from "@turf/helpers";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type TransformFormProperties = {
  unitMode?: boolean;
};

const props = withDefaults(defineProps<TransformFormProperties>(), {
  unitMode: false,
});

const emit = defineEmits(["delete"]);

const currentOp = defineModel<TransformationOperation>({ required: true });

const transformation = ref<TransformationType>(currentOp.value.transform);
const disabled = ref(false);
const isOpen = ref(currentOp.value.isOpen ?? true);
const enabled = computed({
  get() {
    return !disabled.value;
  },
  set(value) {
    disabled.value = !value;
  },
});
const bufferOptions = ref<BufferOptions>(
  currentOp.value.transform === "buffer"
    ? currentOp.value.options
    : { radius: 0, units: "kilometers", steps: 8 },
);

const simplifyOptions = ref<SimplifyOptions>(
  currentOp.value.transform === "simplify"
    ? currentOp.value.options
    : { tolerance: 0.001 },
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
    { label: "Simplify", value: "simplify" },
    { label: "Smooth", value: "smooth" },
    { label: "Union", value: "union" },
  ];
});

const transformationLabel = computed(() => {
  const selectedOption = transformationOptions.value.find(
    (option) => option.value === transformation.value,
  );
  return selectedOption ? selectedOption.label : transformation.value;
});

const unitItems: NewSelectItem<Units>[] = [
  { label: "Kilometers", value: "kilometers" },
  { label: "Meters", value: "meters" },
  { label: "Miles", value: "miles" },
  { label: "Feet", value: "feet" },
  { label: "Nautical miles", value: "nauticalmiles" },
];

const id = currentOp.value.id;
watchEffect(() => {
  if (transformation.value === "buffer") {
    const { radius, units, steps } = bufferOptions.value;
    currentOp.value = {
      id,
      transform: "buffer",
      options: { radius, units, steps },
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "boundingBox") {
    currentOp.value = {
      id,
      transform: "boundingBox",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "convexHull") {
    currentOp.value = {
      id,
      transform: "convexHull",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "concaveHull") {
    currentOp.value = {
      id,
      transform: "concaveHull",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "simplify") {
    const { tolerance } = simplifyOptions.value;
    currentOp.value = {
      id,
      transform: "simplify",
      options: { tolerance },
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "smooth") {
    currentOp.value = {
      id,
      transform: "smooth",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "center") {
    currentOp.value = {
      id,
      transform: "center",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "centerOfMass") {
    currentOp.value = {
      id,
      transform: "centerOfMass",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "centroid") {
    currentOp.value = {
      id,
      transform: "centroid",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "explode") {
    currentOp.value = {
      id,
      transform: "explode",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  } else if (transformation.value === "union") {
    currentOp.value = {
      id,
      transform: "union",
      options: {},
      disabled: disabled.value,
      isOpen: isOpen.value,
    };
  }
});

function onSubmit() {
  // Handle form submission logic here
  console.log("Form submitted with transformation:", transformation.value);
}
</script>
<template>
  <Collapsible v-model:open="isOpen" class="border-border -mx-2 rounded border">
    <header class="flex items-center justify-between rounded border-b p-2 px-4">
      <h4 class="text-sm font-bold">{{ transformationLabel }}</h4>
      <div class="flex items-center gap-1">
        <Switch v-model="enabled" />
        <Button variant="ghost" size="sm" @click="emit('delete')">
          <Trash2Icon />
        </Button>
        <CollapsibleTrigger as-child>
          <Button variant="ghost" size="sm" class="w-9 p-0">
            <ChevronsUpDown class="h-4 w-4" />
            <span class="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
    </header>
    <CollapsibleContent class="p-4">
      <form @submit.prevent="onSubmit" class="space-y-4">
        <NewSelect
          label="Transformation"
          :items="transformationOptions"
          v-model="transformation"
        />

        <div v-if="transformation === 'buffer'">
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
    </CollapsibleContent>
  </Collapsible>
</template>
