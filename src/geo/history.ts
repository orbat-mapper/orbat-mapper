import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import Feature, { FeatureLike } from "ol/Feature";
import { LineString, Point } from "ol/geom";
import { formatDateString } from "@/geo/utils";
import CircleStyle from "ol/style/Circle";
import { LocationState, Unit } from "@/types/scenarioModels";
import { NUnit } from "@/types/internalModels";
import GeometryLayout from "ol/geom/GeometryLayout";
import { nanoid } from "@/utils";

const styleCache = new Map();

export function clearStyleCache() {
  styleCache.clear();
}

const stroke = new Stroke({ color: "black", width: 2 });
const fill = new Fill({ color: "red" });
const lineStyle = new Style({
  stroke: new Stroke({
    color: "red",
    width: 2,
    lineDash: [10, 10],
  }),
});

const circleStyle = new CircleStyle({
  radius: 5,
  fill: new Fill({
    color: "orange",
  }),
  stroke: new Stroke({
    color: "green",
    width: 3,
  }),
});

const viaStyle = new CircleStyle({
  radius: 3,
  fill: new Fill({
    color: "red",
  }),
  stroke: new Stroke({
    color: "green",
    width: 1,
  }),
});

export function createHistoryStylesFromFeature(
  feature: FeatureLike,
  viewResolution: number
): Style[] {
  const geometry = (feature as Feature<LineString>).getGeometry();
  const coordinates = geometry!.getCoordinates();
  let styles = [lineStyle];

  let i = 0;
  const t = coordinates[0][2];
  styles.push(
    new Style({
      image: new RegularShape({
        fill,
        stroke,
        points: 4,
        radius: 10,
        radius2: 0,
        angle: Math.PI / 4,
      }),
      geometry: new Point(geometry!.getFirstCoordinate()!),
      text: new Text({
        text: formatDateString(t).split("T")[0],
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
    const t = coordinates[++ii][2];
    const isVia = t === -1337;

    const label = isVia ? "" : formatDateString(t).split("T")[0];

    styles.push(
      new Style({
        geometry: new Point(end),
        image: isVia ? viaStyle : circleStyle,

        text: new Text({
          text: label,
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

export function createHistoryFeature(unit: Unit | NUnit): Feature<LineString> {
  const state = [{ location: unit.location }, ...(unit.state || [])].filter(
    (s) => s.location
  ) as LocationState[];
  // @ts-ignore
  const geometry = state
    .map((s) => {
      if (s.via) {
        const a = s.via.map((v) => [...v, -1337]);
        a.push([...s.location, s.t]);
        return a;
      }
      return [...s.location, s.t];
    })
    .flat(2);
  const t = new LineString(geometry, GeometryLayout.XYM);
  t.transform("EPSG:4326", "EPSG:3857");
  const f = new Feature({ geometry: t });
  f.setId(nanoid());
  return f;
}
