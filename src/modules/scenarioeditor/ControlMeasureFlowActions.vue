<script setup lang="ts">
import { ArrowLeftRight, GitBranchPlus, Trash2, Unlink } from "@lucide/vue";
import type {
  FlowActions,
  FlowCommand,
} from "@/modules/scenarioeditor/controlMeasureFlows";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

/**
 * The flow edits both flow arrows offer on the selected flow: Add flow, Reverse,
 * Detach tip (on a merging flow) and Remove flow (on any flow but the trunk). The
 * default slot adds the arrow's own buttons before Remove.
 */
defineProps<{
  /** The selected flow's name, for the group's label. */
  label: string;
  actions: FlowActions;
  merges: boolean;
  trunk: boolean;
  /** Whether Add flow can be armed: only during a shape edit. */
  canAddFlow: boolean;
  addFlowArmed: boolean;
}>();

const emit = defineEmits<{
  run: [command: FlowCommand];
  "update:addFlowArmed": [armed: boolean];
}>();
</script>

<template>
  <div class="flex flex-wrap gap-1" role="group" :aria-label="`${label} actions`">
    <Toggle
      v-if="canAddFlow"
      variant="outline"
      size="sm"
      data-test="flow-add"
      :model-value="addFlowArmed"
      @update:model-value="emit('update:addFlowArmed', $event)"
    >
      <GitBranchPlus class="size-4" />
      Add flow
    </Toggle>
    <Button
      variant="outline"
      size="sm"
      data-test="flow-reverse"
      :disabled="!actions.reverse"
      @click="emit('run', 'reverse')"
    >
      <ArrowLeftRight class="size-4" />
      Reverse
    </Button>
    <Button
      v-if="merges"
      variant="outline"
      size="sm"
      data-test="flow-detach"
      :disabled="!actions.detach"
      @click="emit('run', 'detach')"
    >
      <Unlink class="size-4" />
      Detach tip
    </Button>
    <slot />
    <Button
      v-if="!trunk"
      variant="outline"
      size="sm"
      data-test="flow-remove"
      :disabled="!actions.remove"
      @click="emit('run', 'remove')"
    >
      <Trash2 class="size-4" />
      Remove flow
    </Button>
  </div>
</template>
