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
/** Seen nose or tail on, the missile still looks at least this share of its length. */
const MIN_FORESHORTENING = 0.3;

type ScreenPoint = { x: number; y: number };

/**
 * How a puff is lit, to look round: brightest at `toward`, a share of its radius from its
 * middle, and shading off to `dark` at its edge.
 */
type Shade = { light: string; dark: string; toward: ScreenPoint };

/**
 * Where a shadow falls over the ground, in pixels east and north per pixel of height: away
 * from a sun in the north-west, matching the lit side of the smoke on a north-up map.
 */
const SHADOW_FALL: ScreenPoint = { x: 0.5, y: -0.6 };

/** Smoke lit by the sky from above. */
const SMOKE_SHADE: Shade = {
  light: "#a1a1aa",
  dark: "#18181b",
  toward: { x: -0.3, y: -0.45 },
};
/** Fire lit from within, brightest low down where it burns hottest. */
const FIRE_SHADE: Shade = {
  light: "#fef9c3",
  dark: "#7c2d12",
  toward: { x: 0, y: 0.3 },
};
/** The fireball's white-hot core. */
const CORE_SHADE: Shade = {
  light: "#ffffff",
  dark: "#f97316",
  toward: { x: 0, y: 0.2 },
};

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

export type HellfireOptions = {
  /** Called with the ids of the units caught in the blast, once they have all gone up. */
  onUnitsHit?: OnUnitsHit;
  /** Whether the impact shakes the map. On unless turned off. */
  shake?: boolean;
};

/**
 * Just for fun: fires a Hellfire missile from the orbiting "drone" (the bottom middle of the
 * screen) at a point on the map. It leaves a smoke trail, and its impact flashes, throws up a
 * fireball, a shockwave, debris and a smoke cloud, and shakes the map. Unit symbols near the
 * impact go up in secondary explosions; what happens to the units themselves is up to
 * `onUnitsHit`, called with their ids once they have all gone up. `shake: false` keeps the map
 * still.
 *
 * It all draws on a 2D canvas over the map rather than through map layers. With terrain on,
 * MapLibre drapes line layers such as the trail onto the terrain, so updating them every frame
 * redraws the whole basemap into the terrain's textures (see `terrainRttFilter.ts`), which drops
 * the frame rate.
 */
