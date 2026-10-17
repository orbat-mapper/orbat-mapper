/**
 * The Viewshed observer drawn as a pin for a tilted map: a stick from the
 * ground up to the observer's eyes, topped by a ball with a label beside it
 * that reads the height. The stick is to scale, so a low observer makes a
 * short one; the head and label are drawn at screen size, so the pin reads at
 * any zoom even where the stick is too short to see.
 *
 * The terrain's exaggeration stretches the ground but not what stands on it,
 * so the stick and the head's lift are stretched by it here to keep the eyes
 * where the viewshed puts them relative to the relief around.
 */
import type { Feature, FeatureCollection } from "geojson";
import type { LngLat, ObserverAbove } from "@/lib/terrain";

/** An observer's height as it reads, to the decimetre: "2 m", "600 m ASL". */
export function formatEyeHeight(height: number, above: ObserverAbove = "ground"): string {
  return `${Math.round(height * 10) / 10} m${above === "sea-level" ? " ASL" : ""}`;
}

/** How much taller than wide the stick is, and its least width, in metres. */
const SLENDERNESS = 40;
const MIN_WIDTH = 0.3;
const METRES_PER_DEGREE = 111_320;

export function observerPin(
  [lng, lat]: LngLat,
  height: number,
  exaggeration: number,
  {
    label,
    reading = formatEyeHeight(height),
  }: {
    /** What the observer is called, read before its height, e.g. its number. */
    label?: string;
    /** What the head reads after the label; the height by default. */
    reading?: string;
  } = {},
): FeatureCollection {
  const lift = height * exaggeration;
  const half = Math.max(lift / SLENDERNESS, MIN_WIDTH) / 2;
  const dLat = half / METRES_PER_DEGREE;
  const dLng = half / (METRES_PER_DEGREE * Math.cos((lat * Math.PI) / 180));
  const stick: Feature = {
    type: "Feature",
    properties: { kind: "stick", height: lift },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [lng - dLng, lat - dLat],
          [lng + dLng, lat - dLat],
          [lng + dLng, lat + dLat],
          [lng - dLng, lat + dLat],
          [lng - dLng, lat - dLat],
        ],
      ],
    },
  };
  const head: Feature = {
    type: "Feature",
    properties: {
      kind: "head",
      text: `${label ? `${label} · ` : ""}${reading}`,
      lift,
    },
    geometry: { type: "Point", coordinates: [lng, lat] },
  };
  return { type: "FeatureCollection", features: [stick, head] };
}

/** The head's diameter and white rim, in CSS pixels. */
const HEAD_SIZE = 16;
const HEAD_RIM = 2;
type Rgb = [number, number, number];
/** The lit side, the observer's green, and the shaded side. */
const LIGHT: Rgb = [134, 239, 172];
const BASE: Rgb = [22, 163, 74];
const SHADE: Rgb = [20, 83, 45];

const mix = (from: Rgb, to: Rgb, t: number): Rgb =>
  from.map((value, i) => Math.round(value + (to[i]! - value) * t)) as Rgb;

/** The pin's head as an image for `map.addImage`: a green ball in a white
 *  rim, lit from the upper left. */
export function pinHead(pixelRatio: number): {
  width: number;
  height: number;
  data: Uint8Array;
} {
  const size = Math.round(HEAD_SIZE * pixelRatio);
  const radius = size / 2;
  const rim = HEAD_RIM * pixelRatio;
  const light = size * 0.35;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot(x + 0.5 - radius, y + 0.5 - radius);
      const alpha = Math.min(Math.max(radius - distance + 0.5, 0), 1);
      if (!alpha) continue;
      let color: Rgb = [255, 255, 255];
      if (distance < radius - rim) {
        const t = Math.hypot(x + 0.5 - light, y + 0.5 - light) / size;
        color =
          t < 0.4
            ? mix(LIGHT, BASE, t / 0.4)
            : mix(BASE, SHADE, Math.min((t - 0.4) / 0.5, 1));
      }
      data.set([...color, Math.round(alpha * 255)], (y * size + x) * 4);
    }
  return { width: size, height: size, data };
}
