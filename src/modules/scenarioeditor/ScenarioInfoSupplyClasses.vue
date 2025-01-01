<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, triggerRef } from "vue";
import TableHeader from "@/components/TableHeader.vue";
import { NSupplyCategory, NSupplyClass } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import { ColumnDef } from "@tanstack/vue-table";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import AddNameDescriptionForm from "@/modules/scenarioeditor/AddNameDescriptionForm.vue";
import { useSupplyClassTableStore } from "@/stores/tableStores";
import { useToeEditableItems } from "@/composables/toeUtils";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const { editMode, editedId, showAddForm, rerender, selectedItems } =
  useToeEditableItems<NSupplyClass>();
const tableStore = useSupplyClassTableStore();

const supplyClasses = computed(() => {
  rerender.value;
  return Object.values(scn.store.state.supplyClassMap);
});

const columns: ColumnDef<NSupplyClass>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "description", header: "Description", accessorKey: "description" },
];

const addForm = ref<Omit<NSupplyClass, "id">>({ name: "", description: "" });

function onSubmit(e: NSupplyClass) {
  const { id, ...rest } = e;
  scn.unitActions.updateSupplyClass(id, rest);
  editedId.value = null;
  triggerRef(rerender);
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit(formData: Omit<NSupplyClass, "id">) {
  // check if name exists
  if (supplyClasses.value.find((e) => e.name === formData.name)) {
    send({
      type: "error",
      message: "Supply class with this name already exists.",
    });
    return;
  }
  scn.unitActions.addSupplyClass({ ...formData });
  addForm.value = { name: "", description: "" };
}

function onDelete() {
  const notDeletedItems: NSupplyCategory[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.unitActions.deleteSupplyClass(e.id);
      if (!success) {
        send({
          type: "error",
          message: `${e.name}: Cannot delete a supply category that is in use.`,
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
    <TableHeader description="A list of supplyClasses is available in this scenario." />
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit supply classes"
      :selected-count="selectedItems.length"
      :hideEdit="supplyClasses.length === 0"
      @delete="onDelete()"
    />
    <AddNameDescriptionForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
    />
    <ToeGrid
      v-if="supplyClasses.length"
      :columns="columns"
      :data="supplyClasses"
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
            @submit="onSubmit($event as NSupplyClass)"
            @cancel="cancelEdit()"
            heading="Edit supply class"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add supply classes to this scenario.
    </p>
  </div>
</template>
