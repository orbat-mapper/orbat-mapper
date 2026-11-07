<script setup lang="ts">
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * Picks one flow of an arrow drawn as flows (the Flow Arrow and the Split Arrow),
 * with a hint on how to add and merge flows.
 */
defineProps<{
  flows: readonly { index: number; label: string }[];
  selected: number;
  /** Whether a shape edit is open: flows are only added and merged on the map. */
  editing: boolean;
  addFlowArmed: boolean;
}>();

const emit = defineEmits<{ select: [part: number] }>();

function choose(value: unknown) {
  if (typeof value === "string" && value !== "") emit("select", Number(value));
}
</script>

<template>
  <Field>
    <FieldLabel class="sr-only">Flow</FieldLabel>
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      :model-value="String(selected)"
      class="flex flex-wrap justify-start gap-1"
      aria-label="Flow"
      @update:model-value="choose"
    >
      <ToggleGroupItem
        v-for="flow in flows"
        :key="flow.index"
        :value="String(flow.index)"
        data-test="flow-choice"
      >
        {{ flow.label }}
      </ToggleGroupItem>
    </ToggleGroup>
    <FieldDescription v-if="!editing">
      Edit the shape to add flows: hold Ctrl/⌘ and drag from a point.
    </FieldDescription>
    <FieldDescription v-else-if="addFlowArmed">
      Drag from a point to pull out a new flow, or drag a flow's tip onto another flow to
      merge them.
    </FieldDescription>
    <FieldDescription v-else>
      Turn on Add flow, or hold Ctrl/⌘, and drag from a point to pull out a new flow. Drop
      its tip on another flow to merge them.
    </FieldDescription>
  </Field>
</template>
