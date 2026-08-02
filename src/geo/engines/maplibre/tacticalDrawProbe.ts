import type { Map as MlMap } from "maplibre-gl";
import type { ControlMeasure } from "@orbat-mapper/control-measures";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";

const PROBE_PARAM = "tacticalDrawProbe";
const PROBE_ID = "tactical-draw-probe";

/**
 * Dev-only liveness probe for the tactical-draw seam.
 *
 * Renders one hard-coded control measure across the current viewport and logs every
 * pick on it. Opt-in via `?tacticalDrawProbe=1`; a no-op otherwise, and stripped from
 * production builds.
 *
 * **Keep this.** It started as throwaway scaffolding for #634, but our tests stop at
 * the `Graphic[]` we hand the library — nothing in CI can tell whether the map
 * actually drew. This probe is the compensating manual check, and the named artifact
 * a `@orbat-mapper/tactical-draw` version bump is verified against. Widen it to more
 * representative kinds as they land; do not delete it when the draw/edit UI arrives.
 *
 * See docs/adr/0006-control-measures-on-tactical-draw.md.
 */
export function isTacticalDrawProbeEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(PROBE_PARAM) === "1";
}

export function startTacticalDrawProbe(
  mlMap: MlMap,
  surface: TacticalDrawSurface,
): () => void {
  // Control points are derived from the live viewport, so the measure is on screen
  // whatever the scenario's initial view turns out to be.
  function buildProbe(): ControlMeasure<"boundary"> {
    const center = mlMap.getCenter();
    const bounds = mlMap.getBounds();
    const dx = (bounds.getEast() - bounds.getWest()) / 4;
    const dy = (bounds.getNorth() - bounds.getSouth()) / 8;
    return {
      id: PROBE_ID,
      kind: "boundary",
      controlPoints: [
        [center.lng - dx, center.lat - dy],
        [center.lng, center.lat + dy],
        [center.lng + dx, center.lat - dy],
      ],
      textAmplifiers: { T: "PROBE-634" },
    };
  }

  let probe = buildProbe();

  const picks: Array<{ id: string; matchesProbe: boolean }> = [];
  const unsubscribe = surface.onGraphicPick((event) => {
    picks.push({ id: event.id, matchesProbe: event.id === PROBE_ID });
    console.log("[tactical-draw probe] pick", {
      id: event.id,
      matchesProbe: event.id === PROBE_ID,
      pixel: event.pixel,
      coordinate: event.coordinate,
    });
  });

  function aimPixel() {
    // The apex control point. A boundary renders as a curve, so a straight-line
    // midpoint is not on the drawn geometry — but every control point is.
    return surface.adapter.getPixelFromCoordinate(probe.controlPoints[1]);
  }

  surface.render([probe]);

  // Expose a re-center hook, an aiming point and the pick log so an automated
  // browser run can click the measure and assert the round trip.
  Object.assign(window as unknown as Record<string, unknown>, {
    __tdProbe: {
      id: PROBE_ID,
      picks,
      get controlPoints() {
        return probe.controlPoints;
      },
      get pixel() {
        return aimPixel();
      },
      /** Rebuild against the current viewport and re-render. Returns the new aim point. */
      recenter() {
        probe = buildProbe();
        surface.render([probe]);
        return aimPixel();
      },
    },
  });
  console.log("[tactical-draw probe] rendered", probe.id, probe.controlPoints);

  return () => {
    unsubscribe();
    surface.render([]);
  };
}
