<script setup lang="ts">
import { computed, toRaw, useId } from "vue";
import {
  CONTROL_MEASURE_METADATA,
  applyBoxTransformOptions,
  foldsBoxTransformOptions,
  getDefaultOptions,
  resolveParameterPresentationTier,
  resolveParameterSemanticRole,
} from "@orbat-mapper/control-measures";
import { DEFAULT_LABEL_SIZE_PIXELS } from "@orbat-mapper/tactical-draw";
import { ChevronRight } from "@lucide/vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  ControlMeasureId,
  ControlMeasureKind,
  ParamDescriptor,
} from "@orbat-mapper/control-measures";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import ControlMeasureParameterField from "@/modules/scenarioeditor/ControlMeasureParameterField.vue";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

const props = defineProps<{
  graphicKind: ControlMeasureKind;
  options?: TacticalGraphicOptions;
}>();

const emit = defineEmits<{
  (e: "update", value: TacticalGraphicOptions): void;
}>();

const instanceId = useId();
function fieldId(key: string): string {
  return `${instanceId}-cm-extended-${key}`;
}

const metadata = computed(
  () => CONTROL_MEASURE_METADATA[props.graphicKind as ControlMeasureId],
);
const effectiveOptions = computed<Record<string, unknown>>(() => ({
  ...(getDefaultOptions(props.graphicKind as ControlMeasureId) as Record<
    string,
    unknown
  >),
  ...(props.options as Record<string, unknown> | undefined),
  ...(metadata.value?.capturesLabelSize &&
  props.options?.labelSizePixels === undefined &&
  props.options?.labelSize === undefined
    ? { labelSizePixels: DEFAULT_LABEL_SIZE_PIXELS }
    : undefined),
}));

/** Shared label sizing is declared by the per-kind `capturesLabelSize` flag. */
const labelSizeParameter = computed<ParamDescriptor | undefined>(() => {
  if (!metadata.value?.capturesLabelSize) return undefined;
  if (
    props.options?.labelSizePixels === undefined &&
    props.options?.labelSize !== undefined
  ) {
    return {
      key: "labelSize",
      label: "Label size",
      description: "Label text height in meters.",
      type: "number",
      min: 50,
      max: 20_000,
      step: 50,
      unit: "m",
    };
  }
  return {
    key: "labelSizePixels",
    label: "Label size",
    description: "Label text height in screen pixels.",
    type: "number",
    min: 8,
    max: 48,
    step: 1,
    unit: "px",
  };
});

/**
 * A screen/ground size pair is represented by two adjacent number descriptors with
 * the same stem (`radiusPixels` / `radius`). Only one is live: the authored pixel
 * key selects screen sizing, otherwise the ground-sized half is used. This mirrors
 * the package adapter contract and avoids presenting two identically labelled knobs.
 */
function inactiveSizePairKeys(parameters: readonly ParamDescriptor[]): Set<string> {
  const keys = new Set(parameters.map(({ key }) => key));
  const inactive = new Set<string>();
  for (const parameter of parameters) {
    if (!parameter.key.endsWith("Pixels")) continue;
    const groundKey = parameter.key.slice(0, -"Pixels".length);
    if (!keys.has(groundKey)) continue;
    inactive.add(
      props.options?.[parameter.key] === undefined ? parameter.key : groundKey,
    );
  }
  return inactive;
}

/**
 * Some static graphics persist box rotation/scale in their option bag. Probe the
 * package's pure transform hook with a representative value so those parameters stay
 * on the transform box instead of being duplicated here. The probe also adapts when
 * another kind gains the capability in a future package release.
 */
function isTransformBoxParameter(parameter: ParamDescriptor): boolean {
  const kind = props.graphicKind as ControlMeasureId;
  if (!foldsBoxTransformOptions(kind) || parameter.type !== "number") return false;

  const probeOptions = { ...effectiveOptions.value };
  if (parameter.key.endsWith("Pixels")) {
    delete probeOptions[parameter.key.slice(0, -"Pixels".length)];
  } else {
    delete probeOptions[`${parameter.key}Pixels`];
  }
  // Static point graphics use `sizeMeters` / `sizePixels` rather than the usual
  // shared-stem pair. Make the descriptor under test the live size denomination.
  if (parameter.key.startsWith("size")) {
    for (const key of Object.keys(probeOptions)) {
      if (key.startsWith("size") && key !== parameter.key) delete probeOptions[key];
    }
  }
  if (probeOptions[parameter.key] === undefined) {
    probeOptions[parameter.key] = parameter.min ?? parameter.step ?? 1;
  }

  const patch = applyBoxTransformOptions(kind, probeOptions, {
    scale: 1.1,
    rotationRadians: 0.1,
  });
  return Object.prototype.hasOwnProperty.call(patch ?? {}, parameter.key);
}

const appearanceParameters = computed(() => {
  const parameters = metadata.value?.params ?? [];
  const inactiveSizeKeys = inactiveSizePairKeys(parameters);
  const visible = parameters
    .filter((parameter) => resolveParameterSemanticRole(parameter) === "appearance")
    // Smoothing, including its advanced resolution, already lives in Style.
    .filter((parameter) => !["smooth", "smoothResolution"].includes(parameter.key))
    .filter((parameter) => !inactiveSizeKeys.has(parameter.key))
    .filter((parameter) => !isTransformBoxParameter(parameter))
    .filter((parameter) => parameter.visibleWhen?.(effectiveOptions.value) ?? true);
  if (labelSizeParameter.value) visible.push(labelSizeParameter.value);
  return visible;
});

const standardParameters = computed(() =>
  appearanceParameters.value.filter(
    (parameter) => resolveParameterPresentationTier(parameter) !== "advanced",
  ),
);
const advancedParameters = computed(() =>
  appearanceParameters.value.filter(
    (parameter) => resolveParameterPresentationTier(parameter) === "advanced",
  ),
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
</script>

<template>
  <div class="flex flex-col gap-5 pt-4">
    <FieldGroup v-if="standardParameters.length">
      <ControlMeasureParameterField
        v-for="parameter in standardParameters"
        :id="fieldId(parameter.key)"
        :key="parameter.key"
        :parameter="parameter"
        :model-value="valueFor(parameter)"
        @update:model-value="updateOption(parameter.key, $event)"
      />
    </FieldGroup>

    <Collapsible v-if="advancedParameters.length">
      <Separator v-if="standardParameters.length" />
      <CollapsibleTrigger class="group mt-4 flex w-full items-center gap-2 text-left">
        <ChevronRight
          :size="16"
          class="text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
        />
        <span class="font-medium">Advanced</span>
        <span class="text-muted-foreground text-xs tabular-nums">
          {{ advancedParameters.length }}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent class="pt-4">
        <FieldSet class="gap-4">
          <FieldLegend class="sr-only" variant="label">Advanced settings</FieldLegend>
          <FieldDescription>
            Fine-tune how this control measure is constructed and labelled.
          </FieldDescription>
          <FieldGroup>
            <ControlMeasureParameterField
              v-for="parameter in advancedParameters"
              :id="fieldId(parameter.key)"
              :key="parameter.key"
              :parameter="parameter"
              :model-value="valueFor(parameter)"
              @update:model-value="updateOption(parameter.key, $event)"
            />
          </FieldGroup>
        </FieldSet>
      </CollapsibleContent>
    </Collapsible>

    <p
      v-if="!standardParameters.length && !advancedParameters.length"
      class="text-muted-foreground text-sm"
    >
      This control measure has no extended styling settings.
    </p>
  </div>
</template>
