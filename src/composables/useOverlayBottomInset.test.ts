// @vitest-environment jsdom
import { nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { useBottomLeftClearance } from "@/composables/useOverlayBottomInset";

type Box = { left: number; top: number; width: number; height: number };

function setBox(el: HTMLElement, box: Box) {
  el.getBoundingClientRect = () =>
    ({
      ...box,
      x: box.left,
      y: box.top,
      right: box.left + box.width,
      bottom: box.top + box.height,
      toJSON: () => box,
    }) as DOMRect;
}

/** A 1000×800 map area with a toolbar footer and a bottom-left scale control. */
function setup() {
  const area = document.createElement("div");
  setBox(area, { left: 0, top: 0, width: 1000, height: 800 });
  const footer = document.createElement("footer");
  setBox(footer, { left: 0, top: 700, width: 1000, height: 100 });
  Object.defineProperty(footer, "offsetParent", { get: () => area });
  const main = document.createElement("nav");
  setBox(main, { left: 200, top: 730, width: 600, height: 60 });
  footer.append(main);
  const scale = document.createElement("div");
  scale.className = "scale";
  setBox(scale, { left: 8, top: 760, width: 100, height: 20 });
  area.append(footer, scale);
  document.body.append(area);
  const clearance = useBottomLeftClearance(ref(footer), ref(area), ".scale");
  return { area, footer, main, scale, clearance };
}

function addToolbar(footer: HTMLElement, box: Box) {
  const toolbar = document.createElement("div");
  setBox(toolbar, box);
  footer.append(toolbar);
  return toolbar;
}

describe("useBottomLeftClearance", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("stays at 0 while the controls fit beside the toolbars", async () => {
    const { clearance } = setup();
    await nextTick();
    expect(clearance.value).toBe(0);
  });

  it("clears the toolbars the controls would overlap", async () => {
    const { footer, main, clearance } = setup();
    setBox(main, { left: 50, top: 730, width: 900, height: 60 });
    // A narrower toolbar above it the controls do not reach: not counted.
    addToolbar(footer, { left: 300, top: 660, width: 400, height: 60 });
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
    expect(clearance.value).toBe(70);
  });

  it("lifts above a stacked toolbar the controls would also overlap", async () => {
    const { footer, main, clearance } = setup();
    setBox(main, { left: 50, top: 730, width: 900, height: 60 });
    addToolbar(footer, { left: 60, top: 660, width: 880, height: 60 });
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
    expect(clearance.value).toBe(140);
  });
});
