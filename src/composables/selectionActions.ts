import { useSelectedItems } from "@/stores/selectedStore";
import type { EntityId } from "@/types/base";
import type { FeatureId } from "@/types/scenarioGeoModels";

export function useSelectionActions() {
  const { selectedUnitIds, selectedFeatureIds } = useSelectedItems();

  function canAdditivelySelectUnit() {
    return selectedFeatureIds.value.size === 0;
  }

  function canAdditivelySelectFeature() {
    return selectedUnitIds.value.size === 0;
  }

  function toggleUnitSelection(unitId: EntityId) {
    if (!canAdditivelySelectUnit()) return;
    if (selectedUnitIds.value.has(unitId)) {
      selectedUnitIds.value.delete(unitId);
    } else {
      selectedUnitIds.value.add(unitId);
    }
  }

  function toggleFeatureSelection(featureId: FeatureId) {
    if (!canAdditivelySelectFeature()) return;
    if (selectedFeatureIds.value.has(featureId)) {
      selectedFeatureIds.value.delete(featureId);
    } else {
      selectedFeatureIds.value.add(featureId);
    }
  }

  return {
    canAdditivelySelectUnit,
    canAdditivelySelectFeature,
    toggleUnitSelection,
    toggleFeatureSelection,
  };
}
