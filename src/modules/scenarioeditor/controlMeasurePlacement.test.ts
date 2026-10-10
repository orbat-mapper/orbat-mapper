import { describe, expect, it } from "vitest";
import {
  applyBoxTransformOptions,
  CONTROL_MEASURE_IDS,
  CONTROL_MEASURE_METADATA,
  getDefaultOptions,
} from "@orbat-mapper/control-measures";
import type { Position } from "geojson";
import {
  CONTROL_MEASURE_PLACEMENT_FOOTPRINT_PX,
  controlMeasurePlacementAt,
} from "@/modules/scenarioeditor/controlMeasurePlacement";
import { latitudeToMercatorY } from "@/geo/mercator";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

const GROUND: Position = [10, 60];
const VIEW = { zoom: 10, bearing: 0 };

function defaults(id: (typeof CONTROL_MEASURE_IDS)[number]) {
  return getDefaultOptions(id) as TacticalGraphicOptions;
}

/** Screen pixels between two positions at `zoom`, on an untilted north-up view. */
function pixelDistance(a: Position, b: Position, zoom: number) {
  const pixelsPerRadian = (512 * 2 ** zoom) / (2 * Math.PI);
  const dx = ((b[0] - a[0]) * Math.PI) / 180;
  const dy = latitudeToMercatorY(b[1]) - latitudeToMercatorY(a[1]);
  return Math.hypot(dx, dy) * pixelsPerRadian;
}

describe("controlMeasurePlacementAt", () => {
  it("places every kind in the registry", () => {
    const failed = CONTROL_MEASURE_IDS.filter(
      (id) => controlMeasurePlacementAt(id, defaults(id), GROUND, VIEW) === null,
    );
    expect(failed).toEqual([]);
  });

  it("places a single-point kind exactly at the drop point", () => {
    const pointKind = CONTROL_MEASURE_IDS.find(
      (id) => CONTROL_MEASURE_METADATA[id].geometry === "point",
    )!;
    const placement = controlMeasurePlacementAt(pointKind, {}, GROUND, VIEW);
    expect(placement?.controlPoints).toEqual([GROUND]);
  });

  it("keeps a phase line inside the footprint around the drop point", () => {
    const placement = controlMeasurePlacementAt(
      "phase-line",
      defaults("phase-line"),
      GROUND,
      VIEW,
    )!;
    expect(placement.controlPoints.length).toBeGreaterThan(1);
    for (const point of placement.controlPoints) {
      expect(pixelDistance(GROUND, point, VIEW.zoom)).toBeLessThanOrEqual(
        CONTROL_MEASURE_PLACEMENT_FOOTPRINT_PX,
      );
    }
  });

  it("stores the drawn options, not the thumbnail's", () => {
    const options = { ...defaults("battle-position"), echelon: "company" };
    const placement = controlMeasurePlacementAt(
      "battle-position",
      options,
      GROUND,
      VIEW,
    )!;
    expect(placement.options).toEqual(options);
  });

  it("never stores an option the drawn graphic would not have", () => {
    const leaked = CONTROL_MEASURE_IDS.filter((id) => {
      const placement = controlMeasurePlacementAt(id, defaults(id), GROUND, VIEW)!;
      const allowed = new Set([
        ...Object.keys(defaults(id)),
        ...Object.keys(
          applyBoxTransformOptions(id, defaults(id) as never, {
            scale: 2,
            rotationRadians: 0,
          }) ?? {},
        ),
      ]);
      return Object.keys(placement.options).some((key) => !allowed.has(key));
    });
    expect(leaked).toEqual([]);
  });

  it("keeps screen-sized options as authored at any zoom", () => {
    const options = { ...defaults("classic-arrow"), arrowheadLengthPixels: 24 };
    for (const zoom of [6, 10, 20]) {
      const placement = controlMeasurePlacementAt("classic-arrow", options, GROUND, {
        zoom,
        bearing: 0,
      })!;
      expect(placement.options.arrowheadLengthPixels).toBe(24);
    }
  });

  it("covers the same screen footprint at any zoom", () => {
    const span = (zoom: number) => {
      const { controlPoints } = controlMeasurePlacementAt(
        "phase-line",
        defaults("phase-line"),
        GROUND,
        { zoom, bearing: 0 },
      )!;
      return pixelDistance(controlPoints[0], controlPoints.at(-1)!, zoom);
    };
    expect(span(6)).toBeCloseTo(span(14), 0);
  });
});
