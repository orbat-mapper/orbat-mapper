<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, triggerRef } from "vue";
import TableHeader from "@/components/TableHeader.vue";
import { NPersonnelData } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import { ColumnDef } from "@tanstack/vue-table";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import AddNameDescriptionForm from "@/modules/scenarioeditor/AddNameDescriptionForm.vue";
import { usePersonnelTableStore } from "@/stores/tableStores";
import { useToeEditableItems } from "@/composables/toeUtils";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const { editMode, editedId, showAddForm, rerender, selectedItems } =
  useToeEditableItems<NPersonnelData>();
const tableStore = usePersonnelTableStore();

const personnel = computed(() => {
  rerender.value;
  return Object.values(scn.store.state.personnelMap);
});

const columns: ColumnDef<NPersonnelData>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  { id: "description", header: "Description", accessorKey: "description" },
];

const addForm = ref<Omit<NPersonnelData, "id">>({ name: "", description: "" });

function onSubmit(e: NPersonnelData) {
  const { id, ...rest } = e;
  scn.unitActions.updatePersonnel(id, rest);
  editedId.value = null;
  triggerRef(rerender);
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit(formData: Omit<NPersonnelData, "id">) {
  // check if name exists
  if (personnel.value.find((e) => e.name === formData.name)) {
    send({
      type: "error",
      message: "Personnel category with this name already exists.",
    });
    return;
  }
  scn.unitActions.addPersonnel({ ...formData });
  addForm.value = { name: "", description: "" };
}

function onDelete() {
  const notDeletedItems: NPersonnelData[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.unitActions.deletePersonnel(e.id);
      if (!success) {
        send({
          type: "error",
          message: `${e.name}: Cannot delete an equipment category that is in use.`,
        });
        notDeletedItems.push(e);
      }
    });
  });
  triggerRef(editMode);
  selectedItems.value = notDeletedItems;
}
</script>

<template>
  <div class="">
    <TableHeader
      description="A list of equipment categories available in this scenario."
    />
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit personnel"
      :selected-count="selectedItems.length"
      :hideEdit="personnel.length === 0"
      @delete="onDelete()"
    />
    <AddNameDescriptionForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
      heading="Add new personnel category"
    />
    <ToeGrid
      v-if="personnel.length"
      :columns="columns"
      :data="personnel"
      v-model:editedId="editedId"
      :select="editMode"
      v-model:selected="selectedItems"
      v-model:editMode="editMode"
      :tableStore="tableStore"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6">
          <AddNameDescriptionForm
            :model-value="row"
            @submit="onSubmit($event as NPersonnelData)"
            @cancel="cancelEdit()"
            heading="Edit personnel category"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add equipment categories to this scenario.
    </p>
  </div>
</template>
