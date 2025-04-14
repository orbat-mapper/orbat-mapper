<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import EditToggleButton from "@/components/EditToggleButton.vue";
import ToggleField from "@/components/ToggleField.vue";
import PlainButton from "@/components/PlainButton.vue";

defineProps<{
  selectedCount?: number;
  editLabel?: string;
  hideEdit?: boolean;
  isLocked?: boolean;
}>();
const emit = defineEmits(["delete"]);
const editMode = defineModel<boolean>("editMode");
const addMode = defineModel<boolean>("addMode");
const includeSubordinates = defineModel<boolean>("includeSubordinates", {
  default: undefined,
});
let prevIncludeSubordinates: boolean | undefined;
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
      <EditToggleButton v-if="!hideEdit" v-model="editMode" :disabled="isLocked"
        >{{ editLabel ?? "Edit" }}
      </EditToggleButton>
      <PlainButton @click="addMode = !addMode" :disabled="isLocked">
        {{ addMode ? "Hide form" : "Add" }}
      </PlainButton>
    </div>
  </div>
</template>
