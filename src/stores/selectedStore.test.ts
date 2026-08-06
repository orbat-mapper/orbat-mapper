import { beforeEach, describe, expect, it } from "vitest";
import { setTacticalGraphicPredicate, useSelectedItems } from "@/stores/selectedStore";

const { selectedFeatureIds, activeDetailsPanel, clear } = useSelectedItems();

describe("activeDetailsPanel — the tacticalGraphic case", () => {
  beforeEach(() => {
    clear();
    setTacticalGraphicPredicate((id) => String(id).startsWith("cm-"))();
  });

  it("falls back to the feature panel when nothing has registered the lookup", () => {
    selectedFeatureIds.value.add("cm-1");
    expect(activeDetailsPanel.value).toBe("feature");
  });

  it("wins when every selected id is a control measure", () => {
    const unregister = setTacticalGraphicPredicate((id) => String(id).startsWith("cm-"));
    selectedFeatureIds.value.add("cm-1");
    expect(activeDetailsPanel.value).toBe("tacticalGraphic");

    selectedFeatureIds.value.add("cm-2");
    expect(activeDetailsPanel.value).toBe("tacticalGraphic");

    unregister();
  });

  it("falls through to the feature panel on a mixed selection", () => {
    const unregister = setTacticalGraphicPredicate((id) => String(id).startsWith("cm-"));
    selectedFeatureIds.value.add("cm-1");
    selectedFeatureIds.value.add("feature-1");
    expect(activeDetailsPanel.value).toBe("feature");

    unregister();
  });

  it("leaves every other panel untouched", () => {
    const unregister = setTacticalGraphicPredicate(() => true);
    const { selectedUnitIds } = useSelectedItems();
    selectedUnitIds.value.add("unit-1");
    expect(activeDetailsPanel.value).toBe("unit");

    unregister();
  });
});
