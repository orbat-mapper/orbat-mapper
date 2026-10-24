// PROTOTYPE (throwaway, branch prototype/engagement-playback): engagement playback.
// Reads `action` and `causedBy` from unit state entries (not in the typed model yet) and
// computes what to draw at a scenario time. No tests, minimal error handling.
import { ref } from "vue";
import type { Position } from "geojson";
import turfLength from "@turf/length";
import turfAlong from "@turf/along";
import { lineString } from "@turf/helpers";
import turfCircle from "@turf/circle";
import type { NUnit } from "@/types/internalModels";
import type { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { MS_PER_MINUTE } from "@/utils/time";

export type ProtoSide = "friend" | "hostile";
export type ProtoActionType = "fire" | "intercept" | "contact";

interface ProtoActionJson {
  type: ProtoActionType;
  target?:
    | { type: "units"; units: string[] }
    | {
        type: "geometry";
        geometry: { type: "Point"; coordinates: Position };
        radius?: number;
      };
  weapon?: string;
  rounds?: number;
  flightTime?: string;
  duration?: string;
  flight?: { profile?: string; via?: Position[]; points?: ProfilePoint[] };
}

export interface ProfilePoint {
  d: number;
  alt: number;
  t?: number;
}

export interface ProtoEngagement {
  id: string;
  type: ProtoActionType;
  shooterId: string;
  shooterName: string;
  side: ProtoSide;
  t: number;
  end: number;
  weapon: string;
  rounds: number;
  targets: string[];
  profile: string;
  points: ProfilePoint[];
  via: Position[];
  flightMs: number;
  durationMs: number;
  area?: { center: Position; radius: number; ring: Position[] };
  title?: string;
  results: {
    unitId: string;
    t: number;
    stateId: string;
    title?: string;
    losses: string[];
  }[];
}

export interface ProtoTrack {
  engagementId: string;
  side: ProtoSide;
  profile: string;
  points: ProfilePoint[];
  launch: number;
  end: number;
  start: Position;
  finish: Position;
  via: Position[];
  outcome: "hit" | "intercepted" | "miss";
  // when an intercept cuts the track short; the flight timing still uses `end`
  cutAt?: number;
  // intercept tracks carry the track they cut
  cuts?: ProtoTrack;
}

const PRESETS: Record<string, ProfilePoint[]> = {
  direct: [
    { d: 0, alt: 0 },
    { d: 1, alt: 0 },
  ],
  "high-dive": [
    { d: 0, alt: 10000 },
    { d: 0.1, alt: 22000 },
    { d: 0.8, alt: 22000 },
    { d: 1, alt: 0 },
  ],
  "sea-skimming": [
    { d: 0, alt: 3000 },
    { d: 0.1, alt: 15 },
    { d: 1, alt: 15 },
  ],
  "high-low": [
    { d: 0, alt: 0 },
    { d: 0.05, alt: 14000 },
    { d: 0.85, alt: 14000 },
    { d: 0.9, alt: 25 },
    { d: 1, alt: 25 },
  ],
  torpedo: [
    { d: 0, alt: -50 },
    { d: 1, alt: -50 },
  ],
  ballistic: Array.from({ length: 11 }, (_, i) => ({
    d: i / 10,
    alt: 20000 * (i / 10) * (1 - i / 10),
  })),
};

const MAX_TRACKS = 8;
const SALVO_SPREAD = 2 * MS_PER_MINUTE;

export const protoDwell = ref(true);
export const protoDwellSpeed = MS_PER_MINUTE;

function parseDuration(iso?: string): number | undefined {
  if (!iso) return undefined;
  const m = /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(
    iso,
  );
  if (!m) return undefined;
  return ((+(m[1] ?? 0) * 60 + +(m[2] ?? 0)) * 60 + +(m[3] ?? 0)) * 1000;
}

export function sideOf(unit: NUnit): ProtoSide {
  const si = unit.sidc?.[3];
  return si === "5" || si === "6" ? "hostile" : "friend";
}

/** The unit's location at `t`, interpolated the way `rebuildCurrentUnitState` does. */
export function locationAt(unit: NUnit, t: number): Position | undefined {
  let loc: Position | undefined | null = unit.location;
  let locT: number | undefined;
  const entries = unit.state ?? [];
  for (let i = 0; i < entries.length; i++) {
    const s = entries[i];
    if (s.t <= t) {
      if (s.location !== undefined) {
        loc = s.location;
        locT = s.t;
      }
      continue;
    }
    const legEnd = entries.slice(i).find((e) => e.location !== undefined);
    const legStart = legEnd?.viaStartTime ?? locT;
    if (
      loc &&
      legEnd?.location &&
      legEnd.interpolate !== false &&
      legStart !== undefined &&
      legStart <= t
    ) {
      const line = lineString(
        legEnd.via ? [loc, ...legEnd.via, legEnd.location] : [loc, legEnd.location],
      );
      const f = (t - legStart) / (legEnd.t - legStart);
      return turfAlong(line, turfLength(line) * f).geometry.coordinates;
    }
    return loc ?? undefined;
  }
  return loc ?? undefined;
}

export function buildEngagements(store: NewScenarioStore): ProtoEngagement[] {
  const { unitMap, equipmentMap } = store.state;
  const results = new Map<string, ProtoEngagement["results"]>();
  for (const unit of Object.values(unitMap)) {
    for (const s of unit.state ?? []) {
      const causedBy = (s as any).causedBy as string[] | undefined;
      if (!causedBy) continue;
      const losses = (s.diff?.equipment ?? [])
        .filter((e) => (e.onHand ?? 0) < 0)
        .map((e) => `${equipmentMap[e.id]?.name ?? e.id} ${e.onHand}`);
      for (const by of causedBy) {
        const list = results.get(by) ?? [];
        list.push({ unitId: unit.id, t: s.t, stateId: s.id, title: s.title, losses });
        results.set(by, list);
      }
    }
  }
  const out: ProtoEngagement[] = [];
  for (const unit of Object.values(unitMap)) {
    for (const s of unit.state ?? []) {
      const action = (s as any).action as ProtoActionJson | undefined;
      if (!action) continue;
      const targets = action.target?.type === "units" ? action.target.units : [];
      const area =
        action.target?.type === "geometry"
          ? {
              center: action.target.geometry.coordinates,
              radius: action.target.radius ?? 500,
              ring: turfCircle(
                action.target.geometry.coordinates,
                (action.target.radius ?? 500) / 1000,
                {
                  steps: 48,
                },
              ).geometry.coordinates[0],
            }
          : undefined;
      const spent = s.diff?.supplies?.find((x) => (x.onHand ?? 0) < 0)?.onHand;
      const rounds = action.rounds ?? (spent ? -spent : 1);
      const flightMs = parseDuration(action.flightTime) ?? MS_PER_MINUTE;
      const durationMs =
        action.type === "fire" ? (parseDuration(action.duration) ?? 0) : 0;
      const linked = results.get(s.id) ?? [];
      let end: number;
      if (action.type === "contact") {
        end = s.t + (parseDuration(action.duration) ?? 6 * 60 * MS_PER_MINUTE);
      } else {
        end = Math.max(
          s.t + Math.max(SALVO_SPREAD, durationMs) + flightMs,
          ...linked.filter((r) => r.t > s.t).map((r) => r.t),
        );
      }
      const profile = action.flight?.points
        ? "custom"
        : (action.flight?.profile ?? "direct");
      out.push({
        id: s.id,
        type: action.type,
        shooterId: unit.id,
        shooterName: unit.shortName || unit.name,
        side: sideOf(unit),
        t: s.t,
        end,
        weapon: action.weapon ?? "",
        rounds,
        targets,
        profile,
        points: action.flight?.points ?? PRESETS[profile] ?? PRESETS.direct,
        via: action.flight?.via ?? [],
        flightMs,
        durationMs,
        area,
        title: s.title,
        results: linked,
      });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

function hash01(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A ballistic arc whose apex grows with range, about 0.28 x the distance. */
function ballisticPoints(a: Position, b: Position): ProfilePoint[] {
  const apex = Math.min(30000, 0.28 * turfLength(lineString([a, b])) * 1000);
  return Array.from({ length: 11 }, (_, i) => ({
    d: i / 10,
    alt: 4 * apex * (i / 10) * (1 - i / 10),
  }));
}

const MAX_MISSION_ROUNDS = 48;

/** Rounds of a fire mission: spread over its duration, scattered over the target area. */
function missionTracks(
  e: ProtoEngagement,
  shooter: NUnit,
  unitMap: Record<string, NUnit>,
) {
  const out: ProtoTrack[] = [];
  const spread = e.durationMs || SALVO_SPREAD;
  const n = Math.min(MAX_MISSION_ROUNDS, Math.max(1, e.rounds));
  const seed = e.t / 60000;
  for (let k = 0; k < n; k++) {
    const launch = e.t + (spread * (k + 0.8 * hash01(seed + k))) / n;
    const end = launch + Math.max(20000, e.flightMs);
    const start = locationAt(shooter, launch);
    const targetId = e.targets[k % Math.max(1, e.targets.length)];
    const center =
      e.area?.center ??
      (targetId && unitMap[targetId] ? locationAt(unitMap[targetId], end) : undefined);
    if (!start || !center) continue;
    const radius = e.area?.radius ?? 700;
    const r = radius * Math.sqrt(hash01(seed + k * 3.1));
    const a = hash01(seed + k * 7.7) * Math.PI * 2;
    const finish: Position = [
      center[0] + (r * Math.cos(a)) / (111320 * Math.cos((center[1] * Math.PI) / 180)),
      center[1] + (r * Math.sin(a)) / 111320,
    ];
    out.push({
      engagementId: e.id,
      side: e.side,
      profile: e.profile,
      points: e.profile === "ballistic" ? ballisticPoints(start, finish) : e.points,
      launch,
      end,
      start,
      finish,
      via: [],
      outcome: "miss",
    });
  }
  // A linked result is drawn as a hit on the round that lands closest to it.
  for (const res of e.results) {
    let best: ProtoTrack | undefined;
    for (const tr of out)
      if (!best || Math.abs(tr.end - res.t) < Math.abs(best.end - res.t)) best = tr;
    if (best) best.outcome = "hit";
  }
  return out;
}

/** Deterministic tracks for every fire and intercept engagement. Built once per scenario edit. */
export function buildTracks(
  engagements: ProtoEngagement[],
  unitMap: Record<string, NUnit>,
): ProtoTrack[] {
  const tracks: ProtoTrack[] = [];
  for (const e of engagements.filter((x) => x.type === "fire")) {
    const shooter = unitMap[e.shooterId];
    if (!shooter) continue;
    if (e.durationMs || e.area) {
      tracks.push(...missionTracks(e, shooter, unitMap));
      continue;
    }
    const n = Math.min(MAX_TRACKS, Math.max(1, e.rounds));
    const hitTargets = new Map(
      e.results.filter((r) => r.t > e.t).map((r) => [r.unitId, r.t]),
    );
    for (let k = 0; k < n; k++) {
      const targetId = e.targets[k % Math.max(1, e.targets.length)];
      const target = unitMap[targetId];
      if (!target) continue;
      const launch = e.t + (k * SALVO_SPREAD) / n;
      const hitT = hitTargets.get(targetId);
      // One track per hit target ends at the hit; the rest fly their nominal time.
      const isHit = hitT !== undefined && k < e.targets.length;
      const end = isHit ? hitT : launch + Math.max(MS_PER_MINUTE, e.flightMs);
      const start = locationAt(shooter, launch);
      const finish = locationAt(target, end);
      if (!start || !finish) continue;
      const dist = Math.hypot(finish[0] - start[0], finish[1] - start[1]);
      const j = 0.01 * dist;
      tracks.push({
        engagementId: e.id,
        side: e.side,
        profile: e.profile,
        points: e.profile === "ballistic" ? ballisticPoints(start, finish) : e.points,
        launch,
        end,
        start,
        finish: isHit
          ? finish
          : [finish[0] + ((k % 3) - 1) * j, finish[1] + (((k >> 1) % 3) - 1) * j],
        via: e.via,
        outcome: isHit ? "hit" : "miss",
      });
    }
  }
  for (const e of engagements.filter((x) => x.type === "intercept")) {
    const shooter = unitMap[e.shooterId];
    if (!shooter) continue;
    const n = Math.min(MAX_TRACKS, Math.max(1, e.rounds));
    const flight = Math.max(MS_PER_MINUTE, e.flightMs);
    for (let k = 0; k < n; k++) {
      const launch = e.t + (k * SALVO_SPREAD) / n;
      const at = launch + flight;
      const start = locationAt(shooter, launch);
      if (!start) continue;
      const victim = tracks.find(
        (tr) =>
          tr.outcome === "miss" &&
          e.targets.includes(
            engagements.find((x) => x.id === tr.engagementId)!.shooterId,
          ) &&
          tr.launch < at &&
          tr.end > at &&
          tr.cutAt === undefined,
      );
      if (victim) {
        const p = trackPosition(victim, at).position;
        victim.outcome = "intercepted";
        victim.cutAt = at;
        tracks.push({
          engagementId: e.id,
          side: e.side,
          profile: "direct",
          points: PRESETS.direct,
          launch,
          end: at,
          start,
          finish: p,
          via: [],
          outcome: "hit",
          cuts: victim,
        });
      } else {
        const target = unitMap[e.targets[k % e.targets.length]];
        const finish = target && locationAt(target, at);
        if (!finish) continue;
        tracks.push({
          engagementId: e.id,
          side: e.side,
          profile: "direct",
          points: PRESETS.direct,
          launch,
          end: at,
          start,
          finish,
          via: [],
          outcome: "miss",
        });
      }
    }
  }
  return tracks;
}

function interpolatePoints(
  points: ProfilePoint[],
  key: "t" | "d",
  value: number,
  out: "t" | "d" | "alt",
) {
  const get = (p: ProfilePoint, k: "t" | "d" | "alt") =>
    k === "t" ? (p.t ?? p.d) : p[k];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (value <= get(b, key) || i === points.length - 1) {
      const span = get(b, key) - get(a, key) || 1;
      const f = Math.max(0, Math.min(1, (value - get(a, key)) / span));
      return get(a, out) + (get(b, out) - get(a, out)) * f;
    }
  }
  return get(points[0], out);
}

/** Where a track's projectile is at `t`: position, altitude (m) and the fraction of distance flown. */
export function trackPosition(track: ProtoTrack, t: number) {
  const tf = Math.max(
    0,
    Math.min(1, (t - track.launch) / (track.end - track.launch || 1)),
  );
  const d = interpolatePoints(track.points, "t", tf, "d");
  const line = [track.start, ...track.via, track.finish];
  let position: Position;
  if (line.length === 2) {
    position = [
      track.start[0] + (track.finish[0] - track.start[0]) * d,
      track.start[1] + (track.finish[1] - track.start[1]) * d,
    ];
  } else {
    const ls = lineString(line);
    position = turfAlong(ls, turfLength(ls) * d).geometry.coordinates;
  }
  return { position, alt: interpolatePoints(track.points, "d", d, "alt"), d };
}

/** Altitude along the track at distance fractions, for drawing a whole path. */
export function trackSamples(track: ProtoTrack, toD: number, steps = 24) {
  const line = [track.start, ...track.via, track.finish];
  const ls = line.length > 2 ? lineString(line) : undefined;
  const len = ls ? turfLength(ls) : 0;
  const out: { position: Position; alt: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const d = (toD * i) / steps;
    const position = ls
      ? turfAlong(ls, len * d).geometry.coordinates
      : [
          track.start[0] + (track.finish[0] - track.start[0]) * d,
          track.start[1] + (track.finish[1] - track.start[1]) * d,
        ];
    out.push({ position, alt: interpolatePoints(track.points, "d", d, "alt") });
  }
  return out;
}

let cachedEngagements: ProtoEngagement[] = [];
export function setProtoEngagements(list: ProtoEngagement[]) {
  cachedEngagements = list;
}

/** How fast dwell plays at `t`: 1 min/s for short engagements, faster for long fire
 * missions so a two-hour barrage takes about 20 s. Undefined when nothing is active. */
export function dwellSpeedAt(t: number) {
  let speed: number | undefined;
  for (const e of cachedEngagements) {
    if (e.type === "contact" || t < e.t - MS_PER_MINUTE || t > e.end) continue;
    const s = Math.max(MS_PER_MINUTE, (e.end - e.t) / 20);
    speed = speed === undefined ? s : Math.min(speed, s);
  }
  return speed;
}

export function isEngagementActive(t: number) {
  return cachedEngagements.some(
    (e) => e.type !== "contact" && t >= e.t - MS_PER_MINUTE && t <= e.end,
  );
}

/** The start of the first non-contact engagement in (from, to], so playback can stop at it. */
export function nextEngagementStart(from: number, to: number) {
  const e = cachedEngagements.find(
    (x) =>
      x.type !== "contact" && x.t - MS_PER_MINUTE > from && x.t - MS_PER_MINUTE <= to,
  );
  return e ? e.t - MS_PER_MINUTE : undefined;
}

/** When a track stops being drawn as in flight: its hit, or the intercept that cut it. */
export const trackStop = (track: ProtoTrack) => track.cutAt ?? track.end;
