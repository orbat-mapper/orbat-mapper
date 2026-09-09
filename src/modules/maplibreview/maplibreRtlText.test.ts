// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { initializeRtlText } from "./maplibreRtlText";
import { setRTLTextPlugin } from "maplibre-gl";

const state = vi.hoisted(() => ({ status: "unavailable", url: "" }));
vi.mock("maplibre-gl", () => ({
  getRTLTextPluginStatus: () => state.status,
  setRTLTextPlugin: vi.fn(async (url: string) => {
    state.url = url;
    state.status = "loaded";
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.status = "unavailable";
  state.url = "";
});

it("registers only once across map remounts", async () => {
  await initializeRtlText();
  await initializeRtlText();
  expect(setRTLTextPlugin).toHaveBeenCalledExactlyOnceWith(state.url, false);
});

it("registers when a worker has already requested RTL support", async () => {
  state.status = "requested";
  await initializeRtlText();
  expect(setRTLTextPlugin).toHaveBeenCalledOnce();
});

it.each(["deferred", "loading", "loaded", "error"])(
  "does not replace a plugin in the %s state",
  async (status) => {
    state.status = status;
    await initializeRtlText();
    expect(setRTLTextPlugin).not.toHaveBeenCalled();
  },
);

it("provides a self-contained worker plugin that joins Arabic and orders RTL labels", async () => {
  await initializeRtlText();
  // A file:// page's worker cannot fetch a Blob URL from its opaque origin.
  expect(state.url).toMatch(/^data:text\/javascript/);
  const source = await (await fetch(state.url)).text();
  const registerRTLTextPlugin = vi.fn();
  // Execute the bundled classic script with the registration hook a worker supplies.
  new Function("self", "location", "globalThis", source)(
    { registerRTLTextPlugin },
    { href: state.url },
    {},
  );
  await vi.waitFor(() => expect(registerRTLTextPlugin).toHaveBeenCalledOnce());
  const plugin = registerRTLTextPlugin.mock.calls[0]![0];
  // Presentation forms, in visual order, for Egypt.
  expect(plugin.processBidirectionalText(plugin.applyArabicShaping("مصر"), [])).toEqual([
    "\uFEAE\uFEBC\uFEE3",
  ]);
  expect(plugin.processBidirectionalText("ישראל", [])).toEqual(["לארשי"]);
  expect(plugin.processBidirectionalText("Cairo 123", [])).toEqual(["Cairo 123"]);
});
