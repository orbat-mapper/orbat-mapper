<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  CONTROL_MEASURE_METADATA,
  getDefaultOptions,
} from "@orbat-mapper/control-measures";
import type {
  ControlMeasureId,
  TextAmplifierDescriptor,
  TextAmplifiers,
} from "@orbat-mapper/control-measures";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import ControlMeasureEchelonSelect from "@/modules/scenarioeditor/ControlMeasureEchelonSelect.vue";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

const props = defineProps<{
  graphicKind: ControlMeasureId;
  textAmplifiers?: TextAmplifiers;
  options?: TacticalGraphicOptions;
}>();

const emit = defineEmits<{
  update: [textAmplifiers: TextAmplifiers];
  "update-options": [options: TacticalGraphicOptions];
}>();

const descriptors = computed<readonly TextAmplifierDescriptor[]>(
  () => CONTROL_MEASURE_METADATA[props.graphicKind]?.textAmplifiers ?? [],
);
const previewAmplifiers = computed<TextAmplifiers>(() =>
  Object.fromEntries(
    descriptors.value.map((descriptor) => [descriptor.key, `<${descriptor.key}>`]),
  ),
);
const isGenericText = computed(() => props.graphicKind === "text");
const genericText = ref("");

watch(
  () => [props.graphicKind, props.options?.text] as const,
  ([graphicKind, text]) => {
    const defaults = getDefaultOptions(graphicKind) as TacticalGraphicOptions;
    genericText.value = String(text ?? defaults.text ?? "");
  },
  { immediate: true },
);

// The registry's representative sample owns preview-only geometry tuning (for
// example Strong Point's rounded outline and compact tic/echelon sizing). Only
// the option edited in this panel should override that sample.
const previewOptions = computed<TacticalGraphicOptions | undefined>(() => {
  if (isGenericText.value) return { text: genericText.value };
  return props.options?.echelon === undefined
    ? undefined
    : { echelon: props.options.echelon };
});
const values = ref<TextAmplifiers>({});

watch(
  () => [props.graphicKind, props.textAmplifiers] as const,
  ([, textAmplifiers]) => {
    values.value = { ...(textAmplifiers ?? {}) };
  },
  { immediate: true, deep: true },
);

function valueFor(descriptor: TextAmplifierDescriptor): string {
  return values.value[descriptor.key] ?? "";
}

function setValue(key: TextAmplifierDescriptor["key"], value: string) {
  values.value = { ...values.value, [key]: value };
}

function commit() {
  const next = Object.fromEntries(
    Object.entries(values.value).filter(([, value]) => value.trim().length > 0),
  ) as TextAmplifiers;
  values.value = next;
  emit("update", next);
}

function setHostile(descriptor: TextAmplifierDescriptor, checked: boolean) {
  setValue(descriptor.key, checked ? (descriptor.placeholder ?? "ENY") : "");
  commit();
}

function commitGenericText() {
  emit("update-options", { ...props.options, text: genericText.value });
}
</script>

<template>
  <div class="space-y-5 pt-4">
    <div class="space-y-2">
      <p class="text-muted-foreground text-xs">
        Preview of the doctrinal field positions.
      </p>
      <div
        class="border-border bg-muted/30 text-foreground flex min-h-36 w-full items-center justify-center overflow-hidden rounded-md border p-3"
      >
        <ControlMeasurePreview
          :kind="graphicKind"
          :text-amplifiers="previewAmplifiers"
          :width="232"
          :height="116"
          :pad="14"
          :stroke-width="1"
          :fallback-font-size="10"
          :max-font-size="16"
          non-scaling-stroke
          :options="previewOptions"
          class="h-36 w-full"
        />
      </div>
    </div>

    <ControlMeasureEchelonSelect
      :graphic-kind="graphicKind"
      :options="options"
      @update="emit('update-options', $event)"
    />

    <Field v-if="isGenericText">
      <FieldLabel for="control-measure-generic-text">Text</FieldLabel>
      <FieldDescription>
        The text to render. Explicit line breaks are preserved.
      </FieldDescription>
      <Textarea
        id="control-measure-generic-text"
        :model-value="genericText"
        placeholder="Text"
        @update:model-value="genericText = String($event)"
        @change="commitGenericText"
      />
    </Field>

    <div v-if="descriptors.length" class="space-y-4">
      <div v-for="descriptor in descriptors" :key="descriptor.key" class="space-y-1.5">
        <div class="flex items-baseline justify-between gap-3">
          <Label :for="`control-measure-amplifier-${descriptor.key}`">
            {{ descriptor.label }}
          </Label>
          <span class="text-muted-foreground font-mono text-xs">
            {{ descriptor.key }}
          </span>
        </div>
        <p v-if="descriptor.description" class="text-muted-foreground text-xs">
          {{ descriptor.description }}
        </p>

        <Switch
          v-if="descriptor.key === 'N'"
          :id="`control-measure-amplifier-${descriptor.key}`"
          :model-value="valueFor(descriptor) === (descriptor.placeholder ?? 'ENY')"
          @update:model-value="setHostile(descriptor, Boolean($event))"
        />
        <Input
          v-else
          :id="`control-measure-amplifier-${descriptor.key}`"
          type="text"
          :model-value="valueFor(descriptor)"
          :placeholder="descriptor.placeholder"
          :maxlength="descriptor.maxLength"
          @update:model-value="setValue(descriptor.key, String($event))"
          @change="commit"
        />
      </div>
    </div>
    <p v-else-if="!isGenericText" class="text-muted-foreground text-sm">
      This control measure has no text amplifiers.
    </p>
  </div>
</template>
