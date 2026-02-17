import { Icon, Style } from "ol/style";
import type { CustomSymbol, UnitSymbolOptions } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Symbol as MilSymbol } from "milsymbol";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import type { NUnit } from "@/types/internalModels";
import { hashObject, wordWrap } from "@/utils";
import { useMapSettingsStore } from "@/stores/mapSettingsStore.ts";
import type { TScenario } from "@/scenariostore";
import { CUSTOM_SYMBOL_PREFIX, CUSTOM_SYMBOL_SLICE } from "@/config/constants.ts";

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

function createMilSymbolStyle(milSymbol: MilSymbol, rotation: number) {
  const { x, y } = milSymbol.getAnchor();
  const image = new Icon({
    scale: 1 / (window.devicePixelRatio || 1),
    anchor: [x, y],
    anchorXUnits: "pixels",
    anchorYUnits: "pixels",
    img: milSymbol.asCanvas(),
    rotation,
  });
  return new Style({
    image,
  });
}

function createCustomSymbolStyle(
  customSymbol: CustomSymbol,
  size: number,
  rotation: number,
  color?: string,
): Style {
  const image = new Icon({
    anchor: customSymbol.anchor ?? [0.5, 0.5],
    src: customSymbol.src,
    width: size,
    crossOrigin: "anonymous",
    color,
    rotation,
  });
  return new Style({
    image,
  });
}

export function createUnitStyle(
  unit: NUnit,
  symbolOptions: UnitSymbolOptions,
  scenario: TScenario,
  color?: string,
  rotationOverrideDeg?: number,
): { style: Style; cacheKey: string } {
  const { name = "", shortName = "" } = unit;
  const sidc = unit._state?.sidc || unit.sidc;
  const symbolRotationDeg = rotationOverrideDeg ?? unit._state?.symbolRotation ?? 0;
  const symbolRotationRad = (symbolRotationDeg * Math.PI) / 180;

  const mapSettingsStore = useMapSettingsStore();
  const symbolSettings = useSymbolSettingsStore();

  const { uniqueDesignation = shortName || name, ...textAmplifiers } =
    unit.textAmplifiers || {};

  if (sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    const customSymbolId = sidc.slice(CUSTOM_SYMBOL_SLICE);
    const cacheKey = customSymbolId + hashObject({ symbolRotationDeg, color });
    const customSymbol = scenario.store.state.customSymbolMap[customSymbolId];
    return {
      style: customSymbol
        ? createCustomSymbolStyle(
            customSymbol,
            mapSettingsStore.mapIconSize * (mapSettingsStore.mapCustomIconScale || 1.7),
            symbolRotationRad,
            color,
          )
        : new Style(),
      cacheKey,
    };
  }
  const options = {
    size: mapSettingsStore.mapIconSize * (window.devicePixelRatio || 1),
    uniqueDesignation: mapSettingsStore.mapUnitLabelBelow ? "" : uniqueDesignation,
    outlineColor: "white",
    outlineWidth: 8,
    ...textAmplifiers,
    ...symbolSettings.symbolOptions,
    ...symbolOptions,
  };

  const milSymbol = symbolGenerator(sidc, options);
  return {
    style: createMilSymbolStyle(milSymbol, symbolRotationRad),
    cacheKey: sidc + hashObject({ ...options, _symbolRotation: symbolRotationDeg }),
  };
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
  const scale = (unitStyle?.getImage()?.getScale() as number) || 1;
  const yOffset = (iconHeight - anchor[1]) * scale + 5;

  return {
    yOffset: unitStyle ? yOffset : 20,
    text: wrapLabels ? wordWrap(label, { width: wrapWidth }) : label,
  };
}
