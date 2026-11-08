<script setup lang="ts">
import { computed } from "vue";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * Picks the flows of an arrow drawn as flows (the Flow Arrow and the Split Arrow), with
 * a hint on how to add and merge flows. A plain click selects one flow, a Shift or
 * Ctrl/⌘ click adds or takes out a flow, and All selects every flow. Each click reports
 * its own intent rather than the group's toggled value, which can't tell those apart,
 * so the group only shows the selection.
 */
const props = defineProps<{
  flows: readonly { index: number; label: string }[];
  /** The primary flow: the one the fields show when values differ. */
  selected: number;
  selectedParts: readonly number[];
  /** Whether a shape edit is open: flows are only added and merged on the map. */
  editing: boolean;
  addFlowArmed: boolean;
}>();

const emit = defineEmits<{
  select: [part: number, extend: boolean];
  selectParts: [parts: number[], primary: number];
}>();

const allSelected = computed(() => props.selectedParts.length === props.flows.length);
const groupValue = computed(() => [
  ...props.selectedParts.map(String),
  ...(allSelected.value ? ["all"] : []),
]);

// The stock pressed `bg-accent` is close to the panel's own background, which makes
// several pressed flows hard to pick out. Each class beats its counterpart in
// `toggleVariants`, hover included.
const PRESSED_CLASS =
  "data-[state=on]:border-ring data-[state=on]:bg-primary/10 data-[state=on]:text-foreground data-[state=on]:hover:bg-primary/15 data-[state=on]:hover:text-foreground";

function choose(part: number, event: MouseEvent) {
  emit("select", part, event.shiftKey || event.ctrlKey || event.metaKey);
}

function toggleAll() {
  if (allSelected.value) emit("select", props.selected, false);
  else
    emit(
      "selectParts",
      props.flows.map((flow) => flow.index),
      props.selected,
    );
}
</script>

<template>
  <Field>
    <FieldLabel>Select flows</FieldLabel>
    <ToggleGroup
      type="multiple"
      variant="outline"
      size="sm"
      :spacing="1"
      :model-value="groupValue"
      class="flex-wrap justify-start"
      aria-label="Flow"
    >
      <ToggleGroupItem
        v-for="flow in flows"
        :key="flow.index"
        :value="String(flow.index)"
        data-test="flow-choice"
        :class="PRESSED_CLASS"
        @click="choose(flow.index, $event)"
      >
        {{ flow.label }}
      </ToggleGroupItem>
      <ToggleGroupItem
        v-if="flows.length > 1"
        value="all"
        data-test="flow-choice-all"
        :class="PRESSED_CLASS"
        @click="toggleAll"
      >
        All
      </ToggleGroupItem>
    </ToggleGroup>
    <FieldDescription v-if="!editing">
      Shift-click flows to edit several at once. Edit the shape to add flows: hold Ctrl/⌘
      and drag from a point.
    </FieldDescription>
    <FieldDescription v-else-if="addFlowArmed">
      Drag from a point to pull out a new flow, or drag a flow's tip onto another flow to
      merge them.
    </FieldDescription>
    <FieldDescription v-else>
      Turn on Add flow, or hold Ctrl/⌘, and drag from a point to pull out a new flow. Drop
      its tip on another flow to merge them. Shift-click flows to edit several at once.
    </FieldDescription>
  </Field>
</template>
