// @vitest-environment jsdom
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useSelectionActions } from "@/composables/selectionActions";
import { useSelectedItems } from "@/stores/selectedStore";

describe("useSelectionActions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();
    selectedUnitIds.value.clear();
    selectedFeatureIds.value.clear();
  });

  it("toggles a unit into and out of the selection", () => {
    const { toggleUnitSelection } = useSelectionActions();
    const { selectedUnitIds } = useSelectedItems();

    toggleUnitSelection("u-1");
    expect(selectedUnitIds.value.has("u-1")).toBe(true);

    toggleUnitSelection("u-2");
    expect(selectedUnitIds.value.has("u-2")).toBe(true);
    expect(selectedUnitIds.value.size).toBe(2);

    toggleUnitSelection("u-1");
    expect(selectedUnitIds.value.has("u-1")).toBe(false);
    expect(selectedUnitIds.value.size).toBe(1);
  });

  it("refuses to additively select a unit while features are selected", () => {
    const { toggleUnitSelection, canAdditivelySelectUnit } = useSelectionActions();
    const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();

    selectedFeatureIds.value.add("f-1");
    expect(canAdditivelySelectUnit()).toBe(false);

    toggleUnitSelection("u-1");
    expect(selectedUnitIds.value.size).toBe(0);
    expect(selectedFeatureIds.value.has("f-1")).toBe(true);
  });

  it("toggles a feature into and out of the selection", () => {
    const { toggleFeatureSelection } = useSelectionActions();
    const { selectedFeatureIds } = useSelectedItems();

    toggleFeatureSelection("f-1");
    expect(selectedFeatureIds.value.has("f-1")).toBe(true);

    toggleFeatureSelection("f-1");
    expect(selectedFeatureIds.value.has("f-1")).toBe(false);
  });

  it("refuses to additively select a feature while units are selected", () => {
    const { toggleFeatureSelection, canAdditivelySelectFeature } = useSelectionActions();
    const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();

    selectedUnitIds.value.add("u-1");
    expect(canAdditivelySelectFeature()).toBe(false);

    toggleFeatureSelection("f-1");
    expect(selectedFeatureIds.value.size).toBe(0);
    expect(selectedUnitIds.value.has("u-1")).toBe(true);
  });
});
