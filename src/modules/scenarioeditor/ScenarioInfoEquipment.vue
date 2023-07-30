<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NEquipmentData } from "@/types/internalModels";
import DotsMenu from "@/components/DotsMenu.vue";
import { useNotifications } from "@/composables/notifications";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();

const equipment = computed(() => {
  return Object.values(scn.store.state.equipmentMap);
});

const itemActions = [
  { label: "Edit", action: "edit" },
  { label: "Delete", action: "delete" },
];

const editedId = ref();
const form = ref<Omit<NEquipmentData, "id">>({ name: "", description: "" });

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

function add() {
  scn.unitActions.addEquipment({
    name: "New Equipment",
    description: "",
  });
  startEdit(equipment.value[equipment.value.length - 1]);
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
  <div class="prose max-w-none">
    <TableHeader
      title="Equipment"
      description="A list of equipment that is available in this scenario."
      ><BaseButton @click="add()" primary>Add</BaseButton></TableHeader
    >
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
          <tr
            v-for="eq in equipment"
            :key="eq.id"
            @dblclick="startEdit(eq)"
            class="cursor-pointer"
          >
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
      <input type="submit" class="hidden" />
    </form>
  </div>
</template>
