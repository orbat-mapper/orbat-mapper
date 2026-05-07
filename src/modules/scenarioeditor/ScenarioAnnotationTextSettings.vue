<script setup lang="ts">
import { computed } from "vue";
import type { TextAnnotation } from "@/types/scenarioLayerItems";
import type { AnnotationLayerItemUpdate } from "@/types/scenarioLayerItems";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";
import ZoomSelector from "@/components/ZoomSelector.vue";

const props = defineProps<{ annotation: TextAnnotation }>();
const emit = defineEmits<{
  (e: "update", value: AnnotationLayerItemUpdate): void;
}>();

const marker = computed(() => {
  const style = props.annotation.style ?? {};
  return {
    textSize: style.textSize ?? 16,
    textColor: style.textColor ?? "#111827",
    textMinZoom: style.textMinZoom ?? 0,
    textMaxZoom: style.textMaxZoom ?? 24,
  };
});

const range = computed({
  get: (): [number, number] => [marker.value.textMinZoom, marker.value.textMaxZoom],
  set: ([minZoom, maxZoom]) => {
    emit("update", { style: { textMinZoom: +minZoom, textMaxZoom: +maxZoom } });
  },
});

function updateStyle(
  name: "textSize" | "textColor",
  value: number | string | null | undefined,
) {
  emit("update", { style: { [name]: value } });
}
</script>

<template>
  <div class="col-span-2 -mb-2 font-semibold">Text</div>
  <div class="self-center">Color</div>
  <PopoverColorPicker
    :model-value="marker.textColor"
    @update:model-value="updateStyle('textColor', $event)"
  />
  <div class="self-center">Size</div>
  <NumberInputGroup
    :model-value="marker.textSize"
    class="max-w-[10rem]"
    @update:model-value="updateStyle('textSize', $event)"
  />
  <div>Zoom levels</div>
  <ZoomSelector v-model="range" class="mt-4 flex-auto" />
</template>
