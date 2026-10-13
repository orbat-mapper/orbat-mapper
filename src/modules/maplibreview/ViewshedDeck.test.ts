// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { ViewshedRequest, ViewshedResult } from "@/lib/terrain";
import { flatResult, settle } from "@/testdata/viewshed";
import { useTerrainStore } from "@/stores/terrainStore";
import { useViewshedStore } from "@/stores/viewshedStore";
import ViewshedDeck from "@/modules/maplibreview/ViewshedDeck.vue";

const mocks = vi.hoisted(() => ({
  compute: vi.fn<(request: ViewshedRequest) => Promise<ViewshedResult>>(),
}));
vi.mock("@/geo/viewshedClient", () => ({
  viewshedClient: async () => ({ compute: mocks.compute }),
}));

/** Queries the body, so portalled Reka content is included. */
const queryTestId = <T extends Element = HTMLElement>(id: string) =>
  document.body.querySelector<T>(`[data-test='${id}']`);
const byLabel = <T extends Element = HTMLElement>(label: string) =>
  document.body.querySelector<T>(`[aria-label="${label}"]`);

const spinner = () => queryTestId("viewshed-spinner");
/** Shown, as opposed to holding its place hidden so nothing shifts. */
const spinning = () => !!spinner() && !spinner()!.classList.contains("invisible");

/** Opens a Reka dropdown trigger, which listens for pointerdown. */
function openMenu(trigger: HTMLElement) {
  trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  trigger.click();
}
const settingsButton = () => queryTestId<HTMLButtonElement>("viewshed-settings");
const menuItem = (label: string) =>
  Array.from(document.body.querySelectorAll<HTMLElement>("[role^='menuitem']")).find(
    (item) => item.textContent?.includes(label),
  );

let wrapper: VueWrapper | undefined;

// Reka's Popover and DropdownMenu lean on DOM APIs jsdom omits.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const proto = Element.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
});

