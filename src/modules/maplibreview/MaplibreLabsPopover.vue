<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import { FlaskConicalIcon, GridIcon, HexagonIcon } from "@lucide/vue";
import { getHexagonAreaAvg, getHexagonEdgeLengthAvg } from "h3-js";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import ToggleField from "@/components/ToggleField.vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useH3HexGrid } from "@/modules/maplibreview/h3grid";
import { useMgrsGrid } from "@/modules/maplibreview/mgrsgrid";

const props = defineProps<{ mlMap?: MlMap | null }>();

const mapRef = shallowRef<MlMap | undefined>(props.mlMap ?? undefined);
watch(
  () => props.mlMap,
  (m) => {
    mapRef.value = m ?? undefined;
  },
);

const { showHexGrid, hexResolution, autoResolution, lineColor, lineOpacity, lineWidth } =
  useH3HexGrid(mapRef);
const {
  showMgrsGrid,
  showLabels: showMgrsLabels,
  lineColor: mgrsLineColor,
  lineOpacity: mgrsLineOpacity,
  lineWidth: mgrsLineWidth,
  currentAccuracy: mgrsAccuracy,
} = useMgrsGrid(mapRef);

const showHexDiameter = ref(true);
const showHexArea = ref(true);
const hexUnitSystem = ref<"si" | "imperial" | "nautical">("si");

const hexResolutionSlider = computed({
  get: () => [hexResolution.value],
  set: ([v]: number[]) => {
    hexResolution.value = v;
  },
});
const lineOpacitySlider = computed({
  get: () => [lineOpacity.value],
  set: ([v]: number[]) => {
    lineOpacity.value = v;
  },
});
const lineWidthSlider = computed({
  get: () => [lineWidth.value],
  set: ([v]: number[]) => {
    lineWidth.value = v;
  },
});
const mgrsLineOpacitySlider = computed({
  get: () => [mgrsLineOpacity.value],
  set: ([v]: number[]) => {
    mgrsLineOpacity.value = v;
  },
});
const mgrsLineWidthSlider = computed({
  get: () => [mgrsLineWidth.value],
  set: ([v]: number[]) => {
    mgrsLineWidth.value = v;
  },
});

function formatLength(km: number): string {
  if (hexUnitSystem.value === "imperial") {
    const mi = km * 0.621371;
    if (mi >= 1) return `${mi.toFixed(mi >= 100 ? 0 : 1)} mi`;
    const ft = mi * 5280;
    return `${ft < 100 ? ft.toFixed(0) : Math.round(ft).toLocaleString()} ft`;
  }
  if (hexUnitSystem.value === "nautical") {
    const nmi = km * 0.539957;
    if (nmi >= 1) return `${nmi.toFixed(nmi >= 100 ? 0 : 1)} nmi`;
    const yd = km * 1093.61;
    return `${yd < 100 ? yd.toFixed(0) : Math.round(yd).toLocaleString()} yd`;
  }
  if (km >= 1) return `${km.toFixed(km >= 100 ? 0 : 1)} km`;
  return `${(km * 1000).toFixed(0)} m`;
}

function formatArea(km2: number): string {
  if (hexUnitSystem.value === "imperial") {
    const mi2 = km2 * 0.386102;
    if (mi2 >= 1) {
      return `${mi2 < 10 ? mi2.toFixed(1) : Math.round(mi2).toLocaleString()} mi²`;
    }
    const ft2 = mi2 * 27878400;
    return `${Math.round(ft2).toLocaleString()} ft²`;
  }
  if (hexUnitSystem.value === "nautical") {
    const nmi2 = km2 * 0.291553;
    if (nmi2 >= 1) {
      return `${nmi2 < 10 ? nmi2.toFixed(1) : Math.round(nmi2).toLocaleString()} nmi²`;
    }
    return `${Math.round(nmi2 * 3_429_904).toLocaleString()} yd²`;
  }
  if (km2 >= 1) {
    return `${km2 < 10 ? km2.toFixed(1) : Math.round(km2).toLocaleString()} km²`;
  }
  return `${(km2 * 1e6).toFixed(0)} m²`;
}

const hexSizeLabel = computed(() => {
  if (!showHexDiameter.value && !showHexArea.value) return "";
  const parts: string[] = [];
  if (showHexDiameter.value) {
    parts.push(
      `${formatLength(getHexagonEdgeLengthAvg(hexResolution.value, "km") * 2)} ⌀`,
    );
  }
  if (showHexArea.value) {
    parts.push(formatArea(getHexagonAreaAvg(hexResolution.value, "km2")));
  }
  return `~${parts.join(" · ")}`;
});

const mgrsPrecisionLabel = computed(() => {
  const accuracy = mgrsAccuracy.value;
  if (accuracy === 0) return "100 km";
  if (accuracy === 1) return "10 km";
  if (accuracy === 2) return "1 km";
  if (accuracy === 3) return "100 m";
  return "10 m";
});

