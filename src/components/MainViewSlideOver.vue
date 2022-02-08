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
    </TabView>
  </SlideOver>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LayersPanel from "./LayersPanel.vue";
import { useVModel } from "@vueuse/core";
import SlideOver from "./SlideOver.vue";
import TabView from "./TabView.vue";
import TabItem from "./TabItem.vue";
import { useSettingsStore } from "../stores/settingsStore";
import InputGroup from "./InputGroup.vue";
import NumberInputGroup from "./NumberInputGroup.vue";

export default defineComponent({
  name: "MainViewSlideOver",
  components: { NumberInputGroup, InputGroup, TabItem, TabView, SlideOver, LayersPanel },
  props: { modelValue: Boolean },
  setup(props) {
    const open = useVModel(props, "modelValue");
    const settings = useSettingsStore();
    return { open, settings };
  },
});
</script>
