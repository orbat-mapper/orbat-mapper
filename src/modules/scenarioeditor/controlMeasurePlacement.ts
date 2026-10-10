/**
 * Placing a control measure by dropping it on the map rather than clicking its points.
 *
 * Ported from tactrace's placement drag. The catalogue tile shows the kind's
 * representative sample, so a drop places that same shape, fitted to a fixed on-screen
 * footprint around the drop point. The fit runs in a top-down plane at the view's zoom
 * and bearing rather than through the live camera, so a pitched view or terrain places
 * the same shape a flat view would: only the drop point comes off the screen.
 */
import { applyBoxTransformOptions } from "@orbat-mapper/control-measures";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import {
  renderRepresentative,
  representativeSample,
} from "@orbat-mapper/control-measures/preview";
import { coordAll } from "@turf/meta";
import type { Position } from "geojson";
import { latitudeToMercatorY, mercatorYToLatitude } from "@/geo/mercator";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

/** The longest side of a dropped measure, in screen pixels at the drop zoom. */
export const CONTROL_MEASURE_PLACEMENT_FOOTPRINT_PX = 160;

/**
 * What a placement reads from the camera: the zoom and bearing that size and orient the
 * footprint. Pitch and terrain are deliberately absent — they change where the drop
 * lands, not the shape placed there.
 */
export interface ControlMeasurePlacementView {
  zoom: number;
  bearing: number;
}

export interface ControlMeasurePlacement {
  controlPoints: Position[];
  options: TacticalGraphicOptions;
}

interface PlanePoint {
  x: number;
  y: number;
}

/**
 * A top-down Web Mercator screen plane at the view's zoom and bearing, with `origin` at
 * pixel [0, 0] — the screen an untilted camera over flat ground would show.
 */
function topDownPlane(view: ControlMeasurePlacementView, origin: Position) {
  const pixelsPerRadian = (512 * 2 ** view.zoom) / (2 * Math.PI);
  const bearing = (view.bearing * Math.PI) / 180;
  const [cos, sin] = [Math.cos(bearing), Math.sin(bearing)];
  const originX = (origin[0] * Math.PI) / 180;
  const originY = latitudeToMercatorY(origin[1]);
  return {
    project(position: Position): PlanePoint {
      const dx = ((position[0] * Math.PI) / 180 - originX) * pixelsPerRadian;
      const dy = -(latitudeToMercatorY(position[1]) - originY) * pixelsPerRadian;
      return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
    },
    unproject({ x, y }: PlanePoint): Position {
      const dx = x * cos - y * sin;
      const dy = x * sin + y * cos;
      return [
        ((originX + dx / pixelsPerRadian) * 180) / Math.PI,
        mercatorYToLatitude(originY - dy / pixelsPerRadian),
      ];
    },
  };
}

/**
 * Fit the kind's representative sample to the placement footprint and transplant its
 * control points around `ground`, the coordinate under the drop pixel.
 *
 * `options` are the options the measure would be drawn with, and the only ones it is
 * stored with: the sample's own options are tuned for a thumbnail (label sizes, a
 * smoothed outline) and only fill in underneath while the footprint is measured. Ground
 * size options the library scales with a shape are patched by the fit, so an arrowhead
 * or a task glyph keeps its proportion to the placed geometry. Screen (`…Pixels`) sizes
 * are kept as authored: a bare render ignores them, so they take no part in the fit.
 * `null` when the kind has no usable sample.
 */
export function controlMeasurePlacementAt(
  kind: ControlMeasureId,
  options: TacticalGraphicOptions | undefined,
  ground: Position,
  view: ControlMeasurePlacementView,
): ControlMeasurePlacement | null {
  const sample = representativeSample(kind);
  if (!sample.controlPoints.length) return null;
  // A single-point kind is placed exactly as a click would draw it: there is no sample
  // geometry to fit, so the sample's options, tuned to its own extent, stay out.
  if (sample.controlPoints.length === 1) {
    return { controlPoints: [[ground[0], ground[1]]], options: { ...options } };
  }
  const fitOptions = { ...sample.options, ...options } as TacticalGraphicOptions;
  const source = topDownPlane(view, sample.controlPoints[0]);
  const destination = topDownPlane(view, ground);
  const rendered = renderRepresentative(kind, {
    options: fitOptions as Record<string, unknown>,
    // Labels are left blank on a placed measure, so they must not size the footprint.
    textAmplifiers: Object.fromEntries(
      Object.keys(sample.textAmplifiers ?? {}).map((key) => [key, ""]),
    ),
  });
  const pixels = rendered.features.flatMap((feature) =>
    coordAll(feature.geometry).map((position) => source.project(position)),
  );
  if (!pixels.length) return null;
  const minX = Math.min(...pixels.map(({ x }) => x));
  const minY = Math.min(...pixels.map(({ y }) => y));
  const maxX = Math.max(...pixels.map(({ x }) => x));
  const maxY = Math.max(...pixels.map(({ y }) => y));
  const span = Math.max(maxX - minX, maxY - minY);
  if (!(span > 0) || !Number.isFinite(span)) return null;
  const scale = CONTROL_MEASURE_PLACEMENT_FOOTPRINT_PX / span;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const controlPoints = sample.controlPoints.map((position) => {
    const point = source.project(position);
    return destination.unproject({
      x: (point.x - centerX) * scale,
      y: (point.y - centerY) * scale,
    });
  });
  if (controlPoints.some((position) => position.some((value) => !Number.isFinite(value))))
    return null;
  const optionPatch = applyBoxTransformOptions(kind, fitOptions as never, {
    scale,
    rotationRadians: 0,
  }) as TacticalGraphicOptions | undefined;
  // `scale` maps the sample's ground extent to screen pixels at this zoom, so applied
  // to a size already in screen pixels it would vary with zoom, not with the shape.
  const groundPatch = Object.fromEntries(
    Object.entries(optionPatch ?? {}).filter(([key]) => !key.endsWith("Pixels")),
  );
  return { controlPoints, options: { ...options, ...groundPatch } };
}
