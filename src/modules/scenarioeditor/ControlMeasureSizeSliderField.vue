<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SizeUnit } from "@orbat-mapper/control-measures";
import { FieldLabel } from "@/components/ui/field";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  decimalsForStep,
  roundToStep,
  type SizeSliderRange,
} from "@/modules/scenarioeditor/controlMeasureSizeOptions";

/**
 * One size dimension of a control measure (arrowhead length, label size): the label
 * and a typed value with its unit on one line, the slider and the m/px switch below.
 * The unit switch is the denomination itself, so the label needs no "(m)" suffix.
 *
 * The slider previews locally and emits once on release, so a drag is one undo step;
 * the typed value is the precise companion that does not snap to the slider's step.
 */
const props = defineProps<{
  id: string;
  label: string;
  unit: SizeUnit;
  value: number;
  range: SizeSliderRange;
  /** The selection mixes units; neither half of the switch is shown as chosen. */
  mixedUnit?: boolean;
  /** The selection mixes sizes; the typed value reads Mixed. */
  mixed?: boolean;
}>();

const emit = defineEmits<{
  "update:value": [value: number];
  "update:unit": [unit: SizeUnit];
}>();

const UNITS = [
  { value: "m", label: "Meters", title: "Ground (meters)" },
  { value: "px", label: "Pixels", title: "Screen (pixels)" },
] as const;

const draft = ref(props.value);
watch(
  () => props.value,
  (value) => {
    draft.value = value;
  },
);

const unitName = computed(() => (props.unit === "m" ? "meters" : "pixels"));
/** The slider reaches the value it shows, even one outside its range. */
const sliderMin = computed(() =>
  Math.min(
    props.range.min,
    Math.floor(draft.value / props.range.step) * props.range.step,
  ),
);
const sliderMax = computed(() =>
  Math.max(props.range.max, Math.ceil(draft.value / props.range.step) * props.range.step),
);
const formatOptions = computed<Intl.NumberFormatOptions>(() => ({
  useGrouping: false,
  maximumFractionDigits: decimalsForStep(props.range.step),
}));

function commit(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return;
  if (value === props.value) return;
  emit("update:value", value);
}

function chooseUnit(value: unknown) {
  // Choosing the shown unit is a no-op, except on a mixed selection, where it
  // converts every graphic to that unit.
  if ((value === "m" || value === "px") && (value !== props.unit || props.mixedUnit))
    emit("update:unit", value);
}
</script>

<template>
  <div data-slot="size-slider-field" class="flex flex-col gap-2">
    <div class="flex items-center justify-between gap-2">
      <FieldLabel :for="`${id}-value`">{{ label }}</FieldLabel>
      <NumberField
        :id="`${id}-value`"
        class="w-24 shrink-0 gap-0"
        :model-value="mixed ? undefined : roundToStep(draft, range.step)"
        :min="range.step < 1 ? range.step : 1"
        :step="range.step"
        :step-snapping="false"
        :format-options="formatOptions"
        @update:model-value="commit"
      >
        <NumberFieldContent>
          <NumberFieldInput
            :aria-label="`${label} in ${unitName}`"
            :placeholder="mixed ? 'Mixed' : undefined"
            class="h-7 pr-7 pl-2 text-right text-xs tabular-nums shadow-none"
          />
          <span
            aria-hidden="true"
            class="text-muted-foreground pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs"
            >{{ unit }}</span
          >
        </NumberFieldContent>
      </NumberField>
    </div>
    <div class="flex items-center gap-2">
      <Slider
        :id="id"
        class="min-w-0 flex-1"
        :model-value="[draft]"
        :min="sliderMin"
        :max="sliderMax"
        :step="range.step"
        :aria-label="label"
        @update:model-value="(v) => v?.[0] !== undefined && (draft = v[0])"
        @value-commit="(v) => commit(v?.[0])"
      />
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        :model-value="mixedUnit ? '' : unit"
        :aria-label="`${label} unit`"
        @update:model-value="chooseUnit"
      >
        <ToggleGroupItem
          v-for="option in UNITS"
          :key="option.value"
          :value="option.value"
          class="h-7 min-w-7 px-2 text-[11px] font-medium"
          :aria-label="option.label"
          :title="option.title"
        >
          {{ option.value }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  </div>
</template>
