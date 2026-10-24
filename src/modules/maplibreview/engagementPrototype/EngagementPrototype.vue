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
  protoDwellSpeed,
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
  return protoDwell.value && isEngagementActive(t)
    ? Math.min(protoDwellSpeed, playback.playbackSpeed)
    : playback.playbackSpeed;
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
}
function removeLayers() {
  for (const id of LAYERS) if (mlMap.getLayer(id)) mlMap.removeLayer(id);
  if (mlMap.getSource(SRC)) mlMap.removeSource(SRC);
}
function onStyleLoad() {
  if (variant.value !== "B") setupLayers();
  redraw();
}
mlMap.on("style.load", onStyleLoad);

function featuresA(t: number): Feature[] {
  const out: Feature[] = [];
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

function featuresC(t: number): Feature[] {
  const out: Feature[] = [];
  const linger = wall(1.5, 30, t);
  const pulse = (Date.now() % 1400) / 1400;
  for (const e of engagements.value) {
    if (t < e.t || t > e.end + linger) continue;
    const active = t <= e.end;
    const a = locationAt(unitMap[e.shooterId], t);
    for (const id of e.targets) {
      const b = unitMap[id] && locationAt(unitMap[id], t);
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

/* ---------------- frame ---------------- */
function redraw() {
  const t = state.currentTime;
  if (variant.value === "B") {
    drawB(t);
    return;
  }
  setupLayers();
  const src = mlMap.getSource(SRC) as GeoJSONSource | undefined;
  src?.setData({
    type: "FeatureCollection",
    features: variant.value === "C" ? featuresC(t) : featuresA(t),
  });
}
watch(() => state.currentTime, redraw);
watch(
  () => state.unitStateCounter,
  () => {
    rebuild();
    redraw();
  },
);
watch(variant, (v) => {
  if (v === "B") removeLayers();
  else removeCanvas();
  redraw();
});
mlMap.on("render", onRender);
function onRender() {
  if (variant.value === "B") drawB(state.currentTime);
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
const dwellModel = computed({
  get: () => protoDwell.value,
  set: (v: boolean) => (protoDwell.value = v),
});
</script>

<template>
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
          {{ e.shooterName }} → {{ e.targets.map(name).join(", ") }}
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
      v-if="activeNow && protoDwell && playback.playbackRunning"
      class="font-mono text-amber-300"
      >1 min/s</span
    >
    <span class="text-white/60">{{ engagements.length }} engagements</span>
  </div>
</template>
