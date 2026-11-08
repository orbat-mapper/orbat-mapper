<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ParamDescriptor } from "@orbat-mapper/control-measures";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { roundToStep } from "@/modules/scenarioeditor/controlMeasureSizeOptions";
import ControlMeasureColorPicker from "@/modules/scenarioeditor/ControlMeasureColorPicker.vue";
import ControlMeasureFieldLabel from "@/modules/scenarioeditor/ControlMeasureFieldLabel.vue";

const props = defineProps<{
  id: string;
  parameter: ParamDescriptor;
  modelValue?: string | number | boolean;
  /**
   * The value differs across what this edits at once (several of an arrow's flows).
   * The controls a flow field uses read Mixed until the first change levels them;
   * `modelValue` still carries the value a slider starts from.
   */
  mixed?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | boolean): void;
}>();

const boundedNumber = computed(
  () =>
    props.parameter.type === "number" &&
    props.parameter.min !== undefined &&
    props.parameter.max !== undefined,
);
const numberDraft = ref(0);
watch(
  () => props.modelValue,
  (value) => {
    if (typeof value === "number") numberDraft.value = value;
  },
  { immediate: true },
);

/** The readout, at the step's precision: a value set by a grip is not on a step. */
const numberReadout = computed(() =>
  roundToStep(
    numberDraft.value,
    (props.parameter.type === "number" && props.parameter.step) || 0.001,
  ),
);

/** A mixed slider has no value to point at, except under the pointer dragging it. */
const sliderHeld = ref(false);
const sliderMixed = computed(() => props.mixed && !sliderHeld.value);

function previewNumber(value: number[] | undefined) {
  if (value?.[0] !== undefined) numberDraft.value = value[0];
}

function commitNumber(value: number[] | undefined) {
  if (value?.[0] !== undefined) emit("update:modelValue", value[0]);
}

function updateNumber(event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  if (Number.isFinite(value)) emit("update:modelValue", value);
}

function updateText(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}

function enumValue(parameter: Extract<ParamDescriptor, { type: "enum" }>): string {
  if (props.mixed) return "";
  const option = parameter.options.find(({ value }) => value === props.modelValue);
  return String(option?.value ?? parameter.options[0]?.value ?? "");
}

function updateEnum(
  parameter: Extract<ParamDescriptor, { type: "enum" }>,
  rawValue: unknown,
) {
  const option = parameter.options.find(
    ({ value }) => String(value) === String(rawValue),
  );
  if (option) emit("update:modelValue", option.value);
}
</script>

<template>
  <Field>
    <div class="flex items-center justify-between gap-2">
      <ControlMeasureFieldLabel
        :for="id"
        :label="parameter.label"
        :description="parameter.description"
      />
      <span
        v-if="parameter.type === 'number' && boundedNumber"
        class="text-muted-foreground text-xs tabular-nums"
      >
        <template v-if="sliderMixed">Mixed</template>
        <template v-else>
          {{ numberReadout }}{{ parameter.unit ? ` ${parameter.unit}` : "" }}
        </template>
      </span>
      <span
        v-else-if="mixed && parameter.type === 'enum' && parameter.options.length <= 7"
        class="text-muted-foreground text-xs"
      >
        Mixed
      </span>
    </div>

    <ToggleGroup
      v-if="parameter.type === 'enum' && parameter.options.length <= 7"
      :id="id"
      type="single"
      variant="outline"
      :model-value="enumValue(parameter)"
      :aria-label="parameter.label"
      class="flex w-full flex-wrap"
      @update:model-value="updateEnum(parameter, $event)"
    >
      <ToggleGroupItem
        v-for="option in parameter.options"
        :key="String(option.value)"
        :value="String(option.value)"
        class="h-auto min-h-9 flex-1 py-1 text-xs whitespace-normal"
      >
        {{ option.label }}
      </ToggleGroupItem>
    </ToggleGroup>

    <NativeSelect
      v-else-if="parameter.type === 'enum'"
      :id="id"
      class="w-full"
      wrapper-class="w-full"
      :model-value="enumValue(parameter)"
      @update:model-value="updateEnum(parameter, $event)"
    >
      <NativeSelectOption v-if="mixed" value="" disabled hidden>Mixed</NativeSelectOption>
      <NativeSelectOption
        v-for="option in parameter.options"
        :key="String(option.value)"
        :value="String(option.value)"
      >
        {{ option.label }}
      </NativeSelectOption>
    </NativeSelect>

    <Switch
      v-else-if="parameter.type === 'boolean'"
      :id="id"
      class="self-start"
      :model-value="Boolean(modelValue)"
      @update:model-value="$emit('update:modelValue', Boolean($event))"
    />

    <Slider
      v-else-if="parameter.type === 'number' && boundedNumber"
      :id="id"
      :class="
        sliderMixed &&
        '[&_[data-slot=slider-range]]:opacity-0 [&_[data-slot=slider-thumb]:not(:focus-visible)]:opacity-0'
      "
      :model-value="[numberDraft]"
      :min="parameter.min"
      :max="parameter.max"
      :step="parameter.step ?? 1"
      @pointerdown="sliderHeld = true"
      @pointerup="sliderHeld = false"
      @pointercancel="sliderHeld = false"
      @update:model-value="previewNumber"
      @value-commit="commitNumber"
    />

    <Input
      v-else-if="parameter.type === 'number'"
      :id="id"
      type="number"
      :model-value="mixed ? undefined : (modelValue as number)"
      :placeholder="mixed ? 'Mixed' : undefined"
      :min="parameter.min"
      :max="parameter.max"
      :step="parameter.step"
      @change="updateNumber"
    />

    <ControlMeasureColorPicker
      v-else-if="parameter.type === 'color'"
      :model-value="String(modelValue ?? '')"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <Textarea
      v-else-if="parameter.type === 'text' && parameter.multiline"
      :id="id"
      :model-value="mixed ? '' : String(modelValue ?? '')"
      :placeholder="mixed ? 'Mixed' : parameter.placeholder"
      :maxlength="parameter.maxLength"
      @change="updateText"
    />
    <Input
      v-else-if="parameter.type === 'text'"
      :id="id"
      :model-value="mixed ? '' : String(modelValue ?? '')"
      :placeholder="mixed ? 'Mixed' : parameter.placeholder"
      :maxlength="parameter.maxLength"
      @change="updateText"
    />
  </Field>
</template>
