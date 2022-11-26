<template>
  <div class="mt-8 flex flex-col">
    <ImportSelectItemsTable
      :layers="layers"
      :selected="selected"
      @update:selected="emit('update:selected', $event)"
      :select-all="selectAll"
    />
  </div>
</template>
<script setup lang="ts">
import { MilxImportedLayer } from "@/composables/scenarioImport";
import ImportSelectItemsTable from "@/components/ImportSelectItemsTable.vue";

interface Props {
  layers: MilxImportedLayer[];
  selected: (string | number)[];
  selectAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), { selectAll: false });
const emit = defineEmits(["update:selected"]);
</script>
