<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import bboxPolygon from "@turf/bbox-polygon";
import { useMeasurementsStore } from "@/stores/geoStore";
import PrimaryButton from "@/components/PrimaryButton.vue";
import SecondaryButton from "@/components/SecondaryButton.vue";
import InputGroup from "@/components/InputGroup.vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import ExportViewfinderOverlay from "@/modules/maplibreview/imageExport/ExportViewfinderOverlay.vue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  boundsFromViewportFrame,
  checkExportSize,
  exportViewportFrame,
  exportMapByBounds,
  type ExportFormat,
  getMapAttributionText,
  isGeoreferencedFormat,
  isPaperPreset,
  type PaperOrientation,
  type PaperPreset,
  type SafeZoneInsets,
  type ViewportFrame,
  pixelsFromPaperPreset,
  renderBoundsToBlob,
  renderViewportFrameToBlob,
} from "@/modules/maplibreview/imageExport/mapLibreExport";

type Mode = "frame" | "bounds" | "rect";
type Bbox = [number, number, number, number];

// The preview only needs to convey framing/bounds, not output quality, so it is
// rendered downscaled and without sprite supersampling to keep it fast.
const PREVIEW_MAX_DIMENSION = 720;

function previewDimensions(width: number, height: number) {
  const longest = Math.max(width, height);
  if (longest <= PREVIEW_MAX_DIMENSION) return { width, height };
  const scale = PREVIEW_MAX_DIMENSION / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

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

const mode = ref<Mode>("frame");
const aspectRatio = ref("16:9");
const safeZone = ref("title");
const renderFrameBounds = ref(false);
const preset = ref<PaperPreset | "custom">("custom");
const orientation = ref<PaperOrientation>("landscape");
const dpi = ref(150);
const width = ref(1920);
const height = ref(1080);
const outputScale = ref(2);
const resetRotation = ref(false);
const showScaleBar = ref(false);
const showNorthArrow = ref(false);
const showCredits = ref(false);
const outputFormat = ref<ExportFormat>("png");
const fileName = ref("map");

const outputFormatItems = [
  { value: "png", label: "PNG" },
  { value: "world-file-zip", label: "PNG + world file (.zip)" },
  { value: "geotiff", label: "GeoTIFF (.tif)" },
];

const isGeoreferenced = computed(() => isGeoreferencedFormat(outputFormat.value));

const outputFileExtension = computed(() => {
  if (outputFormat.value === "world-file-zip") return ".zip";
  if (outputFormat.value === "geotiff") return ".tif";
  return ".png";
});

const exportButtonLabel = computed(() => {
  if (outputFormat.value === "world-file-zip") return "Export ZIP";
  if (outputFormat.value === "geotiff") return "Export GeoTIFF";
  return "Export PNG";
});

// The scale bar mirrors the map's current measurement units (the same store the
// live scale control reads), so an imperial/nautical map exports a matching bar.
const { measurementUnit } = storeToRefs(useMeasurementsStore());

const decorations = computed(() => ({
  scaleBar: showScaleBar.value,
  scaleUnit: measurementUnit.value,
  northArrow: showNorthArrow.value,
  credits: showCredits.value,
}));
const exporting = ref(false);
const previewing = ref(false);
const previewUrl = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

const customBounds = ref<Bbox>([0, 0, 0, 0]);
const viewfinderFrame = ref<ViewportFrame | null>(null);
const fitNonce = ref(0);

const modeItems = [
  { value: "frame", label: "Viewfinder frame" },
  // Limited to the viewfinder frame for now while it's being tested.
  // Re-enable these once the frame export is validated.
  // { value: "rect", label: "Drawn rectangle" },
  // { value: "bounds", label: "Geographic bounding box" },
];

const aspectRatioItems = [
  { value: "free", label: "Free" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "a4-landscape", label: "A4 landscape" },
  { value: "a4-portrait", label: "A4 portrait" },
];

// Safe-zone presets. Symmetric margins (action/title-safe) are the broadcast
// convention; the platform presets use asymmetric per-edge insets because the
// app's UI chrome covers specific regions (e.g. caption + action buttons on a
// 9:16 story), and they set the matching frame aspect ratio.
type SafeZonePreset = {
  value: string;
  label: string;
  insets: SafeZoneInsets | null;
  aspectRatio?: string;
};

const SAFE_ZONE_PRESETS: SafeZonePreset[] = [
  { value: "none", label: "None", insets: null },
  {
    value: "action",
    label: "Action-safe (95%)",
    insets: { top: 0.025, right: 0.025, bottom: 0.025, left: 0.025 },
  },
  {
    value: "title",
    label: "Title-safe (90%)",
    insets: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 },
  },
  {
    value: "story",
    label: "Story / Reel (9:16)",
    insets: { top: 0.13, right: 0.06, bottom: 0.2, left: 0.06 },
    aspectRatio: "9:16",
  },
  {
    value: "youtube",
    label: "YouTube thumbnail (16:9)",
    insets: { top: 0.05, right: 0.05, bottom: 0.12, left: 0.05 },
    aspectRatio: "16:9",
  },
];

