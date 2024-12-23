<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { useToggle, useVModel } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import { EUnitSupply, NSupplyCategory } from "@/types/internalModels";
import SimpleSelect from "@/components/SimpleSelect.vue";
import BaseButton from "@/components/BaseButton.vue";
import InputGroup from "@/components/InputGroup.vue";
import { useSuppliesEditStore } from "@/stores/toeStore";
import { storeToRefs } from "pinia";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import InlineFormPanel from "@/components/InlineFormPanel.vue";
import InputRadio from "@/components/InputRadio.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import { activeScenarioKey } from "@/components/injects";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import UnitSupplyItemTableMenu from "@/modules/scenarioeditor/UnitSupplyItemTableMenu.vue";

interface Props {
  items: EUnitSupply[];
  values: NSupplyCategory[];
  isMultiMode?: boolean;
  isLocked?: boolean;
  showAdd?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(["delete", "update", "update:showAdd", "diff", "add"]);

const { time } = injectStrict(activeScenarioKey);

const doShowAdd = useVModel(props, "showAdd", emit);
const sortKey = ref<"name" | "count">("name");
const [sortAscending, toggleAscending] = useToggle(true);
const {
  isSuppliesEditMode,
  suppliesEditMode,
  showAssigned,
  showOnHand,
  showPercentage,
  changeMode,
  showClass,
  showUom,
} = storeToRefs(useSuppliesEditStore());
const fmt = useTimeFormatStore();
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

const formattedTime = computed(() =>
  fmt.scenarioFormatter.format(+time.scenarioTime.value),
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

const numColumns = computed(() => {
  let count = 2;
  if (showAssigned.value) count++;
  if (showOnHand.value) count++;
  if (showPercentage.value) count++;
  if (showClass.value) count++;
  if (showUom.value) count++;
  return count;
});

function toggleSort(column: "name" | "count") {
  if (sortKey.value === column) {
    toggleAscending();
  } else {
    sortKey.value = column;
  }
}

function startEdit(data: EUnitSupply) {
  if (!isSuppliesEditMode.value || editedId.value === data.id) return;
  editedId.value = data.id;
  const { id, ...rest } = data;
  if (suppliesEditMode.value === "onHand" && changeMode.value === "diff") {
    form.value = { id, count: 0 };
    return;
  }
  form.value = {
    id: data.id,
    count:
      suppliesEditMode.value === "assigned" ? data.count : (data.onHand ?? data.count),
  };
}

function cancelEdit() {
  editedId.value = null;
}

function onSubmit() {
  if (suppliesEditMode.value === "onHand") {
    if (changeMode.value === "diff") {
      emit("diff", form.value.id, { onHand: form.value.count });
    } else {
      emit("update", form.value.id, { onHand: form.value.count });
    }
  } else {
    emit("update", form.value.id, { count: form.value.count });
  }
  editedId.value = null;
}

function onItemAction(item: EUnitSupply, action: string) {
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
  emit("add", addForm.value.id, { count: addForm.value.count });
  nextTick(() => resetAddForm());
}

function asPercent(item: EUnitSupply) {
  return Math.floor(((item.onHand ?? 1) / item.count) * 100) + "%";
}

resetAddForm();

watch(changeMode, () => {
  if (editedId.value) {
    const data = props.items.find((i) => i.id === editedId.value);
    if (!data) return;
    if (suppliesEditMode.value === "onHand" && changeMode.value === "diff") {
      form.value = { id: data.id, count: 0 };
      return;
    }

    form.value = {
      id: data.id,
      count:
        suppliesEditMode.value === "assigned" ? data.count : (data.onHand ?? data.count),
    };
  }
});
</script>

<template>
  <form
    v-if="isSuppliesEditMode && doShowAdd && valueItems.length"
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
          <th v-if="showClass" class="">Class</th>
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
          <th v-if="showUom" class="pr-4 text-right">Unit</th>
          <th class="not-prose">
            <UnitSupplyItemTableMenu />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedItems" :key="item.id" @dblclick="startEdit(item)">
          <template v-if="editedId === item.id">
            <td :colspan="numColumns">
              <InlineFormPanel @close="cancelEdit()">
                <p class="-mt-4 text-base font-bold">{{ item.name }}</p>
                <InputGroupTemplate label="Edit mode">
                  <MRadioGroup class="mt-2 grid grid-cols-2 gap-4">
                    <InputRadio v-model="suppliesEditMode" :value="'assigned'"
                      >Assigned (initial value)
                    </InputRadio>
                    <InputRadio v-model="suppliesEditMode" value="onHand"
                      >Available at {{ formattedTime }}
                    </InputRadio>
                  </MRadioGroup>
                </InputGroupTemplate>
                <InputGroupTemplate
                  label="Change mode"
                  class="mt-4"
                  v-if="suppliesEditMode === 'onHand'"
                >
                  <MRadioGroup class="mt-2 grid grid-cols-2 gap-4">
                    <InputRadio v-model="changeMode" value="absolute"
                      >Absolute</InputRadio
                    >
                    <InputRadio v-model="changeMode" value="diff">Difference</InputRadio>
                  </MRadioGroup>
                </InputGroupTemplate>
                <InputGroupTemplate
                  label="Assigned"
                  class="mt-4"
                  v-if="suppliesEditMode === 'assigned'"
                >
                  <NumberInputGroup
                    type="number"
                    :min="
                      suppliesEditMode === 'assigned' || changeMode === 'absolute'
                        ? 0
                        : undefined
                    "
                    v-model="form.count"
                  />
                </InputGroupTemplate>
                <InputGroupTemplate v-else label="Assigned" class="mt-4">
                  <span class="font-bold">{{ item.count }}</span>
                </InputGroupTemplate>
                <InputGroupTemplate
                  :label="`Available (${changeMode === 'diff' ? 'diff' : 'abs'})`"
                  class="mt-4"
                  v-if="suppliesEditMode === 'onHand'"
                >
                  <NumberInputGroup
                    type="number"
                    :min="changeMode === 'absolute' ? 0 : undefined"
                    v-model="form.count"
                  />
                </InputGroupTemplate>

                <div class="mt-4 flex items-center justify-end border-t pt-4">
                  <BaseButton small type="submit" primary class="">Save</BaseButton>
                  <BaseButton small class="ml-2" @click="cancelEdit()">Cancel</BaseButton>
                </div>
              </InlineFormPanel>
            </td>
          </template>
          <template v-else>
            <td class="pl-2" :title="item.description">{{ item.name }}</td>
            <td v-if="showClass" class="">
              {{ item.supplyClass }}
            </td>
            <td v-if="showAssigned" class="pr-6 text-right tabular-nums">
              {{ item.count }}
            </td>
            <td v-if="showOnHand" class="pr-6 text-right tabular-nums">
              {{ item.onHand }}
            </td>
            <td v-if="showPercentage" class="pr-6 text-right tabular-nums">
              {{ asPercent(item) }}
            </td>
            <td v-if="showUom && item.uom" class="">
              {{ item.uom }}
            </td>
            <td class="not-prose w-6">
              <DotsMenu
                v-if="isSuppliesEditMode"
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
