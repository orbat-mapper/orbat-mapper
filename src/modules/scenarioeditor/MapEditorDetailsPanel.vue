<template>
  <div class="">
    <aside
      class="pointer-events-auto relative mt-4 flex max-h-[70vh] w-96 flex-col overflow-clip rounded-md bg-white shadow"
    >
      <header class="flex-0 flex items-center justify-end bg-gray-100 p-2 px-4 shadow">
        <CloseButton @click="emit('close')" class="" />
      </header>
      <div class="flex-auto overflow-auto p-4">
        <slot />
      </div>
    </aside>
  </div>
</template>
<script setup lang="ts">
import CloseButton from "@/components/CloseButton.vue";
import { onMounted, onUnmounted } from "vue";
import { injectStrict } from "@/utils";
import { activeMapKey } from "@/components/injects";
const emit = defineEmits(["close"]);
const mapRef = injectStrict(activeMapKey);

onMounted(() => {
  const padding = mapRef.value.getView().padding || [0, 0, 0, 0];
  const [top, right, bottom, left] = padding;
  mapRef.value.getView().padding = [top, 400, bottom, left];
});

onUnmounted(() => {
  const padding = mapRef.value.getView().padding;
  if (padding) {
    const [top, right, bottom, left] = padding;
    mapRef.value.getView().padding = [top, 0, bottom, left];
  }
});
</script>
