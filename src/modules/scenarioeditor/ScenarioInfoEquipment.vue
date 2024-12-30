<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NEquipmentData } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import InputGroup from "@/components/InputGroup.vue";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import { ColumnDef } from "@tanstack/vue-table";
import { useTestStore2 } from "@/stores/tableStores";
import { storeToRefs } from "pinia";
import { useWidthStore } from "@/stores/uiStore";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();
const store = useScenarioInfoPanelStore();
const tableStore = useTestStore2();
const selected = ref<NEquipmentData[]>([]);
const equipment = computed(() => {
  return Object.values(scn.store.state.equipmentMap);
});

const { orbatPanelWidth } = storeToRefs(useWidthStore());

const columns: ColumnDef<NEquipmentData>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    size: 100,
  },
];

const itemActions = [
  { label: "Edit", action: "edit" },
  { label: "Delete", action: "delete" },
];

const editedId = ref();
const form = ref<Omit<NEquipmentData, "id">>({ name: "", description: "" });
const addForm = ref<Omit<NEquipmentData, "id">>({ name: "", description: "" });

function startEdit(data: NEquipmentData) {
  editedId.value = data.id;
  const { id, ...rest } = data;
  form.value = rest;
}

function onSubmit() {
  scn.unitActions.updateEquipment(editedId.value, form.value!);
  editedId.value = null;
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit() {
  // check if name exists
  if (equipment.value.find((e) => e.name === addForm.value.name)) {
    send({
      type: "error",
      message: "Equipment with this name already exists.",
    });
    return;
  }
  scn.unitActions.addEquipment({ ...addForm.value });
  addForm.value = { name: "", description: "" };
}

function onItemAction(item: NEquipmentData, action: string) {
  switch (action) {
    case "edit":
      startEdit(item);
      break;
    case "delete":
      const success = scn.unitActions.deleteEquipment(item.id);
      if (!success) {
        send({
          type: "error",
          message: "Cannot delete equipment that is in use.",
        });
      }
      break;
  }
}
</script>

<template>
  <div class="">
    <TableHeader description="A list of equipment that is available in this scenario.">
      <BaseButton @click="store.toggleAddEquipment()">
        {{ store.showAddEquipment ? "Hide form" : "Add" }}
      </BaseButton>
    </TableHeader>
    <form
      v-if="store.showAddEquipment"
      @submit.prevent="onAddSubmit"
      class="not-prose grid grid-cols-3 gap-2"
    >
      <InputGroup autofocus label="Name" required v-model="addForm.name" />
      <div class="col-span-2 flex items-start gap-3">
        <InputGroup class="" label="Description" v-model="addForm.description" />
        <BaseButton type="submit" small primary class="self-center">+Add</BaseButton>
      </div>
    </form>

    <ToeGrid
      :columns="columns"
      :data="equipment"
      class="mt-4"
      v-model:selected="selected"
      :table-store="tableStore"
      select
      v-model:editedId="editedId"
    >
      <template #inline-form="{ row }">
        <form @submit.prevent="onSubmit" class="" @keyup.esc.stop="cancelEdit()">
          <div class="sticky left-0 p-4" :style="{ maxWidth: orbatPanelWidth + 'px' }">
            <InputGroup autofocus label="Name" />
            <BaseButton type="submit" small primary class="self-center">Save</BaseButton>
          </div>
          {{ row }}
        </form>
      </template>
    </ToeGrid>
    {{ editedId }}
  </div>
</template>
