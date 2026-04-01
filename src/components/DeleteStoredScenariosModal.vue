<script setup lang="ts">
import { computed } from "vue";

import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import type { ScenarioMetadata } from "@/scenariostore/localdb";

const props = defineProps<{
  scenarios: ScenarioMetadata[];
}>();
const emit = defineEmits(["confirm", "cancel"]);

const open = defineModel<boolean>({ default: false });

const visibleScenarios = computed(() => props.scenarios.slice(0, 10));
const hiddenScenarioCount = computed(() =>
  Math.max(props.scenarios.length - visibleScenarios.value.length, 0),
);

function onCancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Delete selected scenarios"
    @cancel="emit('cancel')"
  >
    <div class="space-y-4">
      <p class="text-sm">
        This will permanently delete {{ scenarios.length }} scenario{{
          scenarios.length === 1 ? "" : "s"
        }}
        from browser storage.
      </p>

      <ul class="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3 text-sm">
        <li v-for="scenario in visibleScenarios" :key="scenario.id" class="truncate">
          {{ scenario.name }}
        </li>
        <li v-if="hiddenScenarioCount > 0" class="text-muted-foreground">
          and {{ hiddenScenarioCount }} more
        </li>
      </ul>

      <div class="flex justify-end gap-2">
        <Button type="button" variant="secondary" @click="onCancel">Cancel</Button>
        <Button type="button" variant="destructive" @click="emit('confirm')"
          >Delete</Button
        >
      </div>
    </div>
  </NewSimpleModal>
</template>
