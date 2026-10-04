// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { nextTick } from "vue";
import TerrainSettings from "./TerrainSettings.vue";
import { useTerrainStore } from "@/stores/terrainStore";

describe("Labs terrain controls", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());
  it("shares session preferences between layouts, supports keyboard sliders, and resets hillshade", async () => {
    const pinia = createPinia();
    const wrapper = mount(TerrainSettings, { global: { plugins: [pinia] } });
    const settings = useTerrainStore(pinia);
    expect(wrapper.findAll('[role="slider"]')).toHaveLength(0);
    const toggles = wrapper.findAll('[role="switch"]');
    await toggles[0].trigger("click");
    expect(settings.terrainEnabled).toBe(true);
    let sliders = wrapper.findAll('[role="slider"]');
    expect(sliders).toHaveLength(1);
    expect(sliders[0].attributes("aria-labelledby")).toBeTruthy();
    await sliders[0].trigger("keydown", { key: "ArrowRight" });
    expect(settings.exaggeration).toBe(1.25);
    await toggles[1].trigger("click");
    expect(settings.hillshadeEnabled).toBe(true);
    sliders = wrapper.findAll('[role="slider"]');
    await sliders[1].trigger("keydown", { key: "ArrowRight" });
    expect(settings.hillshadeSettings.strength).toBeCloseTo(0.55);
    await wrapper.find('input[type="color"]').setValue("#123456");
    expect(settings.hillshadeSettings.shadowColor).toBe("#123456");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Viewport")!
      .trigger("click");
    expect(settings.hillshadeSettings.anchor).toBe("viewport");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Reset hillshade")!
      .trigger("click");
    expect(settings.hillshadeSettings).toEqual({
      strength: 0.5,
      direction: 315,
      anchor: "map",
      shadowColor: "#000000",
      highlightColor: "#ffffff",
      accentColor: "#000000",
    });
    wrapper.unmount();
    const reopened = mount(TerrainSettings, { global: { plugins: [pinia] } });
    expect(reopened.findAll('[role="slider"]')).toHaveLength(3);
    settings.terrainError = true;
    await nextTick();
    expect(reopened.get('[role="status"]').text()).toContain("unavailable");
    reopened.unmount();
  });
});