beforeEach(() => {
  localStorage.clear();
  const pinia = createPinia();
  setActivePinia(pinia);
  useTerrainStore().setConfigElevation({
    status: "ready",
    elevation: { source: { type: "raster-dem", url: "https://dem.example/tiles.json" } },
  });
  mocks.compute.mockReset();
  wrapper = mount(ViewshedDeck, {
    attachTo: document.body,
    global: { plugins: [pinia] },
  });
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe("ViewshedDeck", () => {
  it("spins while a viewshed computes, and stops once it is shown", async () => {
    let release!: () => void;
    mocks.compute.mockImplementation(
      (request) =>
        new Promise((resolve) => {
          release = () => resolve(flatResult(request));
        }),
    );
    useViewshedStore().place([10, 50]);
    await settle();
    expect(spinning()).toBe(true);
    release();
    await settle();
    expect(spinning()).toBe(false);
    // It keeps its place in the deck, so the status beside it does not move.
    expect(spinner()).not.toBeNull();
  });

  it("says it is reading only to screen readers, so the deck keeps its width", async () => {
    mocks.compute.mockImplementation(() => new Promise(() => {}));
    useViewshedStore().place([10, 50]);
    await settle();
    const status = queryTestId("viewshed-status")!;
    expect(status.textContent).toContain("Reading…");
    expect(status.querySelector(".sr-only")?.textContent).toContain("Reading…");
    // Nothing wider than the share the deck makes room for.
    expect(
      status.textContent!.replace(status.querySelector(".sr-only")!.textContent!, ""),
    ).toBe("");
  });

  it("spins again while a change recomputes, keeping the last result's status", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    mocks.compute.mockImplementation(() => new Promise(() => {}));
    viewshed.radius = 8000;
    await settle();
    expect(spinning()).toBe(true);
    expect(queryTestId("viewshed-status")?.textContent).toContain("% visible");
  });

  it("offers to combine and to close every viewshed once there are several", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    const combineToggle = () => byLabel<HTMLButtonElement>("Combine coverage");
    viewshed.place([10, 50]);
    await settle();
    expect(combineToggle()).toBeNull();
    expect(queryTestId("viewshed-number")).toBeNull();
    viewshed.place([10.05, 50]);
    await settle();
    expect(combineToggle()?.getAttribute("data-state")).toBe("on");
    combineToggle()!.click();
    await settle();
    expect(viewshed.combine).toBe(false);
    // Closing them all sits in the observer menu, away from closing one.
    expect(byLabel("Close all viewsheds")).toBeNull();
    openMenu(queryTestId("viewshed-number")!);
    await settle();
    menuItem("Close all viewsheds")!.click();
    await settle();
    expect(viewshed.viewsheds).toHaveLength(0);
  });

  it("names the current observer once there are several, and steps between them", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(queryTestId("viewshed-number")).toBeNull();
    viewshed.place([11, 51]);
    await settle();
    expect(queryTestId("viewshed-number")?.textContent).toContain("2/2");
    expect(queryTestId("viewshed-number")?.getAttribute("aria-label")).toBe(
      "Observer 2 of 2",
    );
    byLabel<HTMLButtonElement>("Next observer")!.click();
    await settle();
    expect(queryTestId("viewshed-number")?.textContent).toContain("1/2");
    byLabel<HTMLButtonElement>("Previous observer")!.click();
    await settle();
    expect(viewshed.number).toBe(2);
  });

  it("offers to set the detail for every viewshed once there are several", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    const forAll = () => byLabel<HTMLButtonElement>("Detail for all viewsheds");
    viewshed.place([10, 50]);
    await settle();
    settingsButton()!.click();
    await settle();
    expect(forAll()).toBeNull();
    viewshed.place([10.05, 50]);
    await settle();
    expect(forAll()?.getAttribute("data-state")).toBe("checked");
    forAll()!.click();
    await settle();
    expect(viewshed.detailForAll).toBe(false);
  });

  it("jumps to an observer picked from the observer menu", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.place([11, 51]);
    viewshed.place([12, 52]);
    await settle();
    openMenu(queryTestId("viewshed-number")!);
    await settle();
    menuItem("Observer 1")!.click();
    await settle();
    expect(viewshed.number).toBe(1);
  });

  it("sums up the settings on the deck and edits them in a popover", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.observerHeight = 3;
    viewshed.targetHeight = 1;
    await settle();
    expect(settingsButton()?.textContent).toMatch(/3 m.*1 m.*5 km/);
    // The settings are behind the button, not on the deck.
    expect(byLabel("Observer height in metres")).toBeNull();
    settingsButton()!.click();
    await settle();
    expect(byLabel("Radius in kilometres")).not.toBeNull();
    const input = byLabel<HTMLInputElement>("Observer height in metres")!;
    input.value = "12";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await settle();
    expect(viewshed.observerHeight).toBe(12);
    expect(byLabel("Show observer as a pin")).not.toBeNull();
    expect(document.body.textContent).toContain("Detail");
  });

  it("shows the visible share as a bare percentage, naming it for screen readers", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    useViewshedStore().place([10, 50]);
    await settle();
    const status = queryTestId("viewshed-status")!;
    expect(status.textContent).toMatch(/\d+ % visible/);
    expect(status.querySelector(".sr-only")?.textContent).toContain("visible");
  });

  it("explains the shades of combined coverage while it is shown", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    expect(queryTestId("seen-by-legend")).toBeNull();
    viewshed.place([10.05, 50]);
    await settle();
    expect(queryTestId("seen-by-legend")?.getAttribute("aria-label")).toContain(
      "Seen by",
    );
    viewshed.combine = false;
    await settle();
    expect(queryTestId("seen-by-legend")).toBeNull();
    viewshed.combine = true;
    viewshed.display = "masking";
    await settle();
    expect(queryTestId("seen-by-legend")).toBeNull();
  });

  it("explains the combined shades only once there is a combined image", async () => {
    mocks.compute
      .mockImplementationOnce(async (request) => flatResult(request))
      .mockImplementation(() => new Promise(() => {}));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    await settle();
    viewshed.place([10.05, 50]);
    await settle();
    expect(queryTestId("seen-by-legend")).toBeNull();
  });

  it("tells that each click adds another observer while placing", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.start();
    await settle();
    expect(queryTestId("viewshed-hint")).toBeNull();
    viewshed.place([10, 50]);
    await settle();
    expect(queryTestId("viewshed-hint")?.textContent).toContain(
      "Click to add another observer",
    );
    viewshed.stop();
    await settle();
    expect(queryTestId("viewshed-hint")).toBeNull();
  });

  it("starts and stops placing from its toggle", async () => {
    const viewshed = useViewshedStore();
    expect(queryTestId("viewshed-deck")).toBeNull();
    viewshed.start();
    await settle();
    const toggle = byLabel<HTMLButtonElement>("Place observer")!;
    expect(toggle.getAttribute("data-state")).toBe("on");
    expect(queryTestId("viewshed-status")?.textContent).toContain(
      "Click the map to place the observer",
    );
    toggle.click();
    await settle();
    expect(viewshed.placing).toBe(false);
  });

  it("offers to highlight dead ground, with its legend in place of the others", async () => {
    mocks.compute.mockImplementation(async (request) => flatResult(request));
    const viewshed = useViewshedStore();
    viewshed.place([10, 50]);
    viewshed.place([10.05, 50]);
    await settle();
    byLabel<HTMLButtonElement>("Dead ground")!.click();
    await settle();
    expect(viewshed.display).toBe("dead");
    expect(queryTestId("dead-ground-legend")).not.toBeNull();
    expect(queryTestId("seen-by-legend")).toBeNull();
  });
});
