<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref, toRaw } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NPersonnelData, NSupplyCategory } from "@/types/internalModels";
import DotsMenu from "@/components/DotsMenu.vue";
import { useNotifications } from "@/composables/notifications";
import AddSypplyCategoryForm from "@/modules/scenarioeditor/AddSypplyCategoryForm.vue";
import { useToggle } from "@vueuse/core";

const { store, unitActions } = injectStrict(activeScenarioKey);
const [showAddSupplies, toggleAddSupplies] = useToggle(false);
const { send } = useNotifications();

const supplies = computed(() => {
  return Object.values(store.state.supplyCategoryMap);
});

const itemActions = [
  { label: "Edit", action: "edit" },
  { label: "Delete", action: "delete" },
];

const editedId = ref();
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

function onSubmit() {
  unitActions.updateSupplyCategory(editedId.value, form.value!);
  editedId.value = null;
}

function cancelEdit() {
  editedId.value = null;
}

function onItemAction(item: NSupplyCategory, action: string) {
  switch (action) {
    case "edit":
      startEdit(item);
      break;
    case "delete":
      const success = unitActions.deleteSupplyCategory(item.id);
      if (!success) {
        send({
          type: "error",
          message: "Cannot delete a supply category that is in use.",
        });
      }
      break;
  }
}

function onAddSubmit(formData: Omit<NSupplyCategory, "id">) {
  // check if name exists
  console.log("submit", formData);

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
</script>

<template>
  <div class="prose max-w-none dark:prose-invert">
    <TableHeader description="A list of supply categories available in this scenario.">
      <BaseButton @click="toggleAddSupplies()">
        {{ showAddSupplies ? "Hide form" : "Add" }}
      </BaseButton>
    </TableHeader>
    <AddSypplyCategoryForm
      v-if="showAddSupplies"
      v-model="addForm"
      @cancel="toggleAddSupplies()"
      @submit="onAddSubmit"
    />

    <form @submit.prevent="onSubmit">
      <table v-if="supplies.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Class</th>
            <th>Unit</th>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="supply in supplies"
            :key="supply.id"
            @dblclick="startEdit(supply)"
            class="cursor-pointer"
          >
            <template v-if="supply.id === editedId">
              <td>
                <input
                  type="text"
                  @vue:mounted="({ el }: any) => el.focus()"
                  v-model="form.name"
                  class="h-full w-full text-sm"
                  placeholder="Name"
                />
              </td>
              <td class="" colspan="3">
                <div class="flex">
                  <input
                    type="text"
                    v-model="form.description"
                    class="flex-auto text-sm"
                    placeholder="Description"
                  />
                  <BaseButton small type="submit" secondary class="ml-2">Save</BaseButton>
                  <BaseButton small class="ml-2" @click="cancelEdit()">Cancel</BaseButton>
                </div>
              </td>
            </template>
            <template v-else>
              <td>{{ supply.name }}</td>
              <td>{{ supply.description }}</td>
              <td title="">
                {{ store.state.supplyClassMap[supply.supplyClass ?? ""]?.name ?? "" }}
              </td>
              <td>
                {{ getUom(supply) }}
              </td>
              <td class="not-prose w-6">
                <DotsMenu :items="itemActions" @action="onItemAction(supply, $event)" />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
</template>
