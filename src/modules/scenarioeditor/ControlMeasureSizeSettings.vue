<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { resolveSizePair } from "@orbat-mapper/control-measures";
import type {
  ControlMeasureId,
  ParamDescriptor,
  SizeUnit,
} from "@orbat-mapper/control-measures";
import { FieldGroup } from "@/components/ui/field";
import ControlMeasureSizeSliderField from "@/modules/scenarioeditor/ControlMeasureSizeSliderField.vue";
import {
  metadataFor,
  sizePairParameter,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import {
  editControlMeasureSizes,
  groundSizeRange,
} from "@/modules/scenarioeditor/controlMeasureSizeOptions";
import type {
  ControlMeasureSizeTarget,
  ControlMeasureSizeUpdate,
} from "@/modules/scenarioeditor/controlMeasureSizeOptions";

const props = defineProps<{
  targets: ControlMeasureSizeTarget[];
  /** Read on each gesture so zoom changes cannot leave a cached conversion scale. */
  getResolution?: () => number | undefined;
}>();
const emit = defineEmits<{ update: [updates: ControlMeasureSizeUpdate[]] }>();
const instanceId = useId();
const error = ref("");
const dimensions = computed(() => {
  const first = props.targets[0];
  if (!first) return [];
  return (metadataFor(first.graphicKind)?.sizePairs ?? []).flatMap((pair) => {
    const resolutions = props.targets.map((target) => {
      if (!metadataFor(target.graphicKind)) return undefined;
      return resolveSizePair({
        kind: target.graphicKind as ControlMeasureId,
        options: target.options,
        dimension: pair.id,
      });
    });
    const resolved = resolutions[0];
    if (
      resolved?.status !== "resolved" ||
      resolutions.some((r) => r?.status !== "resolved")
    )
      return [];
    return [
      {
        pair,
        unit: resolved.unit,
        value: resolved.value,
        range: sliderRange(
          sizePairParameter(first.graphicKind, pair, resolved.unit),
          sizePairParameter(first.graphicKind, pair, "px"),
          resolved.unit,
        ),
        mixedUnit: resolutions.some(
          (r) => r?.status === "resolved" && r.unit !== resolved.unit,
        ),
        mixed: resolutions.some(
          (r) =>
            r?.status === "resolved" &&
            (r.unit !== resolved.unit || r.value !== resolved.value),
        ),
      },
    ];
  });
});

/**
 * The slider's travel: the declared range for pixels, and for meters the pixel range
 * at the current zoom (`groundSizeRange`), since the declared meter range is zoom-blind.
 * Read with the rest of `dimensions`, so it follows the zoom the panel last saw.
 */
function sliderRange(
  parameter: ParamDescriptor,
  pixelParameter: ParamDescriptor,
  unit: SizeUnit,
) {
  const number = parameter.type === "number" ? parameter : undefined;
  const declared = {
    min: number?.min ?? 1,
    max: number?.max ?? 100,
    step: number?.step ?? 1,
  };
  if (unit === "px") return declared;
  return groundSizeRange(pixelParameter, props.getResolution?.()) ?? declared;
}

function edit(dimension: string, unit: unknown, value?: string | number | boolean) {
  if (unit !== "m" && unit !== "px") return;
  if (value !== undefined && typeof value !== "number") return;
  const updates = editControlMeasureSizes(
    props.targets,
    dimension,
    unit as SizeUnit,
    props.getResolution?.(),
    value,
  );
  error.value = updates ? "" : "Size conversion needs a valid size and map resolution.";
  if (updates) emit("update", updates);
}
</script>

<template>
  <FieldGroup v-if="dimensions.length">
    <div
      v-for="dimension in dimensions"
      :key="dimension.pair.id"
      class="flex flex-col gap-2"
    >
      <ControlMeasureSizeSliderField
        :id="`${instanceId}-cm-size-${dimension.pair.id}`"
        :label="dimension.pair.label"
        :unit="dimension.unit"
        :value="dimension.value"
        :range="dimension.range"
        :mixed="dimension.mixed"
        :mixed-unit="dimension.mixedUnit"
        @update:value="edit(dimension.pair.id, dimension.unit, $event)"
        @update:unit="edit(dimension.pair.id, $event)"
      />
      <p v-if="dimension.mixed" class="text-muted-foreground text-xs">
        Mixed sizes; showing the first selected graphic. Changing units preserves each
        graphic's size.
      </p>
    </div>
    <p v-if="error" role="alert" class="text-destructive text-sm">{{ error }}</p>
  </FieldGroup>
</template>
