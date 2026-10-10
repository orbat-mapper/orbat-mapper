import { beforeEach, describe, expect, it } from "vitest";
import { setLayerItemKindResolver, useSelectedItems } from "@/stores/selectedStore";
import type { ScenarioLayerItemKind } from "@/types/scenarioLayerItems";

const cmKind = (id: string | number): ScenarioLayerItemKind =>
  String(id).startsWith("cm-") ? "tacticalGraphic" : "geometry";

const { selectedFeatureIds, activeDetailsPanel, clear } = useSelectedItems();

describe("activeDetailsPanel — the tacticalGraphic case", () => {
  beforeEach(() => {
    clear();
    setLayerItemKindResolver(cmKind)();
  });

  it("falls back to the feature panel when nothing has registered the lookup", () => {
    selectedFeatureIds.value.add("cm-1");
    expect(activeDetailsPanel.value).toBe("feature");
  });

  it("wins when every selected id is a control measure", () => {
    const unregister = setLayerItemKindResolver(cmKind);
    selectedFeatureIds.value.add("cm-1");
    expect(activeDetailsPanel.value).toBe("tacticalGraphic");

    selectedFeatureIds.value.add("cm-2");
    expect(activeDetailsPanel.value).toBe("tacticalGraphic");

    unregister();
  });

  it("falls through to the feature panel on a mixed selection", () => {
    const unregister = setLayerItemKindResolver(cmKind);
    selectedFeatureIds.value.add("cm-1");
    selectedFeatureIds.value.add("feature-1");
    expect(activeDetailsPanel.value).toBe("feature");

    unregister();
  });

  it("leaves every other panel untouched", () => {
    const unregister = setLayerItemKindResolver(() => "tacticalGraphic");
    const { selectedUnitIds } = useSelectedItems();
    selectedUnitIds.value.add("unit-1");
    expect(activeDetailsPanel.value).toBe("unit");

    unregister();
  });
});