const safeZoneItems = SAFE_ZONE_PRESETS.map(({ value, label }) => ({ value, label }));

const safeZoneInsets = computed<SafeZoneInsets | null>(
  () => SAFE_ZONE_PRESETS.find((p) => p.value === safeZone.value)?.insets ?? null,
);

// Platform presets imply a frame shape, so adopt their aspect ratio on select.
watch(safeZone, (value) => {
  const preset = SAFE_ZONE_PRESETS.find((p) => p.value === value);
  if (preset?.aspectRatio) aspectRatio.value = preset.aspectRatio;
});

// Reset rotation isn't offered in frame mode (the frame captures the live
// camera as-is), so clear any value carried over from another mode. The
// georeferenced override is applied at submit time via `effectiveResetRotation`
// — keeping the model itself clean here avoids stale state when the user
// switches a georeferenced format back to PNG.
watch(mode, (value) => {
  if (value === "frame") resetRotation.value = false;
});

// Both georeferenced formats embed an axis-aligned affine, so we force the
// north-up render and suppress decorations when one is active. These are
// applied at submit time (see effectiveResetRotation / effectiveDecorations)
// rather than as side-effects on the model, so the user's decoration toggles
// and rotation choice survive switching format back to PNG.
const effectiveResetRotation = computed(
  () => isGeoreferenced.value || resetRotation.value,
);
const effectiveDecorations = computed(() =>
  isGeoreferenced.value ? undefined : decorations.value,
);

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

const aspectRatioValue = computed(() => {
  switch (aspectRatio.value) {
    case "16:9":
      return 16 / 9;
    case "9:16":
      return 9 / 16;
    case "4:3":
      return 4 / 3;
    case "1:1":
      return 1;
    case "a4-landscape":
      return 297 / 210;
    case "a4-portrait":
      return 210 / 297;
    default:
      return null;
  }
});

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

// Final pixel dimensions = base size × output scale. The scale multiplies the
// file so every layer (symbols included) gets more pixels rather than being
// downscaled back to the base size. The base is the frame's on-screen size, or
// the typed width/height for bounds/rect.
const baseSize = computed(() =>
  mode.value === "frame"
    ? {
        width: viewfinderFrame.value?.width ?? 0,
        height: viewfinderFrame.value?.height ?? 0,
      }
    : { width: width.value, height: height.value },
);
const outputWidth = computed(() => Math.round(baseSize.value.width * outputScale.value));
const outputHeight = computed(() =>
  Math.round(baseSize.value.height * outputScale.value),
);
// Short side of the full-resolution export. The preview renders downscaled, so
// it passes this so resolution-dependent decorations (credits) are sized as
// they'll appear in the export rather than from the smaller preview.
const outputShortSide = computed(() => Math.min(outputWidth.value, outputHeight.value));

const sizeError = computed(() => {
  // The frame size isn't known until it's placed; skip pre-validation then and
  // let the export throw with a clear message if it's somehow oversized.
  if (mode.value === "frame" && !viewfinderFrame.value) return null;
  return checkExportSize(outputWidth.value, outputHeight.value);
});

const boundsError = computed(() => {
  if (mode.value !== "bounds") return null;
  const [w, s, e, n] = customBounds.value;
  if (e <= w) return "East must be greater than west.";
  if (n <= s) return "North must be greater than south.";
  return null;
});

const busy = computed(() => exporting.value || previewing.value);

