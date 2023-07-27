<script setup lang="ts">
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { computed } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";

const scn = injectStrict(activeScenarioKey);

const equipment = computed(() => {
  return Object.values(scn.store.state.equipmentMap);
});
</script>

<template>
  <div class="prose">
    <TableHeader
      title="Equipment"
      description="A list of equipment that is available in this scenario."
      ><BaseButton primary>Add</BaseButton></TableHeader
    >
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="eq in equipment" :key="eq.id">
          <td>{{ eq.name }}</td>
          <td>{{ eq.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
