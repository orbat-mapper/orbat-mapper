<template>
  <aside
    class="pointer-events-auto relative mt-4 h-96 max-h-full w-96 overflow-auto rounded-md bg-white p-4 shadow"
  >
    <CloseButton @click="emit('close')" class="absolute right-4 top-4" />
    <slot />
  </aside>
</template>
<script setup lang="ts">
import CloseButton from "@/components/CloseButton.vue";
import { onMounted, onUnmounted } from "vue";
import { injectStrict } from "@/utils";
import { activeMapKey } from "@/components/injects";
const emit = defineEmits(["close"]);
const mapRef = injectStrict(activeMapKey);

onMounted(() => {
  const padding = mapRef.value.getView().padding;
  if (padding) {
    const [top, right, bottom, left] = padding;
    mapRef.value.getView().padding = [top, 400, bottom, left];
  }
});

onUnmounted(() => {
  const padding = mapRef.value.getView().padding;
  if (padding) {
    const [top, right, bottom, left] = padding;
    mapRef.value.getView().padding = [top, 0, bottom, left];
  }
});
</script>
