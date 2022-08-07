import { FeatureLike } from "ol/Feature";
import { Icon, Style } from "ol/style";
import { Unit } from "@/types/scenarioModels";
import { symbolGenerator } from "@/symbology/milsymbwrapper";
import { Symbol as MilSymbol } from "milsymbol";
import IconAnchorUnits from "ol/style/IconAnchorUnits";
import { useSettingsStore } from "@/stores/settingsStore";

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
    anchorXUnits: IconAnchorUnits.PIXELS,
    anchorYUnits: IconAnchorUnits.PIXELS,
    imgSize: [Math.floor(width), Math.floor(height)],
    img: milSymbol.asCanvas(),
  });
  return new Style({
    image,
  });
}

export function createUnitStyleFromFeature(feature: FeatureLike): Style {
  const { sidc, name, shortName } = feature.getProperties() as Unit;
  const key = sidc + name;
  if (!unitStyleCache.has(key)) {
    const settingsStore = useSettingsStore();
    const milSymbol = symbolGenerator(sidc, {
      size: settingsStore.mapIconSize,
      uniqueDesignation: shortName || name,
      outlineColor: "white",
      outlineWidth: 8,
      standard: settingsStore.symbologyStandard,
      simpleStatusModifier: true,
    });
    const style = createMilSymbolStyle(milSymbol);
    unitStyleCache.set(key, style);
    return style;
  } else return unitStyleCache.get(key);
}

export function createSelectedUnitStyleFromFeature(feature: FeatureLike): Style {
  const { sidc, name, shortName } = feature.getProperties() as Unit;
  const key = sidc + name;
  if (!selectedUnitStyleCache.has(key)) {
    const settingsStore = useSettingsStore();
    const milSymbol = symbolGenerator(sidc, {
      size: settingsStore.mapIconSize,
      outlineColor: "Yellow",
      outlineWidth: 21,
      uniqueDesignation: name || shortName,
      standard: settingsStore.symbologyStandard,
      simpleStatusModifier: true,
    });
    const style = createMilSymbolStyle(milSymbol);
    style.setZIndex(10);

    selectedUnitStyleCache.set(key, style);
    return style;
  } else return selectedUnitStyleCache.get(key);
}
