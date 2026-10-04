import { ref, watch } from "vue";
import { defineStore } from "pinia";
export type ReferenceGridMode = "mgrs" | "latlong";
export type MgrsGridInterval = 100 | 1_000 | 10_000 | 100_000;

export const REFERENCE_GRID_STORAGE_KEY = "orbat-mapper:reference-grid";

const MGRS_INTERVALS = new Set<MgrsGridInterval>([100, 1_000, 10_000, 100_000]);
const MIN_GRID_STROKE_WIDTH = 0.1;
const MAX_GRID_STROKE_WIDTH = 8;

function isGridColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

interface StoredReferenceGridPreferences {
  mode: ReferenceGridMode;
  mgrsInterval: MgrsGridInterval;
  latLongInterval: number;
  color: string;
  opacity: number;
  strokeWidth: number;
}

function defaults(): StoredReferenceGridPreferences {
  return {
    mode: "mgrs",
    mgrsInterval: 1_000,
    latLongInterval: 0.01,
    color: "#658cbb",
    opacity: 0.52,
    strokeWidth: 1,
  };
}

function positiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function loadPreferences(): StoredReferenceGridPreferences {
  const fallback = defaults();
  if (typeof localStorage === "undefined") return fallback;
  try {
    const stored = JSON.parse(
      localStorage.getItem(REFERENCE_GRID_STORAGE_KEY) ?? "null",
    ) as Partial<StoredReferenceGridPreferences> | null;
    if (!stored) return fallback;
    return {
      mode: stored.mode === "latlong" ? "latlong" : "mgrs",
      mgrsInterval: MGRS_INTERVALS.has(stored.mgrsInterval as MgrsGridInterval)
        ? (stored.mgrsInterval as MgrsGridInterval)
        : fallback.mgrsInterval,
      latLongInterval: positiveFinite(stored.latLongInterval)
        ? stored.latLongInterval
        : fallback.latLongInterval,
      color: isGridColor(stored.color) ? stored.color.toLowerCase() : fallback.color,
      opacity:
        typeof stored.opacity === "number" &&
        Number.isFinite(stored.opacity) &&
        stored.opacity >= 0 &&
        stored.opacity <= 1
          ? stored.opacity
          : fallback.opacity,
      strokeWidth:
        typeof stored.strokeWidth === "number" &&
        Number.isFinite(stored.strokeWidth) &&
        stored.strokeWidth >= MIN_GRID_STROKE_WIDTH &&
        stored.strokeWidth <= MAX_GRID_STROKE_WIDTH
          ? stored.strokeWidth
          : fallback.strokeWidth,
    };
  } catch {
    return fallback;
  }
}

export const useReferenceGridStore = defineStore("referenceGrid", () => {
  const initial = loadPreferences();
  const visible = ref(false);
  const mode = ref<ReferenceGridMode>(initial.mode);
  const mgrsInterval = ref<MgrsGridInterval>(initial.mgrsInterval);
  const latLongInterval = ref(initial.latLongInterval);
  const color = ref(initial.color);
  const opacity = ref(initial.opacity);
  const strokeWidth = ref(initial.strokeWidth);

  function setMode(value: ReferenceGridMode) {
    mode.value = value;
  }

  function setMgrsInterval(value: MgrsGridInterval) {
    if (MGRS_INTERVALS.has(value)) mgrsInterval.value = value;
  }

  function setLatLongInterval(value: number) {
    if (positiveFinite(value)) latLongInterval.value = value;
  }

  function setColor(value: string) {
    if (isGridColor(value)) color.value = value.toLowerCase();
  }

  function setOpacity(value: number) {
    if (Number.isFinite(value) && value >= 0 && value <= 1) opacity.value = value;
  }

  function setStrokeWidth(value: number) {
    if (
      Number.isFinite(value) &&
      value >= MIN_GRID_STROKE_WIDTH &&
      value <= MAX_GRID_STROKE_WIDTH
    ) {
      strokeWidth.value = value;
    }
  }

  watch(
    [mode, mgrsInterval, latLongInterval, color, opacity, strokeWidth],
    () => {
      try {
        localStorage.setItem(
          REFERENCE_GRID_STORAGE_KEY,
          JSON.stringify({
            mode: mode.value,
            mgrsInterval: mgrsInterval.value,
            latLongInterval: latLongInterval.value,
            color: color.value,
            opacity: opacity.value,
            strokeWidth: strokeWidth.value,
          } satisfies StoredReferenceGridPreferences),
        );
      } catch {
        // Live preferences continue to work when browser storage is unavailable.
      }
    },
    { flush: "sync" },
  );

  return {
    visible,
    mode,
    mgrsInterval,
    latLongInterval,
    color,
    opacity,
    strokeWidth,
    setMode,
    setMgrsInterval,
    setLatLongInterval,
    setColor,
    setOpacity,
    setStrokeWidth,
  };
});
