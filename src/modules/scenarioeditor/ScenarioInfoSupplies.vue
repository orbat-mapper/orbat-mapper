<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, triggerRef } from "vue";
import TableHeader from "@/components/TableHeader.vue";
import { NSupplyCategory } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import AddSupplyCategoryForm from "@/modules/scenarioeditor/AddSupplyCategoryForm.vue";
import { ColumnDef } from "@tanstack/vue-table";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import { useSupplyCategoryTableStore } from "@/stores/tableStores";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import { useToeEditableItems } from "@/composables/toeUtils";
import { useUiStore } from "@/stores/uiStore";
import { getSupplyClass, getUom } from "@/scenariostore/supplyManipulations";

const { store, unitActions } = injectStrict(activeScenarioKey);

const { send } = useNotifications();

const {
  editMode,
  editedId,
  showAddForm,
  rerender,
  selectedItems: selectedSupplies,
} = useToeEditableItems<NSupplyCategory>();

const tableStore = useSupplyCategoryTableStore();
const uiStore = useUiStore();

const supplies = computed(() => {
  store.state.settingsStateCounter && rerender.value;
  return Object.values(store.state.supplyCategoryMap);
});

const columns: ColumnDef<NSupplyCategory>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  { id: "class", header: "Class", accessorFn: (f) => getSupplyClass(f, store.state) },
  { id: "unit", header: "Unit", accessorFn: (f) => getUom(f, store.state), size: 80 },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    size: 100,
  },
];

const addForm = ref<Omit<NSupplyCategory, "id">>({
  name: "",
  description: "",
  supplyClass: "",
  uom: "",
});

function onSubmit(e: NSupplyCategory) {
  const { id, ...rest } = e;
  unitActions.updateSupplyCategory(id, rest);
  if (uiStore.goToNextOnSubmit) {
    const currentIndex = supplies.value.findIndex((sc) => sc.id === id);
    if (currentIndex < supplies.value.length - 1) {
      editedId.value = supplies.value[currentIndex + 1].id;
    } else {
      editedId.value = null;
    }
  } else {
    editedId.value = null;
  }
  triggerRef(rerender);
}

function onDelete() {
  const notDeletedItems: NSupplyCategory[] = [];
  store.groupUpdate(() => {
    selectedSupplies.value.forEach((e) => {
      const success = unitActions.deleteSupplyCategory(e.id);
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
  selectedSupplies.value = notDeletedItems;
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit(formData: Omit<NSupplyCategory, "id">) {
  // check if name exists
  if (supplies.value.find((e) => e.name === formData.name)) {
    send({
      type: "error",
      message: "Supply category with this name already exists.",
    });
    return;
  }
  unitActions.addSupplyCategory({ ...formData });
  addForm.value = { ...formData, name: "", description: "" };
}
</script>

<template>
  <div class="">
    <TableHeader description="A list of supply categories available in this scenario.">
    </TableHeader>
    <ToeGridHeader
      v-model:editMode="editMode"
      v-model:addMode="showAddForm"
      editLabel="Edit supply categories"
      :selectedCount="selectedSupplies.length"
      :hideEdit="supplies.length === 0"
      @delete="onDelete()"
    />

    <AddSupplyCategoryForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
    />

    <ToeGrid
      v-if="supplies.length"
      :columns="columns"
      :data="supplies"
      v-model:editedId="editedId"
      :tableStore="tableStore"
      :select="editMode"
      v-model:selected="selectedSupplies"
      v-model:editMode="editMode"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6">
          <AddSupplyCategoryForm
            :model-value="row"
            @submit="onSubmit($event as NSupplyCategory)"
            @cancel="cancelEdit()"
            heading="Edit supply category"
            showNextToggle
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add supply categories to this scenario.
    </p>
  </div>
</template>
