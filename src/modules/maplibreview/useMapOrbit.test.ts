// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { createPinia, setActivePinia } from "pinia";
import type { Map as MlMap } from "maplibre-gl";
import { ORBIT_PITCH, useMapOrbit } from "@/modules/maplibreview/useMapOrbit";
import { useMapSelectStore } from "@/stores/mapSelectStore";

function createHandler() {
  let enabled = true;
  return {
    isEnabled: () => enabled,
    enable: vi.fn(() => (enabled = true)),
    disable: vi.fn(() => (enabled = false)),
  };
}

function createFakeMap() {
  const container = document.createElement("div");
  const listeners = new Map<string, (event: unknown) => void>();
  let bearing = 0;
  let pitch = 0;
  let clamped = true;
  let center = { lng: 0, lat: 0 };
  let moving = false;
  const map = {
    isMoving: () => moving,
    stop: vi.fn(() => (moving = false)),
    getCenter: () => center,
    getCanvasContainer: () => container,
    getBearing: () => bearing,
    getPitch: () => pitch,
    getCenterClampedToGround: () => clamped,
    setCenterClampedToGround: vi.fn((value: boolean) => (clamped = value)),
    easeTo: vi.fn(
      (options: {
        bearing?: number;
        pitch?: number;
        center?: typeof center;
        duration?: number;
      }) => {
        // An animation is left running; the test ends it with `finishEase`.
        moving = !!options.duration;
        if (moving) return;
        center = options.center ?? center;
        bearing = options.bearing ?? bearing;
        pitch = options.pitch ?? pitch;
      },
    ),
    on: vi.fn((type: string, fn: (event: unknown) => void) => listeners.set(type, fn)),
    off: vi.fn((type: string) => listeners.delete(type)),
    dragPan: createHandler(),
    dragRotate: createHandler(),
    touchZoomRotate: { disableRotation: vi.fn(), enableRotation: vi.fn() },
  };
  const fire = (type: string, event: unknown) => listeners.get(type)?.(event);
  const setMoving = (value: boolean) => (moving = value);
  return { map, container, fire, listeners, setMoving };
}

let frames: FrameRequestCallback[] = [];
function runFrame(time: number) {
  const pending = frames;
  frames = [];
  pending.forEach((cb) => cb(time));
}

