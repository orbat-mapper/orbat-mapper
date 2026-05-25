<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import PrimaryButton from "@/components/PrimaryButton.vue";
import SecondaryButton from "@/components/SecondaryButton.vue";
import InputGroup from "@/components/InputGroup.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  checkExportSize,
  exportMapByBounds,
  exportViewportAtPixelRatio,
  isPaperPreset,
  type PaperOrientation,
  type PaperPreset,
  pixelsFromPaperPreset,
} from "@/modules/maplibreview/mapLibreExport";

type Mode = "viewport" | "bounds" | "rect";
type Bbox = [number, number, number, number];

const props = withDefaults(
  defineProps<{
    map: MlMap;
    drawnBounds?: Bbox | null;
    cancelable?: boolean;
  }>(),
  { cancelable: false },
);

const emit = defineEmits<{
  (e: "request-draw-rect"): void;
  (e: "exported"): void;
  (e: "cancel"): void;
}>();

const mode = ref<Mode>("viewport");
const preset = ref<PaperPreset | "custom">("custom");
const orientation = ref<PaperOrientation>("landscape");
const dpi = ref(150);
const width = ref(1920);
const height = ref(1080);
const pixelRatio = ref(2);
const spritePixelRatio = ref(2);
const fileName = ref("map");
const exporting = ref(false);
const errorMsg = ref<string | null>(null);

const customBounds = ref<Bbox>([0, 0, 0, 0]);

const modeItems = [
  { value: "viewport", label: "Current viewport" },
  { value: "rect", label: "Drawn rectangle" },
  { value: "bounds", label: "Geographic bounding box" },
];

const presetItems = [
  { value: "custom", label: "Custom" },
  { value: "a4", label: "A4 (paper)" },
  { value: "letter", label: "Letter (paper)" },
  { value: "slide-16-9", label: "16:9 slide (1920×1080)" },
  { value: "uhd-4k", label: "4K (3840×2160)" },
];

const orientationItems = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
];

const presetIsPaper = computed(
  () => preset.value !== "custom" && isPaperPreset(preset.value as PaperPreset),
);

watch([preset, orientation, dpi], () => {
  if (preset.value === "custom") return;
  const px = pixelsFromPaperPreset(
    preset.value as PaperPreset,
    dpi.value,
    orientation.value,
  );
  width.value = px.width;
  height.value = px.height;
});

const sizeError = computed(() =>
  mode.value === "viewport" ? null : checkExportSize(width.value, height.value),
);

const boundsError = computed(() => {
  if (mode.value !== "bounds") return null;
  const [w, s, e, n] = customBounds.value;
  if (e <= w) return "East must be greater than west.";
  if (n <= s) return "North must be greater than south.";
  return null;
});

const canExport = computed(
  () => !exporting.value && !sizeError.value && !boundsError.value,
);

watch(
  () => props.drawnBounds,
  (bbox) => {
    if (!bbox || preset.value !== "custom") return;
    // Default the export size from the drawn rectangle's aspect by sampling
    // the screen-projection of two corners; gives a sensible starting size
    // without forcing the user to type dimensions.
    const a = props.map.project([bbox[0], bbox[3]]);
    const b = props.map.project([bbox[2], bbox[1]]);
    width.value = Math.max(1, Math.round(Math.abs(b.x - a.x) * 2));
    height.value = Math.max(1, Math.round(Math.abs(b.y - a.y) * 2));
  },
);

onMounted(() => {
  errorMsg.value = null;
  try {
    const b = props.map.getBounds?.();
    if (b) customBounds.value = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const canvas = props.map.getCanvas?.();
    if (canvas && preset.value === "custom") {
      width.value = canvas.clientWidth || width.value;
      height.value = canvas.clientHeight || height.value;
    }
  } catch {
    // Tests and some early-mount states may not have a full map.
  }
});

