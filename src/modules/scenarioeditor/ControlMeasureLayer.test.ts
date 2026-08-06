// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ControlMeasureLayer from "@/modules/scenarioeditor/ControlMeasureLayer.vue";
import { activeScenarioKey } from "@/components/injects";
import type { NTacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { identityColor } from "@/symbology/identityColors";

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    selectedFeatureIds: ref(new Set<string>()),
    activeFeatureId: ref(null),
  }),
}));

function cm(
  id: string,
  overrides: Partial<NTacticalGraphicLayerItem> = {},
): NTacticalGraphicLayerItem {
  return {
    id,
    kind: "tacticalGraphic",
    graphicKind: "boundary",
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    _pid: "cm-layer",
    ...overrides,
  } as NTacticalGraphicLayerItem;
}

function mountLayer(items: NTacticalGraphicLayerItem[]) {
  const layer = {
    id: "cm-layer",
    kind: "overlay",
    name: "Control measures",
    items: items.map((i) => i.id),
    _isOpen: true,
  } as NScenarioOverlayLayer;

  const geo = { updateLayer: vi.fn(), updateLayerItem: vi.fn() };

  const wrapper = mount(ControlMeasureLayer, {
    props: {
      layer,
      items,
      layerMenuItems: [],
      itemMenuItems: [],
    },
    global: {
      provide: { [activeScenarioKey as symbol]: { geo } },
      stubs: {
        ChevronPanel: {
          template: "<div><slot name='right' /><slot /></div>",
        },
        DotsMenu: true,
        EditLayerInlineForm: true,
      },
    },
  });

  return { wrapper, geo, layer };
}

describe("ControlMeasureLayer", () => {
  it("lists one row per control measure", () => {
    const { wrapper } = mountLayer([cm("cm1", { name: "PL BLUE" }), cm("cm2")]);

    const rows = wrapper.findAll("[data-feature-id]");
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).toContain("PL BLUE");
  });

  it("tints the icon with the resolved stroke colour", () => {
    // Read time only: the identity is projected, never stored as a colour.
    const { wrapper } = mountLayer([cm("cm1", { standardIdentity: "6" })]);
    const icon = wrapper.find("[data-feature-id] svg");

    // jsdom normalises whitespace inside the rgb() triple.
    expect(icon.attributes("style")?.replace(/\s/g, "")).toContain(
      identityColor("6").replace(/\s/g, ""),
    );
  });

  it("prefers an authored stroke colour over the identity projection", () => {
    const { wrapper } = mountLayer([
      cm("cm1", { standardIdentity: "6", style: { strokeColor: "rgb(1, 2, 3)" } }),
    ]);

    expect(wrapper.find("[data-feature-id] svg").attributes("style")).toContain(
      "rgb(1, 2, 3)",
    );
  });

  it("lists an unsupported graphicKind, flagged and untinted", () => {
    const { wrapper } = mountLayer([
      cm("cm1", { graphicKind: "from-the-future" as never, standardIdentity: "6" }),
    ]);

    const row = wrapper.find("[data-feature-id]");
    expect(row.text()).toContain("from-the-future");
    expect(row.find("svg").attributes("style")).toBeUndefined();
    // The alert icon is rendered in addition to the kind icon.
    expect(row.findAll("svg").length).toBeGreaterThan(2);
  });

  it("toggles item visibility through the kind-agnostic store door", async () => {
    const { wrapper, geo } = mountLayer([cm("cm1")]);

    await wrapper.find('[title="Toggle visibility"]').trigger("click");

    expect(geo.updateLayerItem).toHaveBeenCalledWith("cm1", { isHidden: true });
  });

  it("owns layer visibility and lock from the section header", async () => {
    const { wrapper, geo } = mountLayer([cm("cm1")]);

    await wrapper.find('[title="Toggle layer visibility"]').trigger("click");
    await wrapper.find('[title="Toggle layer lock"]').trigger("click");

    expect(geo.updateLayer).toHaveBeenCalledWith("cm-layer", { isHidden: true });
    expect(geo.updateLayer).toHaveBeenCalledWith("cm-layer", { locked: true });
  });
});