export function launchHellfire(
  map: MlMap,
  target: { lng: number; lat: number },
  { onUnitsHit, shake: shakes = true }: HellfireOptions = {},
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
   * How much of its length the missile shows at `air`, where it looks `scale` times bigger than
   * at the target: all of it seen from the side, down to `MIN_FORESHORTENING` nose or tail on.
   * Points go back into 3D from where they show on screen and how far from the camera their
   * scale puts them; the missile flies the straight line from the launch to the target.
   */
  function foreshorteningAt(air: ScreenPoint, scale: number) {
    const width = mapCanvas.clientWidth;
    const height = mapCanvas.clientHeight;
    const fov = (map.getVerticalFieldOfView() * Math.PI) / 180;
    const focal = height / 2 / Math.tan(fov / 2);
    const toWorld = (at: ScreenPoint, depth: number) => [
      (at.x - width / 2) * depth,
      (at.y - height / 2) * depth,
      focal * depth,
    ];
    const ray = toWorld(air, 1 / scale);
    const from = toWorld(launch, LAUNCH_DEPTH);
    const [dx, dy, dz] = toWorld(targetPoint, 1).map((value, i) => value - from[i]);
    const [rx, ry, rz] = ray;
    const cross = Math.hypot(dy * rz - dz * ry, dz * rx - dx * rz, dx * ry - dy * rx);
    const lengths = Math.hypot(dx, dy, dz) * Math.hypot(rx, ry, rz);
    return Math.max(MIN_FORESHORTENING, lengths > 0 ? cross / lengths : 1);
  }

  /**
   * The missile, seen from behind as it flies away: nose towards the target, `foreshortening`
   * of its length, its motor glowing. Its middle trails the head a little.
   */
  function drawMissileAt(
    at: ScreenPoint,
    scale: number,
    size: number,
    foreshortening: number,
  ) {
    const angle = Math.atan2(targetPoint.x - at.x, at.y - targetPoint.y);
    ctx.save();
    ctx.translate(at.x, at.y);
    ctx.rotate(angle);
    ctx.scale(size * scale, size * scale * foreshortening);
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
   * `offset` moves it over the ground, in pixels east and north of the explosion.
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
    offset?: ScreenPoint;
    shade?: Shade;
    /** How it blends with what is under it, such as "lighter" for a glow. */
    composite?: GlobalCompositeOperation;
  };

  /** Where an offset over the ground, in pixels east and north, puts a point on screen. */
  function groundOffset(view: View, offset?: ScreenPoint): ScreenPoint {
    if (!offset) return { x: 0, y: 0 };
    const [a, b, c, d] = view.ground;
    return { x: a * offset.x + c * offset.y, y: b * offset.x + d * offset.y };
  }

  /** How far over the ground, east and north, the shadow of something `height` up falls. */
  function shadowFall(height: number): ScreenPoint {
    return { x: SHADOW_FALL.x * height, y: SHADOW_FALL.y * height };
  }

  /**
   * Puffs in the order to draw them, furthest from the camera first, so nearer ones hide the
   * ones behind. Further up the ground is further away, and higher is nearer, by how much the
   * map is tilted: `tilt` is the sine of the pitch, and the ground shows squashed by its cosine.
   * This is the distance along the camera's line of sight, times that cosine.
   */
  function backToFront(puffs: Puff[], view: View): Puff[] {
    const nearness = (puff: Puff) => {
      const ground = groundOffset(view, puff.offset);
      return (
        -(ground.x * view.up.x + ground.y * view.up.y) +
        (puff.height ?? 0) * (1 - view.tilt ** 2)
      );
    };
    return puffs
      .map((puff) => ({ puff, nearness: nearness(puff) }))
      .sort((a, b) => a.nearness - b.nearness)
      .map(({ puff }) => puff);
  }

  /**
   * The layers of one explosion `t` of the way through. Seen from the side, the fireball and the
   * smoke rise off the ground, the smoke cloud on a column. The fireball, column and cloud are
   * each a clump of billows that roll outwards at their own pace.
   */
  function blastPuffs(t: number, explosion: Explosion, view: View): Puff[] {
    const { scale, billows } = explosion;
    const smoke = clamp01((t - 0.08) / 0.92);
    const fire = clamp01(t / 0.45);
    const flash = clamp01(t / 0.12);
    const wave = clamp01(t / 0.35);
    const smokeRadius = scale * (20 + 75 * easeOutCubic(smoke));
    const smokeHeight = scale * 110 * easeOutCubic(smoke);
    // Overlapping billows add up, so each is fainter than the cloud they make.
    const smokeFade = Math.min(1, smoke * 6) * (1 - smoke ** 2);
    const smokeOpacity = 0.55 * smokeFade;
    const fireRadius = scale * (12 + 48 * easeOutCubic(fire));
    const fireHeight = scale * 25 * easeOutCubic(fire);
    // The cloud's shadow shows once it has lifted off the ground.
    const cloudLift = clamp01(smokeHeight / (scale * 30));

    const around = (billow: Billow, distance: number): ScreenPoint => ({
      x: Math.cos(billow.angle) * billow.reach * distance,
      y: Math.sin(billow.angle) * billow.reach * distance,
    });
    const cloud = billows.cloud.map((billow): Puff => {
      const grow = easeOutCubic(clamp01(smoke * billow.speed));
      return {
        color: "#3f3f46",
        radius: smokeRadius * 0.45 * billow.size,
        opacity: smokeOpacity,
        blur: 0.6,
        offset: around(billow, smokeRadius * 0.6 * (0.4 + 0.6 * grow)),
        height: Math.max(0, smokeHeight + billow.rise * smokeRadius * 0.35),
        shade: SMOKE_SHADE,
      };
    });
    // The column only shows from the side; from above, the cloud hides it.
    const column = billows.column.map((billow, i): Puff => {
      const up = (i + 0.5) / billows.column.length;
      return {
        color: "#52525b",
        radius: smokeRadius * (0.22 + 0.12 * up) * billow.size,
        opacity: smokeOpacity * view.tilt,
        blur: 0.6,
        offset: around(billow, smokeRadius * 0.1),
        height: smokeHeight * up * 0.9,
        shade: SMOKE_SHADE,
      };
    });
    const fireball = billows.fire.map((billow): Puff => {
      const burn = clamp01(fire * billow.speed);
      const grow = easeOutCubic(burn);
      return {
        color: "#ea580c",
        radius: fireRadius * 0.55 * billow.size,
        opacity: 0.95 * (1 - burn ** 1.5),
        blur: 0.5,
        offset: around(billow, fireRadius * 0.5 * grow),
        height: fireHeight + Math.max(0, billow.rise) * fireRadius * 0.4 * grow,
        shade: FIRE_SHADE,
      };
    });

    return [
      {
        color: "#1c1917",
        radius: scale * (16 + 20 * easeOutCubic(fire)),
        opacity: 0.45 * Math.min(1, t * 8) * (1 - clamp01((t - 0.7) / 0.3)),
        blur: 0.6,
        flat: true,
      },
      // The fire lights up the ground around it.
      {
        color: "#f97316",
        radius: fireRadius * 1.8,
        opacity: 0.45 * (1 - fire),
        blur: 1,
        flat: true,
        composite: "lighter",
      },
      {
        color: "#0f172a",
        radius: smokeRadius * 1.1,
        opacity: 0.3 * smokeFade * cloudLift,
        blur: 0.8,
        flat: true,
        offset: shadowFall(smokeHeight),
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
      ...backToFront([...column, ...cloud], view),
      ...backToFront(fireball, view),
      {
        color: "#fde047",
        radius: scale * (8 + 26 * easeOutCubic(fire)),
        opacity: 1 - fire,
        blur: 0.6,
        height: fireHeight * 0.7,
        shade: CORE_SHADE,
      },
      {
        color: "#ffffff",
        radius: scale * (10 + 40 * easeOutCubic(flash)),
        opacity: 1 - flash,
        blur: 0.4,
      },
    ];
  }

  /**
   * Fills for puffs at unit radius and full opacity, by colour, shade and blur. They are the same
   * every frame, so they are made once and scaled to each puff.
   */
  const puffFills = new Map<string, CanvasGradient>();

  function puffFill({ color, blur, shade }: Puff): CanvasGradient {
    const key = shade
      ? `${color} ${blur} ${shade.light} ${shade.dark} ${shade.toward.x} ${shade.toward.y}`
      : `${color} ${blur}`;
    let fill = puffFills.get(key);
    if (fill) return fill;
    if (shade) {
      fill = ctx.createRadialGradient(shade.toward.x, shade.toward.y, 0, 0, 0, 1);
      fill.addColorStop(0, toRgbaColor(shade.light, 1, shade.light));
      fill.addColorStop(0.5, toRgbaColor(color, 1, color));
      fill.addColorStop(
        clamp01(1 - blur * 0.4),
        toRgbaColor(shade.dark, 0.8, shade.dark),
      );
      fill.addColorStop(1, toRgbaColor(shade.dark, 0, shade.dark));
    } else {
      fill = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      fill.addColorStop(0, toRgbaColor(color, 1, color));
      fill.addColorStop(clamp01(1 - blur), toRgbaColor(color, 1, color));
      fill.addColorStop(1, toRgbaColor(color, 0, color));
    }
    puffFills.set(key, fill);
    return fill;
  }

  /**
   * Draws a puff over the ground at `center`. Its edge fades out over the outer `blur` of it; a
   * shaded puff also shades off from its lit side, to look round.
   */
  function drawPuff(center: ScreenPoint, view: View, puff: Puff) {
    const { color, radius, opacity, stroke = 0, strokeOpacity = 0 } = puff;
    if (radius <= 0) return;
    const offset = groundOffset(view, puff.offset);
    const ground = { x: center.x + offset.x, y: center.y + offset.y };
    const at = puff.flat ? ground : lift(ground, view, puff.height ?? 0);
    ctx.save();
    if (puff.composite) ctx.globalCompositeOperation = puff.composite;
    ctx.translate(at.x, at.y);
    if (puff.flat) ctx.transform(...view.ground, 0, 0);
    if (opacity > 0) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.scale(radius, radius);
      ctx.fillStyle = puffFill(puff);
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
  /**
   * One of the clumps an explosion's fire and smoke are made of: which way and how far out over
   * the ground it rolls, as a share of the clump's reach, how far above or below the clump's
   * middle it hangs, its size and how fast it grows, both relative to the clump's.
   */
  type Billow = {
    angle: number;
    reach: number;
    rise: number;
    size: number;
    speed: number;
  };
  type Explosion = {
    at: Position;
    delay: number;
    scale: number;
    sparks: Spark[];
    billows: { cloud: Billow[]; column: Billow[]; fire: Billow[] };
    unitId?: string;
  };

  function createBillows(count: number): Billow[] {
    return Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      // Spread evenly over a disc rather than bunched in the middle.
      reach: Math.sqrt(Math.random()),
      rise: Math.random() * 2 - 1,
      size: 0.8 + Math.random() * 0.4,
      speed: 0.75 + Math.random() * 0.5,
    }));
  }

  function createBillowSet(): Explosion["billows"] {
    return { cloud: createBillows(14), column: createBillows(5), fire: createBillows(7) };
  }

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
        billows: createBillowSet(),
        unitId,
      });
    }
    return explosions;
  }

  /**
   * Debris flying out over the ground and up on an arc, landing as it burns out, each piece
   * over its shadow.
   */
  function drawSparks(origin: ScreenPoint, view: View, explosion: Explosion, t: number) {
    if (t >= 1) return;
    const travel = easeOutCubic(t);
    // From above, the arc reads as a slight sag.
    const sag = 12 * t * t * (1 - view.tilt);
    const pieces = explosion.sparks.map(({ angle, distance, size }) => {
      const reach = distance * travel;
      const out = groundOffset(view, {
        x: Math.cos(angle) * reach,
        y: Math.sin(angle) * reach,
      });
      const ground = { x: origin.x + out.x, y: origin.y + out.y + sag };
      const height = distance * 2.4 * t * (1 - t);
      const fall = groundOffset(view, shadowFall(height));
      return {
        at: lift(ground, view, height),
        shadow: { x: ground.x + fall.x, y: ground.y + fall.y },
        size,
      };
    });
    ctx.save();
    ctx.globalAlpha = 0.35 * (1 - t ** 2);
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    for (const { shadow, size } of pieces) {
      ctx.moveTo(shadow.x + size * 0.8, shadow.y);
      ctx.arc(shadow.x, shadow.y, size * 0.8, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalAlpha = 1 - t ** 2;
    ctx.fillStyle = "#fdba74";
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 0.5;
    for (const { at, size } of pieces) {
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
      drawMissileAt(air, scale, 0.95 + Math.random() * 0.1, foreshorteningAt(air, scale));
    } else {
      const afterImpact = elapsed - FLIGHT_MS;
      if (!explosions) {
        explosions = [
          {
            at: to,
            delay: 0,
            scale: 1,
            sparks: createSparks(16, 70),
            billows: createBillowSet(),
          },
          ...findUnitsInBlast(),
        ];
        lastDelay = Math.max(...explosions.map((e) => e.delay));
        endsAt = Math.max(BLAST_MS + lastDelay, TRAIL_LINGER_MS);
        if (shakes) shake();
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
        for (const puff of blastPuffs(sinceStart / BLAST_MS, explosion, view)) {
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
