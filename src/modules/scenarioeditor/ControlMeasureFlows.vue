<script setup lang="ts">
import { computed, useId } from "vue";
import type {
  FlowArrowOptions,
  ParamDescriptor,
  SplitArrowOptions,
} from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import { Equal, Eraser, RotateCcw, WandSparkles } from "@lucide/vue";
import {
  applyFlowCommand,
  CLEAR_FLOW_POINT_WIDTHS,
  flowActions,
  patchFlowOptions,
  sharedFlowParams,
  sharedFlowValues,
  summarizeFlows,
} from "@/modules/scenarioeditor/flowArrowFlows";
import {
  applySplitFlowCommand,
  AUTO_LABEL_POSITION,
  patchSplitFlowOptions,
  RESET_HEAD_SIZE,
  sameHeadSizeEverywhere,
  sharedSplitFlowParams,
  sharedSplitFlowValues,
  splitFlowActions,
  summarizeSplitFlows,
  TRUNK_LABEL_KEY,
} from "@/modules/scenarioeditor/splitArrowFlows";
import {
  flowSelectionHeading,
  NO_FLOW_ACTIONS,
  selectedSummaries,
  type FlowCommand,
} from "@/modules/scenarioeditor/controlMeasureFlows";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ControlMeasureFlowActions from "@/modules/scenarioeditor/ControlMeasureFlowActions.vue";
import ControlMeasureFlowPicker from "@/modules/scenarioeditor/ControlMeasureFlowPicker.vue";
import ControlMeasureParameterField from "@/modules/scenarioeditor/ControlMeasureParameterField.vue";

/**
 * The flows of an arrow drawn as flows (the Flow Arrow and the Split Arrow): pick one
 * or more flows, set their own fields, and run the engine's flow edits on one.
 * Presentational: the caller routes `select` and `selectParts` to the edit session's
 * part selection, `patch` to an options write, `edit` (points and options together) to
 * one undo step and `update:trunkLabel` to the graphic's Field T, which labels the
 * Split Arrow's trunk.
 *
 * The engine owns the topology rules; the helpers either read the `flows` option or
 * ask the engine's own edit functions.
 */
const props = defineProps<{
  graphicKind: "flow-arrow" | "split-arrow";
  controlPoints: readonly Position[];
  options: TacticalGraphicOptions;
  /** The primary selected flow; `undefined` reads as the trunk. */
  selectedPart: number | undefined;
  /** Every selected flow, the primary included; absent or empty reads as the primary alone. */
  selectedParts?: readonly number[];
  /** Whether a shape edit is open on this graphic. */
  editing: boolean;
  canAddFlow: boolean;
  addFlowArmed: boolean;
  /** The Split Arrow's trunk label: the graphic's Field T. */
  trunkLabel?: string;
}>();

const emit = defineEmits<{
  select: [part: number, extend: boolean];
  selectParts: [parts: number[], primary: number];
  patch: [options: Pick<FlowArrowOptions | SplitArrowOptions, "flows">];
  edit: [edit: { controlPoints: Position[]; options: TacticalGraphicOptions }];
  "update:addFlowArmed": [armed: boolean];
  "update:trunkLabel": [label: string];
}>();

const instanceId = useId();

const flowArrowOptions = computed(() => props.options as FlowArrowOptions);
const splitArrowOptions = computed(() => props.options as SplitArrowOptions);

const flowArrowFlows = computed(() =>
  props.graphicKind === "flow-arrow"
    ? summarizeFlows(props.controlPoints, flowArrowOptions.value)
    : [],
);
const splitArrowFlows = computed(() =>
  props.graphicKind === "split-arrow"
    ? summarizeSplitFlows(props.controlPoints, splitArrowOptions.value)
    : [],
);
const flows = computed(() =>
  props.graphicKind === "flow-arrow" ? flowArrowFlows.value : splitArrowFlows.value,
);

// An undo can remove the selected flow before the engine's fallback reaches the
// panel, so a stale index reads as the trunk rather than as nothing.
const selectedIndex = computed(() =>
  flows.value[props.selectedPart ?? 0] ? (props.selectedPart ?? 0) : 0,
);

/** The selected summaries, primary first, so the fields show its values where they differ. */
function selectionOf<S extends { index: number }>(summaries: readonly S[]): S[] {
  const primary = summaries[selectedIndex.value];
  return primary ? selectedSummaries(summaries, primary, props.selectedParts) : [];
}
const selectedFlowArrows = computed(() => selectionOf(flowArrowFlows.value));
const selectedSplitArrows = computed(() => selectionOf(splitArrowFlows.value));
const selectedOfKind = computed<readonly { index: number; label: string }[]>(() =>
  props.graphicKind === "flow-arrow"
    ? selectedFlowArrows.value
    : selectedSplitArrows.value,
);
const selectedIndexes = computed(() => selectedOfKind.value.map((flow) => flow.index));
const several = computed(() => selectedIndexes.value.length > 1);
const primaryFlow = computed(
  () => selectedFlowArrows.value[0]?.flow ?? selectedSplitArrows.value[0]?.flow,
);
const heading = computed(() =>
  flowSelectionHeading(selectedOfKind.value, flows.value.length),
);

