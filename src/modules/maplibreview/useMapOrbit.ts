import type { Map as MlMap, MapMouseEvent } from "maplibre-gl";
import { onScopeDispose, ref } from "vue";
import { unwrapLongitude } from "@/geo/longitude";
import { useMapSelectStore } from "@/stores/mapSelectStore";

const ORBIT_DEGREES_PER_SECOND = 11.25;
/** The pitch the camera tilts up to when an orbit starts, until the user tilts it. */
export const ORBIT_PITCH = 50;
/** Degrees of pitch per millisecond the camera tilts by on its way to the orbit pitch. */
const ORBIT_PITCH_RATE = 0.025;
/** How long after the last wheel event or tilt gesture the orbit resumes. */
const RESUME_DELAY_MS = 250;
/** How long the camera takes to glide onto a new orbit center. */
const GLIDE_MS = 1200;
/** How long the turn takes to build up to full speed when the orbit starts or resumes. */
const SPIN_UP_MS = 800;
/**
 * How far each of the long MapLibre animations that keep a settled orbit turning goes. MapLibre
 * takes the shorter way round to a bearing, so this must stay under 180.
 */
const CRUISE_DEGREES = 90;
const CRUISE_MS = (CRUISE_DEGREES / ORBIT_DEGREES_PER_SECOND) * 1_000;

type OrbitPoint = { lng: number; lat: number };
type Glide = { from: OrbitPoint; to: OrbitPoint; elapsed: number };