const activeCount = computed(
  () => Number(showHexGrid.value) + Number(showMgrsGrid.value),
);
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <MainToolbarButton
        title="Experimental features"
        :class="[
          'relative',
          activeCount > 0
            ? 'bg-amber-500/20! ring-2 ring-amber-500/70 hover:bg-amber-500/30!'
            : '',
        ]"
      >
        <FlaskConicalIcon
          :class="[
            'size-5',
            activeCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-amber-500',
          ]"
        />
        <span
          v-if="activeCount > 0"
          class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white shadow-sm"
        >
          {{ activeCount }}
        </span>
      </MainToolbarButton>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="end">
      <header class="flex items-center gap-2 border-b px-3 py-2">
        <FlaskConicalIcon class="size-4 text-amber-500" />
        <div class="flex flex-col">
          <span class="text-sm font-medium">Labs</span>
          <span class="text-muted-foreground text-xs">Experimental features</span>
        </div>
      </header>

      <div class="max-h-[70vh] space-y-1 overflow-y-auto p-3">
        <section class="rounded-md border">
          <div class="flex items-center justify-between gap-2 px-3 py-2">
            <div class="flex items-center gap-2">
              <HexagonIcon class="size-4" />
              <Label class="text-sm">H3 hex grid</Label>
            </div>
            <ToggleField v-model="showHexGrid" />
          </div>
          <div v-if="showHexGrid" class="space-y-3 border-t px-3 py-3">
            <div class="flex items-center justify-between">
              <ToggleField v-model="autoResolution">Auto resolution</ToggleField>
              <span
                v-if="hexSizeLabel"
                class="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
                :title="`H3 resolution ${hexResolution}`"
                >{{ hexSizeLabel }}</span
              >
            </div>
            <div v-if="!autoResolution" class="flex items-center gap-2">
              <Label class="text-xs">Resolution</Label>
              <Slider
                v-model="hexResolutionSlider"
                :min="0"
                :max="8"
                :step="1"
                class="flex-1"
              />
              <span class="text-muted-foreground w-4 text-xs">{{ hexResolution }}</span>
            </div>
            <div class="space-y-2">
              <Label for="hex-line-color" class="text-xs">Line color</Label>
              <input
                id="hex-line-color"
                v-model="lineColor"
                type="color"
                class="h-8 w-full cursor-pointer rounded border"
              />
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Opacity</Label>
                <span class="text-muted-foreground text-xs">{{
                  lineOpacity.toFixed(2)
                }}</span>
              </div>
              <Slider v-model="lineOpacitySlider" :min="0" :max="1" :step="0.05" />
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Line width</Label>
                <span class="text-muted-foreground text-xs">{{
                  lineWidth.toFixed(1)
                }}</span>
              </div>
              <Slider v-model="lineWidthSlider" :min="0.5" :max="5" :step="0.1" />
            </div>
            <div class="space-y-2 border-t pt-3">
              <Label class="text-xs">Size display</Label>
              <ToggleField v-model="showHexDiameter">Show diameter</ToggleField>
              <ToggleField v-model="showHexArea">Show area</ToggleField>
              <div class="flex items-center justify-between pt-1">
                <Label class="text-xs">Units</Label>
                <div class="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    :variant="hexUnitSystem === 'si' ? 'default' : 'outline'"
                    class="h-7 px-2 text-xs"
                    @click="hexUnitSystem = 'si'"
                    >SI</Button
                  >
                  <Button
                    type="button"
                    size="sm"
                    :variant="hexUnitSystem === 'imperial' ? 'default' : 'outline'"
                    class="h-7 px-2 text-xs"
                    @click="hexUnitSystem = 'imperial'"
                    >Imperial</Button
                  >
                  <Button
                    type="button"
                    size="sm"
                    :variant="hexUnitSystem === 'nautical' ? 'default' : 'outline'"
                    class="h-7 px-2 text-xs"
                    @click="hexUnitSystem = 'nautical'"
                    >Nautical</Button
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-md border">
          <div class="flex items-center justify-between gap-2 px-3 py-2">
            <div class="flex items-center gap-2">
              <GridIcon class="size-4" />
              <Label class="text-sm">MGRS grid zones</Label>
            </div>
            <ToggleField v-model="showMgrsGrid" />
          </div>
          <div v-if="showMgrsGrid" class="space-y-3 border-t px-3 py-3">
            <div class="flex items-center justify-between">
              <Label class="text-xs">Precision</Label>
              <span
                class="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
                >{{ mgrsPrecisionLabel }}</span
              >
            </div>
            <div class="space-y-2">
              <Label for="mgrs-line-color" class="text-xs">Line color</Label>
              <input
                id="mgrs-line-color"
                v-model="mgrsLineColor"
                type="color"
                class="h-8 w-full cursor-pointer rounded border"
              />
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Opacity</Label>
                <span class="text-muted-foreground text-xs">{{
                  mgrsLineOpacity.toFixed(2)
                }}</span>
              </div>
              <Slider v-model="mgrsLineOpacitySlider" :min="0" :max="1" :step="0.05" />
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Line width</Label>
                <span class="text-muted-foreground text-xs">{{
                  mgrsLineWidth.toFixed(1)
                }}</span>
              </div>
              <Slider v-model="mgrsLineWidthSlider" :min="0.5" :max="5" :step="0.1" />
            </div>
            <div class="border-t pt-3">
              <ToggleField v-model="showMgrsLabels">Show labels</ToggleField>
            </div>
          </div>
        </section>
      </div>
    </PopoverContent>
  </Popover>
</template>
