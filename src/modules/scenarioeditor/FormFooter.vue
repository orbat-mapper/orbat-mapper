<script setup lang="ts">
import ToggleField from "@/components/ToggleField.vue";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
withDefaults(
  defineProps<{ showNextToggle?: boolean; submitLabel?: string; cancelLabel?: string }>(),
  {
    submitLabel: "Save",
    cancelLabel: "Cancel",
  },
);
const emit = defineEmits(["cancel"]);
const uiStore = useUiStore();
</script>

<template>
  <div class="mt-6 flex items-center justify-between gap-x-6">
    <div>
      <ToggleField v-if="showNextToggle" v-model="uiStore.goToNextOnSubmit">
        Go to next on save
      </ToggleField>
    </div>
    <div class="flex items-center gap-x-2">
      <Button variant="link" @click="emit('cancel')">
        {{ cancelLabel }}
      </Button>
      <Button type="submit">
        {{ submitLabel }}
      </Button>
    </div>
  </div>
</template>