function interpolate(from: OrbitPoint, to: OrbitPoint, k: number): OrbitPoint {
  return {
    lng: from.lng + (unwrapLongitude(from.lng, to.lng) - from.lng) * k,
    lat: from.lat + (to.lat - from.lat) * k,
  };
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Orbit mode, after TacTrace's orbit demo: the camera glides a point on the map to the middle of
 * the screen and slowly circles it.
 *
 * While orbiting, a click on the map picks a new center instead of selecting and map panning is
 * off. Wheel zoom and tilt gestures pause the orbit until they end, and a tilt sets the pitch
 * the orbit keeps. The map view owns one orbit and provides it (`mapOrbitKey`); Escape stops
 * it through the scenario editor's Escape chain (`handleEscape`).
 */
export type MapOrbit = ReturnType<typeof useMapOrbit>;

export function useMapOrbit(getMap: () => MlMap | undefined) {
  const mapSelectStore = useMapSelectStore();
  const isOrbiting = ref(false);
  let cleanup: (() => void) | null = null;

  function stopOrbit() {
    cleanup?.();
    cleanup = null;
    isOrbiting.value = false;
  }

  function startOrbit(point: OrbitPoint) {
    const mapOrUndefined = getMap();
    if (!mapOrUndefined) return;
    const map: MlMap = mapOrUndefined;
    stopOrbit();
    isOrbiting.value = true;

    let center = point;
    // The camera reaches a new center by an eased glide rather than a jump.
    let glide: Glide | null = null;
    let spinUp = 0;
    let frame: number | undefined;
    let frameTime: number | undefined;
    // Once the camera has settled (no glide, full speed, at the target pitch), one long MapLibre
    // animation turns it instead of a camera update per frame. Each of those fires the whole set
    // of move events, and the after-move handlers they run made busy maps stutter.
    let cruising = false;
    let cruiseEnd = 0;
    let cruiseCheck: number | undefined;
    let paused = false;
    let resumeTimer: number | undefined;
    let targetPitch = ORBIT_PITCH;

    function advance(now: number) {
      frame = undefined;
      if (paused) return;
      if (frameTime !== undefined) {
        const elapsed = Math.min(now - frameTime, 100);
        let nextCenter: OrbitPoint | undefined;
        if (glide) {
          glide.elapsed += elapsed;
          const k = easeInOutCubic(Math.min(1, glide.elapsed / GLIDE_MS));
          nextCenter = interpolate(glide.from, glide.to, k);
          if (k >= 1) glide = null;
        }
        spinUp = Math.min(SPIN_UP_MS, spinUp + elapsed);
        const speed = easeInOutCubic(spinUp / SPIN_UP_MS) * ORBIT_DEGREES_PER_SECOND;
        const pitch = map.getPitch();
        const pitchStep = elapsed * ORBIT_PITCH_RATE;
        map.easeTo({
          // Without a glide the camera turns around the middle of the screen, which a wheel
          // zoom toward the pointer may have moved.
          ...(nextCenter && { center: nextCenter }),
          bearing: map.getBearing() + (elapsed * speed) / 1_000,
          pitch:
            pitch < targetPitch
              ? Math.min(targetPitch, pitch + pitchStep)
              : Math.max(targetPitch, pitch - pitchStep),
          duration: 0,
          // Hold the center's elevation so the camera keeps one altitude instead of rising
          // and falling with the terrain the orbiting center sweeps across.
          freezeElevation: true,
        });
        if (
          !glide &&
          spinUp >= SPIN_UP_MS &&
          Math.abs(map.getPitch() - targetPitch) < 0.01
        ) {
          cruise();
          return;
        }
      }
      frameTime = now;
      frame = requestAnimationFrame(advance);
    }

    /** Turns the camera with a camera update per frame, for glides, spin-up and tilting. */
    function runFrames() {
      cruising = false;
      if (frame !== undefined) return;
      frameTime = undefined;
      frame = requestAnimationFrame(advance);
    }

    function cruise() {
      cruising = true;
      cruiseEnd = performance.now() + CRUISE_MS;
      map.easeTo({
        bearing: map.getBearing() + CRUISE_DEGREES,
        duration: CRUISE_MS,
        easing: (t) => t,
        freezeElevation: true,
      });
    }

    // A cruise ends when it has run its course, and the next one starts at once so the turn
    // doesn't stall. It also ends when anything else moves the camera, such as a gesture, a
    // keyboard tilt or a zoom to a unit; then the orbit carries on once nothing else is.
    function onMoveEnd() {
      if (!cruising || paused || cruiseCheck !== undefined) return;
      if (performance.now() >= cruiseEnd - 50) {
        cruise();
        return;
      }
      cruiseCheck = requestAnimationFrame(() => {
        cruiseCheck = undefined;
        if (cruising && !paused && !map.isMoving()) cruise();
      });
    }

    function cancelFrame() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      if (cruiseCheck !== undefined) cancelAnimationFrame(cruiseCheck);
      cruiseCheck = undefined;
    }

    function startGlide() {
      glide = { from: map.getCenter(), to: center, elapsed: 0 };
    }

    function resume() {
      resumeTimer = undefined;
      paused = false;
      // A gesture may have moved the camera off the glide's path, so carry on from where it is.
      if (glide) startGlide();
      spinUp = 0;
      runFrames();
    }

    /**
     * Gives a user gesture exclusive control of the camera until it ends. A gesture stops a
     * running cruise animation itself, without being stopped by it.
     */
    function pause() {
      paused = true;
      cruising = false;
      cancelFrame();
      window.clearTimeout(resumeTimer);
    }

    function resumeSoon() {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(resume, RESUME_DELAY_MS);
    }

    function onWheel() {
      // A wheel zoom has no end event, so resume shortly after the last wheel event.
      pause();
      resumeSoon();
    }

    // Every orbit frame eases the camera, and an ease stops MapLibre's gesture handlers. A
    // drag-to-tilt would be reset before it got going, so a press that can start one pauses the
    // orbit until all pointers are up. A plain click, which picks a new center, does not.
    const activePointers = new Set<number>();
    let pausedByPress = false;
    let pitchAtPress = 0;

    function canStartTilt(event: PointerEvent) {
      if (event.pointerType === "touch") return activePointers.size >= 2;
      return event.button === 2 || (event.button === 0 && event.ctrlKey);
    }

    function onPointerDown(event: PointerEvent) {
      activePointers.add(event.pointerId);
      if (pausedByPress || !canStartTilt(event)) return;
      pausedByPress = true;
      pitchAtPress = map.getPitch();
      pause();
    }

    function onPointerUp(event: PointerEvent) {
      if (!activePointers.delete(event.pointerId) || activePointers.size > 0) return;
      if (!pausedByPress) return;
      pausedByPress = false;
      const pitch = map.getPitch();
      if (Math.abs(pitch - pitchAtPress) > 0.5) targetPitch = pitch;
      resumeSoon();
    }

    // The orbit's own camera updates carry no original event; only the user's gestures do,
    // such as keyboard tilting.
    function onGestureStart(event: { originalEvent?: unknown }) {
      if (event.originalEvent) pause();
    }

    function onGestureEnd(event: { originalEvent?: unknown }) {
      if (!event.originalEvent) return;
      targetPitch = map.getPitch();
      resumeSoon();
    }

    function onClick(event: MapMouseEvent) {
      center = { lng: event.lngLat.lng, lat: event.lngLat.lat };
      startGlide();
      if (!paused) runFrames();
    }

    const container = map.getCanvasContainer();
    const dragPanEnabled = map.dragPan.isEnabled();
    // While clamped, MapLibre re-solves the center onto the terrain after every ease and
    // render, which would move the camera with the ground below it.
    const centerClampedToGround = map.getCenterClampedToGround();
    const releaseSelection = mapSelectStore.suppressSelection();

    map.dragPan.disable();
    map.touchZoomRotate.disableRotation();
    map.setCenterClampedToGround(false);
    map.on("click", onClick);
    map.on("moveend", onMoveEnd);
    map.on("pitchstart", onGestureStart);
    map.on("rotatestart", onGestureStart);
    map.on("pitchend", onGestureEnd);
    map.on("rotateend", onGestureEnd);
    const listeners = new AbortController();
    const { signal } = listeners;
    container.addEventListener("wheel", onWheel, {
      capture: true,
      passive: true,
      signal,
    });
    container.addEventListener("pointerdown", onPointerDown, { capture: true, signal });
    window.addEventListener("pointerup", onPointerUp, { signal });
    window.addEventListener("pointercancel", onPointerUp, { signal });
    container.classList.add("orbit-active");

    cleanup = () => {
      const wasCruising = cruising;
      pause();
      releaseSelection();
      map.off("click", onClick);
      map.off("moveend", onMoveEnd);
      if (wasCruising) map.stop();
      map.off("pitchstart", onGestureStart);
      map.off("rotatestart", onGestureStart);
      map.off("pitchend", onGestureEnd);
      map.off("rotateend", onGestureEnd);
      listeners.abort();
      container.classList.remove("orbit-active");
      if (dragPanEnabled) map.dragPan.enable();
      map.touchZoomRotate.enableRotation();
      map.setCenterClampedToGround(centerClampedToGround);
      // A frozen-elevation ease ends by re-solving the center onto the terrain the camera
      // looks at, without moving the camera.
      if (centerClampedToGround) map.easeTo({ duration: 0, freezeElevation: true });
    };

    startGlide();
    runFrames();
  }

  onScopeDispose(stopOrbit);

  /** Starts orbiting the middle of the screen, or stops a running orbit. */
  function toggleOrbit() {
    if (isOrbiting.value) {
      stopOrbit();
      return;
    }
    const center = getMap()?.getCenter();
    if (center) startOrbit(center);
  }

  /** Stops a running orbit; returns whether there was one to stop. */
  function handleEscape() {
    if (!isOrbiting.value) return false;
    stopOrbit();
    return true;
  }

  return { isOrbiting, startOrbit, stopOrbit, toggleOrbit, handleEscape };
}
