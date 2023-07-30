<script setup lang="ts">
import { computed, ref } from "vue";
import { sortBy } from "@/utils";
import { UnitEquipment, UnitPersonnel } from "@/types/scenarioModels";
import { useToggle } from "@vueuse/core";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";

interface Props {
  items: UnitEquipment[] | UnitPersonnel[];
}
const props = defineProps<Props>();

const sortKey = ref<"name" | "count">("count");
const [sortAscending, toggleAscending] = useToggle(true);

const sortedItems = computed(() =>
  sortBy(props.items, sortKey.value, sortAscending.value),
);

function toggleSort(column: "name" | "count") {
  if (sortKey.value === column) {
    toggleAscending();
  } else {
    sortKey.value = column;
  }
}

function onEquipmentSubmit() {
  console.log("submit equipment");
}
</script>

<template>
  <form @submit.prevent="onEquipmentSubmit">
    <table class="-mx-2 mt-2" v-if="items.length">
      <thead>
        <tr class="cursor-pointer">
          <th class="pl-2" @click="toggleSort('name')">Name</th>
          <th class="pr-8 text-right" @click="toggleSort('count')">Qty.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedItems" :key="item.name">
          <td class="pl-2" :title="item.description">{{ item.name }}</td>
          <td class="pr-6 text-right tabular-nums">{{ item.count }}</td>
        </tr>
      </tbody>
    </table>
  </form>
</template>
