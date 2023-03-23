import type { FeatureLike } from "ol/Feature";
import { Icon, Style } from "ol/style";
import type { Unit } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import type { Symbol as MilSymbol } from "milsymbol";
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import type { OlUnitProps } from "@/types/internalModels";

const unitStyleCache = new Map();
const selectedUnitStyleCache = new Map();

export function clearStyleCache() {
  unitStyleCache.clear();
  selectedUnitStyleCache.clear();
}

function createMilSymbolStyle(milSymbol: MilSymbol) {
  const { x, y } = milSymbol.getAnchor();
  const { width, height } = milSymbol.getSize();
  const image = new Icon({
    // temporary workaround for ol bug (https://github.com/openlayers/openlayers/issues/12574)
    color: "white",
    scale: 1,
    anchor: [x, y],
    anchorXUnits: "pixels",
    anchorYUnits: "pixels",
    imgSize: [Math.floor(width), Math.floor(height)],
    img: milSymbol.asCanvas(),
  });
  return new Style({
    image,
  });
}

export function createUnitStyleFromFeature(feature: FeatureLike): Style[] {
  const {
    sidc,
    name,
    shortName,
    stateType,
    symbolOptions = {},
  } = feature.getProperties() as OlUnitProps;
  const isInterpolated = stateType === "interpolated";
  const key = sidc + name + symbolOptions.fillColor || "";
  if (!unitStyleCache.has(key)) {
    const settingsStore = useSettingsStore();
    const symbolSettings = useSymbolSettingsStore();
    const milSymbol = symbolGenerator(sidc, {
      size: settingsStore.mapIconSize,
      uniqueDesignation: shortName || name,
      outlineColor: "white",
      outlineWidth: 8,
      ...symbolSettings.symbolOptions,
      ...symbolOptions,
    });
    const style = createMilSymbolStyle(milSymbol);
    unitStyleCache.set(key, style);
    return [style];
  } else return [unitStyleCache.get(key)];
}

export function createSelectedUnitStyleFromFeature(feature: FeatureLike): Style {
  const { sidc, name, shortName, symbolOptions = {} } = feature.getProperties() as Unit;
  const key = sidc + name + symbolOptions.fillColor || "";
  if (!selectedUnitStyleCache.has(key)) {
    const settingsStore = useSettingsStore();
    const symbolSettings = useSymbolSettingsStore();
    const milSymbol = symbolGenerator(sidc, {
      size: settingsStore.mapIconSize,
      outlineColor: "Yellow",
      outlineWidth: 21,
      uniqueDesignation: name || shortName,
      ...symbolSettings.symbolOptions,
      ...symbolOptions,
    });
    const style = createMilSymbolStyle(milSymbol);
    style.setZIndex(10);

    selectedUnitStyleCache.set(key, style);
    return style;
  } else return selectedUnitStyleCache.get(key);
}
