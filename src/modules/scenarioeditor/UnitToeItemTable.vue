<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { sortBy } from "@/utils";
import { useToggle, useVModel } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import {
  EUnitEquipment,
  EUnitPersonnel,
  NEquipmentData,
  NPersonnelData,
} from "@/types/internalModels";
import SimpleSelect from "@/components/SimpleSelect.vue";
import BaseButton from "@/components/BaseButton.vue";
import InputGroup from "@/components/InputGroup.vue";

interface Props {
  items: EUnitEquipment[] | EUnitPersonnel[];
  values: NEquipmentData[] | NPersonnelData[];
  isMultiMode?: boolean;
  showAdd?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(["delete", "update", "update:showAdd"]);

const doShowAdd = useVModel(props, "showAdd", emit);
const sortKey = ref<"name" | "count">("name");
const [sortAscending, toggleAscending] = useToggle(true);

const editedId = ref();
const form = ref({
  id: "",
  count: -1,
});

const addForm = ref({
  id: "",
  count: 1,
});

const itemActions = computed(() => [
  { label: "Edit", action: "edit", disabled: props.isMultiMode },
  { label: "Delete", action: "delete" },
]);

const sortedItems = computed(() =>
  sortBy(props.items, sortKey.value, sortAscending.value),
);

const usedItems = computed(() => props.items.map((i) => i.id));

const valueItems = computed(() =>
  props.values
    .filter((v) => !usedItems.value.includes(v.id))
    .map((v) => ({
      label: v.name,
      value: v.id,
    })),
);

function toggleSort(column: "name" | "count") {
  if (sortKey.value === column) {
    toggleAscending();
  } else {
    sortKey.value = column;
  }
}

function startEdit(data: EUnitEquipment | EUnitPersonnel) {
  editedId.value = data.id;
  const { id, ...rest } = data;
  form.value = { id: data.id, count: data.count };
}

function cancelEdit() {
  editedId.value = null;
}

function onSubmit() {
  emit("update", form.value.id, form.value.count);
  editedId.value = null;
}

function onItemAction(item: EUnitEquipment | EUnitPersonnel, action: string) {
  switch (action) {
    case "edit":
      startEdit(item);
      break;
    case "delete":
      emit("delete", item.id);
      break;
  }
}

function resetAddForm() {
  addForm.value = {
    id: valueItems.value[0]?.value,
    count: 1,
  };
}

function onAddItemSubmit() {
  emit("update", addForm.value.id, addForm.value.count);
  nextTick(() => resetAddForm());
}

resetAddForm();
</script>

<template>
  <form
    v-if="doShowAdd && valueItems.length"
    @submit.prevent="onAddItemSubmit"
    class="flex w-full items-center gap-x-2 pb-4"
  >
    <div class="flex-auto">
      <SimpleSelect :items="valueItems" v-model="addForm.id" />
    </div>
    <div class="w-24">
      <InputGroup type="number" min="0" v-model.number="addForm.count" class="" />
    </div>
    <BaseButton small type="submit" primary class="ml-2 flex-shrink-0">Add</BaseButton>
  </form>
  <p v-else-if="doShowAdd">No new item available</p>
  <form @submit.prevent="onSubmit">
    <table class="-mx-2 mt-2" v-if="items.length">
      <thead>
        <tr class="cursor-pointer">
          <th class="pl-2" @click="toggleSort('name')">
            Name
            <span v-if="sortKey === 'name'">{{
              sortAscending ? "&darr;" : "&uarr;"
            }}</span>
          </th>
          <th class="pr-8 text-right" @click="toggleSort('count')">
            Qty.
            <span v-if="sortKey === 'count'">{{
              sortAscending ? "&darr;" : "&uarr;"
            }}</span>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedItems" :key="item.id" @dblclick="startEdit(item)">
          <template v-if="editedId === item.id">
            <td class="pl-2" :title="item.description">{{ item.name }}</td>
            <td colspan="2">
              <div class="flex items-center justify-end">
                <input
                  type="number"
                  min="0"
                  class="w-24"
                  v-model="form.count"
                  @vue:mounted="({ el }: any) => el.focus()"
                />
                <BaseButton small type="submit" secondary class="ml-2">Save</BaseButton>
                <BaseButton small class="ml-2" @click="cancelEdit()">Cancel</BaseButton>
              </div>
            </td>
          </template>
          <template v-else>
            <td class="pl-2" :title="item.description">{{ item.name }}</td>
            <td class="pr-6 text-right tabular-nums">{{ item.count }}</td>
            <td class="not-prose w-6">
              <DotsMenu :items="itemActions" @action="onItemAction(item, $event)" />
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </form>
</template>
