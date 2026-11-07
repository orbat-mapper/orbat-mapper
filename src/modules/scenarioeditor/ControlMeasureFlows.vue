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
  flowParams,
  flowValues,
  patchFlowOptions,
  summarizeFlows,
} from "@/modules/scenarioeditor/flowArrowFlows";
import {
  applySplitFlowCommand,
  AUTO_LABEL_POSITION,
  patchSplitFlowOptions,
  RESET_HEAD_SIZE,
  sameHeadSizeEverywhere,
  splitFlowActions,
  splitFlowParams,
  splitFlowValues,
  summarizeSplitFlows,
} from "@/modules/scenarioeditor/splitArrowFlows";
import type { FlowCommand } from "@/modules/scenarioeditor/controlMeasureFlows";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ControlMeasureFlowActions from "@/modules/scenarioeditor/ControlMeasureFlowActions.vue";
import ControlMeasureFlowPicker from "@/modules/scenarioeditor/ControlMeasureFlowPicker.vue";
import ControlMeasureParameterField from "@/modules/scenarioeditor/ControlMeasureParameterField.vue";

/**
 * The flows of an arrow drawn as flows (the Flow Arrow and the Split Arrow): pick a
 * flow, set its own fields, and run the engine's flow edits on it. Presentational:
 * the caller routes `select` to the edit session's part selection, `patch` to an
 * options write and `edit` (points and options together) to one undo step.
 *
 * The engine owns the topology rules; the helpers either read the `flows` option or
 * ask the engine's own edit functions.
 */
const props = defineProps<{
  graphicKind: "flow-arrow" | "split-arrow";
  controlPoints: readonly Position[];
  options: TacticalGraphicOptions;
  /** The selected flow; `undefined` reads as the trunk. */
  selectedPart: number | undefined;
  /** Whether a shape edit is open on this graphic. */
  editing: boolean;
  canAddFlow: boolean;
  addFlowArmed: boolean;
}>();

const emit = defineEmits<{
  select: [part: number];
  patch: [options: Pick<FlowArrowOptions | SplitArrowOptions, "flows">];
  edit: [edit: { controlPoints: Position[]; options: TacticalGraphicOptions }];
  "update:addFlowArmed": [armed: boolean];
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
const selectedFlowArrow = computed(() => flowArrowFlows.value[selectedIndex.value]);
const selectedSplitArrow = computed(() => splitArrowFlows.value[selectedIndex.value]);
const selectedFlow = computed(
  () => selectedFlowArrow.value?.flow ?? selectedSplitArrow.value?.flow,
);
const selectedLabel = computed(() => flows.value[selectedIndex.value]?.label ?? "");

const params = computed<ParamDescriptor[]>(() => {
  if (selectedFlowArrow.value) return flowParams(selectedFlowArrow.value);
  if (selectedSplitArrow.value) return splitFlowParams(selectedSplitArrow.value);
  return [];
});

const values = computed<Record<string, unknown>>(() => {
  if (selectedFlowArrow.value)
    return flowValues(selectedFlowArrow.value.flow, flowArrowOptions.value);
  if (selectedSplitArrow.value)
    return splitFlowValues(selectedSplitArrow.value.flow, splitArrowOptions.value);
  return {};
});

// Trial-runs each edit, so only for the flow on show.
const actions = computed(() =>
  props.graphicKind === "flow-arrow"
    ? flowActions(props.controlPoints, flowArrowOptions.value, selectedIndex.value)
    : splitFlowActions(props.controlPoints, splitArrowOptions.value, selectedIndex.value),
);

// Another flow sizes its own head: the selected one has its own reset.
const otherOwnHeadSize = computed(() =>
  splitArrowFlows.value.some(
    (flow) => flow.ownHeadSize && flow.index !== selectedIndex.value,
  ),
);

function valueFor(parameter: ParamDescriptor) {
  return values.value[parameter.key] as string | number | boolean | undefined;
}

function onChange(patch: Record<string, unknown>) {
  emit(
    "patch",
    props.graphicKind === "flow-arrow"
      ? patchFlowOptions(
          props.controlPoints,
          flowArrowOptions.value,
          selectedIndex.value,
          patch,
        )
      : patchSplitFlowOptions(
          props.controlPoints,
          splitArrowOptions.value,
          selectedIndex.value,
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
      <FieldLegend variant="legend" class="mb-1">Flows</FieldLegend>
      <ControlMeasureFlowPicker
        :flows="flows"
        :selected="selectedIndex"
        :editing="editing"
        :add-flow-armed="addFlowArmed"
        @select="emit('select', $event)"
      />

      <FieldGroup v-if="params.length">
        <ControlMeasureParameterField
          v-for="parameter in params"
          :id="`${instanceId}-flow-${parameter.key}`"
          :key="`${selectedIndex}-${parameter.key}`"
          :parameter="parameter"
          :model-value="valueFor(parameter)"
          @update:model-value="onChange({ [parameter.key]: $event })"
        />
      </FieldGroup>

      <ControlMeasureFlowActions
        :label="selectedLabel"
        :actions="actions"
        :merges="selectedFlow?.mergeInto !== undefined"
        :trunk="selectedIndex === 0"
        :can-add-flow="editing && canAddFlow"
        :add-flow-armed="addFlowArmed"
        @run="run"
        @update:add-flow-armed="emit('update:addFlowArmed', $event)"
      >
        <Button
          v-if="selectedFlowArrow?.hasPointWidths"
          variant="outline"
          size="sm"
          data-test="flow-clear-point-widths"
          @click="onChange(CLEAR_FLOW_POINT_WIDTHS)"
        >
          <Eraser class="size-4" />
          Clear point widths
        </Button>
        <Button
          v-if="selectedSplitArrow && selectedSplitArrow.flow.labelPosition !== undefined"
          variant="outline"
          size="sm"
          data-test="flow-auto-label-position"
          @click="onChange(AUTO_LABEL_POSITION)"
        >
          <WandSparkles class="size-4" />
          Auto label position
        </Button>
        <Button
          v-if="selectedSplitArrow?.ownHeadSize"
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
