<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, triggerRef } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NPersonnelData, NSupplyCategory } from "@/types/internalModels";
import { useNotifications } from "@/composables/notifications";
import AddSypplyCategoryForm from "@/modules/scenarioeditor/AddSypplyCategoryForm.vue";
import { useToggle } from "@vueuse/core";
import { ColumnDef } from "@tanstack/vue-table";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import { useSupplyCategoryTableStore } from "@/stores/tableStores";
import SecondaryButton from "@/components/SecondaryButton.vue";

const { store, unitActions } = injectStrict(activeScenarioKey);
const [showAddSupplies, toggleAddSupplies] = useToggle(false);
const { send } = useNotifications();

const rerender = ref(true);
const tableStore = useSupplyCategoryTableStore();

const supplies = computed(() => {
  rerender.value;
  return Object.values(store.state.supplyCategoryMap);
});

const selectedSupplies = ref<NSupplyCategory[]>([]);

const columns: ColumnDef<NSupplyCategory>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 200 },
  { id: "class", header: "Class", accessorFn: (f) => getSupplyClass(f) },
  { id: "unit", header: "Unit", accessorFn: (f) => getUom(f), size: 80 },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    size: 100,
  },
];

const editMode = ref(false);

const editedId = ref<string | null>(null);
const form = ref<Omit<NPersonnelData, "id">>({ name: "", description: "" });
const addForm = ref<Omit<NSupplyCategory, "id">>({
  name: "",
  description: "",
  supplyClass: "",
  uom: "",
});

function startEdit(data: NPersonnelData) {
  editedId.value = data.id;
  const { id, ...rest } = data;
  form.value = rest;
}

function onSubmit(e: NSupplyCategory) {
  const { id, ...rest } = e;
  unitActions.updateSupplyCategory(id, rest);
  editedId.value = null;
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
  unitActions.addSupplyCategory({ ...addForm.value });
  addForm.value = { ...formData, name: "", description: "" };
}

function getUom(supply: NSupplyCategory) {
  const uomId = supply.uom ?? "";
  if (!uomId) return "";
  const uom = store.state.supplyUomMap[uomId];
  return uom?.code ?? uom?.name ?? "";
}

function getSupplyClass(supply: NSupplyCategory) {
  const classId = supply.supplyClass ?? "";
  if (!classId) return "";
  const supplyClass = store.state.supplyClassMap[classId];
  return supplyClass?.name ?? "";
}
</script>

<template>
  <div class="">
    <TableHeader description="A list of supply categories available in this scenario.">
    </TableHeader>
    <div class="my-4 flex items-center justify-between gap-2">
      <div>
        <BaseButton v-if="selectedSupplies.length" small @click="onDelete()"
          >Delete ({{ selectedSupplies.length }})</BaseButton
        >
      </div>
      <div class="flex items-center gap-2">
        <SecondaryButton @click="editMode = !editMode"
          ><span v-if="editMode">Done editing</span
          ><span v-else>Edit</span></SecondaryButton
        >
        <BaseButton @click="toggleAddSupplies()">
          {{ showAddSupplies ? "Hide form" : "Add" }}
        </BaseButton>
      </div>
    </div>

    <AddSypplyCategoryForm
      v-if="showAddSupplies"
      v-model="addForm"
      @cancel="toggleAddSupplies()"
      @submit="onAddSubmit"
      heading="Edit supply category"
    />

    <ToeGrid
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
          <AddSypplyCategoryForm
            :model-value="row"
            @submit="onSubmit($event as NSupplyCategory)"
            @cancel="cancelEdit()"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
  </div>
</template>
