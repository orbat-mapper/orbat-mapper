<script setup lang="ts">
import { computed, toRaw, useId } from "vue";
import {
  applyBoxTransformOptions,
  foldsBoxTransformOptions,
  resolveParameterPresentationTier,
  resolveParameterSemanticRole,
} from "@orbat-mapper/control-measures";
import {
  CONTROL_MEASURE_STYLE_OWNED_OPTION_KEYS,
  effectiveControlMeasureOptions,
  metadataFor,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import ControlMeasureSizeSettings from "@/modules/scenarioeditor/ControlMeasureSizeSettings.vue";
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
  getResolution?: () => number | undefined;
}>();

const emit = defineEmits<{
  (e: "update", value: TacticalGraphicOptions): void;
}>();

const instanceId = useId();
function fieldId(key: string): string {
  return `${instanceId}-cm-extended-${key}`;
}

const metadata = computed(() => metadataFor(props.graphicKind));

const effectiveOptions = computed(() =>
  effectiveControlMeasureOptions(props.graphicKind, props.options),
);
const sizePairKeys = computed(
  () =>
    new Set(
      (metadata.value?.sizePairs ?? []).flatMap((pair) => [pair.pixels, pair.meters]),
    ),
);

/**
 * Some static graphics persist box rotation/scale in their option bag. Probe the
 * package's pure transform hook with a representative value so those parameters stay
 * on the transform box instead of being duplicated here. The probe also adapts when
 * another kind gains the capability in a future package release.
 */
function isTransformBoxParameter(parameter: ParamDescriptor): boolean {
  if (parameter.type !== "number") return false;
  const kind = props.graphicKind as ControlMeasureId;

  const probeOptions = { ...effectiveOptions.value };
  const pair = metadata.value?.sizePairs?.find(
    (pair) => pair.pixels === parameter.key || pair.meters === parameter.key,
  );
  if (pair)
    delete probeOptions[parameter.key === pair.pixels ? pair.meters : pair.pixels];
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
  // Whether the transform box folds any option at all is a static per-kind fact, so
  // the expensive per-parameter probe is skipped entirely for kinds without it.
  const foldsTransform = foldsBoxTransformOptions(props.graphicKind as ControlMeasureId);
  const visible = parameters.filter(
    (parameter) =>
      resolveParameterSemanticRole(parameter) === "appearance" &&
      // Smoothing, including its advanced resolution, already lives in Style.
      !CONTROL_MEASURE_STYLE_OWNED_OPTION_KEYS.includes(parameter.key) &&
      !sizePairKeys.value.has(parameter.key) &&
      (parameter.visibleWhen?.(effectiveOptions.value) ?? true) &&
      !(foldsTransform && isTransformBoxParameter(parameter)),
  );
  return visible;
});

const parameterTiers = computed(() => {
  const standard: ParamDescriptor[] = [];
  const advanced: ParamDescriptor[] = [];
  for (const parameter of appearanceParameters.value) {
    (resolveParameterPresentationTier(parameter) === "advanced"
      ? advanced
      : standard
    ).push(parameter);
  }
  return { standard, advanced };
});
const standardParameters = computed(() => parameterTiers.value.standard);
const advancedParameters = computed(() => parameterTiers.value.advanced);

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
    <ControlMeasureSizeSettings
      :targets="[{ id: 'single', graphicKind, options }]"
      :get-resolution="getResolution"
      @update="emit('update', $event[0]!.options)"
    />
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
      v-if="
        !standardParameters.length &&
        !advancedParameters.length &&
        !metadata?.sizePairs?.length
      "
      class="text-muted-foreground text-sm"
    >
      This control measure has no extended styling settings.
    </p>
  </div>
</template>
