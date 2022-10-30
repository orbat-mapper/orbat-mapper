<template>
  <form @submit.prevent="onLoad" class="mt-4 space-y-6">
    <div class="prose prose-sm">
      <p v-if="isMilx">
        Basic support for importing MilX layers from
        <a href="https://www.map.army/">map.army</a>
      </p>
    </div>
    <section>
      <div v-for="layer in data" :key="layer.name">
        <p>{{ layer.name }}</p>
        <ul class="ml-4 space-y-1.5 font-mono">
          <li v-for="f in layer.features" class="flex items-center">
            <MilSymbol :sidc="f.properties.sidc" :size="20" /><span class="ml-2">{{
              f.properties.name || f.properties.sidc
            }}</span>
          </li>
        </ul>
      </div>
    </section>

    <footer class="flex items-center justify-end space-x-2 pt-4">
      <BaseButton type="submit" primary small disabled>Import</BaseButton>
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFocusOnMount } from "@/components/helpers";
import BaseButton from "@/components/BaseButton.vue";
import type { ImportFormat, ImportSettings } from "@/types/convert";
import { useNotifications } from "@/composables/notifications";
import { useImportStore } from "@/stores/importExportStore";
import { MilxImportedLayer, useScenarioImport } from "@/composables/scenarioImport";
import MilSymbol from "@/components/MilSymbol.vue";

interface Props {
  data: MilxImportedLayer[];
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);

const store = useImportStore();

interface Form extends ImportSettings {
  format: ImportFormat;
}

const form = ref<Form>({
  format: store.format,
  includeFeatures: false,
  includeUnits: true,
  fileName: "scenario.geojson",
  embedIcons: true,
  useShortName: true,
});

const { focusId } = useFocusOnMount(undefined, 150);
const { send } = useNotifications();

const isMilx = computed(() => form.value.format === "milx");
const { importMilxString } = useScenarioImport();
async function onLoad(e: Event) {
  const { format } = form.value;
}
</script>
