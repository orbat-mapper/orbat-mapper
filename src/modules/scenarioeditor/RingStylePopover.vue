<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RangeRingStyle } from "@/types/scenarioGeoModels";
import DrawRangeRingMarker from "@/components/DrawRangeRingMarker.vue";
import { computed } from "vue";
import ColorPicker from "@/components/ColorPicker.vue";
import { SimpleStyleSpec } from "@/geo/simplestyle";
import { useUiStore } from "@/stores/uiStore";
import { PopoverClose } from "radix-vue";
import CloseButton from "@/components/CloseButton.vue";

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

const uiStore = useUiStore();

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

function onOpen(isOpen: boolean) {
  if (isOpen) {
    uiStore.popperCounter++;
  } else {
    uiStore.popperCounter--;
  }
}
</script>
<template>
  <Popover @update:open="onOpen">
    <PopoverTrigger
      title="Change style"
      class="hover:bg-gray-100 disabled:opacity-50"
      :disabled="disabled"
    >
      <DrawRangeRingMarker :styling="rStyle" />
    </PopoverTrigger>
    <PopoverContent class="relative" side="left" align="start">
      <div class="flex items-center justify-between text-sm font-bold">
        <h3>Set range ring style</h3>
        <div />
      </div>
      <section
        class="mt-4 grid w-full grid-cols-[max-content_1fr] gap-4 pb-1 text-sm text-foreground"
      >
        <div class="col-span-2 -mb-2 font-semibold">Stroke</div>
        <div>Color</div>
        <ColorPicker
          :model-value="rStyle['stroke'] as string | undefined"
          @update:model-value="updateValue('stroke', $event)"
        />
        <label for="stroke-width" class="">Width</label>
        <div class="grid grid-cols-[1fr_5ch] gap-4">
          <input
            id="stroke-width"
            v-model.number="width"
            type="range"
            min="1"
            max="10"
            step="1"
            class="min-w-20"
          />
          <span class="">{{ rStyle["stroke-width"] }} px</span>
        </div>
        <label for="stroke-opacity">Opacity</label>
        <div class="grid grid-cols-[1fr_5ch] gap-4">
          <input
            id="stroke-opacity"
            v-model.number="strokeOpacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="min-w-20"
          />
          <span class="">{{ strokeOpacityAsPercent }}%</span>
        </div>
      </section>

      <section
        class="mt-4 grid w-full grid-cols-[max-content_1fr] gap-4 pb-1 text-sm text-foreground"
      >
        <div class="col-span-2 -mb-2 font-semibold">Fill</div>
        <div>Color</div>
        <ColorPicker
          :model-value="rStyle['fill'] as string | undefined"
          @update:model-value="updateValue('fill', $event)"
        />

        <label for="stroke-opacity">Opacity</label>
        <div class="grid grid-cols-[1fr_5ch] gap-4">
          <input
            id="stroke-opacity"
            v-model.number="fillOpacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="min-w-20"
          />
          <span class="">{{ fillOpacityAsPercent }}%</span>
        </div>
      </section>
      <PopoverClose as-child>
        <CloseButton class="absolute right-4 top-4" />
      </PopoverClose>
    </PopoverContent>
  </Popover>
</template>
