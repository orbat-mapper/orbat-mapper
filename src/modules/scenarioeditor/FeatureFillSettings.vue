<script setup lang="ts">
import { useDebounceFn, useStorage } from "@vueuse/core";
import InputGroup from "../../components/InputGroup.vue";
import { computed, ref } from "vue";
import { type FillStyleSpec } from "../../geo/simplestyle";
import { type ScenarioFeature } from "../../types/scenarioGeoModels";
import ToggleField from "../../components/ToggleField.vue";
import OpacityInput from "../../components/OpacityInput.vue";
import InputGroupTemplate from "../../components/InputGroupTemplate.vue";
import SettingsPanel from "@/components/SettingsPanel.vue";

const settings = ref<Partial<FillStyleSpec>>({});
const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits<{ (e: "update", value: Partial<FillStyleSpec>): void }>();

const open = useStorage("fill-panel", true);
const fill = computed((): Partial<FillStyleSpec> => {
  const { properties } = props.feature;
  return {
    fill: properties.fill,
    "fill-opacity": properties["fill-opacity"],
    _fill: properties._fill,
  };
});

function updateValue(name: keyof FillStyleSpec, value: string | number) {
  emit("update", { [name]: value });
}

const db = useDebounceFn(updateValue, 100);

const usedOptions = computed(
  () =>
    new Set(
      Object.entries(fill.value || {})
        .filter(([k, v]) => v !== undefined)
        .map(([k, v]) => k),
    ),
);

const hasFill = computed(() => fill.value.fill !== null);

function toggleFill(v: boolean) {
  if (v) {
    emit("update", { fill: props.feature.properties._fill || "#555555" });
  } else {
    emit("update", { fill: null, _fill: props.feature.properties.fill });
  }
}
</script>

<template>
  <SettingsPanel label="Fill" v-model:open="open">
    <template #right>
      <ToggleField :model-value="hasFill" @update:model-value="toggleFill" />
    </template>

    <div v-if="hasFill" class="mt-4 space-y-4">
      <InputGroup
        type="color"
        label="Color"
        :model-value="fill.fill"
        @update:model-value="updateValue('fill', $event)"
      />

      <InputGroupTemplate label="Opacity">
        <OpacityInput
          :model-value="fill['fill-opacity']"
          visible
          @update:model-value="updateValue('fill-opacity', $event)"
        />
      </InputGroupTemplate>
    </div>
  </SettingsPanel>
</template>