const params = computed<ParamDescriptor[]>(() =>
  props.graphicKind === "flow-arrow"
    ? sharedFlowParams(selectedFlowArrows.value)
    : sharedSplitFlowParams(selectedSplitArrows.value),
);

const shared = computed<{ values: Record<string, unknown>; mixed: string[] }>(() => {
  if (props.graphicKind === "flow-arrow")
    return sharedFlowValues(selectedFlowArrows.value, flowArrowOptions.value);
  const { values, mixed } = sharedSplitFlowValues(
    selectedSplitArrows.value,
    splitArrowOptions.value,
  );
  return { values: { ...values, [TRUNK_LABEL_KEY]: props.trunkLabel ?? "" }, mixed };
});

// Trial-runs each edit, so only while one flow's edits are on show.
const actions = computed(() => {
  if (several.value) return NO_FLOW_ACTIONS;
  return props.graphicKind === "flow-arrow"
    ? flowActions(props.controlPoints, flowArrowOptions.value, selectedIndex.value)
    : splitFlowActions(props.controlPoints, splitArrowOptions.value, selectedIndex.value);
});

// Another flow sizes its own head: the selected ones have their own reset.
const otherOwnHeadSize = computed(() =>
  splitArrowFlows.value.some(
    (flow) => flow.ownHeadSize && !selectedIndexes.value.includes(flow.index),
  ),
);

function valueFor(parameter: ParamDescriptor) {
  return shared.value.values[parameter.key] as string | number | boolean | undefined;
}

function onChange(patch: Record<string, unknown>) {
  if (TRUNK_LABEL_KEY in patch) {
    emit("update:trunkLabel", String(patch[TRUNK_LABEL_KEY]));
    return;
  }
  emit(
    "patch",
    props.graphicKind === "flow-arrow"
      ? patchFlowOptions(
          props.controlPoints,
          flowArrowOptions.value,
          selectedIndexes.value,
          patch,
        )
      : patchSplitFlowOptions(
          props.controlPoints,
          splitArrowOptions.value,
          selectedIndexes.value,
          patch,
        ),
  );
}

function run(command: FlowCommand) {
  const edit =
    props.graphicKind === "flow-arrow"
      ? applyFlowCommand(
          props.controlPoints,
          flowArrowOptions.value,
          selectedIndex.value,
          command,
        )
      : applySplitFlowCommand(
          props.controlPoints,
          splitArrowOptions.value,
          selectedIndex.value,
          command,
        );
  if (edit) {
    emit("edit", {
      controlPoints: edit.controlPoints.map((point) => [...point]),
      options: edit.options as TacticalGraphicOptions,
    });
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <Separator />
    <FieldSet class="gap-4" data-test="control-measure-flows">
      <FieldLegend variant="legend" class="mb-1" data-test="flow-heading">
        {{ heading }}
      </FieldLegend>
      <ControlMeasureFlowPicker
        :flows="flows"
        :selected="selectedIndex"
        :selected-parts="selectedIndexes"
        :editing="editing"
        :add-flow-armed="addFlowArmed"
        @select="(part, extend) => emit('select', part, extend)"
        @select-parts="(parts, primary) => emit('selectParts', parts, primary)"
      />

      <FieldGroup v-if="params.length">
        <ControlMeasureParameterField
          v-for="parameter in params"
          :id="`${instanceId}-flow-${parameter.key}`"
          :key="`${selectedIndexes.join()}-${parameter.key}`"
          :parameter="parameter"
          :model-value="valueFor(parameter)"
          :mixed="shared.mixed.includes(parameter.key)"
          @update:model-value="onChange({ [parameter.key]: $event })"
        />
      </FieldGroup>

      <ControlMeasureFlowActions
        :label="heading"
        :several="several"
        :actions="actions"
        :merges="primaryFlow?.mergeInto !== undefined"
        :trunk="selectedIndex === 0"
        :can-add-flow="editing && canAddFlow"
        :add-flow-armed="addFlowArmed"
        @run="run"
        @update:add-flow-armed="emit('update:addFlowArmed', $event)"
      >
        <Button
          v-if="selectedFlowArrows.some((flow) => flow.hasPointWidths)"
          variant="outline"
          size="sm"
          data-test="flow-clear-point-widths"
          @click="onChange(CLEAR_FLOW_POINT_WIDTHS)"
        >
          <Eraser class="size-4" />
          Clear point widths
        </Button>
        <Button
          v-if="selectedSplitArrows.some((flow) => flow.flow.labelPosition !== undefined)"
          variant="outline"
          size="sm"
          data-test="flow-auto-label-position"
          @click="onChange(AUTO_LABEL_POSITION)"
        >
          <WandSparkles class="size-4" />
          Auto label position
        </Button>
        <Button
          v-if="selectedSplitArrows.some((flow) => flow.ownHeadSize)"
          variant="outline"
          size="sm"
          data-test="flow-reset-head-size"
          @click="onChange(RESET_HEAD_SIZE)"
        >
          <RotateCcw class="size-4" />
          Reset head size
        </Button>
        <Button
          v-if="otherOwnHeadSize"
          variant="outline"
          size="sm"
          data-test="flow-same-head-size"
          @click="emit('patch', sameHeadSizeEverywhere(splitArrowOptions))"
        >
          <Equal class="size-4" />
          Same size for every head
        </Button>
      </ControlMeasureFlowActions>
    </FieldSet>
  </div>
</template>
