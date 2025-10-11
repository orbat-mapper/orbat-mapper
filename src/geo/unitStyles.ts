import { Icon, Style } from "ol/style";
import type { UnitSymbolOptions } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Symbol as MilSymbol } from "milsymbol";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import type { NUnit } from "@/types/internalModels";
import { wordWrap } from "@/utils";
import { useMapSettingsStore } from "@/stores/mapSettingsStore.ts";

export type UnitLabelData = {
  yOffset: number;
  text: string;
};
export const unitStyleCache = new Map<string, Style>();
export const selectedUnitStyleCache = new Map<string, Style>();
export const labelStyleCache = new Map<string, UnitLabelData>();

export function clearUnitStyleCache() {
  unitStyleCache.clear();
  selectedUnitStyleCache.clear();
  labelStyleCache.clear();
}

export function invalidateUnitStyle(cacheKey: string) {
  unitStyleCache.delete(cacheKey);
  selectedUnitStyleCache.delete(cacheKey);
  labelStyleCache.delete(cacheKey);
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

  const mapSettingsStore = useMapSettingsStore();
  const symbolSettings = useSymbolSettingsStore();

  const { uniqueDesignation = shortName || name, ...textAmplifiers } =
    unit.textAmplifiers || {};
  const milSymbol = symbolGenerator(sidc, {
    size: mapSettingsStore.mapIconSize * (window.devicePixelRatio || 1),
    uniqueDesignation: mapSettingsStore.mapUnitLabelBelow ? "" : uniqueDesignation,
    outlineColor: "white",
    outlineWidth: 8,
    ...textAmplifiers,
    ...symbolSettings.symbolOptions,
    ...symbolOptions,
  });
  return createMilSymbolStyle(milSymbol);
}

type UnitLabelOptions = {
  wrapLabels?: boolean;
  wrapWidth?: number;
};
export function createUnitLabelData(
  unit: NUnit,
  unitStyle: Style | undefined,
  { wrapLabels = true, wrapWidth = 20 }: UnitLabelOptions = {},
): UnitLabelData {
  const label = unit.shortName || unit.name || "";
  const anchor = unitStyle?.getImage()?.getAnchor() ?? [0, 0];
  const iconHeight = unitStyle?.getImage()?.getSize()?.[1] || 0;
  const yOffset = iconHeight - anchor[1] + 5;

  return {
    yOffset: unitStyle ? yOffset : 20,
    text: wrapLabels ? wordWrap(label, { width: wrapWidth }) : label,
  };
}