beforeEach(() => {
  setActivePinia(createPinia());
  frames = [];
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    frames = [];
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function setup() {
  const fake = createFakeMap();
  const scope = effectScope();
  const orbit = scope.run(() => useMapOrbit(() => fake.map as unknown as MlMap))!;
  return { ...fake, scope, orbit };
}

describe("useMapOrbit", () => {
  it("glides the point to the middle, then circles it and tilts up", () => {
    const { map, orbit } = setup();

    orbit.startOrbit({ lng: 10, lat: 60 });
    expect(orbit.isOrbiting.value).toBe(true);
    for (let t = 0; t <= 600; t += 100) runFrame(t);
    expect(map.getCenter()).toEqual({ lng: 5, lat: 30 });
    for (let t = 700; t <= 1300; t += 100) runFrame(t);
    expect(map.getCenter()).toEqual({ lng: 10, lat: 60 });

    const bearing = map.getBearing();
    runFrame(1400);
    expect(map.getBearing() - bearing).toBeCloseTo(1.125);
    expect(map.easeTo.mock.lastCall![0]).not.toHaveProperty("center");
    for (let t = 1500; t <= 5000; t += 100) runFrame(t);
    expect(map.getPitch()).toBe(ORBIT_PITCH);
  });

  it("builds up to full turning speed", () => {
    const { map, orbit } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    runFrame(0);
    runFrame(100);
    expect(map.getBearing()).toBeLessThan(0.1);
  });

  it("glides to a clicked center and suppresses selection", () => {
    const { map, orbit, fire } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    expect(useMapSelectStore().selectionSuppressed).toBe(true);
    runFrame(0);

    fire("click", { lngLat: { lng: 10, lat: 20 } });
    for (let t = 100; t <= 600; t += 100) runFrame(t);
    expect(map.getCenter()).toEqual({ lng: 5, lat: 10 });
    for (let t = 700; t <= 1300; t += 100) runFrame(t);
    expect(map.getCenter()).toEqual({ lng: 10, lat: 20 });
  });

  describe("once settled", () => {
    function settle() {
      const fake = setup();
      fake.orbit.startOrbit({ lng: 0, lat: 0 });
      for (let t = 0; t <= 3000; t += 100) runFrame(t);
      return fake;
    }

    it("turns with one long linear animation instead of per-frame updates", () => {
      const { map } = settle();
      expect(frames).toHaveLength(0);
      const [options] = map.easeTo.mock.lastCall!;
      expect(options).toMatchObject({ duration: 8_000, freezeElevation: true });
      expect(options.bearing! - map.getBearing()).toBe(90);
    });

    it("starts the next lap as soon as a lap ends", () => {
      const { map, fire, setMoving } = settle();
      const calls = map.easeTo.mock.calls.length;
      vi.advanceTimersByTime(8_000);
      setMoving(false);
      fire("moveend", {});
      expect(map.easeTo).toHaveBeenCalledTimes(calls + 1);
    });

    it("carries on after an interruption once nothing else moves the camera", () => {
      const { map, fire, setMoving } = settle();
      const calls = map.easeTo.mock.calls.length;

      setMoving(true);
      fire("moveend", {});
      runFrame(3100);
      expect(map.easeTo).toHaveBeenCalledTimes(calls);

      setMoving(false);
      fire("moveend", {});
      runFrame(3200);
      expect(map.easeTo).toHaveBeenCalledTimes(calls + 1);
    });

    it("glides frame by frame again after a click", () => {
      const { map, fire } = settle();
      fire("click", { lngLat: { lng: 10, lat: 20 } });
      runFrame(3100);
      runFrame(3200);
      expect(map.easeTo.mock.lastCall![0]).toMatchObject({ duration: 0 });
      expect(map.getCenter().lng).toBeGreaterThan(0);
    });

    it("stops the animation when the orbit stops", () => {
      const { map, orbit } = settle();
      orbit.stopOrbit();
      expect(map.stop).toHaveBeenCalled();
    });
  });

  it("pauses for wheel zoom and resumes once it settles", () => {
    const { container, orbit } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });

    container.dispatchEvent(new WheelEvent("wheel"));
    expect(frames).toHaveLength(0);
    vi.advanceTimersByTime(250);
    expect(frames).toHaveLength(1);
    expect(orbit.isOrbiting.value).toBe(true);
  });

  it("pauses for a tilt gesture and keeps the pitch the user chose", () => {
    const { map, orbit, fire } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    runFrame(0);
    runFrame(100);

    fire("pitchstart", { originalEvent: new MouseEvent("mousedown") });
    expect(frames).toHaveLength(0);
    map.easeTo({ pitch: 20 });
    fire("pitchend", { originalEvent: new MouseEvent("mouseup") });
    vi.advanceTimersByTime(250);
    for (let t = 1000; t <= 5000; t += 100) runFrame(t);
    expect(map.getPitch()).toBe(20);
  });

  it("pauses during a right-button press so a drag-to-tilt can start", () => {
    const { map, container, orbit } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    runFrame(0);
    runFrame(100);

    container.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, button: 2 }));
    expect(frames).toHaveLength(0);
    vi.advanceTimersByTime(1000);
    expect(frames).toHaveLength(0);

    map.easeTo({ pitch: 70 });
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
    vi.advanceTimersByTime(250);
    for (let t = 2000; t <= 5000; t += 100) runFrame(t);
    expect(map.getPitch()).toBe(70);
  });

  it("keeps turning through a plain click", () => {
    const { map, container, orbit } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    runFrame(0);
    runFrame(100);

    container.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, button: 0 }));
    expect(frames).toHaveLength(1);
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
    for (let t = 1000; t <= 5000; t += 100) runFrame(t);
    expect(map.getPitch()).toBe(ORBIT_PITCH);
  });

  it("pauses for a ctrl-drag and a two-finger touch", () => {
    const { container, orbit } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });

    container.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 1, button: 0, ctrlKey: true }),
    );
    expect(frames).toHaveLength(0);
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
    vi.advanceTimersByTime(250);
    expect(frames).toHaveLength(1);

    container.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 2, pointerType: "touch" }),
    );
    expect(frames).toHaveLength(1);
    container.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 3, pointerType: "touch" }),
    );
    expect(frames).toHaveLength(0);
  });

  it("ignores pitch events from its own camera updates", () => {
    const { orbit, fire } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    fire("pitchstart", {});
    expect(frames).toHaveLength(1);
  });

  it("restores map interactions when Escape stops it", () => {
    const { map, orbit, listeners } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    expect(map.dragPan.isEnabled()).toBe(false);
    expect(map.dragRotate.isEnabled()).toBe(true);
    expect(map.getCenterClampedToGround()).toBe(false);

    expect(orbit.handleEscape()).toBe(true);
    expect(orbit.isOrbiting.value).toBe(false);
    expect(frames).toHaveLength(0);
    expect(map.dragPan.isEnabled()).toBe(true);
    expect(map.getCenterClampedToGround()).toBe(true);
    expect(listeners.has("click")).toBe(false);
    expect(useMapSelectStore().selectionSuppressed).toBe(false);
  });

  it("leaves Escape to the rest of the editor when not orbiting", () => {
    const { orbit } = setup();
    expect(orbit.handleEscape()).toBe(false);
  });

  it("does not listen for Escape itself", () => {
    const { orbit } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(orbit.isOrbiting.value).toBe(true);
  });

  it("toggles orbiting the middle of the screen", () => {
    const { orbit } = setup();
    orbit.toggleOrbit();
    expect(orbit.isOrbiting.value).toBe(true);
    orbit.toggleOrbit();
    expect(orbit.isOrbiting.value).toBe(false);
  });

  it("stops when the scope is disposed", () => {
    const { orbit, scope } = setup();
    orbit.startOrbit({ lng: 0, lat: 0 });
    scope.stop();
    expect(orbit.isOrbiting.value).toBe(false);
    expect(frames).toHaveLength(0);
  });
});
