/**
 * The picker's preview geometry — a thin wrapper over the library's own preview
 * subpath.
 *
 * `renderRepresentative` draws a kind's canonical sample and `projectRenderToShapes`
 * fits it into a viewBox, so nothing here recomputes geometry: the host only picks the
 * box, the fallback font size and the colours. Keeping the wrapper pure (no component,
 * no map) is what makes it testable and lets the toolbar button and the picker row
 * share one model.
 */
import {
  projectRenderToShapes,
  renderRepresentative,
  viewBoxString,
} from "@orbat-mapper/control-measures/preview";
import type {
  PreviewShape,
  ProjectDimensions,
} from "@orbat-mapper/control-measures/preview";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

/**
 * The box every preview is fit into. Unitless — the SVG scales to whatever size the
 * consumer gives the element — so one set of numbers serves a 20 px toolbar button and
 * a 40 px picker row.
 */
export const CONTROL_MEASURE_PREVIEW_DIMENSIONS: ProjectDimensions = {
  width: 100,
  height: 100,
  pad: 8,
};

/** Font size used for a label that carries no ground-anchored sizing of its own. */
export const PREVIEW_FALLBACK_FONT_SIZE = 14;

/** Radius of a `circle` shape, which the library leaves to the consumer. */
export const PREVIEW_VERTEX_RADIUS = 3;

export function previewFontSize(shape: PreviewShape): number {
  return shape.heightPx ?? PREVIEW_FALLBACK_FONT_SIZE;
}

export interface ControlMeasurePreviewModel {
  shapes: PreviewShape[];
  /** `false` for an empty or degenerate render — consumers show a fallback glyph. */
  ok: boolean;
  viewBox: string;
}

export function buildControlMeasurePreview(
  kind: ControlMeasureId,
  dims: ProjectDimensions = CONTROL_MEASURE_PREVIEW_DIMENSIONS,
): ControlMeasurePreviewModel {
  const { shapes, ok } = projectRenderToShapes(renderRepresentative(kind), dims);
  // The plain box fits geometry only, so an anchored label can hang outside it.
  return { shapes, ok, viewBox: viewBoxString(shapes, dims, previewFontSize) };
}
