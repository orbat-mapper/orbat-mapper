import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { attachPointDrag, type PointerAt } from "./pointDrag";

/** A map whose pixels are degrees: x = lng, y = lat. */
function fakeMap() {
  const container = document.createElement("div");
  const canvas = document.createElement("canvas");
  container.append(canvas);
  document.body.append(container);
  container.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect;
  return {
    container,
    canvas,
    map: {
      getCanvasContainer: () => container,
      getCanvas: () => canvas,
      project: ([lng, lat]: [number, number]) => ({ x: lng, y: lat }),
      unproject: ([x, y]: [number, number]) => ({ lng: x, lat: y }),
    },
  };
}

const press = (target: EventTarget, x: number, y: number, init: MouseEventInit = {}) =>
  target.dispatchEvent(
    new MouseEvent("mousedown", {
      clientX: x,
      clientY: y,
      button: 0,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
const pointer = (type: string, x: number, y: number, init: MouseEventInit = {}) =>
  window.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, ...init }));

let setup: ReturnType<typeof fakeMap>;
let handlers: {
  onStart: (index: number) => void;
  onMove: (position: [number, number], pointer: PointerAt) => void;
  onEnd: () => void;
};
let detach: () => void;
let mapPress: Mock<(event: Event) => void>;

beforeEach(() => {
  setup = fakeMap();
  handlers = {
    onStart: vi.fn<(index: number) => void>(),
    onMove: vi.fn<(position: [number, number], pointer: PointerAt) => void>(),
    onEnd: vi.fn<() => void>(),
  };
  detach = attachPointDrag(setup.map, {
    points: () => [[100, 100]],
    ...handlers,
  });
  // Stands in for MapLibre's own press handling on the canvas.
  mapPress = vi.fn<(event: Event) => void>();
  setup.canvas.addEventListener("mousedown", mapPress);
});
afterEach(() => {
  detach();
  setup.container.remove();
});

describe("attachPointDrag", () => {
  it("drags the point from a press on it, keeping the press from the map", () => {
    press(setup.canvas, 104, 97);
    expect(handlers.onStart).toHaveBeenCalledWith(0);
    expect(mapPress).not.toHaveBeenCalled();
    pointer("pointermove", 150, 120);
    expect(handlers.onMove).toHaveBeenLastCalledWith([150, 120], {
      point: [150, 120],
      altKey: false,
      shiftKey: false,
    });
    pointer("pointerup", 150, 120);
    expect(handlers.onEnd).toHaveBeenCalled();
    pointer("pointermove", 10, 10);
    expect(handlers.onMove).toHaveBeenCalledTimes(1);
  });

  it("tells where the pointer is on the map, and the modifiers held as it moves", () => {
    setup.container.getBoundingClientRect = () => ({ left: 10, top: 20 }) as DOMRect;
    press(setup.canvas, 110, 120);
    pointer("pointermove", 160, 140, { altKey: true, shiftKey: true });
    expect(handlers.onMove).toHaveBeenLastCalledWith([150, 120], {
      point: [150, 120],
      altKey: true,
      shiftKey: true,
    });
    pointer("pointerup", 160, 140);
  });

  it("swallows the click that ends a drag, so it does not pick under the point", async () => {
    const mapClick = vi.fn<(event: Event) => void>();
    setup.canvas.addEventListener("click", mapClick);
    press(setup.canvas, 100, 100);
    pointer("pointerup", 120, 100);
    setup.canvas.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(mapClick).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve));
    setup.canvas.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(mapClick).toHaveBeenCalledTimes(1);
  });

  it("leaves a press with a modifier to the map's marquee and lasso", () => {
    press(setup.canvas, 100, 100, { ctrlKey: true });
    press(setup.canvas, 100, 100, { altKey: true });
    expect(handlers.onStart).not.toHaveBeenCalled();
    expect(mapPress).toHaveBeenCalledTimes(2);
  });

  it("leaves a press away from the point to the map", () => {
    press(setup.canvas, 140, 100);
    expect(handlers.onStart).not.toHaveBeenCalled();
    expect(mapPress).toHaveBeenCalled();
  });

  it("shows a grab cursor over the point, and clears only its own", () => {
    setup.container.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 101, clientY: 101 }),
    );
    expect(setup.canvas.style.cursor).toBe("grab");
    setup.container.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 160, clientY: 160 }),
    );
    expect(setup.canvas.style.cursor).toBe("");
  });

  it("drags the nearest of several points under the press", () => {
    detach();
    detach = attachPointDrag(setup.map, {
      points: () => [
        [100, 100],
        [200, 200],
        [106, 100],
      ],
      ...handlers,
    });
    press(setup.canvas, 104, 100);
    expect(handlers.onStart).toHaveBeenCalledWith(2);
    pointer("pointerup", 104, 100);
    press(setup.canvas, 199, 201);
    expect(handlers.onStart).toHaveBeenLastCalledWith(1);
  });

  it("stops listening once detached", () => {
    detach();
    press(setup.canvas, 100, 100);
    expect(handlers.onStart).not.toHaveBeenCalled();
  });
});
