import type {
  AddLayerObject,
  CircleLayerSpecification,
  FilterSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
  GeoJSONSource,
  Map as MlMap,
} from "maplibre-gl";
import type { Feature, Position } from "geojson";
import turfBearing from "@turf/bearing";
import { unwrapLongitude } from "@/geo/longitude";
import { isUnitLayerId } from "@/geo/engines/maplibre/unitLayer";
import { nanoid } from "@/utils";

/** How long the missile takes from the drone to the target. */
const FLIGHT_MS = 1800;
/** How long the blast takes to flash, burn out and leave its smoke behind. */
const BLAST_MS = 1800;
/** How long the smoke trail hangs in the air after impact. */
const TRAIL_LINGER_MS = 1400;
/** How long flying debris takes to land. */
const SPARK_MS = 900;
/** How far from the impact, in screen pixels, unit symbols go up with it. */
const BLAST_REACH_PX = 70;
const MISSILE_IMAGE = "hellfire-missile";
/** The sprite is drawn at this multiple of its display size, for sharp edges on any screen. */
const PIXEL_RATIO = 2;

function lerp(from: Position, to: Position, k: number): Position {
  return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Missiles in flight, so the last one to land can take the shared missile image with it. */
let missilesInFlight = 0;

/**
 * Draws a top-down missile pointing up: a slim olive body with a seeker nose, mid-body wings,
 * tail fins and the rocket motor's flame. The flame is drawn without its flicker, which comes
 * from scaling the icon.
 */
function drawMissile(): ImageData {
  const width = 22 * PIXEL_RATIO;
  const height = 64 * PIXEL_RATIO;
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
  const cx = 11;

  // Exhaust flame: a white-hot core in an orange plume, fading out behind the motor.
  const plume = ctx.createLinearGradient(0, 40, 0, 64);
  plume.addColorStop(0, "rgba(255, 244, 214, 1)");
  plume.addColorStop(0.25, "rgba(253, 186, 116, 0.95)");
  plume.addColorStop(0.6, "rgba(249, 115, 22, 0.55)");
  plume.addColorStop(1, "rgba(234, 88, 12, 0)");
  ctx.fillStyle = plume;
  ctx.beginPath();
  ctx.moveTo(cx - 2.5, 40);
  ctx.quadraticCurveTo(cx - 4.5, 52, cx, 64);
  ctx.quadraticCurveTo(cx + 4.5, 52, cx + 2.5, 40);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.beginPath();
  ctx.ellipse(cx, 43, 1.3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(20, 24, 18, 0.9)";
  ctx.lineWidth = 0.6;

  // Wings and tail fins, cruciform seen from above as two pairs.
  ctx.fillStyle = "#4b5340";
  for (const [y, span, chord] of [
    [17, 5, 6],
    [33, 6, 6],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx - 2.2, y);
    ctx.lineTo(cx - 2.2 - span, y + chord);
    ctx.lineTo(cx - 2.2, y + chord);
    ctx.moveTo(cx + 2.2, y);
    ctx.lineTo(cx + 2.2 + span, y + chord);
    ctx.lineTo(cx + 2.2, y + chord);
    ctx.fill();
    ctx.stroke();
  }

  // Body, shaded to look round.
  const body = ctx.createLinearGradient(cx - 2.5, 0, cx + 2.5, 0);
  body.addColorStop(0, "#3f4636");
  body.addColorStop(0.45, "#7c8668");
  body.addColorStop(1, "#353b2d");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(cx - 2.5, 9);
  ctx.lineTo(cx - 2.5, 40);
  ctx.lineTo(cx + 2.5, 40);
  ctx.lineTo(cx + 2.5, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Seeker nose: a rounded glass dome over the body's front.
  const nose = ctx.createRadialGradient(cx - 0.8, 4, 0.3, cx, 6, 4);
  nose.addColorStop(0, "#e0f2fe");
  nose.addColorStop(0.5, "#64748b");
  nose.addColorStop(1, "#1e293b");
  ctx.fillStyle = nose;
  ctx.beginPath();
  ctx.moveTo(cx - 2.5, 9);
  ctx.bezierCurveTo(cx - 2.5, 3, cx + 2.5, 3, cx + 2.5, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yellow band: live warhead.
  ctx.fillStyle = "#facc15";
  ctx.fillRect(cx - 2.5, 11, 5, 1.6);
  // Motor nozzle.
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(cx - 2, 39.5, 4, 1.5);

  return ctx.getImageData(0, 0, width, height);
}

type LayerWithoutSource =
  | Omit<LineLayerSpecification, "id" | "source">
  | Omit<CircleLayerSpecification, "id" | "source">
  | Omit<SymbolLayerSpecification, "id" | "source">;

export type OnUnitsHit = (unitIds: string[]) => void;

/**
 * Just for fun: fires a Hellfire missile from the orbiting "drone" (the bottom middle of the
 * screen) at a point on the map. It leaves a smoke trail, and its impact flashes, throws up a
 * fireball, a shockwave, debris and a smoke cloud, and shakes the map. Unit symbols near the
 * impact go up in secondary explosions; what happens to the units themselves is up to
 * `onUnitsHit`, called with their ids once they have all gone up.
 */
export function launchHellfire(
  map: MlMap,
  target: { lng: number; lat: number },
  onUnitsHit?: OnUnitsHit,
) {
  const id = `hellfire-${nanoid()}`;
  const canvas = map.getCanvas();
  const launch = map.unproject([canvas.clientWidth / 2, canvas.clientHeight]);
  const from: Position = [launch.lng, launch.lat];
  const to: Position = [unwrapLongitude(launch.lng, target.lng), target.lat];
  const heading = turfBearing(from, to);

  missilesInFlight++;
  if (!map.hasImage(MISSILE_IMAGE)) {
    map.addImage(MISSILE_IMAGE, drawMissile(), { pixelRatio: PIXEL_RATIO });
  }

  // Line progress drives the trail's gradient, from old thin smoke to fresh thick smoke.
  map.addSource(id, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    lineMetrics: true,
  });
  const isKind = (kind: string): FilterSpecification => ["==", ["get", "kind"], kind];
  const layerIds: string[] = [];
  function addLayer(suffix: string, layer: LayerWithoutSource) {
    const layerId = `${id}-${suffix}`;
    map.addLayer({ ...layer, id: layerId, source: id } as AddLayerObject);
    layerIds.push(layerId);
  }
  addLayer("smoke", {
    type: "line",
    filter: isKind("trail"),
    layout: { "line-cap": "round" },
    paint: {
      "line-width": 14,
      "line-blur": 10,
      // The trail carries its own fade, as it lingers after impact.
      "line-opacity": ["*", 0.5, ["get", "fade"]],
      "line-gradient": [
        "interpolate",
        ["linear"],
        ["line-progress"],
        0,
        "rgba(148, 163, 184, 0)",
        0.5,
        "rgba(148, 163, 184, 0.25)",
        1,
        "rgba(203, 213, 225, 0.9)",
      ],
    },
  });
  addLayer("trail", {
    type: "line",
    filter: isKind("trail"),
    layout: { "line-cap": "round" },
    paint: {
      "line-width": 4,
      "line-blur": 2,
      "line-opacity": ["*", 0.9, ["get", "fade"]],
      "line-gradient": [
        "interpolate",
        ["linear"],
        ["line-progress"],
        0,
        "rgba(241, 245, 249, 0)",
        0.7,
        "rgba(241, 245, 249, 0.5)",
        0.97,
        "rgba(255, 255, 255, 1)",
        1,
        "rgba(253, 186, 116, 1)",
      ],
    },
  });
  addLayer("blast", {
    type: "circle",
    filter: isKind("blast"),
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": ["get", "color"],
      "circle-opacity": ["get", "opacity"],
      "circle-blur": ["get", "blur"],
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": ["coalesce", ["get", "stroke"], 0],
      "circle-stroke-opacity": ["coalesce", ["get", "strokeOpacity"], 0],
      "circle-pitch-alignment": "map",
    },
    layout: { "circle-sort-key": ["get", "order"] },
  });
  addLayer("spark", {
    type: "circle",
    filter: isKind("spark"),
    paint: {
      "circle-radius": ["get", "size"],
      "circle-color": "#fdba74",
      "circle-opacity": ["get", "opacity"],
      "circle-stroke-color": "#7c2d12",
      "circle-stroke-width": 0.5,
      "circle-stroke-opacity": ["get", "opacity"],
    },
  });
  addLayer("missile", {
    type: "symbol",
    filter: isKind("missile"),
    layout: {
      "icon-image": MISSILE_IMAGE,
      "icon-size": ["get", "size"],
      "icon-rotate": heading,
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      // The missile's nose leads, so its middle trails the point a little.
      "icon-offset": [0, 10],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  function setData(features: Feature[]) {
    const source = map.getSource<GeoJSONSource>(id);
    source?.setData({ type: "FeatureCollection", features });
    // A basemap change takes the source with it, which ends the show.
    return !!source;
  }

  function remove() {
    for (const layerId of layerIds) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    }
    if (map.getSource(id)) map.removeSource(id);
    if (--missilesInFlight === 0 && map.hasImage(MISSILE_IMAGE)) {
      map.removeImage(MISSILE_IMAGE);
    }
  }

  function shake() {
    const container = map.getCanvasContainer();
    container.classList.remove("hellfire-shake");
    // Restart the animation if another missile is still shaking the map.
    void container.offsetWidth;
    container.classList.add("hellfire-shake");
    window.setTimeout(() => container.classList.remove("hellfire-shake"), 500);
  }

  function trail(head: Position, fade = 1): Feature {
    return {
      type: "Feature",
      properties: { kind: "trail", fade },
      geometry: { type: "LineString", coordinates: [from, head] },
    };
  }

  function pointFeature(kind: string, at: Position, properties: object): Feature {
    return {
      type: "Feature",
      properties: { kind, ...properties },
      geometry: { type: "Point", coordinates: at },
    };
  }

  /** One layer of an explosion; the layers stack in the order `blastPuffs` lists them. */
  type Puff = {
    color: string;
    radius: number;
    opacity: number;
    blur: number;
    stroke?: number;
    strokeOpacity?: number;
  };

  /** The layers of one explosion `t` of the way through, at `scale` times the missile's own. */
  function blastPuffs(t: number, scale: number): Puff[] {
    const smoke = clamp01((t - 0.08) / 0.92);
    const fire = clamp01(t / 0.45);
    const flash = clamp01(t / 0.12);
    const wave = clamp01(t / 0.35);
    return [
      {
        color: "#3f3f46",
        radius: scale * (20 + 75 * easeOutCubic(smoke)),
        opacity: 0.75 * Math.min(1, smoke * 6) * (1 - smoke ** 2),
        blur: 0.7,
      },
      {
        color: "#ea580c",
        radius: scale * (12 + 48 * easeOutCubic(fire)),
        opacity: 0.95 * (1 - fire ** 1.5),
        blur: 0.5,
      },
      {
        color: "#fde047",
        radius: scale * (8 + 26 * easeOutCubic(fire)),
        opacity: 1 - fire,
        blur: 0.6,
      },
      {
        color: "#ffffff",
        radius: scale * (10 + 40 * easeOutCubic(flash)),
        opacity: 1 - flash,
        blur: 0.4,
      },
      {
        color: "#fef3c7",
        radius: scale * (20 + 140 * easeOutCubic(wave)),
        opacity: 0,
        blur: 0,
        stroke: 3 * (1 - wave) + 0.5,
        strokeOpacity: 0.8 * (1 - wave),
      },
    ];
  }

  type Spark = { angle: number; distance: number; size: number };
  type Explosion = {
    at: Position;
    delay: number;
    scale: number;
    sparks: Spark[];
    unitId?: string;
  };

  function createSparks(count: number, reach: number): Spark[] {
    return Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: reach * (0.5 + Math.random() * 0.5),
      size: 1.5 + Math.random() * 2,
    }));
  }

  /**
   * The unit symbols drawn within reach of the impact, each of which goes up in a secondary
   * explosion shortly after it. Only the map shows it; the units themselves are untouched.
   */
  function findUnitsInBlast(): Explosion[] {
    const center = map.project(to as [number, number]);
    const hits = map.queryRenderedFeatures(
      [
        [center.x - BLAST_REACH_PX, center.y - BLAST_REACH_PX],
        [center.x + BLAST_REACH_PX, center.y + BLAST_REACH_PX],
      ],
      { layers: map.getLayersOrder().filter(isUnitLayerId) },
    );
    const seen = new Set<string>();
    const explosions: Explosion[] = [];
    for (const hit of hits) {
      if (hit.geometry.type !== "Point") continue;
      const unitId = String(hit.properties?.id ?? "");
      if (!unitId || seen.has(unitId)) continue;
      const at = hit.geometry.coordinates;
      const point = map.project(at as [number, number]);
      const distance = Math.hypot(point.x - center.x, point.y - center.y);
      if (distance > BLAST_REACH_PX) continue;
      seen.add(unitId);
      explosions.push({
        at,
        // The blast reaches the closest units first.
        delay: 120 + distance * 3 + Math.random() * 250,
        scale: 0.55 + Math.random() * 0.2,
        sparks: createSparks(10, 45),
        unitId,
      });
    }
    return explosions;
  }

  function sparkFeatures(explosion: Explosion, t: number): Feature[] {
    if (t >= 1) return [];
    const origin = map.project(explosion.at as [number, number]);
    const travel = easeOutCubic(t);
    // Debris arcs up and falls back, which seen from above reads as a slight sag.
    const sag = 12 * t * t;
    return explosion.sparks.map(({ angle, distance, size }) => {
      const reach = distance * travel;
      const { lng, lat } = map.unproject([
        origin.x + Math.cos(angle) * reach,
        origin.y + Math.sin(angle) * reach + sag,
      ]);
      return pointFeature("spark", [lng, lat], { size, opacity: 1 - t ** 2 });
    });
  }

  const start = performance.now();
  let explosions: Explosion[] | null = null;
  let lastDelay = 0;
  let endsAt = 0;
  let reported = false;

  function frame(now: number) {
    const elapsed = now - start;
    const features: Feature[] = [];

    if (elapsed < FLIGHT_MS) {
      // The motor burns all the way down, so the missile keeps speeding up.
      const t = elapsed / FLIGHT_MS;
      const head = lerp(from, to, 0.15 * t + 0.85 * t * t);
      // The flame flickers.
      features.push(
        trail(head),
        pointFeature("missile", head, { size: 0.95 + Math.random() * 0.1 }),
      );
    } else {
      const afterImpact = elapsed - FLIGHT_MS;
      if (!explosions) {
        explosions = [
          { at: to, delay: 0, scale: 1, sparks: createSparks(16, 70) },
          ...findUnitsInBlast(),
        ];
        lastDelay = Math.max(...explosions.map((e) => e.delay));
        endsAt = Math.max(BLAST_MS + lastDelay, TRAIL_LINGER_MS);
        shake();
      }
      // The units' fate is sealed once the last of their fireballs hides them.
      if (!reported && afterImpact >= lastDelay + 200) {
        reported = true;
        const unitIds = explosions.flatMap((e) => (e.unitId ? [e.unitId] : []));
        if (unitIds.length) onUnitsHit?.(unitIds);
      }
      if (afterImpact >= endsAt) return remove();
      const fade = 1 - clamp01(afterImpact / TRAIL_LINGER_MS);
      if (fade > 0) features.push(trail(to, fade));
      explosions.forEach((explosion, index) => {
        const sinceStart = afterImpact - explosion.delay;
        if (sinceStart < 0 || sinceStart >= BLAST_MS) return;
        blastPuffs(sinceStart / BLAST_MS, explosion.scale).forEach((puff, layer) =>
          features.push(
            // Later explosions draw over earlier ones.
            pointFeature("blast", explosion.at, { ...puff, order: index * 10 + layer }),
          ),
        );
        features.push(...sparkFeatures(explosion, sinceStart / SPARK_MS));
      });
    }

    if (!setData(features)) return remove();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
