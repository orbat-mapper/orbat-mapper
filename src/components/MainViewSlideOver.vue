<script setup lang="ts">
import LayersPanel from "./LayersPanel.vue";
import { useVModel } from "@vueuse/core";
import SlideOver from "./SlideOver.vue";
import TabView from "./TabView.vue";
import TabItem from "./TabItem.vue";
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
</script>

<template>
  <SlideOver v-model="open" title="Settings">
    <TabView gap="gap-x-2">
      <TabItem label="Map view">
        <MapSettingsPanel />
      </TabItem>
      <TabItem label="Map layers">
        <LayersPanel />
      </TabItem>
      <TabItem label="ORBAT">
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
      </TabItem>
      <TabItem label="Time and date">
        <TimeDateSettingsPanel />
      </TabItem>
    </TabView>
  </SlideOver>
</template>
