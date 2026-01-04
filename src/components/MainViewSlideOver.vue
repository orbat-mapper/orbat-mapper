<script setup lang="ts">
import LayersPanel from "./LayersPanel.vue";
import { useVModel } from "@vueuse/core";
import SlideOver from "./SlideOver.vue";
import MyTabs from "@/components/MyTabs.vue";
import TabsContent from "@/components/ui/tabs/TabsContent.vue";
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import NumberInputGroup from "./NumberInputGroup.vue";
import MapSettingsPanel from "@/components/MapSettingsPanel.vue";
import ToggleField from "@/components/ToggleField.vue";
import { useUiStore } from "@/stores/uiStore";
import TimeDateSettingsPanel from "@/components/TimeDateSettingsPanel.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore.ts";

const props = defineProps({ modelValue: Boolean });

const open = useVModel(props, "modelValue");
const settings = useSettingsStore();
const mapSettings = useMapSettingsStore();
const symbolSettings = useSymbolSettingsStore();
const uiSettings = useUiStore();

const tabItems = ["Map view", "Map layers", "ORBAT", "Time and date"];
</script>

<template>
  <SlideOver v-model="open" title="Settings">
    <MyTabs :items="tabItems" default-value="0">
      <TabsContent value="0" class="px-4 py-6">
        <MapSettingsPanel />
      </TabsContent>
      <TabsContent value="1" class="px-4 py-6">
        <LayersPanel />
      </TabsContent>
      <TabsContent value="2" class="px-4 py-6">
        <div class="space-y-4 p-1">
          <NumberInputGroup
            InputGroup
            label="Map symbol size"
            v-model="mapSettings.mapIconSize"
          />
          <NumberInputGroup label="ORBAT symbol size" v-model="settings.orbatIconSize" />
          <ToggleField v-model="settings.orbatShortName"
            >Use short names in ORBAT
          </ToggleField>
          <ToggleField v-model="symbolSettings.simpleStatusModifier"
            >Use simple status modifier
          </ToggleField>

          <ToggleField v-model="uiSettings.debugMode">Debug mode</ToggleField>
        </div>
      </TabsContent>
      <TabsContent value="3" class="px-4 py-6">
        <TimeDateSettingsPanel />
      </TabsContent>
    </MyTabs>
  </SlideOver>
</template>
