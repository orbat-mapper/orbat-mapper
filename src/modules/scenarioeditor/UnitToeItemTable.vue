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
import InlineRadioGroup from "@/components/InlineRadioGroup.vue";
import { useToeEditStore } from "@/stores/toeStore";
import { storeToRefs } from "pinia";
import UnitToeItemTableMenu from "@/modules/scenarioeditor/UnitToeItemTableMenu.vue";

interface Props {
  items: EUnitEquipment[] | EUnitPersonnel[];
  values: NEquipmentData[] | NPersonnelData[];
  isMultiMode?: boolean;
  isLocked?: boolean;
  showAdd?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(["delete", "update", "update:showAdd"]);

const doShowAdd = useVModel(props, "showAdd", emit);
const sortKey = ref<"name" | "count">("name");
const [sortAscending, toggleAscending] = useToggle(true);
const { isToeEditMode, toeEditMode, showAssigned, showOnHand, showPercentage } =
  storeToRefs(useToeEditStore());

const editedId = ref();

const form = ref<{ id: string; count: number; onHand?: number }>({
  id: "",
  count: -1,
});

const addForm = ref({
  id: "",
  count: 1,
});

const itemActions = computed(() => [
  { label: "Edit", action: "edit", disabled: props.isMultiMode || props.isLocked },
  { label: "Delete", action: "delete", disabled: props.isLocked },
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
  if (!isToeEditMode.value) return;
  editedId.value = data.id;
  const { id, ...rest } = data;
  form.value = {
    id: data.id,
    count: toeEditMode.value === "assigned" ? data.count : (data.onHand ?? data.count),
  };
}

function cancelEdit() {
  editedId.value = null;
}

function onSubmit() {
  if (toeEditMode.value === "onHand") {
    emit("update", form.value.id, { onHand: form.value.count });
  } else {
    emit("update", form.value.id, { count: form.value.count });
  }
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
  emit("update", addForm.value.id, { count: addForm.value.count });
  nextTick(() => resetAddForm());
}

function asPercent(item: EUnitEquipment | EUnitPersonnel) {
  return Math.floor(((item.onHand ?? 1) / item.count) * 100) + "%";
}

resetAddForm();
</script>

<template>
  <form
    v-if="isToeEditMode && doShowAdd && valueItems.length"
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
          <th
            v-if="showAssigned"
            class="whitespace-nowrap pr-4 text-right"
            @click="toggleSort('count')"
            title="Assigned"
          >
            Assigned
            <span v-if="sortKey === 'count'">{{
              sortAscending ? "&darr;" : "&uarr;"
            }}</span>
          </th>
          <th v-if="showOnHand" class="pr-4 text-right">Avail.</th>
          <th v-if="showPercentage" class="min-w-[5rem] pr-4 text-right">%</th>
          <th class="not-prose">
            <UnitToeItemTableMenu />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedItems" :key="item.id" @dblclick="startEdit(item)">
          <template v-if="editedId === item.id">
            <td class="pl-2" :title="item.description">{{ item.name }}</td>

            <td v-if="toeEditMode === 'onHand'" class="pr-6 text-right tabular-nums">
              {{ item.count }}
            </td>
            <td colspan="4">
              <div class="flex w-full items-center justify-between">
                <input
                  type="number"
                  min="0"
                  class="w-24"
                  v-model="form.count"
                  @vue:mounted="({ el }: any) => el.focus()"
                />
                <div class="flex items-center">
                  <BaseButton small type="submit" secondary class="ml-2">Save</BaseButton>
                  <BaseButton small class="ml-2" @click="cancelEdit()">Cancel</BaseButton>
                </div>
              </div>
            </td>
          </template>
          <template v-else>
            <td class="pl-2" :title="item.description">{{ item.name }}</td>
            <td v-if="showAssigned" class="pr-6 text-right tabular-nums">
              {{ item.count }}
            </td>
            <td v-if="showOnHand" class="pr-6 text-right tabular-nums">
              {{ item.onHand }}
            </td>
            <td v-if="showPercentage" class="pr-6 text-right tabular-nums">
              {{ asPercent(item) }}
            </td>
            <td class="not-prose w-6">
              <DotsMenu
                v-if="isToeEditMode"
                :items="itemActions"
                @action="onItemAction(item, $event)"
                portal
              />
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </form>
</template>
