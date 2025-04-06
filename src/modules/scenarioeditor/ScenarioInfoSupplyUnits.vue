<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, triggerRef } from "vue";
import TableHeader from "@/components/TableHeader.vue";
import type { NPersonnelData, NSupplyUoM } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import type { ColumnDef } from "@tanstack/vue-table";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import { useSupplyUoMTableStore } from "@/stores/tableStores";
import { useToeEditableItems } from "@/composables/toeUtils";
import AddSupplyUoMForm from "@/modules/scenarioeditor/AddSupplyUoMForm.vue";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const { editMode, editedId, showAddForm, rerender, selectedItems } =
  useToeEditableItems<NSupplyUoM>();
const tableStore = useSupplyUoMTableStore();

const supplyUnits = computed(() => {
  scn.store.state.settingsStateCounter && rerender.value;
  return Object.values(scn.store.state.supplyUomMap);
});

const columns: ColumnDef<NSupplyUoM>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 100 },
  { id: "code", header: "Abbrev.", accessorKey: "code", size: 80 },
  { id: "type", header: "Type", accessorKey: "type", size: 100 },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    size: 100,
  },
];

const addForm = ref<Omit<NSupplyUoM, "id">>({
  name: "",
  code: "",
  description: "",
  type: "",
});

function onSubmit(e: NPersonnelData) {
  const { id, ...rest } = e;
  scn.unitActions.updateSupplyUom(id, rest);
  editedId.value = null;
  triggerRef(rerender);
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit(formData: Omit<NSupplyUoM, "id">) {
  // check if name exists
  if (supplyUnits.value.find((e) => e.name === formData.name)) {
    send({
      type: "error",
      message: "Unit of measure/issue with this name already exists.",
    });
    return;
  }
  scn.unitActions.addSupplyUom({ ...formData });
  addForm.value = { ...addForm.value, name: "", code: "", description: "" };
}

function onDelete() {
  const notDeletedItems: NSupplyUoM[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.unitActions.deleteSupplyUom(e.id);
      if (!success) {
        send({
          type: "error",
          message: `${e.name}: Cannot delete an item that is in use.`,
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
      description="A list of unit of measures/issues available in this scenario."
    />
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit UoM/UI"
      :selected-count="selectedItems.length"
      :hideEdit="supplyUnits.length === 0"
      @delete="onDelete()"
    />
    <AddSupplyUoMForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
      heading="Add new unit of measure/issue"
    />
    <ToeGrid
      v-if="supplyUnits.length"
      :columns="columns"
      :data="supplyUnits"
      v-model:editedId="editedId"
      :select="editMode"
      v-model:selected="selectedItems"
      v-model:editMode="editMode"
      :tableStore="tableStore"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6">
          <AddSupplyUoMForm
            :model-value="row"
            @submit="onSubmit($event as NPersonnelData)"
            @cancel="cancelEdit()"
            heading="Edit unit of measure/issue"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add a new unit of measure/issue to this scenario.
    </p>
  </div>
</template>
