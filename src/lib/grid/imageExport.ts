import type { Feature, LineString } from "geojson";
import type { MapAdapter } from "@orbat-mapper/tactical-draw";
import type { GridAppearance } from "./appearance";
import {
  GRID_LABEL_HALO_COLOR,
  GRID_LABEL_METRICS,
  type GridReferenceLabel,
} from "./labels";
import { buildGridPortrayal, type GridPortrayalStatus } from "./portrayal";
import type { GridSettings } from "./types";

export type ImageExportGridStatus = GridPortrayalStatus;

export interface ImageExportGridRequest {
  settings: GridSettings;
  appearance: GridAppearance;
  /** Resolved editor background color used by the reference-label halo. */
  haloColor?: string;
}

export interface ImageExportGridPortrayal {
  features: Feature<LineString>[];
  labels: GridReferenceLabel[];
  status: ImageExportGridStatus;
}

/** Grid export is optional and best-effort: malformed or out-of-range definitions never fail PNG export. */
export function resolveImageExportGridPortrayal(
  adapter: MapAdapter,
  request: ImageExportGridRequest | undefined,
  globe: boolean,
): ImageExportGridPortrayal | null {
  if (!request) return null;
  try {
    return buildImageExportGridPortrayal(adapter, request, globe);
  } catch {
    return { features: [], labels: [], status: "portrayal-unavailable" };
  }
}

/** Build the exported grid through the same mode-specific portrayal seams as the editor. */
export function buildImageExportGridPortrayal(
  adapter: MapAdapter,
  request: ImageExportGridRequest,
  globe: boolean,
): ImageExportGridPortrayal {
  void globe;
  const portrayal = buildGridPortrayal(adapter, {
    configuration: request.settings,
    appearance: request.appearance,
  });
  return {
    features: portrayal.features,
    labels: portrayal.labels,
    status: portrayal.status,
  };
}

function labelPosition(label: GridReferenceLabel): {
  x: number;
  y: number;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
} {
  if (label.anchor === "bottom") {
    return {
      x: label.pixel[0],
      y: label.pixel[1] - GRID_LABEL_METRICS.baselineOffsetPx,
      align: "center",
      baseline: "bottom",
    };
  }
  if (label.anchor === "zone") {
    return {
      x: label.pixel[0] + GRID_LABEL_METRICS.zoneInsetPx,
      y: label.pixel[1] - GRID_LABEL_METRICS.zoneInsetPx,
      align: "left",
      baseline: "bottom",
    };
  }
  return {
    x: label.pixel[0] + (label.anchor === "left" ? GRID_LABEL_METRICS.edgeOffsetPx : 0),
    y: label.pixel[1],
    align: "left",
    baseline: "middle",
  };
}

/** Paint DOM-equivalent references after MapLibre has produced the export canvas. */
export function drawImageExportGridLabels(
  context: CanvasRenderingContext2D,
  labels: readonly GridReferenceLabel[],
  appearance: GridAppearance,
  scale = 1,
  haloColor = GRID_LABEL_HALO_COLOR,
): void {
  if (!labels.length) return;
  context.save();
  context.globalAlpha = appearance.opacity;
  context.font = `${GRID_LABEL_METRICS.weight} ${GRID_LABEL_METRICS.fontPx * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  context.lineJoin = "round";
  context.lineWidth = 4 * scale;
  context.strokeStyle = haloColor;
  context.fillStyle = appearance.color;
  for (const label of labels) {
    const position = labelPosition(label);
    context.textAlign = position.align;
    context.textBaseline = position.baseline;
    context.strokeText(label.text, position.x, position.y);
    context.fillText(label.text, position.x, position.y);
  }
  context.restore();
}
