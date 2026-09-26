<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ChevronDownIcon, GridIcon } from "@lucide/vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  useReferenceGridStore,
  type MgrsGridInterval,
  type ReferenceGridMode,
} from "@/stores/referenceGridStore";

const grid = useReferenceGridStore();
const { visible, mode, mgrsInterval, latLongInterval, color, opacity, strokeWidth } =
  storeToRefs(grid);
const latLongDraft = ref(String(latLongInterval.value));

watch(latLongInterval, (value) => {
  latLongDraft.value = String(value);
});

const opacitySlider = computed({
  get: () => [Math.round(opacity.value * 100)],
  set: ([value]: number[]) => grid.setOpacity(value / 100),
});

const strokeWidthSlider = computed({
  get: () => [strokeWidth.value],
  set: ([value]: number[]) => grid.setStrokeWidth(value),
});

function setMode(event: Event) {
  grid.setMode((event.target as HTMLSelectElement).value as ReferenceGridMode);
}

function setMgrsInterval(event: Event) {
  grid.setMgrsInterval(
    Number((event.target as HTMLSelectElement).value) as MgrsGridInterval,
  );
}

function commitLatLongInterval() {
  const value = Number(latLongDraft.value);
  if (Number.isFinite(value) && value > 0) grid.setLatLongInterval(value);
  latLongDraft.value = String(latLongInterval.value);
}

function commitColor(event: Event) {
  grid.setColor((event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="flex items-center">
    <MainToolbarButton
      aria-label="Toggle reference grid"
      :aria-pressed="visible"
      :active="visible"
      title="Toggle reference grid"
      class="rounded-r-none"
      @click="visible = !visible"
    >
      <GridIcon class="size-5" />
    </MainToolbarButton>
    <Popover>
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Reference grid settings"
          title="Reference grid settings"
          class="hover:bg-army2/50! -ml-px w-5 rounded-l-none px-0"
        >
          <ChevronDownIcon class="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-72 space-y-4" align="end">
        <header>
          <h2 class="text-sm font-semibold">Reference grid</h2>
          <p class="text-muted-foreground text-xs">Display settings for this device</p>
        </header>

        <div class="space-y-2">
          <Label for="reference-grid-mode" class="text-xs">Grid mode</Label>
          <select
            id="reference-grid-mode"
            :value="mode"
            class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            @change="setMode"
          >
            <option value="mgrs">MGRS</option>
            <option value="latlong">Latitude/longitude</option>
          </select>
        </div>

        <div v-if="mode === 'mgrs'" class="space-y-2">
          <Label for="reference-grid-mgrs-interval" class="text-xs"
            >Finest interval</Label
          >
          <select
            id="reference-grid-mgrs-interval"
            :value="mgrsInterval"
            class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            @change="setMgrsInterval"
          >
            <option value="100">100 m</option>
            <option value="1000">1 km</option>
            <option value="10000">10 km</option>
            <option value="100000">100 km</option>
          </select>
        </div>

        <div v-else class="space-y-2">
          <Label for="reference-grid-latlong-interval" class="text-xs">
            Finest interval (°)
          </Label>
          <input
            id="reference-grid-latlong-interval"
            v-model="latLongDraft"
            type="number"
            min="0.00000001"
            step="any"
            inputmode="decimal"
            class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            @blur="commitLatLongInterval"
            @keydown.enter.prevent="commitLatLongInterval"
          />
        </div>

        <p class="text-muted-foreground text-xs">
          The map automatically thins subdivisions as you zoom out.
        </p>

        <div class="space-y-2 border-t pt-4">
          <Label for="reference-grid-color" class="text-xs">Line colour</Label>
          <input
            id="reference-grid-color"
            :value="color"
            type="color"
            class="h-8 w-full cursor-pointer rounded border"
            @input="commitColor"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <Label class="text-xs">Opacity</Label>
            <span class="text-muted-foreground text-xs tabular-nums">
              {{ Math.round(opacity * 100) }}%
            </span>
          </div>
          <Slider v-model="opacitySlider" :min="0" :max="100" :step="1" />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <Label class="text-xs">Line width</Label>
            <span class="text-muted-foreground text-xs tabular-nums">
              {{ strokeWidth.toFixed(2) }} px
            </span>
          </div>
          <Slider v-model="strokeWidthSlider" :min="0.1" :max="8" :step="0.25" />
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
