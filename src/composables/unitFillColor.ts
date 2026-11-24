import { computed } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { useUnitEditTargets } from "@/composables/unitEditTargets";

type UnitEditTargets = Pick<
  ReturnType<typeof useUnitEditTargets>,
  "units" | "forEachEditableUnit"
>;

/**
 * Sets or clears the symbol fill color of the units an edit in the unit details
 * panel applies to. Only the fill color is written, so each unit keeps its own
 * symbol, status and other symbol options.
 */
export function useUnitFillColor({ units, forEachEditableUnit }: UnitEditTargets) {
  const {
    unitActions: { updateUnit, getCombinedSymbolOptions },
    helpers: { getUnitById },
    settings,
  } = injectStrict(activeScenarioKey);

  const fillColors = computed(() =>
    units.value.map((unit) => unit.symbolOptions?.fillColor ?? null),
  );
  const hasMixedFillColor = computed(() => new Set(fillColors.value).size > 1);
  const hasCustomFillColor = computed(() => fillColors.value.some(Boolean));
  const currentFillColor = computed(() =>
    hasMixedFillColor.value ? null : (fillColors.value[0] ?? null),
  );
  // The color the first unit draws with when it has no fill color of its own
  const inheritedFillColor = computed(() => {
    const unit = units.value[0];
    return unit ? getCombinedSymbolOptions(unit, true).fillColor : undefined;
  });

  /** Sets the fill color as a single undo step; `null` clears it. Locked units are skipped. */
  function setFillColor(color: string | null) {
    forEachEditableUnit((id) => {
      const unit = getUnitById(id);
      if (!unit || (unit.symbolOptions?.fillColor ?? null) === color) return;
      const symbolOptions = { ...unit.symbolOptions };
      if (color) symbolOptions.fillColor = color;
      else delete symbolOptions.fillColor;
      updateUnit(id, { symbolOptions });
    });
    if (color) settings?.addColorIfAbsent(color);
  }

  return {
    currentFillColor,
    hasMixedFillColor,
    hasCustomFillColor,
    inheritedFillColor,
    setFillColor,
  };
}
