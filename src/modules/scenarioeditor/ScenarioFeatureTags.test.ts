// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ScenarioFeatureTags from "@/modules/scenarioeditor/ScenarioFeatureTags.vue";
import type { NGeometryLayerItem } from "@/types/internalModels";

function feature(userData?: Record<string, unknown>): NGeometryLayerItem {
  return { userData } as NGeometryLayerItem;
}

describe("ScenarioFeatureTags", () => {
  it("renders every stored tag, including nested values", () => {
    const wrapper = mount(ScenarioFeatureTags, {
      props: {
        feature: feature({
          highway: "primary",
          lanes: 2,
          lit: false,
          note: null,
          extra: { a: 1 },
        }),
      },
    });

    const text = wrapper.text();
    expect(text).toContain("Tags");
    expect(text).toContain("highway");
    expect(text).toContain("primary");
    expect(text).toContain("lanes");
    expect(text).toContain("2");
    expect(text).toContain("lit");
    expect(text).toContain("false");
    expect(text).toContain("note");
    expect(text).toContain('{"a":1}');
  });

  it("omits the section when the feature has no tags", () => {
    const wrapper = mount(ScenarioFeatureTags, {
      props: { feature: feature() },
    });

    expect(wrapper.text()).not.toContain("Tags");
  });
});