const canExport = computed(
  () =>
    !busy.value &&
    !sizeError.value &&
    !boundsError.value &&
    (mode.value !== "frame" || !!viewfinderFrame.value),
);

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

// A preview reflects the framing inputs; drop it once those change so a stale
// image can't be mistaken for the current bounds. Output-quality settings
// (pixel/sprite ratio) don't affect the preview, so they're excluded;
// resetRotation does change framing, so it's included.
watch(
  [
    mode,
    width,
    height,
    customBounds,
    resetRotation,
    renderFrameBounds,
    showScaleBar,
    showNorthArrow,
    showCredits,
    // outputFormat does not affect the preview pixels (preview is always the
    // downscaled rendered raster, regardless of zip/tiff wrapping), so it's
    // intentionally not in this list — switching formats keeps the preview.
    () => props.drawnBounds,
    viewfinderFrame,
  ],
  clearPreview,
  { deep: true },
);

onBeforeUnmount(clearPreview);

// --- Export-area overlay ---
// Draw the rectangle/bounding box that will be exported on the map so the user
// can see the selected area. Null in frame mode (the viewfinder overlay shows it).
const AREA_SOURCE = "__exportAreaSource";
const AREA_FILL = "__exportAreaFill";
const AREA_LINE = "__exportAreaLine";
const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

const exportArea = computed<Bbox | null>(() => {
  if (mode.value === "rect") return props.drawnBounds ?? null;
  if (mode.value === "bounds") return boundsError.value ? null : customBounds.value;
  return null;
});

function ensureAreaLayers() {
  const map = props.map;
  if (typeof map.getSource !== "function") return;
  if (!map.getSource(AREA_SOURCE)) {
    map.addSource(AREA_SOURCE, { type: "geojson", data: EMPTY_FC });
  }
  if (!map.getLayer(AREA_FILL)) {
    map.addLayer({
      id: AREA_FILL,
      type: "fill",
      source: AREA_SOURCE,
      paint: { "fill-color": "rgba(37, 99, 235, 0.1)" },
    });
  }
  if (!map.getLayer(AREA_LINE)) {
    map.addLayer({
      id: AREA_LINE,
      type: "line",
      source: AREA_SOURCE,
      paint: { "line-color": "#2563eb", "line-width": 2 },
    });
  }
}

function drawExportArea(bbox: Bbox | null) {
  const map = props.map;
  if (typeof map.getSource !== "function") return;
  if (!bbox) {
    (map.getSource(AREA_SOURCE) as GeoJSONSource | undefined)?.setData(EMPTY_FC);
    return;
  }
  ensureAreaLayers();
  (map.getSource(AREA_SOURCE) as GeoJSONSource | undefined)?.setData(bboxPolygon(bbox));
}

// Hide the overlay while rendering so it isn't baked into the exported PNG
// (the bounds export clones the live map style, overlay layers included).
function setExportAreaVisible(visible: boolean) {
  const map = props.map;
  if (typeof map.getLayer !== "function") return;
  const v = visible ? "visible" : "none";
  if (map.getLayer(AREA_FILL)) map.setLayoutProperty(AREA_FILL, "visibility", v);
  if (map.getLayer(AREA_LINE)) map.setLayoutProperty(AREA_LINE, "visibility", v);
}

function removeAreaLayers() {
  const map = props.map;
  if (typeof map.getLayer !== "function") return;
  if (map.getLayer(AREA_LINE)) map.removeLayer(AREA_LINE);
  if (map.getLayer(AREA_FILL)) map.removeLayer(AREA_FILL);
  if (map.getSource(AREA_SOURCE)) map.removeSource(AREA_SOURCE);
}

watch(exportArea, (bbox) => drawExportArea(bbox), { immediate: true });
onBeforeUnmount(removeAreaLayers);

watch(
  () => props.drawnBounds,
  (bbox) => {
    if (!bbox || preset.value !== "custom") return;
    // Default the base size to the rectangle's on-screen pixel size by sampling
    // the screen-projection of two corners; gives a sensible WYSIWYG starting
    // size without forcing the user to type dimensions. Output scale then
    // multiplies this for higher resolution.
    const a = props.map.project([bbox[0], bbox[3]]);
    const b = props.map.project([bbox[2], bbox[1]]);
    width.value = Math.max(1, Math.round(Math.abs(b.x - a.x)));
    height.value = Math.max(1, Math.round(Math.abs(b.y - a.y)));
  },
);

