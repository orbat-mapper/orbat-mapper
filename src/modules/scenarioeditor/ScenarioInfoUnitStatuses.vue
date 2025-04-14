<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import type { NEquipmentData, NUnitStatus } from "@/types/internalModels";
import DotsMenu from "@/components/DotsMenu.vue";
import { useNotifications } from "@/composables/notifications";
import InputGroup from "@/components/InputGroup.vue";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import { Button } from "@/components/ui/button";

const scn = injectStrict(activeScenarioKey);
const { send } = useNotifications();
const store = useScenarioInfoPanelStore();

const statuses = computed(() => {
  return Object.values(scn.store.state.unitStatusMap);
});

const itemActions = [
  { label: "Edit", action: "edit" },
  { label: "Delete", action: "delete" },
];

const editedId = ref();
const form = ref<Omit<NUnitStatus, "id">>({ name: "", description: "" });
const addForm = ref<Omit<NUnitStatus, "id">>({ name: "", description: "" });

function startEdit(data: NUnitStatus) {
  editedId.value = data.id;
  const { id, ...rest } = data;
  form.value = rest;
}

function onSubmit() {
  scn.unitActions.updateUnitStatus(editedId.value, form.value!);
  editedId.value = null;
}

function cancelEdit() {
  editedId.value = null;
}

function onAddSubmit() {
  // check if name exists
  if (statuses.value.find((e) => e.name === addForm.value.name)) {
    send({
      type: "error",
      message: "Unit status with this name already exists.",
    });
    return;
  }
  scn.unitActions.addUnitStatus({ ...addForm.value });
  addForm.value = { name: "", description: "" };
}

function onItemAction(item: NEquipmentData, action: string) {
  switch (action) {
    case "edit":
      startEdit(item);
      break;
    case "delete":
      const success = scn.unitActions.deleteUnitStatus(item.id);
      if (!success) {
        send({
          type: "error",
          message: "Cannot delete unit status that is in use.",
        });
      }
      break;
  }
}
</script>

<template>
  <div class="prose dark:prose-invert max-w-none">
    <TableHeader description="A list of unit statues is available in this scenario.">
      <Button variant="outline" @click="store.toggleAddEquipment()">
        {{ store.showAddEquipment ? "Hide form" : "Add" }}
      </Button>
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
          <tr v-for="status in statuses" :key="status.id" @dblclick="startEdit(status)">
            <template v-if="status.id === editedId">
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
              <td>{{ status.name }}</td>
              <td>{{ status.description }}</td>
              <td class="not-prose w-6">
                <DotsMenu :items="itemActions" @action="onItemAction(status, $event)" />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
</template>
