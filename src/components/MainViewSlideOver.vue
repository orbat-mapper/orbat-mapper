<template>
  <SlideOver v-model="open" title="Settings">
    <TabView>
      <TabItem label="Layers">
        <LayersPanel />
      </TabItem>
      <TabItem label="Rendering">
        <div class="space-y-4 p-1">
          <NumberInputGroup
            InputGroup
            label="Map symbol size"
            v-model="settings.mapIconSize"
          />
          <NumberInputGroup
            InputGroup
            label="ORBAT symbol size"
            type="number"
            v-model="settings.orbatIconSize"
          />
        </div>
      </TabItem>
      <TabItem label="Map settings"><MapSettingsPanel /></TabItem>
    </TabView>
  </SlideOver>
</template>

<script setup lang="ts">
import LayersPanel from "./LayersPanel.vue";
import { useVModel } from "@vueuse/core";
import SlideOver from "./SlideOver.vue";
import TabView from "./TabView.vue";
import TabItem from "./TabItem.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import NumberInputGroup from "./NumberInputGroup.vue";
import MapSettingsPanel from "@/components/MapSettingsPanel.vue";

const props = defineProps({ modelValue: Boolean });

const open = useVModel(props, "modelValue");
const settings = useSettingsStore();
</script>
