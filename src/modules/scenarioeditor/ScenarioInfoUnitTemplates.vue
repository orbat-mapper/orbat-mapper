<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, triggerRef } from "vue";
import TableHeader from "@/components/TableHeader.vue";
import { NEquipmentData } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import { ColumnDef } from "@tanstack/vue-table";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import AddNameDescriptionForm from "@/modules/scenarioeditor/AddNameDescriptionForm.vue";
import { useEquipmentTableStore } from "@/stores/tableStores";
import { useToeEditableItems } from "@/composables/toeUtils";
import { useUiStore } from "@/stores/uiStore";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const { editMode, editedId, showAddForm, rerender, selectedItems } =
  useToeEditableItems<NEquipmentData>();

const tableStore = useEquipmentTableStore();
const uiStore = useUiStore();

const equipment = computed(() => {
  scn.store.state.settingsStateCounter && rerender.value;
  return Object.values(scn.store.state.equipmentMap);
});

const columns: ColumnDef<NEquipmentData>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  { id: "description", header: "Description", accessorKey: "description" },
];

const addForm = ref<Omit<NEquipmentData, "id">>({ name: "", description: "" });

function onSubmit(e: NEquipmentData) {
  const { id, ...rest } = e;
  scn.unitActions.updateEquipment(id, rest);
  if (uiStore.goToNextOnSubmit) {
    const currentIndex = equipment.value.findIndex((sc) => sc.id === id);
    if (currentIndex < equipment.value.length - 1) {
      editedId.value = equipment.value[currentIndex + 1].id;
    } else {
      editedId.value = null;
    }
  } else {
    editedId.value = null;
  }

  triggerRef(rerender);
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit(formData: Omit<NEquipmentData, "id">) {
  // check if name exists
  if (equipment.value.find((e) => e.name === formData.name)) {
    send({
      type: "error",
      message: "Equipment category with this name already exists.",
    });
    return;
  }
  scn.unitActions.addEquipment({ ...formData });
  addForm.value = { name: "", description: "" };
}

function onDelete() {
  const notDeletedItems: NEquipmentData[] = [];
  scn.store.groupUpdate(() => {
    selectedItems.value.forEach((e) => {
      const success = scn.unitActions.deleteEquipment(e.id);
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
      editLabel="Edit equipment"
      :selected-count="selectedItems.length"
      :hideEdit="equipment.length === 0"
      @delete="onDelete()"
    />
    <AddNameDescriptionForm
      v-if="showAddForm"
      v-model="addForm"
      @cancel="showAddForm = false"
      @submit="onAddSubmit"
    />
    <ToeGrid
      v-if="equipment.length"
      :columns="columns"
      :data="equipment"
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
            @submit="onSubmit($event as NEquipmentData)"
            @cancel="cancelEdit()"
            heading="Edit supply class"
            showNextToggle
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
    <p v-else class="prose prose-sm dark:prose-invert">
      Use the <kbd>Add</kbd> button to add equipment categories to this scenario.
    </p>
  </div>
</template>
