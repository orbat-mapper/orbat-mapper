<template>
  <SlideOver v-model="open" title="Settings">
    <LayersPanel />
  </SlideOver>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LayersPanel from "./LayersPanel.vue";
import { useVModel } from "@vueuse/core";
import SlideOver from "./SlideOver.vue";

export default defineComponent({
  name: "MainViewSlideOver",
  components: { SlideOver, LayersPanel },
  props: { modelValue: Boolean },
  setup(props) {
    const open = useVModel(props, "modelValue");
    return { open };
  },
});
</script>
