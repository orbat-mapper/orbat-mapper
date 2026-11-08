// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import AtlasBasemapOptions from "@/components/AtlasBasemapOptions.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

function item(wrapper: ReturnType<typeof mount>, group: string, label: string) {
  return wrapper
    .find(`[data-test='${group}']`)
    .findAll("button")
    .find((button) => button.text() === label)!;
}

describe("AtlasBasemapOptions", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    setActivePinia(createPinia());
  });

  it("starts on Alpine with everything shown", () => {
    const settings = useMapSettingsStore();
    const wrapper = mount(AtlasBasemapOptions);

    expect(settings.atlasElevationBands).toBe("alpine");
    expect(
      item(wrapper, "atlas-elevation-bands", "Alpine").attributes("data-state"),
    ).toBe("on");
    expect(item(wrapper, "atlas-layer-groups", "Borders").attributes("data-state")).toBe(
      "on",
    );
  });

  it("changes the elevation bands and keeps a preset when it is clicked again", async () => {
    const settings = useMapSettingsStore();
    const wrapper = mount(AtlasBasemapOptions);

    await item(wrapper, "atlas-elevation-bands", "Lowland").trigger("click");
    expect(settings.atlasElevationBands).toBe("lowland");

    await item(wrapper, "atlas-elevation-bands", "Lowland").trigger("click");
    expect(settings.atlasElevationBands).toBe("lowland");
  });

  it("hides a group and remembers only what is hidden", async () => {
    const settings = useMapSettingsStore();
    const wrapper = mount(AtlasBasemapOptions);

    await item(wrapper, "atlas-layer-groups", "Borders").trigger("click");

    expect(settings.atlasHiddenLayerGroups).toEqual(["borders"]);
    expect(settings.atlasLayerGroups).not.toContain("borders");
    expect(settings.atlasLayerGroups).toContain("cities");
  });

  it("hides a label type without touching the other groups", async () => {
    const settings = useMapSettingsStore();
    const wrapper = mount(AtlasBasemapOptions);

    await item(wrapper, "atlas-label-categories", "Rivers").trigger("click");

    expect(settings.atlasHiddenLayerGroups).toEqual(["rivers"]);
  });

  it("disables the label types while labels are off", async () => {
    const wrapper = mount(AtlasBasemapOptions);

    await item(wrapper, "atlas-layer-groups", "Labels").trigger("click");

    expect(
      item(wrapper, "atlas-label-categories", "Rivers").attributes("disabled"),
    ).toBeDefined();
  });

  it("disables the city labels while cities are off, and only those", async () => {
    const wrapper = mount(AtlasBasemapOptions);

    await item(wrapper, "atlas-layer-groups", "Cities").trigger("click");

    expect(
      item(wrapper, "atlas-label-categories", "Cities").attributes("disabled"),
    ).toBeDefined();
    expect(
      item(wrapper, "atlas-label-categories", "Rivers").attributes("disabled"),
    ).toBeUndefined();
  });
});
