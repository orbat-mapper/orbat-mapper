<script setup lang="ts">
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{
  save: [];
  discard: [];
  cancel: [];
}>();
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Unsaved changes"
    @cancel="emit('cancel')"
    class="sm:max-w-lg"
  >
    <div class="space-y-4">
      <p class="text-sm">
        This scenario has unsaved changes. Save the scenario before leaving, discard the
        changes, or stay on this page.
      </p>

      <div class="flex justify-end gap-2">
        <Button type="button" variant="secondary" @click="emit('cancel')">Cancel</Button>
        <Button type="button" variant="outline" @click="emit('discard')">Discard</Button>
        <Button type="button" @click="emit('save')">Save</Button>
      </div>
    </div>
  </NewSimpleModal>
</template>
