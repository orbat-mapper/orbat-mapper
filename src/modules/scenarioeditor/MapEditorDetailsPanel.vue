<template>
  <div class="">
    <aside
      class="pointer-events-auto relative mt-4 flex max-h-[70vh] flex-col overflow-clip rounded-md bg-white shadow"
      :style="{ width: widthStore.detailsWidth + 'px' }"
    >
      <header
        class="flex-0 flex items-center justify-between bg-gray-100 p-2 px-4 shadow"
      >
        <div></div>
        <CloseButton @click="emit('close')" class="" />
      </header>
      <div class="flex-auto overflow-auto p-4">
        <slot />
      </div>
      <PanelResizeHandle
        :width="widthStore.detailsWidth"
        @update="widthStore.detailsWidth = $event"
        @reset="widthStore.resetDetailsWidth()"
        left
      />
    </aside>
  </div>
</template>
<script setup lang="ts">
import CloseButton from "@/components/CloseButton.vue";
import { onMounted, onUnmounted } from "vue";
import { injectStrict } from "@/utils";
import { activeMapKey } from "@/components/injects";
import { useWidthStore } from "@/stores/uiStore";
import PanelResizeHandle from "@/components/PanelResizeHandle.vue";
const emit = defineEmits(["close"]);
const mapRef = injectStrict(activeMapKey);
const widthStore = useWidthStore();
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
