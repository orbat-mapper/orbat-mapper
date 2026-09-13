<script setup lang="ts">
defineProps<{
  rows: { parameter: string; value: string | number | boolean }[];
}>();
</script>

<template>
  <div class="border-border overflow-x-auto rounded-md border">
    <table class="w-full text-xs">
      <tbody class="divide-border divide-y">
        <tr v-for="row in rows" :key="row.parameter">
          <th
            scope="row"
            class="text-muted-foreground w-1/2 px-3 py-2 text-left font-normal whitespace-nowrap"
          >
            {{ row.parameter }}
          </th>
          <td class="px-3 py-2 font-mono">{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
