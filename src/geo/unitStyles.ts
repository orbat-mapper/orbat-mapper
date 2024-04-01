import { Icon, Style } from "ol/style";
import type { UnitSymbolOptions } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Symbol as MilSymbol } from "milsymbol";
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import type { NUnit } from "@/types/internalModels";

export const unitStyleCache = new Map<string, Style>();
export const selectedUnitStyleCache = new Map<string, Style>();

export function clearUnitStyleCache() {
  unitStyleCache.clear();
  selectedUnitStyleCache.clear();
}

export function invalidateUnitStyle(cacheKey: string) {
  unitStyleCache.delete(cacheKey);
  selectedUnitStyleCache.delete(cacheKey);
}

function createMilSymbolStyle(milSymbol: MilSymbol) {
  const { x, y } = milSymbol.getAnchor();
  const image = new Icon({
    scale: 1 / (window.devicePixelRatio || 1),
    anchor: [x, y],
    anchorXUnits: "pixels",
    anchorYUnits: "pixels",
    img: milSymbol.asCanvas(),
  });
  return new Style({
    image,
  });
}

export function createUnitStyle(unit: NUnit, symbolOptions: UnitSymbolOptions): Style {
  const { name = "", shortName = "" } = unit;
  const sidc = unit._state?.sidc || unit.sidc;

  const settingsStore = useSettingsStore();
  const symbolSettings = useSymbolSettingsStore();

  const { uniqueDesignation = shortName || name, ...textAmplifiers } =
    unit.textAmplifiers || {};
  const milSymbol = symbolGenerator(sidc, {
    size: settingsStore.mapIconSize * (window.devicePixelRatio || 1),
    uniqueDesignation,
    outlineColor: "white",
    outlineWidth: 8,
    ...textAmplifiers,
    ...symbolSettings.symbolOptions,
    ...symbolOptions,
  });
  return createMilSymbolStyle(milSymbol);
}
