<script setup lang="ts">
import { computed, toRaw } from "vue";
import {
  doctrinalControlMeasureParams,
  effectiveControlMeasureOptions,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import type {
  ControlMeasureId,
  ControlMeasureKind,
  ParamDescriptor,
} from "@orbat-mapper/control-measures";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ControlMeasureColorPicker from "@/modules/scenarioeditor/ControlMeasureColorPicker.vue";
import ControlMeasureEchelonSelect from "@/modules/scenarioeditor/ControlMeasureEchelonSelect.vue";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

const props = defineProps<{
  graphicKind?: ControlMeasureKind;
  options?: TacticalGraphicOptions;
  includeText?: boolean;
  fieldLayout?: boolean;
}>();

const emit = defineEmits<{
  (e: "update", value: TacticalGraphicOptions): void;
}>();

const effectiveOptions = computed(() =>
  effectiveControlMeasureOptions(props.graphicKind, props.options),
);

/**
 * The compact toolbar omits text parameters; the amplifier panel opts into them.
 * Both surfaces follow the registry so a newly added doctrinal field does not require
 * another kind-specific component.
 */
const parameters = computed(() =>
  doctrinalControlMeasureParams(props.graphicKind, props.options, {
    includeText: props.includeText,
  }),
);

function valueFor(parameter: ParamDescriptor): string | number | boolean | undefined {
  return effectiveOptions.value[parameter.key] as string | number | boolean | undefined;
}

function updateOption(key: string, value: unknown) {
  emit("update", {
    ...toRaw(props.options),
    [key]: value,
  } as TacticalGraphicOptions);
}

function updateNumber(
  parameter: Extract<ParamDescriptor, { type: "number" }>,
  event: Event,
) {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  if (Number.isFinite(value)) updateOption(parameter.key, value);
}

function updateText(parameter: Extract<ParamDescriptor, { type: "text" }>, event: Event) {
  updateOption(parameter.key, (event.target as HTMLInputElement).value);
}
</script>

<template>
  <template v-for="parameter in parameters" :key="parameter.key">
    <ControlMeasureEchelonSelect
      v-if="parameter.key === 'echelon' && parameter.type === 'enum'"
      :graphic-kind="graphicKind as ControlMeasureId"
      :options="options"
      :inline="!fieldLayout"
      @update="$emit('update', $event)"
    />

    <Field v-else :class="fieldLayout ? undefined : 'contents'">
      <FieldLabel
        :for="`cm-doctrinal-${parameter.key}`"
        :class="fieldLayout ? undefined : 'self-center'"
      >
        {{ parameter.label }}
        <template v-if="parameter.type === 'number' && parameter.unit">
          ({{ parameter.unit }})
        </template>
      </FieldLabel>
      <FieldDescription v-if="fieldLayout && parameter.description">
        {{ parameter.description }}
      </FieldDescription>

      <NativeSelect
        v-if="parameter.type === 'enum'"
        :id="`cm-doctrinal-${parameter.key}`"
        class="w-full"
        wrapper-class="w-full"
        :title="parameter.description"
        :model-value="valueFor(parameter) as string | number | undefined"
        @update:model-value="updateOption(parameter.key, $event)"
      >
        <NativeSelectOption
          v-for="option in parameter.options"
          :key="String(option.value)"
          :value="option.value"
        >
          {{ option.label }}
        </NativeSelectOption>
      </NativeSelect>

      <Switch
        v-else-if="parameter.type === 'boolean'"
        :id="`cm-doctrinal-${parameter.key}`"
        :title="parameter.description"
        :model-value="Boolean(valueFor(parameter))"
        @update:model-value="updateOption(parameter.key, $event)"
      />

      <Input
        v-else-if="parameter.type === 'number'"
        :id="`cm-doctrinal-${parameter.key}`"
        type="number"
        :title="parameter.description"
        :model-value="valueFor(parameter) as number"
        :min="parameter.min"
        :max="parameter.max"
        :step="parameter.step"
        @change="updateNumber(parameter, $event)"
      />

      <ControlMeasureColorPicker
        v-else-if="parameter.type === 'color'"
        :model-value="String(valueFor(parameter) ?? '')"
        @update:model-value="updateOption(parameter.key, $event)"
      />

      <Textarea
        v-else-if="parameter.type === 'text' && parameter.multiline"
        :id="`cm-doctrinal-${parameter.key}`"
        :title="parameter.description"
        :model-value="String(valueFor(parameter) ?? '')"
        :placeholder="parameter.placeholder"
        :maxlength="parameter.maxLength"
        @change="updateText(parameter, $event)"
      />
      <Input
        v-else-if="parameter.type === 'text'"
        :id="`cm-doctrinal-${parameter.key}`"
        type="text"
        :title="parameter.description"
        :model-value="String(valueFor(parameter) ?? '')"
        :placeholder="parameter.placeholder"
        :maxlength="parameter.maxLength"
        @change="updateText(parameter, $event)"
      />
    </Field>
  </template>
</template>
