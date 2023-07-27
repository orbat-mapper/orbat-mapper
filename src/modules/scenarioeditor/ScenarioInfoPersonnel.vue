<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";

const scn = injectStrict(activeScenarioKey);

const personnel = computed(() => {
  return Object.values(scn.store.state.personnelMap);
});
</script>

<template>
  <div class="prose">
    <TableHeader
      title="Personnel"
      description="A list of personnel categories available in this scenario."
    >
      <BaseButton primary>Add</BaseButton>
    </TableHeader>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in personnel" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
