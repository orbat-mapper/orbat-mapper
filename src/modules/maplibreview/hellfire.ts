import type { Map as MlMap } from "maplibre-gl";
import type { Position } from "geojson";
import { isUnitLayerId } from "@/geo/engines/maplibre/unitLayer";
import { toRgbaColor } from "@/utils/cssColor";

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
/** The sprite is drawn at this multiple of its display size, for sharp edges on any screen. */
const PIXEL_RATIO = 2;
const MISSILE_WIDTH = 22;
const MISSILE_HEIGHT = 64;
/** How far from the camera the missile starts, as a share of the target's distance. */
const LAUNCH_DEPTH = 0.25;
/** Seen from behind, the missile looks this much shorter than it is. */
const FORESHORTENING = 0.65;

type ScreenPoint = { x: number; y: number };

function lerp(from: ScreenPoint, to: ScreenPoint, k: number): ScreenPoint {
  return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** The missile sprite, drawn on first launch and shared by every missile after it. */
let missileSprite: HTMLCanvasElement | undefined;

/**
 * Draws a top-down missile pointing up: a slim olive body with a seeker nose, mid-body wings,
 * tail fins and the rocket motor's flame. The flame is drawn without its flicker, which comes
 * from scaling the sprite.
 */
function drawMissile(): HTMLCanvasElement {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.canvas.width = MISSILE_WIDTH * PIXEL_RATIO;
  ctx.canvas.height = MISSILE_HEIGHT * PIXEL_RATIO;
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

  return ctx.canvas;
}

export type OnUnitsHit = (unitIds: string[]) => void;

/**
 * Just for fun: fires a Hellfire missile from the orbiting "drone" (the bottom middle of the
 * screen) at a point on the map. It leaves a smoke trail, and its impact flashes, throws up a
 * fireball, a shockwave, debris and a smoke cloud, and shakes the map. Unit symbols near the
 * impact go up in secondary explosions; what happens to the units themselves is up to
 * `onUnitsHit`, called with their ids once they have all gone up.
 *
 * It all draws on a 2D canvas over the map rather than through map layers. With terrain on,
 * MapLibre drapes line layers such as the trail onto the terrain, so updating them every frame
 * redraws the whole basemap into the terrain's textures (see `terrainRttFilter.ts`), which drops
 * the frame rate.
 */
export function launchHellfire(
  map: MlMap,
  target: { lng: number; lat: number },
  onUnitsHit?: OnUnitsHit,
) {
  const mapCanvas = map.getCanvas();
  const to: Position = [target.lng, target.lat];

  missileSprite ??= drawMissile();
  const sprite = missileSprite;

  // In the canvas container, so the overlay shakes with the map.
  const overlay = document.createElement("canvas");
  Object.assign(overlay.style, {
    position: "absolute",
    top: "0",
    left: "0",
    pointerEvents: "none",
  });
  map.getCanvasContainer().appendChild(overlay);
  const ctx = overlay.getContext("2d")!;

  // The motor's glow over the nozzle, 40 pixels down the sprite, which is drawn 10 back.
  const nozzle = 40 - MISSILE_HEIGHT / 2 + 10;
  const glow = ctx.createRadialGradient(0, nozzle, 0, 0, nozzle, 9);
  glow.addColorStop(0, "rgba(255, 237, 213, 0.9)");
  glow.addColorStop(0.4, "rgba(251, 146, 60, 0.5)");
  glow.addColorStop(1, "rgba(234, 88, 12, 0)");

  function project(at: Position): ScreenPoint {
    return map.project(at as [number, number]);
  }

  /** The target on screen this frame. */
  let targetPoint: ScreenPoint = project(to);
  /**
   * Where the missile comes from this frame: just below the bottom of the screen, beside the
   * camera. The drone flies with the camera, so the missile flies in screen space, which keeps
   * its path straight on a globe too.
   */
  let launch: ScreenPoint = { x: 0, y: 0 };

  /** Matches the overlay to the map's size and clears it for a new frame. */
  function resetOverlay() {
    const width = mapCanvas.clientWidth;
    const height = mapCanvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (overlay.width !== pixelWidth || overlay.height !== pixelHeight) {
      overlay.width = pixelWidth;
      overlay.height = pixelHeight;
      overlay.style.width = `${width}px`;
      overlay.style.height = `${height}px`;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    targetPoint = project(to);
    launch = { x: width / 2, y: height + 80 };
  }

  function shake() {
    const container = map.getCanvasContainer();
    container.classList.remove("hellfire-shake");
    // Restart the animation if another missile is still shaking the map.
    void container.offsetWidth;
    container.classList.add("hellfire-shake");
    window.setTimeout(() => container.classList.remove("hellfire-shake"), 500);
  }

  /** How the ground around a point lies on screen. */
  type View = {
    /** The point itself. */
    center: ScreenPoint;
    /** A 2D transform that lays a circle flat on the ground, keeping its widest size in pixels. */
    ground: [number, number, number, number];
    /** Where a point moves on screen per pixel of height above the ground. */
    up: ScreenPoint;
    /** How far the ground is tilted away: 0 looking straight down, near 1 at the horizon. */
    tilt: number;
  };

  /**
   * How the ground around `at` lies on screen: tilted by the map's pitch and, on a globe, by the
   * curve of the earth. Found by projecting short steps east and north of it; a circle on the
   * ground shows as an ellipse, squashed across the way the ground tilts away, and height shows
   * along that same squashed axis.
   */
  function viewAt(at: Position): View {
    const center = project(at);
    const [lng, lat] = at;
    // About a kilometre each way; a circle looks the same whichever way the steps go.
    const step = 0.01;
    const east = project([
      lng + step / Math.max(Math.cos((lat * Math.PI) / 180), 0.01),
      lat,
    ]);
    const north = project([lng, lat > 0 ? lat - step : lat + step]);
    const ex = east.x - center.x;
    const ey = east.y - center.y;
    const nx = north.x - center.x;
    const ny = north.y - center.y;
    // The ellipse's axes, from the eigenvalues of the steps' covariance.
    const sxx = ex * ex + nx * nx;
    const syy = ey * ey + ny * ny;
    const sxy = ex * ey + nx * ny;
    const mean = (sxx + syy) / 2;
    const spread = Math.hypot((sxx - syy) / 2, sxy);
    const major = Math.sqrt(mean + spread);
    const minor = Math.sqrt(Math.max(mean - spread, 0));
    if (!(major > 0))
      return { center, ground: [1, 0, 0, 1], up: { x: 0, y: 0 }, tilt: 0 };
    const along = Math.atan2(2 * sxy, sxx - syy) / 2;
    const tilt = Math.sqrt(1 - (minor / major) ** 2);
    // Across the major axis, pointing up the screen.
    const sign = Math.cos(along) > 0 ? -1 : 1;
    return {
      center,
      ground: [ex / major, ey / major, nx / major, ny / major],
      up: { x: -Math.sin(along) * sign * tilt, y: Math.cos(along) * sign * tilt },
      tilt,
    };
  }

  function lift(point: ScreenPoint, view: View, height: number): ScreenPoint {
    return { x: point.x + view.up.x * height, y: point.y + view.up.y * height };
  }

  /**
   * The missile's flight `progress` of the way along. It flies from beside the camera straight
   * at the target, so perspective does the work: it starts big and close, then shrinks and slows
   * on screen as it pulls away. `scale` is how much bigger it looks than at the target, and
   * `ground` is the spot on the ground below it, which runs in from the bottom of the screen.
   */
  function flightAt(progress: number, view: View) {
    const depth = LAUNCH_DEPTH + (1 - LAUNCH_DEPTH) * progress;
    const scale = 1 / depth;
    // Off the line of sight to the target, the offset shrinks with distance from the camera.
    const air = lerp(targetPoint, launch, ((1 - progress) * LAUNCH_DEPTH) / depth);
    const height = 1 - progress;
    const drop =
      (Math.hypot(launch.x - targetPoint.x, launch.y - targetPoint.y) / 8) *
      height *
      scale;
    return { air, ground: lift(air, view, -drop), height, scale };
  }

  /**
   * A ribbon along the trail, `width` pixels wide at the target and wider towards the camera,
   * its gradient running from the camera end to the head.
   */
  function fillRibbon(
    points: { at: ScreenPoint; scale: number }[],
    width: number,
    stops: [number, string][],
  ) {
    const left: ScreenPoint[] = [];
    const right: ScreenPoint[] = [];
    points.forEach(({ at, scale }, i) => {
      const before = points[Math.max(0, i - 1)].at;
      const after = points[Math.min(points.length - 1, i + 1)].at;
      const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
      const half = (width * scale) / 2;
      const nx = (-(after.y - before.y) / length) * half;
      const ny = ((after.x - before.x) / length) * half;
      left.push({ x: at.x + nx, y: at.y + ny });
      right.push({ x: at.x - nx, y: at.y - ny });
    });
    const first = points[0].at;
    const last = points[points.length - 1].at;
    const gradient = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    for (const point of [...left, ...right.reverse()]) ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.fill();
  }

  /** The smoke trail up to `progress`; fresh thick smoke at the head, thinning out behind. */
  function drawTrail(progress: number, view: View, fade = 1) {
    const segments = Math.max(1, Math.ceil(progress * 40));
    const points = Array.from({ length: segments + 1 }, (_, i) => {
      const { air, scale } = flightAt((progress * i) / segments, view);
      return { at: air, scale };
    });
    ctx.save();
    // Soft smoke: wide faint ribbons under narrower ones.
    for (const [width, alpha] of [
      [24, 0.15],
      [14, 0.3],
    ]) {
      ctx.globalAlpha = alpha * fade;
      fillRibbon(points, width, [
        [0, "rgba(148, 163, 184, 0)"],
        [0.5, "rgba(148, 163, 184, 0.25)"],
        [1, "rgba(203, 213, 225, 0.9)"],
      ]);
    }
    ctx.globalAlpha = 0.9 * fade;
    fillRibbon(points, 4, [
      [0, "rgba(241, 245, 249, 0)"],
      [0.7, "rgba(241, 245, 249, 0.5)"],
      [0.97, "rgba(255, 255, 255, 1)"],
      [1, "rgba(253, 186, 116, 1)"],
    ]);
    ctx.restore();
  }

  /** The missile's shadow on the ground below it, softer the higher the missile flies. */
  function drawShadow(at: ScreenPoint, view: View, height: number, scale: number) {
    const opacity = 0.35 * Math.min(1, view.tilt * 3) * (1 - 0.5 * height);
    if (opacity <= 0) return;
    drawPuff(at, view, {
      color: "#0f172a",
      radius: (7 + 5 * height) * scale,
      opacity,
      blur: 1,
      flat: true,
    });
  }

  /**
   * The missile, seen from behind as it flies away: nose towards the target, foreshortened, its
   * motor glowing. Its middle trails the head a little.
   */
  function drawMissileAt(at: ScreenPoint, scale: number, size: number) {
    const angle = Math.atan2(targetPoint.x - at.x, at.y - targetPoint.y);
    ctx.save();
    ctx.translate(at.x, at.y);
    ctx.rotate(angle);
    ctx.scale(size * scale, size * scale * FORESHORTENING);
    ctx.drawImage(
      sprite,
      -MISSILE_WIDTH / 2,
      -MISSILE_HEIGHT / 2 + 10,
      MISSILE_WIDTH,
      MISSILE_HEIGHT,
    );
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, nozzle, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * One layer of an explosion; the layers stack in the order `blastPuffs` lists them. A flat
   * puff lies on the ground; any other hangs `height` pixels above it, facing the viewer.
   */
  type Puff = {
    color: string;
    radius: number;
    opacity: number;
    blur: number;
    stroke?: number;
    strokeOpacity?: number;
    flat?: boolean;
    height?: number;
  };

  /**
   * The layers of one explosion `t` of the way through, at `scale` times the missile's own. Seen
   * from the side, the fireball and the smoke rise off the ground, the smoke cloud on a column.
   */
  function blastPuffs(t: number, scale: number, tilt: number): Puff[] {
    const smoke = clamp01((t - 0.08) / 0.92);
    const fire = clamp01(t / 0.45);
    const flash = clamp01(t / 0.12);
    const wave = clamp01(t / 0.35);
    const smokeRadius = scale * (20 + 75 * easeOutCubic(smoke));
    const smokeHeight = scale * 110 * easeOutCubic(smoke);
    const smokeOpacity = 0.75 * Math.min(1, smoke * 6) * (1 - smoke ** 2);
    const fireHeight = scale * 25 * easeOutCubic(fire);
    return [
      {
        color: "#1c1917",
        radius: scale * (16 + 20 * easeOutCubic(fire)),
        opacity: 0.45 * Math.min(1, t * 8) * (1 - clamp01((t - 0.7) / 0.3)),
        blur: 0.6,
        flat: true,
      },
      {
        color: "#fef3c7",
        radius: scale * (20 + 140 * easeOutCubic(wave)),
        opacity: 0,
        blur: 0,
        stroke: 3 * (1 - wave) + 0.5,
        strokeOpacity: 0.8 * (1 - wave),
        flat: true,
      },
      // The column only shows from the side; from above, the cloud hides it.
      ...[0.25, 0.55].map((at, i) => ({
        color: "#52525b",
        radius: smokeRadius * (0.4 + 0.15 * i),
        opacity: smokeOpacity * tilt,
        blur: 0.7,
        height: smokeHeight * at,
      })),
      {
        color: "#3f3f46",
        radius: smokeRadius,
        opacity: smokeOpacity,
        blur: 0.7,
        height: smokeHeight,
      },
      {
        color: "#ea580c",
        radius: scale * (12 + 48 * easeOutCubic(fire)),
        opacity: 0.95 * (1 - fire ** 1.5),
        blur: 0.5,
        height: fireHeight,
      },
      {
        color: "#fde047",
        radius: scale * (8 + 26 * easeOutCubic(fire)),
        opacity: 1 - fire,
        blur: 0.6,
        height: fireHeight * 0.7,
      },
      {
        color: "#ffffff",
        radius: scale * (10 + 40 * easeOutCubic(flash)),
        opacity: 1 - flash,
        blur: 0.4,
      },
    ];
  }

  /** Draws a puff over the ground at `center`. Its edge fades out over the outer `blur` of it. */
  function drawPuff(center: ScreenPoint, view: View, puff: Puff) {
    const { color, radius, opacity, blur, stroke = 0, strokeOpacity = 0 } = puff;
    if (radius <= 0) return;
    const at = puff.flat ? center : lift(center, view, puff.height ?? 0);
    ctx.save();
    ctx.translate(at.x, at.y);
    if (puff.flat) ctx.transform(...view.ground, 0, 0);
    if (opacity > 0) {
      const fill = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      fill.addColorStop(0, toRgbaColor(color, opacity, color));
      fill.addColorStop(clamp01(1 - blur), toRgbaColor(color, opacity, color));
      fill.addColorStop(1, toRgbaColor(color, 0, color));
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    if (stroke > 0 && strokeOpacity > 0) {
      ctx.strokeStyle = toRgbaColor(color, strokeOpacity, color);
      ctx.lineWidth = stroke;
      ctx.beginPath();
      ctx.arc(0, 0, radius + stroke / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
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
    const center = targetPoint;
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
      const point = project(at);
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

  /** Debris flying out over the ground and up on an arc, landing as it burns out. */
  function drawSparks(origin: ScreenPoint, view: View, explosion: Explosion, t: number) {
    if (t >= 1) return;
    const travel = easeOutCubic(t);
    const [a, b, c, d] = view.ground;
    // From above, the arc reads as a slight sag.
    const sag = 12 * t * t * (1 - view.tilt);
    ctx.save();
    ctx.globalAlpha = 1 - t ** 2;
    ctx.fillStyle = "#fdba74";
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 0.5;
    for (const { angle, distance, size } of explosion.sparks) {
      const reach = distance * travel;
      const dx = Math.cos(angle) * reach;
      const dy = Math.sin(angle) * reach;
      const ground = {
        x: origin.x + a * dx + c * dy,
        y: origin.y + b * dx + d * dy + sag,
      };
      const at = lift(ground, view, distance * 2.4 * t * (1 - t));
      ctx.beginPath();
      ctx.arc(at.x, at.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  const start = performance.now();
  let explosions: Explosion[] | null = null;
  let lastDelay = 0;
  let endsAt = 0;
  let reported = false;

  function frame(now: number) {
    // The map is gone, and the overlay with it.
    if (!overlay.isConnected) return;
    const elapsed = now - start;
    resetOverlay();

    if (elapsed < FLIGHT_MS) {
      // The motor burns all the way down, so the missile keeps speeding up.
      const t = elapsed / FLIGHT_MS;
      const progress = 0.15 * t + 0.85 * t * t;
      const view = viewAt(to);
      const { air, ground, height, scale } = flightAt(progress, view);
      drawShadow(ground, view, height, scale);
      drawTrail(progress, view);
      // The flame flickers.
      drawMissileAt(air, scale, 0.95 + Math.random() * 0.1);
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
      if (afterImpact >= endsAt) return overlay.remove();
      const fade = 1 - clamp01(afterImpact / TRAIL_LINGER_MS);
      if (fade > 0) drawTrail(1, viewAt(to), fade);
      const active = explosions.flatMap((explosion) => {
        const sinceStart = afterImpact - explosion.delay;
        if (sinceStart < 0 || sinceStart >= BLAST_MS) return [];
        return [{ explosion, sinceStart, view: viewAt(explosion.at) }];
      });
      // Later explosions draw over earlier ones, and debris flies over all of them.
      for (const { explosion, sinceStart, view } of active) {
        for (const puff of blastPuffs(
          sinceStart / BLAST_MS,
          explosion.scale,
          view.tilt,
        )) {
          drawPuff(view.center, view, puff);
        }
      }
      for (const { explosion, sinceStart, view } of active) {
        drawSparks(view.center, view, explosion, sinceStart / SPARK_MS);
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
