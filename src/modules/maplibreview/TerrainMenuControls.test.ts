// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import HillshadeSettingsControl from "./HillshadeSettingsControl.vue";
import TerrainExaggerationControl from "./TerrainExaggerationControl.vue";
import { useTerrainStore } from "@/stores/terrainStore";

describe("terrain menu controls", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
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

  it("shows the exaggeration slider only with terrain on and keeps its keys from the menu", async () => {
    const wrapper = mount(TerrainExaggerationControl);
    const settings = useTerrainStore();
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
    settings.terrainEnabled = true;
    await nextTick();
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes("aria-labelledby")).toBeTruthy();
    const menuKeydown = vi.fn();
    wrapper.element.parentElement?.addEventListener("keydown", menuKeydown);
    await slider.trigger("keydown", { key: "ArrowRight" });
    expect(settings.exaggeration).toBe(1.25);
    expect(menuKeydown).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("edits and resets hillshade settings", async () => {
    const wrapper = mount(HillshadeSettingsControl);
    const settings = useTerrainStore();
    await wrapper.findAll('[role="slider"]')[0].trigger("keydown", { key: "ArrowRight" });
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
  });
});