onMounted(() => {
  errorMsg.value = null;
  try {
    // Credit the basemap by default whenever it declares attribution (most
    // tile providers require visible attribution on shared images).
    showCredits.value = !!getMapAttributionText(props.map);
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

function onFitCurrentView() {
  fitNonce.value += 1;
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
  setExportAreaVisible(false);
  try {
    const name = (fileName.value || "map").trim();
    if (mode.value === "frame") {
      if (!viewfinderFrame.value) {
        errorMsg.value = "Place the export frame on the map first.";
        return;
      }
      if (renderFrameBounds.value) {
        await exportMapByBounds(props.map, {
          bounds: boundsFromViewportFrame(props.map, viewfinderFrame.value),
          width: outputWidth.value,
          height: outputHeight.value,
          outputScale: 1,
          symbolPixelRatio: outputScale.value,
          symbolDisplayScale: outputScale.value,
          resetRotation: effectiveResetRotation.value,
          decorations: effectiveDecorations.value,
          outputFormat: outputFormat.value,
          fileName: name,
        });
      } else {
        await exportViewportFrame(props.map, viewfinderFrame.value, {
          outputScale: outputScale.value,
          resetRotation: effectiveResetRotation.value,
          decorations: effectiveDecorations.value,
          outputFormat: outputFormat.value,
          fileName: name,
        });
      }
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
        outputScale: outputScale.value,
        resetRotation: effectiveResetRotation.value,
        decorations: effectiveDecorations.value,
        outputFormat: outputFormat.value,
        fileName: name,
      });
    }
    emit("exported");
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : String(err);
  } finally {
    setExportAreaVisible(true);
    exporting.value = false;
  }
}

async function onPreview() {
  if (busy.value || sizeError.value || boundsError.value) return;
  errorMsg.value = null;
  previewing.value = true;
  setExportAreaVisible(false);
  try {
    let blob: Blob | null;
    if (mode.value === "frame") {
      if (!viewfinderFrame.value) {
        errorMsg.value = "Place the export frame on the map first.";
        return;
      }
      if (renderFrameBounds.value) {
        const { width: pw, height: ph } = previewDimensions(
          outputWidth.value,
          outputHeight.value,
        );
        const previewDisplayScale =
          outputWidth.value > 0 ? outputScale.value * (pw / outputWidth.value) : 1;
        blob = await renderBoundsToBlob(props.map, {
          bounds: boundsFromViewportFrame(props.map, viewfinderFrame.value),
          width: pw,
          height: ph,
          outputScale: 1,
          symbolPixelRatio: outputScale.value,
          symbolDisplayScale: previewDisplayScale,
          resetRotation: effectiveResetRotation.value,
          decorations: effectiveDecorations.value,
          decorationReferenceShortSide: outputShortSide.value,
        });
      } else {
        blob = await renderViewportFrameToBlob(props.map, viewfinderFrame.value, {
          outputScale: 1,
          resetRotation: effectiveResetRotation.value,
          decorations: effectiveDecorations.value,
          decorationReferenceShortSide: outputShortSide.value,
        });
      }
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
      const { width: pw, height: ph } = previewDimensions(width.value, height.value);
      blob = await renderBoundsToBlob(props.map, {
        bounds: [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        width: pw,
        height: ph,
        outputScale: 1,
        resetRotation: effectiveResetRotation.value,
        decorations: effectiveDecorations.value,
        decorationReferenceShortSide: outputShortSide.value,
      });
    }
    if (!blob) {
      errorMsg.value = "Could not render a preview.";
      return;
    }
    clearPreview();
    previewUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : String(err);
  } finally {
    setExportAreaVisible(true);
    previewing.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <SimpleSelect v-model="mode" label="Export area" :items="modeItems" />

    <ExportViewfinderOverlay
      v-if="mode === 'frame'"
      :map="map"
      :aspect-ratio="aspectRatioValue"
      :fit-nonce="fitNonce"
      :safe-zone="safeZoneInsets"
      @update:frame="viewfinderFrame = $event"
    />

    <div v-if="mode === 'frame'" class="space-y-3">
      <SimpleSelect
        v-model="aspectRatio"
        label="Frame aspect ratio"
        :items="aspectRatioItems"
      />
      <SimpleSelect v-model="safeZone" label="Safe zone" :items="safeZoneItems" />
      <div class="flex items-center justify-between gap-3">
        <p class="text-muted-foreground text-sm">
          Drag or resize the frame on the map. The exported PNG will match that visible
          area.
        </p>
        <SecondaryButton type="button" class="shrink-0" @click="onFitCurrentView">
          Fit current view
        </SecondaryButton>
      </div>
      <InputCheckbox
        v-model="renderFrameBounds"
        label="Render more map detail"
        description="Fit the frame's map bounds into the export for higher detail at large output scales. Warning: framing may not match the view, especially when rotated or tilted."
      />
    </div>

    <div v-if="mode === 'rect'" class="space-y-2">
      <p class="text-muted-foreground text-sm">
        <template v-if="drawnBounds">
          Rectangle selected. The export will cover the same geographic area at the chosen
          output size.
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

    <div v-if="mode !== 'frame'" class="space-y-3">
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

    <div class="space-y-1">
      <NumberInputGroup
        v-model="outputScale"
        label="Output scale"
        description="Multiplies the final image size. Higher values give symbols, labels and the basemap more pixels (sharper), but a larger file."
        :min="1"
        :max="20"
        :step="1"
      />
      <p v-if="outputWidth > 0" class="text-muted-foreground text-xs">
        Final image: {{ outputWidth }} × {{ outputHeight }} px
      </p>
    </div>

    <InputCheckbox
      v-if="mode !== 'frame'"
      v-model="resetRotation"
      label="Reset rotation (north up)"
      description="Export with the map flattened and pointing north, ignoring the current rotation and tilt."
    />

    <div class="space-y-1">
      <SimpleSelect
        v-model="outputFormat"
        label="Output format"
        :items="outputFormatItems"
      />
      <p v-if="isGeoreferenced" class="text-muted-foreground text-xs">
        Exports north-up and top-down — the embedded affine assumes axis
        alignment, so the rendered area may differ from the viewfinder framing
        when the live map is rotated. Annotations are disabled while a
        georeferenced format is selected.
      </p>
    </div>

    <fieldset class="space-y-2" :disabled="isGeoreferenced">
      <legend
        class="text-sm font-medium"
        :class="isGeoreferenced ? 'text-muted-foreground' : 'text-foreground'"
      >
        Annotations
      </legend>
      <InputCheckbox
        v-model="showScaleBar"
        :disabled="isGeoreferenced"
        label="Scale bar"
        description="Draw a distance scale bar in the lower-left corner."
      />
      <InputCheckbox
        v-model="showNorthArrow"
        :disabled="isGeoreferenced"
        label="North arrow"
        description="Draw a compass arrow in the upper-right, oriented to the map's rotation."
      />
      <InputCheckbox
        v-model="showCredits"
        :disabled="isGeoreferenced"
        label="Map credits"
        description="Print the basemap attribution in the lower-right corner."
      />
    </fieldset>

    <InputGroup
      v-model="fileName"
      label="File name"
      :description="`Saved as ${outputFileExtension}.`"
    />

    <Alert v-if="sizeError" variant="destructive">
      <AlertDescription>{{ sizeError }}</AlertDescription>
    </Alert>
    <Alert v-if="errorMsg" variant="destructive">
      <AlertDescription>{{ errorMsg }}</AlertDescription>
    </Alert>

    <figure v-if="previewUrl" class="space-y-1">
      <img
        :src="previewUrl"
        alt="Export preview"
        class="bg-muted max-h-72 w-full rounded border object-contain"
      />
      <figcaption class="text-muted-foreground text-xs">
        Preview of the exported image.
      </figcaption>
    </figure>

    <div class="flex items-center justify-end gap-2 pt-2">
      <SecondaryButton v-if="cancelable" type="button" @click="emit('cancel')">
        Cancel
      </SecondaryButton>
      <SecondaryButton type="button" :disabled="!canExport" @click="onPreview">
        {{ previewing ? "Rendering…" : "Preview" }}
      </SecondaryButton>
      <PrimaryButton type="submit" :disabled="!canExport">
        {{ exporting ? "Exporting…" : exportButtonLabel }}
      </PrimaryButton>
    </div>
  </form>
</template>
