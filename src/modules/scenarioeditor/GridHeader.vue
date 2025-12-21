<script setup lang="ts">
import { type TableColumn } from "@/modules/scenarioeditor/types";

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
  <thead class="bg-muted text-muted-foreground">
    <tr>
      <th scope="col" class="sticky top-0 z-10">
        <div
          class="border-border bg-card text-foreground -m-[1.5px] border-b py-3.5 pr-3 pl-6 text-left text-sm font-semibold"
        >
          &nbsp;
        </div>
      </th>
      <th scope="col" class="sticky top-0 z-10">
        <div
          class="border-border bg-card text-foreground -m-[1.5px] border-b py-3.5 pr-3 pl-6 text-left text-sm font-semibold"
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
          class="border-border bg-card text-foreground -my-0.5 -ml-0.5 border-b border-l py-3.5 pr-3 pl-3 text-left text-sm font-semibold"
        >
          {{ column.label }}
        </div>
      </th>
    </tr>
  </thead>
</template>
