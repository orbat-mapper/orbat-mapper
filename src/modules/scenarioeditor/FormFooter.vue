<script setup lang="ts">
import ToggleField from "@/components/ToggleField.vue";
import { useUiStore } from "@/stores/uiStore";
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
    <div class="flex items-center gap-x-6">
      <button
        type="button"
        class="text-sm/6 font-semibold text-slate-900 dark:text-slate-200"
        @click="emit('cancel')"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="submit"
        class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>
