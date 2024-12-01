<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NEquipmentData } from "@/types/internalModels";
import DotsMenu from "@/components/DotsMenu.vue";
import { useNotifications } from "@/composables/notifications";
import InputGroup from "@/components/InputGroup.vue";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();
const store = useScenarioInfoPanelStore();

const equipment = computed(() => {
  return Object.values(scn.store.state.equipmentMap);
});

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
  <div class="prose max-w-none dark:prose-invert">
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
    <form @submit.prevent="onSubmit">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="eq in equipment" :key="eq.id" @dblclick="startEdit(eq)">
            <template v-if="eq.id === editedId">
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
              <td>{{ eq.name }}</td>
              <td>{{ eq.description }}</td>
              <td class="not-prose w-6">
                <DotsMenu :items="itemActions" @action="onItemAction(eq, $event)" />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
</template>
