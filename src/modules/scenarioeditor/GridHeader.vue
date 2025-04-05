<script setup lang="ts">
import { TableColumn } from "@/modules/scenarioeditor/types";

interface Props {
  columns: TableColumn[];
}

const props = defineProps<Props>();
</script>
<template>
  <colgroup>
    <col class="w-10" />
    <col />
    <col />
    <col class="w-1/4" />
  </colgroup>
  <thead class="bg-gray-500">
    <tr>
      <th scope="col" class="sticky top-0 z-10">
        <div
          class="-m-[1.5px] border-b border-gray-400 bg-gray-100 py-3.5 pr-3 pl-6 text-left text-sm font-semibold text-gray-900"
        >
          &nbsp;
        </div>
      </th>
      <th scope="col" class="sticky top-0 z-10">
        <div
          class="-m-[1.5px] border-b border-gray-400 bg-gray-100 py-3.5 pr-3 pl-6 text-left text-sm font-semibold text-gray-900"
        >
          Unit
        </div>
      </th>

      <th
        v-for="column in columns"
        :key="column.value"
        scope="col"
        class="sticky top-0 z-10"
      >
        <div
          class="-my-[2px] -ml-[2px] border-b border-l border-gray-400 border-l-gray-200 bg-gray-100 py-3.5 pr-3 pl-3 text-left text-sm font-semibold text-gray-900"
        >
          {{ column.label }}
        </div>
      </th>
    </tr>
  </thead>
</template>
