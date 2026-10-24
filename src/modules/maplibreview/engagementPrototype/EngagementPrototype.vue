<script setup lang="ts">
// PROTOTYPE (throwaway, branch prototype/engagement-playback).
// Three ways to draw engagements during playback, switchable with ?variant=A|B|C:
//   A Tracks: projectile tracks, trails, bursts and impact markers as MapLibre layers.
//   B Arcs: a canvas overlay that lifts each track by its flight profile's altitude.
//   C Links + log: shooter-to-target links only, with a docked engagement log.
import { computed, onUnmounted, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import type { Feature, Position } from "geojson";
import type { TScenario } from "@/scenariostore";
import { usePlaybackStore } from "@/stores/playbackStore";
import { MS_PER_MINUTE } from "@/utils/time";
import {
  buildEngagements,
  buildTracks,
  isEngagementActive,
  locationAt,
  protoDwell,
  dwellSpeedAt,
  setProtoEngagements,
  trackPosition,
  trackSamples,
  trackStop,
  type ProtoEngagement,
  type ProtoTrack,
} from "./engagements.prototype";

const { mlMap, activeScenario } = defineProps<{
  mlMap: MlMap;
  activeScenario: TScenario;
}>();

const VARIANTS = [
  { key: "A", name: "Tracks" },
  { key: "B", name: "Arcs with flight profiles" },
  { key: "C", name: "Links + log" },
  { key: "D", name: "Cinematic" },
  { key: "E", name: "Pulse rings" },
] as const;
const route = useRoute();
const router = useRouter();
const variant = computed(() => {
  const v = String(route.query.variant ?? "A").toUpperCase();
  return VARIANTS.some((x) => x.key === v) ? v : "A";
});
const variantIndex = computed(() => VARIANTS.findIndex((v) => v.key === variant.value));
function cycle(step: number) {
  const next = VARIANTS[(variantIndex.value + step + VARIANTS.length) % VARIANTS.length];
  router.replace({ query: { ...route.query, variant: next.key } });
}
function onKey(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  if (
    el &&
    (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
  )
    return;
  if (!e.altKey) return;
  if (e.key === "ArrowLeft") cycle(-1);
  else if (e.key === "ArrowRight") cycle(1);
}
window.addEventListener("keydown", onKey);
const showBar = import.meta.env.DEV;
// Dev-only handle for driving the prototype from the console:
// __engProto.go("1985-06-09T11:47:00+02:00", [-16, 59.2], 5)
if (import.meta.env.DEV) {
  (window as any).__engProto = {
    go(iso: string, center?: [number, number], zoom?: number) {
      activeScenario.time.setCurrentTime(+new Date(iso));
      if (center) mlMap.jumpTo({ center, zoom });
    },
  };
}

const playback = usePlaybackStore();
const state = activeScenario.store.state;
const unitMap = state.unitMap;
const engagements = shallowRef<ProtoEngagement[]>([]);
const tracks = shallowRef<ProtoTrack[]>([]);
function rebuild() {
  engagements.value = buildEngagements(activeScenario.store);
  tracks.value = buildTracks(engagements.value, unitMap);
  setProtoEngagements(engagements.value);
}
rebuild();
const engById = computed(() => new Map(engagements.value.map((e) => [e.id, e])));

const COLORS = { friend: "#3b82f6", hostile: "#ef4444" };
const FLASH = "#fbbf24";
const FIRE = "#f97316";

// Wall-clock seconds turned into scenario time at the current speed, so bursts and
// lingering markers stay visible however fast playback runs.
function effectiveSpeed(t: number) {
  const d = protoDwell.value ? dwellSpeedAt(t) : undefined;
  return d !== undefined ? Math.min(d, playback.playbackSpeed) : playback.playbackSpeed;
}
const wall = (seconds: number, minMinutes: number, t: number) =>
  Math.max(minMinutes * MS_PER_MINUTE, seconds * effectiveSpeed(t));

function jagged(a: Position, b: Position, steps = 10): Position[] {
  const dx = (b[0] - a[0]) / steps;
  const dy = (b[1] - a[1]) / steps;
  const len = Math.hypot(dx, dy) || 1;
  const amp = 0.35 * len;
  const nx = (-dy / len) * amp;
  const ny = (dx / len) * amp;
  const pts: Position[] = [a];
  for (let i = 1; i < steps; i++) {
    const s = i % 2 ? 1 : -1;
    pts.push([a[0] + dx * i + nx * s, a[1] + dy * i + ny * s]);
  }
  pts.push(b);
  return pts;
}
function shorten(a: Position, b: Position, f = 0.08): [Position, Position] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return [
    [a[0] + dx * f, a[1] + dy * f],
    [b[0] - dx * f, b[1] - dy * f],
  ];
}

/* ---------------- Variant A and C: MapLibre layers ---------------- */
const SRC = "proto-eng";
const LAYERS = [
  "proto-eng-area-fill",
  "proto-eng-area-line",
  "proto-eng-link",
  "proto-eng-spent",
  "proto-eng-path",
  "proto-eng-trail",
  "proto-eng-contact",
  "proto-eng-burst",
  "proto-eng-impact",
  "proto-eng-head",
  "proto-eng-ring",
  "proto-eng-label",
  "proto-eng-elink",
  "proto-eng-econtact",
  "proto-eng-ering",
  "proto-eng-earrow",
  "proto-eng-elabel",
];
function setupLayers() {
  if (mlMap.getSource(SRC)) return;
  mlMap.addSource(SRC, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  const kind = (k: string) => ["==", ["get", "kind"], k] as any;
  const color = [
    "match",
    ["get", "side"],
    "hostile",
    COLORS.hostile,
    COLORS.friend,
  ] as any;
  mlMap.addLayer({
    id: "proto-eng-area-fill",
    type: "fill",
    source: SRC,
    filter: kind("area"),
    paint: { "fill-color": FIRE, "fill-opacity": ["*", 0.18, ["get", "o"]] },
  });
  mlMap.addLayer({
    id: "proto-eng-area-line",
    type: "line",
    source: SRC,
    filter: kind("area"),
    paint: {
      "line-color": FIRE,
      "line-width": 2,
      "line-opacity": ["get", "o"],
      "line-dasharray": [3, 2],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-link",
    type: "line",
    source: SRC,
    filter: kind("link"),
    paint: {
      "line-color": color,
      "line-width": ["get", "w"],
      "line-opacity": ["get", "o"],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-spent",
    type: "line",
    source: SRC,
    filter: kind("spent"),
    paint: {
      "line-color": color,
      "line-width": 1,
      "line-opacity": ["get", "o"],
      "line-dasharray": [2, 2],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-path",
    type: "line",
    source: SRC,
    filter: kind("path"),
    paint: { "line-color": color, "line-width": 1, "line-opacity": 0.45 },
  });
  mlMap.addLayer({
    id: "proto-eng-trail",
    type: "line",
    source: SRC,
    filter: kind("trail"),
    layout: { "line-cap": "round" },
    paint: { "line-color": color, "line-width": 3 },
  });
  mlMap.addLayer({
    id: "proto-eng-contact",
    type: "line",
    source: SRC,
    filter: kind("contact"),
    layout: { "line-join": "miter" },
    paint: { "line-color": FIRE, "line-width": 2.5, "line-opacity": 0.9 },
  });
  mlMap.addLayer({
    id: "proto-eng-burst",
    type: "circle",
    source: SRC,
    filter: kind("burst"),
    paint: {
      "circle-radius": ["get", "r"],
      "circle-color": FLASH,
      "circle-opacity": ["*", 0.5, ["get", "o"]],
      "circle-stroke-color": FIRE,
      "circle-stroke-width": 2,
      "circle-stroke-opacity": ["get", "o"],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-impact",
    type: "circle",
    source: SRC,
    filter: kind("impact"),
    paint: {
      "circle-radius": 6,
      "circle-color": FIRE,
      "circle-opacity": ["get", "o"],
      "circle-stroke-color": "#111827",
      "circle-stroke-width": 1.5,
      "circle-stroke-opacity": ["get", "o"],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-head",
    type: "circle",
    source: SRC,
    filter: kind("head"),
    paint: {
      "circle-radius": 3.5,
      "circle-color": color,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
    },
  });
  mlMap.addLayer({
    id: "proto-eng-ring",
    type: "circle",
    source: SRC,
    filter: kind("ring"),
    paint: {
      "circle-radius": ["get", "r"],
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": FIRE,
      "circle-stroke-width": 3,
      "circle-stroke-opacity": ["get", "o"],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-label",
    type: "symbol",
    source: SRC,
    filter: kind("label"),
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
      "text-offset": [0, -2.2],
      "text-allow-overlap": true,
    },
    paint: { "text-color": color, "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
  });
  // Variant E
  if (!mlMap.hasImage("proto-arrow")) {
    const size = 24;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.beginPath();
    g.moveTo(5, 5);
    g.lineTo(20, 12);
    g.lineTo(5, 19);
    g.lineTo(9, 12);
    g.closePath();
    g.fill();
    mlMap.addImage("proto-arrow", g.getImageData(0, 0, size, size), {
      sdf: true,
      pixelRatio: 2,
    });
  }
  mlMap.addLayer({
    id: "proto-eng-elink",
    type: "line",
    source: SRC,
    filter: kind("elink"),
    layout: { "line-cap": "round" },
    paint: {
      "line-color": color,
      "line-width": ["get", "w"],
      "line-opacity": ["get", "o"],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-econtact",
    type: "line",
    source: SRC,
    filter: kind("econtact"),
    paint: {
      "line-color": FIRE,
      "line-width": 1.25,
      "line-opacity": ["get", "o"],
      "line-dasharray": [3, 3],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-ering",
    type: "circle",
    source: SRC,
    filter: kind("ering"),
    paint: {
      "circle-radius": ["get", "r"],
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": ["get", "c"],
      "circle-stroke-width": ["get", "w"],
      "circle-stroke-opacity": ["get", "o"],
    },
  });
  mlMap.addLayer({
    id: "proto-eng-earrow",
    type: "symbol",
    source: SRC,
    filter: kind("elink"),
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 140,
      "icon-size": 0.7,
      "icon-image": "proto-arrow",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-rotation-alignment": "map",
    },
    paint: { "icon-color": color, "icon-opacity": ["*", 1.2, ["get", "o"]] },
  });
  mlMap.addLayer({
    id: "proto-eng-elabel",
    type: "symbol",
    source: SRC,
    filter: ["all", kind("elink"), ["has", "label"]],
    layout: {
      "symbol-placement": "line-center",
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 10,
      "text-offset": [0, -0.9],
      "text-allow-overlap": true,
      "text-keep-upright": true,
    },
    paint: {
      "text-color": color,
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.5,
      "text-opacity": ["min", 1, ["*", 1.6, ["get", "o"]]],
    },
  });
}
function removeLayers() {
  for (const id of LAYERS) if (mlMap.getLayer(id)) mlMap.removeLayer(id);
  if (mlMap.getSource(SRC)) mlMap.removeSource(SRC);
}
function onStyleLoad() {
  if (variant.value === "A" || variant.value === "C" || variant.value === "E")
    setupLayers();
  redraw();
}
mlMap.on("style.load", onStyleLoad);

/** Target areas of fire missions while they are being fired on, then fading out. */
function areaFeatures(t: number): Feature[] {
  const out: Feature[] = [];
  const linger = wall(1, 20, t);
  for (const e of engagements.value) {
    if (!e.area || t < e.t || t > e.end + linger) continue;
    const o = t <= e.end ? 1 : 1 - (t - e.end) / linger;
    out.push({
      type: "Feature",
      properties: { kind: "area", o },
      geometry: { type: "Polygon", coordinates: [e.area.ring] },
    });
  }
  return out;
}

function featuresA(t: number): Feature[] {
  const out: Feature[] = areaFeatures(t);
  const linger = wall(1, 20, t);
  const burstDur = wall(0.6, 3, t);
  for (const tr of tracks.value) {
    if (t < tr.launch) continue;
    const stop = trackStop(tr);
    const age = t - stop;
    if (age > linger) continue;
    const props = { side: tr.side };
    if (age <= 0) {
      const now = trackPosition(tr, t);
      const flown = trackSamples(tr, now.d, 16).map((s) => s.position);
      out.push({
        type: "Feature",
        properties: { kind: "path", ...props },
        geometry: { type: "LineString", coordinates: flown },
      });
      const tail = trackSamples(tr, now.d, 16)
        .slice(-5)
        .map((s) => s.position);
      out.push({
        type: "Feature",
        properties: { kind: "trail", ...props },
        geometry: { type: "LineString", coordinates: tail },
      });
      out.push({
        type: "Feature",
        properties: { kind: "head", ...props },
        geometry: { type: "Point", coordinates: now.position },
      });
    } else {
      const fade = 1 - age / linger;
      const at = trackPosition(tr, stop);
      const flown = trackSamples(tr, at.d, 16).map((s) => s.position);
      out.push({
        type: "Feature",
        properties: { kind: "spent", o: 0.5 * fade, ...props },
        geometry: { type: "LineString", coordinates: flown },
      });
      if (age < burstDur) {
        const f = age / burstDur;
        out.push({
          type: "Feature",
          properties: {
            kind: "burst",
            r: (tr.outcome === "hit" && !tr.cuts ? 16 : 9) * (0.4 + f),
            o: 1 - f,
          },
          geometry: { type: "Point", coordinates: at.position },
        });
      }
      if (tr.outcome === "hit" && !tr.cuts) {
        out.push({
          type: "Feature",
          properties: { kind: "impact", o: Math.max(0.3, fade) },
          geometry: { type: "Point", coordinates: at.position },
        });
      }
    }
  }
  for (const e of engagements.value) {
    if (e.type === "contact") {
      if (t < e.t || t > e.end) continue;
      const a = locationAt(unitMap[e.shooterId], t);
      for (const id of e.targets) {
        const b = unitMap[id] && locationAt(unitMap[id], t);
        if (!a || !b) continue;
        const [aa, bb] = shorten(a, b, 0.15);
        out.push({
          type: "Feature",
          properties: { kind: "contact" },
          geometry: { type: "LineString", coordinates: jagged(aa, bb) },
        });
      }
    } else if (t >= e.t && t <= e.end) {
      const at = locationAt(unitMap[e.shooterId], e.t);
      if (at)
        out.push({
          type: "Feature",
          properties: {
            kind: "label",
            side: e.side,
            label: `${e.weapon || "Fire"} ×${e.rounds}`,
          },
          geometry: { type: "Point", coordinates: at },
        });
    }
  }
  return out;
}

/** Variant E: pulsing rings on units in action, thin arrowed links from shooter to target. */
function featuresE(t: number): Feature[] {
  const out: Feature[] = [];
  const linger = wall(1, 20, t);
  const now = Date.now();
  const ph = (now % 1800) / 1800;
  const point = (p: Position, props: Record<string, unknown>): Feature => ({
    type: "Feature",
    properties: props,
    geometry: { type: "Point", coordinates: p },
  });
  // Two staggered rings that grow and fade, around a faint steady ring.
  const pulse = (p: Position, c: string, strength = 1) => {
    out.push(point(p, { kind: "ering", r: 15, c, w: 1.5, o: 0.45 * strength }));
    for (const k of [0, 0.5]) {
      const f = (ph + k) % 1;
      out.push(
        point(p, { kind: "ering", r: 15 + 16 * f, c, w: 2, o: 0.8 * (1 - f) * strength }),
      );
    }
  };
  for (const e of engagements.value) {
    if (t < e.t || t > e.end + linger) continue;
    const active = t <= e.end;
    const fade = active ? 1 : 1 - (t - e.end) / linger;
    const a = locationAt(unitMap[e.shooterId], t);
    if (!a) continue;
    if (e.type === "contact") {
      if (!active) continue;
      for (const id of e.targets) {
        const b = unitMap[id] && locationAt(unitMap[id], t);
        if (!b) continue;
        const [aa, bb] = shorten(a, b, 0.12);
        out.push({
          type: "Feature",
          properties: { kind: "econtact", o: 0.5 },
          geometry: { type: "LineString", coordinates: [aa, bb] },
        });
        pulse(b, FIRE);
      }
      pulse(a, FIRE);
      continue;
    }
    const ends: Position[] = e.area
      ? [e.area.center]
      : (e.targets
          .map((id) => unitMap[id] && locationAt(unitMap[id], t))
          .filter(Boolean) as Position[]);
    ends.forEach((b, i) => {
      const [aa, bb] = shorten(a, b, 0.06);
      out.push({
        type: "Feature",
        properties: {
          kind: "elink",
          side: e.side,
          w: active ? 1.25 : 0.75,
          o: (active ? 0.5 : 0.25) * fade * fade,
          ...(i === 0 ? { label: `${e.weapon || "Fire"} ×${e.rounds}` } : {}),
        },
        geometry: { type: "LineString", coordinates: [aa, bb] },
      });
      if (active && !e.area) pulse(b, FIRE);
    });
    if (active) pulse(a, COLORS[e.side]);
    if (e.area) {
      out.push({
        type: "Feature",
        properties: {
          kind: "area",
          o: active ? 0.75 + 0.25 * Math.sin(now / 300) : fade,
        },
        geometry: { type: "Polygon", coordinates: [e.area.ring] },
      });
    }
    for (const r of e.results) {
      if (t < r.t || t > r.t + linger) continue;
      const p = unitMap[r.unitId] && locationAt(unitMap[r.unitId], t);
      if (!p) continue;
      const age = (t - r.t) / linger;
      out.push(point(p, { kind: "ering", r: 19, c: "#dc2626", w: 3, o: 1 - age }));
      const burst = (t - r.t) / wall(0.8, 3, t);
      if (burst < 1)
        out.push(
          point(p, {
            kind: "ering",
            r: 19 + 30 * burst,
            c: "#dc2626",
            w: 3,
            o: 1 - burst,
          }),
        );
    }
  }
  return out;
}

function featuresC(t: number): Feature[] {
  const out: Feature[] = areaFeatures(t);
  const linger = wall(1.5, 30, t);
  const pulse = (Date.now() % 1400) / 1400;
  for (const e of engagements.value) {
    if (t < e.t || t > e.end + linger) continue;
    const active = t <= e.end;
    const a = locationAt(unitMap[e.shooterId], t);
    const ends: (Position | undefined)[] = e.area
      ? [e.area.center]
      : e.targets.map((id) => unitMap[id] && locationAt(unitMap[id], t));
    for (const b of ends) {
      if (!a || !b) continue;
      const [aa, bb] = shorten(a, b, 0.04);
      const geometry = e.type === "contact" ? jagged(aa, bb) : [aa, bb];
      out.push({
        type: "Feature",
        properties: {
          kind: "link",
          side: e.side,
          w: active ? 3 : 1.5,
          o: active ? 0.9 : 0.35 * (1 - (t - e.end) / linger),
        },
        geometry: { type: "LineString", coordinates: geometry },
      });
    }
    for (const r of e.results) {
      if (t < r.t || t > r.t + linger) continue;
      const p = unitMap[r.unitId] && locationAt(unitMap[r.unitId], t);
      if (!p) continue;
      const fade = 1 - (t - r.t) / linger;
      out.push({
        type: "Feature",
        properties: { kind: "ring", r: 16 + 14 * pulse, o: fade * (1 - pulse) },
        geometry: { type: "Point", coordinates: p },
      });
      out.push({
        type: "Feature",
        properties: { kind: "ring", r: 18, o: fade },
        geometry: { type: "Point", coordinates: p },
      });
    }
  }
  return out;
}

/* ---------------- Variant B: canvas arcs ---------------- */
function drawAreas(
  ctx: CanvasRenderingContext2D,
  P: (p: Position, alt?: number) => readonly [number, number],
  t: number,
  glow: boolean,
) {
  const linger = wall(1, 20, t);
  const now = Date.now();
  for (const e of engagements.value) {
    if (!e.area || t < e.t || t > e.end + linger) continue;
    const o = t <= e.end ? 1 : 1 - (t - e.end) / linger;
    ctx.beginPath();
    e.area.ring.forEach((p, i) => {
      const [x, y] = P(p);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
    const pulse = glow ? 0.6 + 0.4 * Math.sin(now / 250) : 1;
    ctx.fillStyle = `rgba(249,115,22,${0.16 * o * pulse})`;
    ctx.fill();
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = glow ? -(now / 50) % 10 : 0;
    ctx.strokeStyle = `rgba(249,115,22,${0.9 * o})`;
    ctx.lineWidth = 2;
    if (glow) {
      ctx.shadowColor = FIRE;
      ctx.shadowBlur = 12;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
  }
}

let canvas: HTMLCanvasElement | undefined;
function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:2";
  mlMap.getCanvasContainer().appendChild(canvas);
  return canvas;
}
function removeCanvas() {
  canvas?.remove();
  canvas = undefined;
}
// Screen lift for an altitude: 22 km lifts about 70 px, on a square-root scale so
// sea-skimmers still clear the surface.
const lift = (alt: number) => (alt >= 0 ? 70 * Math.sqrt(alt / 22000) : -6);

function drawB(t: number) {
  const c = ensureCanvas();
  const el = mlMap.getCanvas();
  const dpr = window.devicePixelRatio || 1;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
  }
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const P = (p: Position, alt = 0) => {
    const s = mlMap.project(p as [number, number]);
    return [s.x, s.y - lift(alt)] as const;
  };
  drawAreas(ctx, P, t, false);
  const linger = wall(1, 20, t);
  const burstDur = wall(0.6, 3, t);
  const now = Date.now();
  for (const tr of tracks.value) {
    if (t < tr.launch) continue;
    const stop = trackStop(tr);
    const age = t - stop;
    if (age > linger) continue;
    const col = COLORS[tr.side];
    const d = trackPosition(tr, Math.min(t, stop)).d;
    const samples = trackSamples(tr, d, 32);
    const fade = age > 0 ? 1 - age / linger : 1;
    // ground shadow
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.globalAlpha = fade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    samples.forEach((s, i) => {
      const [x, y] = P(s.position);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
    // elevated path
    ctx.setLineDash(tr.profile === "torpedo" ? [1.5, 4] : []);
    ctx.strokeStyle = col;
    ctx.lineWidth = age > 0 ? 1 : 1.5;
    ctx.globalAlpha = age > 0 ? 0.5 * fade : 0.7;
    ctx.beginPath();
    samples.forEach((s, i) => {
      const [x, y] = P(s.position, s.alt);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    const last = samples[samples.length - 1];
    const [hx, hy] = P(last.position, last.alt);
    if (age <= 0) {
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 9);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(hx, hy, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (age < burstDur) {
        const f = age / burstDur;
        const big = tr.outcome === "hit" && !tr.cuts;
        const r = (big ? 26 : 14) * (0.3 + f);
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
        g.addColorStop(0, `rgba(255,255,220,${1 - f})`);
        g.addColorStop(0.4, `rgba(251,191,36,${0.8 * (1 - f)})`);
        g.addColorStop(1, "rgba(249,115,22,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hx, hy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (tr.outcome === "hit" && !tr.cuts) {
        // lingering impact star, with a slow wall-clock flicker
        const flick = 0.75 + 0.25 * Math.sin(now / 180 + hx);
        ctx.globalAlpha = Math.max(0.3, fade) * flick;
        ctx.fillStyle = FIRE;
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
          const rr = i % 2 ? 3 : 8;
          const a = (i * Math.PI) / 8;
          const x = hx + rr * Math.cos(a);
          const y = hy + rr * Math.sin(a);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  // contact: jagged, flowing lines
  for (const e of engagements.value) {
    if (e.type !== "contact" || t < e.t || t > e.end) continue;
    const a = locationAt(unitMap[e.shooterId], t);
    for (const id of e.targets) {
      const b = unitMap[id] && locationAt(unitMap[id], t);
      if (!a || !b) continue;
      const [aa, bb] = shorten(a, b, 0.15);
      ctx.strokeStyle = FIRE;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -(now / 40) % 13;
      ctx.beginPath();
      jagged(aa, bb).forEach((p, i) => {
        const [x, y] = P(p);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  // salvo labels
  ctx.font = "600 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const e of engagements.value) {
    if (e.type === "contact" || t < e.t || t > e.end) continue;
    const at = locationAt(unitMap[e.shooterId], e.t);
    if (!at) continue;
    const [x, y] = P(at);
    const label = `${e.weapon || "Fire"} ×${e.rounds}${e.profile !== "direct" ? ` · ${e.profile}` : ""}`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.strokeText(label, x, y - 28);
    ctx.fillStyle = COLORS[e.side];
    ctx.fillText(label, x, y - 28);
  }
}

/* ---------------- Variant D: cinematic ---------------- */
// Deterministic per-track noise, so sparks and puffs don't jump between frames.
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const GLOW = { friend: "#60a5fa", hostile: "#ff4d4d" };

function drawD(t: number) {
  const c = ensureCanvas();
  const el = mlMap.getCanvas();
  const dpr = window.devicePixelRatio || 1;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
  }
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const now = Date.now();
  const active = isEngagementActive(t);

  // Night-ops veil, deeper while something is in the air, with a vignette.
  ctx.fillStyle = `rgba(3,7,18,${active ? 0.55 : 0.35})`;
  ctx.fillRect(0, 0, w, h);
  const vg = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.3,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(0,0,0,${active ? 0.65 : 0.4})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
  // scanlines
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let y = (now / 60) % 4; y < h; y += 4) ctx.fillRect(0, y, w, 1);

  const P = (p: Position, alt = 0) => {
    const s = mlMap.project(p as [number, number]);
    return [s.x, s.y - lift(alt)] as const;
  };
  drawAreas(ctx, P, t, true);

  // Radar sweeps on units firing interceptors.
  for (const e of engagements.value) {
    if (e.type !== "intercept" || t < e.t - 10 * MS_PER_MINUTE || t > e.end) continue;
    const at = locationAt(unitMap[e.shooterId], t);
    if (!at) continue;
    const [x, y] = P(at);
    const a = (now / 900) % (Math.PI * 2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 160);
    g.addColorStop(0, "rgba(96,165,250,0.35)");
    g.addColorStop(1, "rgba(96,165,250,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 160, a, a + 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(96,165,250,0.25)";
    ctx.lineWidth = 1;
    for (const r of [60, 110, 160]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const smokeLife = wall(2.5, 6, t);
  const linger = wall(1.5, 30, t);
  const boomDur = wall(1.2, 4, t);
  tracks.value.forEach((tr, ti) => {
    if (t < tr.launch) return;
    const stop = trackStop(tr);
    const age = t - stop;
    if (age > linger) return;
    const col = GLOW[tr.side];
    const nowD = trackPosition(tr, Math.min(t, stop)).d;
    const samples = trackSamples(tr, nowD, 40);
    const span = Math.min(t, stop) - tr.launch;

    // smoke: each sample was passed at a time, so puffs swell and fade with age
    ctx.globalCompositeOperation = "source-over";
    samples.forEach((s, i) => {
      const passed = tr.launch + (span * i) / samples.length;
      const pa = (t - passed) / smokeLife;
      if (pa < 0 || pa > 1) return;
      const [x, y] = P(s.position, s.alt);
      const drift = 6 * pa * (hash(ti * 97 + i) - 0.5);
      ctx.fillStyle = `rgba(200,205,215,${0.22 * (1 - pa)})`;
      ctx.beginPath();
      ctx.arc(x + drift, y - 4 * pa, 2 + 9 * pa, 0, Math.PI * 2);
      ctx.fill();
    });

    // glowing trail
    ctx.globalCompositeOperation = "lighter";
    const tail = samples.slice(-12);
    if (age <= 0 && tail.length > 1) {
      const [x0, y0] = P(tail[0].position, tail[0].alt);
      const [x1, y1] = P(tail[tail.length - 1].position, tail[tail.length - 1].alt);
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, col);
      ctx.strokeStyle = g;
      ctx.lineWidth = 3;
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      tail.forEach((s, i) => {
        const [x, y] = P(s.position, s.alt);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
      // head with a flickering exhaust flare
      const flick = 0.7 + 0.3 * Math.sin(now / 35 + ti);
      const hg = ctx.createRadialGradient(x1, y1, 0, x1, y1, 14 * flick);
      hg.addColorStop(0, "rgba(255,255,255,1)");
      hg.addColorStop(0.25, "rgba(255,230,160,0.9)");
      hg.addColorStop(0.6, col);
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(x1, y1, 14 * flick, 0, Math.PI * 2);
      ctx.fill();
    }

    // detonation: flash, fireball, shockwave, sparks; then a burning ember
    if (age > 0) {
      const end = samples[samples.length - 1];
      const [x, y] = P(end.position, end.alt);
      const big = tr.outcome === "hit" && !tr.cuts;
      if (age < boomDur) {
        const f = age / boomDur;
        const R = big ? 46 : 22;
        const fb = ctx.createRadialGradient(x, y, 0, x, y, R * (0.3 + f));
        fb.addColorStop(0, `rgba(255,255,255,${1 - f})`);
        fb.addColorStop(0.3, `rgba(255,214,102,${0.95 * (1 - f)})`);
        fb.addColorStop(0.7, `rgba(255,94,0,${0.7 * (1 - f)})`);
        fb.addColorStop(1, "rgba(120,20,0,0)");
        ctx.fillStyle = fb;
        ctx.beginPath();
        ctx.arc(x, y, R * (0.3 + f), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,240,200,${0.8 * (1 - f)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, R * 2 * f, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,200,80,${1 - f})`;
        ctx.lineWidth = 1.5;
        for (let k = 0; k < (big ? 14 : 7); k++) {
          const a = hash(ti * 31 + k) * Math.PI * 2;
          const r0 = R * 0.4 * f;
          const r1 = R * (0.6 + 1.2 * hash(ti * 7 + k)) * f;
          ctx.beginPath();
          ctx.moveTo(x + r0 * Math.cos(a), y + r0 * Math.sin(a));
          ctx.lineTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a) + 8 * f * f);
          ctx.stroke();
        }
      }
      if (big) {
        const fade = 1 - age / linger;
        const flick = 0.6 + 0.4 * Math.abs(Math.sin(now / 90 + ti));
        const eg = ctx.createRadialGradient(x, y, 0, x, y, 14);
        eg.addColorStop(0, `rgba(255,180,60,${fade * flick})`);
        eg.addColorStop(1, "rgba(255,60,0,0)");
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        // smoke column drifting up
        ctx.globalCompositeOperation = "source-over";
        for (let k = 0; k < 6; k++) {
          const ph = (now / 1600 + k / 6) % 1;
          ctx.fillStyle = `rgba(60,60,66,${0.35 * fade * (1 - ph)})`;
          ctx.beginPath();
          ctx.arc(x + 10 * ph * Math.sin(k), y - 40 * ph, 4 + 10 * ph, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
  });

  // contact: glowing front with tracer fire both ways and muzzle flashes
  for (const e of engagements.value) {
    if (e.type !== "contact" || t < e.t || t > e.end) continue;
    const a = locationAt(unitMap[e.shooterId], t);
    for (const id of e.targets) {
      const b = unitMap[id] && locationAt(unitMap[id], t);
      if (!a || !b) continue;
      const [aa, bb] = shorten(a, b, 0.15);
      const [ax, ay] = P(aa);
      const [bx, by] = P(bb);
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = FIRE;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgba(249,115,22,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      jagged(aa, bb).forEach((p, i) => {
        const [x, y] = P(p);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
      for (let k = 0; k < 10; k++) {
        const dir = k % 2;
        const f = (now / 700 + hash(k * 13)) % 1;
        const from = dir ? [bx, by] : [ax, ay];
        const to = dir ? [ax, ay] : [bx, by];
        const x = from[0] + (to[0] - from[0]) * f;
        const y = from[1] + (to[1] - from[1]) * f + 6 * (hash(k) - 0.5);
        const dx = (to[0] - from[0]) * 0.04;
        const dy = (to[1] - from[1]) * 0.04;
        ctx.strokeStyle = dir ? "rgba(255,120,120,0.9)" : "rgba(160,200,255,0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
      for (const [x, y, s] of [
        [ax, ay, 1],
        [bx, by, 2],
      ] as const) {
        if (hash(Math.floor(now / 120) * s + x) > 0.55) {
          const mg = ctx.createRadialGradient(x, y, 0, x, y, 12);
          mg.addColorStop(0, "rgba(255,255,220,0.95)");
          mg.addColorStop(1, "rgba(255,150,0,0)");
          ctx.fillStyle = mg;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // salvo labels, HUD style
  ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  for (const e of engagements.value) {
    if (e.type === "contact" || t < e.t || t > e.end) continue;
    const at = locationAt(unitMap[e.shooterId], e.t);
    if (!at) continue;
    const [x, y] = P(at);
    const label = `▲ ${e.weapon.toUpperCase() || "FIRE"} ×${e.rounds}`;
    ctx.shadowColor = GLOW[e.side];
    ctx.shadowBlur = 10;
    ctx.fillStyle = GLOW[e.side];
    ctx.fillText(label, x, y - 30);
    ctx.shadowBlur = 0;
  }
}

// Playback moments: banners, a director camera, screen flashes and Hellfire blasts.
const banner = ref<{
  text: string;
  sub: string;
  side: "friend" | "hostile";
  key: number;
} | null>(null);
const flash = ref(0);
let bannerTimer: number | undefined;
let lastBlast = 0;
let lastT = state.currentTime;
let hellfire: typeof import("@/lib/hellfire") | undefined;
function showBanner(e: ProtoEngagement) {
  banner.value = {
    text: e.type === "intercept" ? `${e.weapon} intercept` : `${e.weapon} ×${e.rounds}`,
    sub: `${e.shooterName} → ${e.area ? "target area" : e.targets.map((id) => unitMap[id]?.shortName || id).join(", ")}`,
    side: e.side,
    key: Date.now(),
  };
  clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(() => (banner.value = null), 3200);
}
function direct(e: ProtoEngagement) {
  const pts = [e.shooterId, ...e.targets]
    .map((id) => unitMap[id] && locationAt(unitMap[id], e.t))
    .filter(Boolean) as Position[];
  if (e.area) pts.push(e.area.center);
  if (pts.length < 2) return;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  mlMap.fitBounds(
    [
      [Math.min(...xs), Math.min(...ys)],
      [Math.max(...xs), Math.max(...ys)],
    ],
    { padding: 180, maxZoom: 8, duration: 1400, pitch: 35 },
  );
}
async function blast(p: Position) {
  flash.value = 1;
  window.setTimeout(() => (flash.value = 0), 90);
  if (Date.now() - lastBlast < 1200) return;
  lastBlast = Date.now();
  hellfire ??= await import("@/lib/hellfire");
  hellfire.launchHellfire(mlMap, { lng: p[0], lat: p[1] }, { shake: true });
}
function onTimeD(t: number) {
  const from = lastT;
  lastT = t;
  if (variant.value !== "D" || !playback.playbackRunning || t <= from) return;
  const starting = engagements.value.filter((e) => e.t > from && e.t <= t);
  if (starting.length) {
    const e = starting[0];
    showBanner(e);
    direct(e);
  }
  for (const tr of tracks.value) {
    const stop = trackStop(tr);
    if (tr.outcome === "hit" && !tr.cuts && stop > from && stop <= t) {
      blast(trackPosition(tr, stop).position);
    }
  }
}

/* ---------------- frame ---------------- */
function redraw() {
  const t = state.currentTime;
  if (variant.value === "B") {
    drawB(t);
    return;
  }
  if (variant.value === "D") {
    drawD(t);
    return;
  }
  setupLayers();
  const src = mlMap.getSource(SRC) as GeoJSONSource | undefined;
  src?.setData({
    type: "FeatureCollection",
    features:
      variant.value === "C"
        ? featuresC(t)
        : variant.value === "E"
          ? featuresE(t)
          : featuresA(t),
  });
}
watch(
  () => state.currentTime,
  (t) => {
    onTimeD(t);
    redraw();
  },
);
watch(
  () => state.unitStateCounter,
  () => {
    rebuild();
    redraw();
  },
);
watch(variant, (v) => {
  if (v === "B" || v === "D") {
    removeLayers();
    removeCanvas();
  } else removeCanvas();
  redraw();
});
mlMap.on("render", onRender);
function onRender() {
  if (variant.value === "B") drawB(state.currentTime);
  else if (variant.value === "D") drawD(state.currentTime);
}
// wall-clock animation (pulses, flowing contact lines) while paused
let raf = 0;
function tick() {
  if (!playback.playbackRunning && variant.value !== "A") redraw();
  raf = requestAnimationFrame(tick);
}
raf = requestAnimationFrame(tick);
if (mlMap.isStyleLoaded()) redraw();

onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("keydown", onKey);
  mlMap.off("style.load", onStyleLoad);
  mlMap.off("render", onRender);
  removeCanvas();
  removeLayers();
});

/* ---------------- Variant C: engagement log ---------------- */
const nowT = computed(() => state.currentTime);
const logRows = computed(() => {
  const t = nowT.value;
  const active = engagements.value.filter((e) => t >= e.t && t <= e.end);
  const recent = engagements.value
    .filter((e) => e.end < t && e.end > t - 24 * 60 * MS_PER_MINUTE)
    .slice(-6)
    .reverse();
  const upcoming = engagements.value.filter((e) => e.t > t).slice(0, 3);
  return { active, recent, upcoming };
});
const losses = computed(() => {
  const t = nowT.value;
  const tally = new Map<string, number>();
  for (const e of engagements.value)
    for (const r of e.results)
      if (r.t <= t)
        for (const l of r.losses) {
          const m = /^(.*) (-\d+)$/.exec(l);
          if (m) tally.set(m[1], (tally.get(m[1]) ?? 0) - +m[2]);
        }
  return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
});
const name = (id: string) => unitMap[id]?.shortName || unitMap[id]?.name || id;
const fmt = (t: number) => `${new Date(t).toISOString().slice(5, 16).replace("T", " ")}Z`;
function jumpTo(e: ProtoEngagement) {
  activeScenario.time.setCurrentTime(e.t - MS_PER_MINUTE);
  const a = locationAt(unitMap[e.shooterId], e.t);
  const b =
    e.targets[0] && unitMap[e.targets[0]] && locationAt(unitMap[e.targets[0]], e.t);
  if (a && b)
    mlMap.fitBounds(
      [
        [Math.min(a[0], b[0]), Math.min(a[1], b[1])],
        [Math.max(a[0], b[0]), Math.max(a[1], b[1])],
      ],
      { padding: 120, maxZoom: 9, duration: 900 },
    );
}
const activeNow = computed(() => isEngagementActive(nowT.value));
const dwellLabel = computed(() => {
  const d = dwellSpeedAt(nowT.value);
  return d === undefined ? "" : `${Math.round(d / MS_PER_MINUTE)} min/s`;
});
const dwellModel = computed({
  get: () => protoDwell.value,
  set: (v: boolean) => (protoDwell.value = v),
});
</script>

<template>
  <template v-if="variant === 'D'">
    <div
      class="pointer-events-none absolute inset-0 z-20 bg-white transition-opacity duration-100"
      :style="{ opacity: flash * 0.35 }"
    />
    <Transition
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      leave-to-class="opacity-0 scale-105"
      enter-active-class="transition duration-300 ease-out"
      leave-active-class="transition duration-500 ease-in"
    >
      <div
        v-if="banner"
        :key="banner.key"
        class="pointer-events-none absolute top-28 left-1/2 z-30 -translate-x-1/2 text-center"
      >
        <div class="font-mono text-[11px] tracking-[0.4em] text-white/70">ENGAGEMENT</div>
        <div
          class="font-mono text-3xl font-bold tracking-widest uppercase"
          :style="{
            color: banner.side === 'hostile' ? '#ff6b6b' : '#7cb7ff',
            textShadow: `0 0 18px ${banner.side === 'hostile' ? '#ff2d2d' : '#3b82f6'}`,
          }"
        >
          {{ banner.text }}
        </div>
        <div class="mt-1 font-mono text-sm tracking-wider text-white/85">
          {{ banner.sub }}
        </div>
      </div>
    </Transition>
  </template>
  <div
    v-if="variant === 'C'"
    class="bg-background/90 pointer-events-auto absolute top-16 left-16 z-20 max-h-[70vh] w-72 overflow-y-auto rounded-md border p-3 text-xs shadow-lg backdrop-blur-sm"
  >
    <p class="text-muted-foreground mb-2 font-mono text-[10px] tracking-wider uppercase">
      Engagement log · prototype
    </p>
    <template
      v-for="(group, label) in {
        'In progress': logRows.active,
        Recent: logRows.recent,
        Next: logRows.upcoming,
      }"
      :key="label"
    >
      <p v-if="group.length" class="mt-2 mb-1 font-semibold">{{ label }}</p>
      <button
        v-for="e in group"
        :key="e.id"
        type="button"
        class="hover:bg-muted flex w-full flex-col items-start rounded px-1.5 py-1 text-left"
        @click="jumpTo(e)"
      >
        <span class="flex w-full justify-between gap-2">
          <span :style="{ color: COLORS[e.side] }" class="font-medium">
            {{ e.type === "contact" ? "Contact" : `${e.weapon} ×${e.rounds}` }}
          </span>
          <span class="text-muted-foreground font-mono">{{ fmt(e.t) }}</span>
        </span>
        <span class="text-muted-foreground">
          {{ e.shooterName }} →
          {{ e.area ? "target area" : e.targets.map(name).join(", ") }}
        </span>
        <span
          v-for="r in e.results.filter((x) => x.t <= nowT)"
          :key="r.stateId"
          class="text-orange-600"
        >
          ✸ {{ name(r.unitId) }}: {{ r.title }}
        </span>
      </button>
    </template>
    <p class="mt-3 mb-1 font-semibold">Losses so far (linked hits)</p>
    <p v-if="!losses.length" class="text-muted-foreground">None yet</p>
    <div v-for="[n, c] in losses" :key="n" class="flex justify-between font-mono">
      <span>{{ n }}</span
      ><span>{{ c }}</span>
    </div>
  </div>

  <div
    v-if="showBar"
    class="pointer-events-auto absolute top-14 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/85 px-3 py-1.5 text-xs text-white shadow-xl"
  >
    <button
      type="button"
      class="rounded-full px-2 hover:bg-white/20"
      title="Previous variant (Alt+←)"
      @click="cycle(-1)"
    >
      ←
    </button>
    <span class="min-w-44 text-center font-medium">
      {{ variant }} ({{ VARIANTS[variantIndex].name }})
    </span>
    <button
      type="button"
      class="rounded-full px-2 hover:bg-white/20"
      title="Next variant (Alt+→)"
      @click="cycle(1)"
    >
      →
    </button>
    <span class="mx-1 h-4 w-px bg-white/30" />
    <label class="flex items-center gap-1.5">
      <input v-model="dwellModel" type="checkbox" />
      Dwell
    </label>
    <span
      v-if="dwellLabel && protoDwell && playback.playbackRunning"
      class="font-mono text-amber-300"
      >{{ dwellLabel }}</span
    >
    <span class="text-white/60">{{ engagements.length }} engagements</span>
  </div>
</template>
