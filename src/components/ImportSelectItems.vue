<template>
  <template v-for="([sid, values], i) in tLayer.entries()" :key="sid">
    <div class="mt-8 flex flex-col">
      <ImportSelectItemsTable
        :layers="values"
        :selected="lSelected[i]"
        @update:selected="updateSelected(i, $event)"
        :select-all="selectAll"
      />
    </div>
  </template>
</template>
<script setup lang="ts">
import { MilxImportedLayer } from "@/composables/scenarioImport";
import ImportSelectItemsTable from "@/components/ImportSelectItemsTable.vue";
import { computed, ref } from "vue";
import { Sidc } from "@/symbology/sidc";

interface Props {
  layers: MilxImportedLayer[];
  selected: (string | number)[];
  selectAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), { selectAll: false });
const emit = defineEmits(["update:selected"]);

const tLayer = computed(() => {
  const acc = new Map();
  props.layers.forEach((layer, i) => {
    layer.features.forEach((item) => {
      const key = new Sidc(item.properties.sidc).standardIdentity;
      const v = acc.get(key) || props.layers.map((e) => ({ ...e, features: [] }));
      v[i].features.push(item);
      acc.set(key, v);
    });
  });
  return acc;
});

const lSelected = ref<(string | number)[][]>([...tLayer.value].map((e) => []));

function updateSelected(index: number, selected: (string | number)[]) {
  lSelected.value[index] = selected;
  emit("update:selected", lSelected.value.flat());
}
</script>
