<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { Float } from "@headlessui-float/vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { RangeRingStyle } from "@/types/scenarioGeoModels";
import DrawRangeRingMarker from "@/components/DrawRangeRingMarker.vue";
import { computed } from "vue";
import ColorPicker from "@/components/ColorPicker.vue";
import { SimpleStyleSpec, StrokeStyleSpec } from "@/geo/simplestyle";

interface Props {
  ringStyle: Partial<RangeRingStyle>;
  disabled?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(["update"]);
const rStyle = computed((): RangeRingStyle => {
  return {
    fill: props.ringStyle.fill ?? null,
    "fill-opacity": props.ringStyle["fill-opacity"] ?? 0.5,
    stroke: props.ringStyle.stroke ?? "#f43f5e",
    "stroke-width": props.ringStyle["stroke-width"] ?? 2,
    "stroke-opacity": props.ringStyle["stroke-opacity"] ?? 1,
  };
});

const width = computed({
  get: () => rStyle.value["stroke-width"],
  set: (v) => emit("update", { "stroke-width": v }),
});

const strokeOpacity = computed({
  get: () => rStyle.value["stroke-opacity"],
  set: (v) => emit("update", { "stroke-opacity": v }),
});

const strokeOpacityAsPercent = computed(() => (strokeOpacity.value! * 100).toFixed(0));

const fillOpacity = computed({
  get: () => rStyle.value["fill-opacity"],
  set: (v) => emit("update", { "fill-opacity": v }),
});

const fillOpacityAsPercent = computed(() => (fillOpacity.value! * 100).toFixed(0));

function updateValue(name: keyof SimpleStyleSpec, value: string | number) {
  emit("update", { [name]: value });
}
</script>
<template>
  <Popover as="template">
    <Float placement="top-end" strategy="fixed" portal>
      <PopoverButton
        title="Change style"
        class="hover:bg-gray-100 disabled:opacity-50"
        :disabled="disabled"
      >
        <DrawRangeRingMarker :styling="rStyle" />
      </PopoverButton>
      <PopoverPanel>
        <FloatingPanel class="p-4">
          <h3>Set range ring style</h3>
          <section class="mt-2">
            <ColorPicker
              :model-value="rStyle['stroke'] as string | undefined"
              @update:model-value="updateValue('stroke', $event)"
              label="Stroke"
            />
            <div class="mt-4 flex space-x-2">
              <label for="stroke-width" class="w-16">Width</label>
              <input
                id="stroke-width"
                v-model.number="width"
                type="range"
                min="1"
                max="10"
                step="1"
                class="w-28"
              />
              <span class="ml-2">{{ rStyle["stroke-width"] }}</span>
            </div>
            <div class="mt-4 flex space-x-2">
              <label for="stroke-opacity" class="w-16">Opacity</label>
              <input
                id="stroke-opacity"
                v-model.number="strokeOpacity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="w-28"
              />
              <span class="ml-2">{{ strokeOpacityAsPercent }}%</span>
            </div>
          </section>
          <section class="mt-4">
            <ColorPicker
              :model-value="rStyle['fill'] as string | undefined"
              @update:model-value="updateValue('fill', $event)"
              label="Fill"
              show-none
            />
            <div class="mt-4 flex space-x-2">
              <label for="fill-opacity" class="w-16">Opacity</label>
              <input
                id="fill-opacity"
                v-model.number="fillOpacity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="w-28"
              />
              <span class="ml-2">{{ fillOpacityAsPercent }}%</span>
            </div>
          </section>
        </FloatingPanel>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
