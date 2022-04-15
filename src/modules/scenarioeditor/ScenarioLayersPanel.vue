<script setup lang="ts">
import { ScenarioFeature } from "../../types/scenarioGeoModels";
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import CloseButton from "../../components/CloseButton.vue";
import DescriptionItem from "../../components/DescriptionItem.vue";
import { computed } from "vue";
import { renderMarkdown } from "../../composables/formatting";

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits(["close"]);

const hDescription = computed(() =>
  renderMarkdown(props.feature.properties.description || "")
);
</script>
<template>
  <TabView extra-class="px-6" tab-class="pl-6 pr-6" class="mt-3 min-h-0">
    <template #extra>
      <div class="flex pt-4">
        <CloseButton @click="emit('close')" />
      </div>
    </template>
    <TabItem label="Feature details">
      <div class="space-y-4">
        <DescriptionItem label="Name">{{ feature.properties.name }}</DescriptionItem>
        <DescriptionItem v-if="feature.properties.description" label="Description">
          <div class="prose prose-sm" v-html="hDescription"></div>
        </DescriptionItem>
      </div>
    </TabItem>
    <TabItem label="Debug view">
      <div>
        <pre class="overflow-auto text-sm">{{ feature }}</pre>
      </div>
    </TabItem>
  </TabView>
</template>
