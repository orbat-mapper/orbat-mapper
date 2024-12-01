<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import { NPersonnelData } from "@/types/internalModels";
import DotsMenu from "@/components/DotsMenu.vue";
import { useNotifications } from "@/composables/notifications";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import InputGroup from "@/components/InputGroup.vue";

const scn = injectStrict(activeScenarioKey);
const store = useScenarioInfoPanelStore();
const { send } = useNotifications();

const personnel = computed(() => {
  return Object.values(scn.store.state.personnelMap);
});

const itemActions = [
  { label: "Edit", action: "edit" },
  { label: "Delete", action: "delete" },
];

const editedId = ref();
const form = ref<Omit<NPersonnelData, "id">>({ name: "", description: "" });
const addForm = ref<Omit<NPersonnelData, "id">>({ name: "", description: "" });

function startEdit(data: NPersonnelData) {
  editedId.value = data.id;
  const { id, ...rest } = data;
  form.value = rest;
}

function onSubmit() {
  scn.unitActions.updatePersonnel(editedId.value, form.value!);
  editedId.value = null;
}

function cancelEdit() {
  editedId.value = null;
}

function onItemAction(item: NPersonnelData, action: string) {
  switch (action) {
    case "edit":
      startEdit(item);
      break;
    case "delete":
      const success = scn.unitActions.deletePersonnel(item.id);
      if (!success) {
        send({
          type: "error",
          message: "Cannot delete a personnel category that is in use.",
        });
      }
      break;
  }
}

function onAddSubmit() {
  // check if name exists
  if (personnel.value.find((e) => e.name === addForm.value.name)) {
    send({
      type: "error",
      message: "Personnel category with this name already exists.",
    });
    return;
  }
  scn.unitActions.addPersonnel({ ...addForm.value });
  addForm.value = { name: "", description: "" };
}
</script>

<template>
  <div class="prose max-w-none dark:prose-invert">
    <TableHeader description="A list of personnel categories available in this scenario.">
      <BaseButton @click="store.toggleAddPersonnel()">
        {{ store.showAddPersonnel ? "Hide form" : "Add" }}
      </BaseButton>
    </TableHeader>
    <form
      v-if="store.showAddPersonnel"
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
          <tr
            v-for="eq in personnel"
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
    </form>
  </div>
</template>
