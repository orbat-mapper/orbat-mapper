<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import EditToggleButton from "@/components/EditToggleButton.vue";
import ToggleField from "@/components/ToggleField.vue";
import { watch } from "vue";

defineProps<{
  selectedCount?: number;
  editLabel?: string;
  hideEdit?: boolean;
}>();
const emit = defineEmits(["delete"]);
const editMode = defineModel<boolean>("editMode");
const addMode = defineModel<boolean>("addMode");
const includeSubordinates = defineModel<boolean>("includeSubordinates");
let prevIncludeSubordinates: boolean | undefined;

watch(editMode, (isEditMode) => {
  if (isEditMode) {
    prevIncludeSubordinates = includeSubordinates.value;
    includeSubordinates.value = false;
  } else {
    if (prevIncludeSubordinates !== undefined) {
      includeSubordinates.value = prevIncludeSubordinates;
    }
  }
});
</script>
<template>
  <div class="my-4 flex items-center justify-between gap-2">
    <div>
      <BaseButton v-if="selectedCount" small @click="emit('delete')">
        Delete ({{ selectedCount }})
      </BaseButton>
      <ToggleField
        v-else-if="includeSubordinates !== undefined"
        v-model="includeSubordinates"
        :disabled="editMode"
        >Include subordinates
      </ToggleField>
    </div>
    <div class="flex items-center gap-2">
      <EditToggleButton v-if="!hideEdit" v-model="editMode"
        >{{ editLabel ?? "Edit" }}
      </EditToggleButton>
      <BaseButton @click="addMode = !addMode">
        {{ addMode ? "Hide form" : "Add" }}
      </BaseButton>
    </div>
  </div>
</template>
