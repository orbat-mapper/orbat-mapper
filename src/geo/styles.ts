import Feature, { FeatureLike } from "ol/Feature";
import { Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";
import { Unit } from "../types/models";
import { symbolGenerator } from "../symbology/milsymbwrapper";
import { Symbol as MilSymbol } from "milsymbol";
import IconAnchorUnits from "ol/style/IconAnchorUnits";
import { LineString, Point } from "ol/geom";
import CircleStyle from "ol/style/Circle";
import { formatDateString } from "./utils";
import { useSettingsStore } from "../stores/settingsStore";

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
  if (!selectedUnitStyleCache.has(key)) {
    const settingsStore = useSettingsStore();
    const milSymbol = symbolGenerator(sidc, {
      size: settingsStore.mapIconSize,
      uniqueDesignation: shortName || name,
      outlineColor: "white",
      outlineWidth: 8,
      standard: settingsStore.symbologyStandard,
    });
    const style = createMilSymbolStyle(milSymbol);
    selectedUnitStyleCache.set(key, style);
    return style;
  } else return selectedUnitStyleCache.get(key);
}

export function createSelectedUnitStyleFromFeature(
  feature: FeatureLike
): Style {
  const { sidc, name, shortName } = feature.getProperties() as Unit;
  const key = sidc + name;
  if (!unitStyleCache.has(key)) {
    const settingsStore = useSettingsStore();
    const milSymbol = symbolGenerator(sidc, {
      size: settingsStore.mapIconSize,
      outlineColor: "Yellow",
      outlineWidth: 20,
      uniqueDesignation: name || shortName,
      standard: settingsStore.symbologyStandard,
    });
    const style = createMilSymbolStyle(milSymbol);
    style.setZIndex(10);

    unitStyleCache.set(key, style);
    return style;
  } else return unitStyleCache.get(key);
}

const stroke = new Stroke({ color: "black", width: 2 });
const fill = new Fill({ color: "red" });

export function createHistoryStylesFromFeature(
  feature: FeatureLike,
  viewResolution: number
): Style[] {
  const geometry = (feature as Feature<LineString>).getGeometry();
  const coordinates = geometry!.getCoordinates();
  let styles = [
    // linestring
    new Style({
      stroke: new Stroke({
        color: "red",
        width: 2,
        lineDash: [10, 10],
      }),
    }),
  ];

  let i = 0;
  const t = feature.get("t");
  styles.push(
    new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        radius2: 0,
        angle: Math.PI / 4,
      }),
      geometry: new Point(geometry!.getFirstCoordinate()!),
      text: new Text({
        text: formatDateString(coordinates[0][2]).split("T")[0],
        textAlign: "left",
        offsetY: -15,
        offsetX: 15,
        fill: new Fill({ color: "#aa3300" }),
        stroke: new Stroke({ color: "white", width: 4 }),
      }),
    })
  );

  let ii = 0;

  geometry!.forEachSegment((start, end) => {
    styles.push(
      new Style({
        geometry: new Point(end),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: "orange",
          }),
          stroke: new Stroke({
            color: "green",
            width: 3,
          }),
        }),
        text: new Text({
          text: formatDateString(coordinates[++ii][2]).split("T")[0],
          textAlign: "left",
          offsetX: 12,
          fill: new Fill({ color: "#aa3300" }),
          stroke: new Stroke({ color: "white", width: 4 }),
        }),
      })
    );
    i++;
  });

  return styles;
}
