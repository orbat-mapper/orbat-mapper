<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type ScenarioInfo } from "@/types/scenarioModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import EditableLabel from "@/components/EditableLabel.vue";
import ScenarioInfoDetails from "@/modules/scenarioeditor/ScenarioInfoDetails.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import { TabsContent } from "@/components/ui/tabs";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";

const { store } = injectStrict(activeScenarioKey);
const { state } = store;

const scenarioName = ref("");

const panelStore = useScenarioInfoPanelStore();

watch(
  () => state.info.name,
  (v) => (scenarioName.value = v),
  { immediate: true },
);

const tabList = [{ label: "Details", value: "0" }];

const selectedTabString = computed({
  get: () => panelStore.tabIndex.toString(),
  set: (v) => {
    panelStore.tabIndex = Number(v);
  },
});

function updateScenarioInfo(data: Partial<ScenarioInfo>) {
  store.update((s) => {
    Object.assign(s.info, { ...data });
  });
}
</script>

<template>
  <div class="">
    <header class="pr-4">
      <EditableLabel
        v-model="scenarioName"
        @update-value="updateScenarioInfo({ name: $event })"
      />
    </header>
    <div class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTabString">
        <TabsContent value="0" class="mx-4 pt-4"
          ><ScenarioInfoDetails class=""
        /></TabsContent>
      </ScrollTabs>
    </div>
  </div>
</template>
