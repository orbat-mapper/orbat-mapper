<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { resolveSizePair } from "@orbat-mapper/control-measures";
import type { ControlMeasureId, SizeUnit } from "@orbat-mapper/control-measures";
import { FieldGroup } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ControlMeasureParameterField from "@/modules/scenarioeditor/ControlMeasureParameterField.vue";
import {
  metadataFor,
  sizePairParameter,
} from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import { editControlMeasureSizes } from "@/modules/scenarioeditor/controlMeasureSizeOptions";
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
        parameter: sizePairParameter(first.graphicKind, pair, resolved.unit),
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
      <ControlMeasureParameterField
        :id="`${instanceId}-cm-size-${dimension.parameter.key}`"
        :parameter="dimension.parameter"
        :model-value="dimension.value"
        @update:model-value="edit(dimension.pair.id, dimension.unit, $event)"
      >
        <template #unit>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            :model-value="dimension.mixedUnit ? '' : dimension.unit"
            :aria-label="`${dimension.pair.label} unit`"
            @update:model-value="edit(dimension.pair.id, $event)"
          >
            <ToggleGroupItem value="m" aria-label="Meters">m</ToggleGroupItem>
            <ToggleGroupItem value="px" aria-label="Pixels">px</ToggleGroupItem>
          </ToggleGroup>
        </template>
      </ControlMeasureParameterField>
      <p v-if="dimension.mixed" class="text-muted-foreground text-xs">
        Mixed sizes; showing the first selected graphic. Changing units preserves each
        graphic's size.
      </p>
    </div>
    <p v-if="error" role="alert" class="text-destructive text-sm">{{ error }}</p>
  </FieldGroup>
</template>