function onUseCurrentView() {
  const b = props.map.getBounds();
  customBounds.value = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

function setBoundsComponent(i: 0 | 1 | 2 | 3, value: number) {
  const next = [...customBounds.value] as Bbox;
  next[i] = value;
  customBounds.value = next;
}

async function onSubmit() {
  if (!canExport.value) return;
  errorMsg.value = null;
  exporting.value = true;
  try {
    const name = (fileName.value || "map").trim();
    if (mode.value === "viewport") {
      await exportViewportAtPixelRatio(props.map, {
        pixelRatio: pixelRatio.value,
        fileName: name,
      });
    } else {
      let bbox: Bbox;
      if (mode.value === "rect") {
        if (!props.drawnBounds) {
          errorMsg.value = "Draw a rectangle on the map first.";
          return;
        }
        bbox = props.drawnBounds;
      } else {
        bbox = customBounds.value;
      }
      await exportMapByBounds(props.map, {
        bounds: [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        width: width.value,
        height: height.value,
        spritePixelRatio: spritePixelRatio.value,
        fileName: name,
      });
    }
    emit("exported");
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : String(err);
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <SimpleSelect v-model="mode" label="Export area" :items="modeItems" />

    <div v-if="mode === 'rect'" class="space-y-2">
      <p class="text-muted-foreground text-sm">
        <template v-if="drawnBounds">
          Rectangle selected. The export will cover the same geographic area at the
          chosen output size.
        </template>
        <template v-else>No rectangle drawn yet.</template>
      </p>
      <SecondaryButton type="button" @click="emit('request-draw-rect')">
        {{ drawnBounds ? "Redraw rectangle" : "Draw rectangle on map" }}
      </SecondaryButton>
    </div>

    <div v-if="mode === 'bounds'" class="space-y-2">
      <div class="grid grid-cols-2 gap-3">
        <NumberInputGroup
          :model-value="customBounds[0]"
          @update:model-value="setBoundsComponent(0, $event ?? 0)"
          label="West (lon)"
          :step="0.001"
        />
        <NumberInputGroup
          :model-value="customBounds[2]"
          @update:model-value="setBoundsComponent(2, $event ?? 0)"
          label="East (lon)"
          :step="0.001"
        />
        <NumberInputGroup
          :model-value="customBounds[1]"
          @update:model-value="setBoundsComponent(1, $event ?? 0)"
          label="South (lat)"
          :step="0.001"
        />
        <NumberInputGroup
          :model-value="customBounds[3]"
          @update:model-value="setBoundsComponent(3, $event ?? 0)"
          label="North (lat)"
          :step="0.001"
        />
      </div>
      <SecondaryButton type="button" @click="onUseCurrentView">
        Use current map view
      </SecondaryButton>
      <p v-if="boundsError" class="text-destructive text-sm">{{ boundsError }}</p>
    </div>

    <div v-if="mode !== 'viewport'" class="space-y-3">
      <SimpleSelect v-model="preset" label="Preset" :items="presetItems" />
      <div v-if="presetIsPaper" class="grid grid-cols-2 gap-3">
        <SimpleSelect
          v-model="orientation"
          label="Orientation"
          :items="orientationItems"
        />
        <NumberInputGroup v-model="dpi" label="DPI" :min="72" :max="600" :step="1" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <NumberInputGroup
          v-model="width"
          label="Width (px)"
          :min="1"
          :step="1"
          :disabled="preset !== 'custom'"
        />
        <NumberInputGroup
          v-model="height"
          label="Height (px)"
          :min="1"
          :step="1"
          :disabled="preset !== 'custom'"
        />
      </div>
    </div>

    <NumberInputGroup
      v-if="mode === 'viewport'"
      v-model="pixelRatio"
      label="Pixel ratio"
      :min="1"
      :max="8"
      :step="0.5"
    />
    <NumberInputGroup
      v-else
      v-model="spritePixelRatio"
      label="Symbol sprite pixel ratio"
      :min="1"
      :max="4"
      :step="1"
    />

    <InputGroup v-model="fileName" label="File name" />

    <Alert v-if="sizeError" variant="destructive">
      <AlertDescription>{{ sizeError }}</AlertDescription>
    </Alert>
    <Alert v-if="errorMsg" variant="destructive">
      <AlertDescription>{{ errorMsg }}</AlertDescription>
    </Alert>

    <div class="flex items-center justify-end gap-2 pt-2">
      <SecondaryButton v-if="cancelable" type="button" @click="emit('cancel')">
        Cancel
      </SecondaryButton>
      <PrimaryButton type="submit" :disabled="!canExport">
        {{ exporting ? "Exporting…" : "Export PNG" }}
      </PrimaryButton>
    </div>
  </form>
</template>
