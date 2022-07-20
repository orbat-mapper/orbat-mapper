<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import InputGroup from "../../components/InputGroup.vue";
import NumberInputGroup from "../../components/NumberInputGroup.vue";
import { computed, ref } from "vue";
import { type StrokeStyleSpec } from "../../geo/simplestyle";
import { type ScenarioFeature } from "../../types/scenarioGeoModels";
import ToggleField from "../../components/ToggleField.vue";
import OpacityInput from "../../components/OpacityInput.vue";
import InputGroupTemplate from "../../components/InputGroupTemplate.vue";

const settings = ref<Partial<StrokeStyleSpec>>({});
const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<StrokeStyleSpec>): void }>();

const stroke = computed((): Partial<StrokeStyleSpec> => {
  const { properties } = props.feature;
  return {
    stroke: properties.stroke,
    "stroke-width": properties["stroke-width"],
    "stroke-opacity": properties["stroke-opacity"],
    _stroke: properties._stroke,
  };
});

function updateValue(name: keyof StrokeStyleSpec, value: string | number | null) {
  emit("update", { [name]: value });
}

const db = useDebounceFn(updateValue, 100);

const usedOptions = computed(
  () =>
    new Set(
      Object.entries(stroke.value || {})
        .filter(([k, v]) => v !== undefined)
        .map(([k, v]) => k)
    )
);

const hasStroke = computed(() => stroke.value.stroke !== null);

function toggleStroke(v: boolean) {
  if (v) {
    emit("update", { stroke: props.feature.properties._stroke || "#cccccc" });
  } else {
    emit("update", { stroke: null, _stroke: props.feature.properties.stroke });
  }
}
</script>

<template>
  <header class="flex items-center justify-between">
    <h4 class="text-sm font-bold text-gray-700">Stroke</h4>
    <ToggleField
      :model-value="hasStroke"
      @update:model-value="toggleStroke"
    ></ToggleField>
  </header>
  <div v-if="hasStroke" class="mt-4 space-y-4">
    <InputGroup
      type="color"
      label="Color"
      :model-value="stroke.stroke"
      @update:model-value="updateValue('stroke', $event)"
    />
    <NumberInputGroup
      label="Width"
      :model-value="stroke['stroke-width']"
      @update:model-value="updateValue('stroke-width', $event)"
    />
    <InputGroupTemplate label="Opacity">
      <OpacityInput
        :model-value="stroke['stroke-opacity']"
        visible
        @update:model-value="updateValue('stroke-opacity', $event)"
      />
    </InputGroupTemplate>
  </div>
</template>
