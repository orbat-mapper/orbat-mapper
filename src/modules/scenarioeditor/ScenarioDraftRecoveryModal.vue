<script setup lang="ts">
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{
  restoreDraft: [];
  openSaved: [];
  cancel: [];
}>();
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Recover draft"
    @cancel="emit('cancel')"
    class="sm:max-w-lg"
  >
    <div class="space-y-4">
      <p class="text-sm">
        A newer recovery draft is available for this scenario. You can restore the draft
        or continue with the last saved version.
      </p>

      <div class="flex justify-end gap-2">
        <Button type="button" variant="secondary" @click="emit('cancel')">Cancel</Button>
        <Button type="button" variant="outline" @click="emit('openSaved')">
          Open saved version
        </Button>
        <Button type="button" @click="emit('restoreDraft')">Restore draft</Button>
      </div>
    </div>
  </NewSimpleModal>
</template>
