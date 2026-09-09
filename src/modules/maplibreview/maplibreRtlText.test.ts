// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initializeRtlText as initializeHostedRtlText } from "./maplibreRtlText";
import { initializeRtlText as initializeStandaloneRtlText } from "./maplibreRtlText.standalone";
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

describe.each([
  ["hosted", initializeHostedRtlText],
  ["standalone", initializeStandaloneRtlText],
] as const)("%s registration", (_build, initializeRtlText) => {
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
});

it("provides a separate script URL for hosted workers", async () => {
  await initializeHostedRtlText();
  expect(state.url).not.toMatch(/^(data:|blob:)/);
  expect(state.url).toContain("mapbox-gl-rtl-text");
});

it("provides a self-contained worker plugin that joins Arabic and orders RTL labels", async () => {
  await initializeStandaloneRtlText();
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
