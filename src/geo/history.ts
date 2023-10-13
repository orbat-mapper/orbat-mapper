import Feature from "ol/Feature";
import { LineString, MultiPoint, Point } from "ol/geom";
import { formatDateString } from "@/geo/utils";
import { LocationState, Unit } from "@/types/scenarioModels";
import { NUnit } from "@/types/internalModels";
import { greatCircle } from "@turf/turf";
import { getDistance } from "ol/sphere";
import { Position } from "geojson";
import { GeometryLayout } from "ol/geom/Geometry";
import { Fill, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";

export const VIA_TIME = -1337;

const viaStyle = new Style({
  image: new CircleStyle({
    radius: 4,
    fill: new Fill({
      color: "rgba(101,213,57,0.73)",
    }),
    stroke: new Stroke({
      color: "green",
      width: 1,
    }),
  }),
  stroke: new Stroke({
    color: "rgba(255,0,0,0.65)",
    width: 3,
  }),

  geometry: function (feature) {
    // @ts-ignore
    const coordinates = feature?.getGeometry()?.getCoordinates();
    return new MultiPoint(coordinates);
  },
});

const legStyle = new Style({
  stroke: new Stroke({
    color: "rgba(255,0,0,0.65)",
    width: 2,
  }),
});

const waypointStyle = new Style({
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
});

const labelStyle = new Style({
  text: new Text({
    text: "HH",
    textAlign: "left",
    offsetY: -15,
    offsetX: 15,
    fill: new Fill({ color: "#aa3300" }),
    stroke: new Stroke({ color: "white", width: 4 }),
  }),
});

export function createUnitHistoryLayers() {
  const legLayer = new VectorLayer({
    source: new VectorSource({}),
    style: legStyle,
  });

  const waypointLayer = new VectorLayer({
    source: new VectorSource(),
    style: waypointStyle,
  });

  const arcLayer = new VectorLayer({
    source: new VectorSource(),
    style: legStyle,
  });
  const viaLayer = new VectorLayer({
    source: legLayer.getSource()!,
    style: viaStyle,
  });
  const labelsLayer = new VectorLayer({
    declutter: true,
    source: waypointLayer.getSource()!,
    style: (feature) => {
      labelStyle.getText()!.setText(feature.get("label") || "");
      return labelStyle;
    },
  });

  return {
    historyLayer: new LayerGroup({
      layers: [arcLayer, legLayer, viaLayer, waypointLayer, labelsLayer],
    }),
    legLayer,
    waypointLayer,
    viaLayer,
    arcLayer,
  };
}

function unwindCoordinates(coordinates: number[][]): number[][] {
  const result = [coordinates[0]]; // Start with the first coordinate

  for (let i = 1; i < coordinates.length; i++) {
    const currentCoordinate = [...coordinates[i]];
    const prevLongitude = result[i - 1][0];
    let longitude = coordinates[i][0];
    const latitude = coordinates[i][1];

    while (longitude - prevLongitude > 180) {
      longitude -= 360;
    }

    while (prevLongitude - longitude > 180) {
      longitude += 360;
    }
    currentCoordinate[0] = longitude;
    currentCoordinate[1] = latitude;

    result.push(currentCoordinate);
  }

  return result;
}

export function createUnitPathFeatures(unit: Unit | NUnit, isEditMode = false) {
  // extract the location states from the unit, and add the initial location
  // we then remove any states that don't have a location
  const state = [
    { location: unit.location, t: Number.MIN_SAFE_INTEGER },
    ...(unit.state || []),
  ].filter((s) => s.location !== undefined) as LocationState[];

  // split state entries into groups in case the path is split
  const parts = splitLocationStateIntoParts(state);

  const waypointFeatures = parts.flat().map((part) => createWaypointFeature(part));
  const legFeatures: Feature<LineString | Point>[] = [];
  const arcFeatures: Feature<LineString | Point>[] = [];
  parts.forEach((part) => {
    if (part.length < 2) {
      if (isEditMode) {
        legFeatures.push(createSegmentFeature([[...part[0].location, part[0].t]]));
      }
      // arcFeatures.push(createSegmentFeature[[...part[0].location, part[0].t]]);return;
      return;
    }
    const segment = [];
    for (let i = 0; i < part.length - 1; i++) {
      const from = part[i];
      const to = part[i + 1];
      if (i === 0) segment.push([...from.location, from.t]);
      if (to.via) {
        to.via.forEach((v) => {
          segment.push([...v, VIA_TIME]);
        });
      }
      segment.push([...to.location, to.t]);
    }
    if (isEditMode) {
      legFeatures.push(createSegmentFeature(segment));
    }
    arcFeatures.push(createSegmentFeature(createGreatCircleArcFeature(segment), "XY"));
  });

  function createSegmentFeature(
    segment: Position[],
    geometryLayout: GeometryLayout = "XYM",
  ): Feature<LineString | Point> {
    const geometry =
      segment.length > 1
        ? new LineString(unwindCoordinates(segment), geometryLayout)
        : new Point(segment[0], geometryLayout);
    geometry.transform("EPSG:4326", "EPSG:3857");

    return new Feature({
      geometry,
      unitId: unit.id,
    });
  }

  function createWaypointFeature(state: LocationState) {
    const geometry = new Point(state.location);
    geometry.transform("EPSG:4326", "EPSG:3857");

    return new Feature({
      geometry,
      id: state.id,
      unitId: unit.id,
      label: state.t > Number.MIN_SAFE_INTEGER ? formatDateString(state.t) : "",
    });
  }

  return { legFeatures, waypointFeatures, viaPointFeatures: [], arcFeatures };
}

function createGreatCircleArcFeature(leg: Position[]) {
  const coords: Position[] = [];
  for (let i = 0; i < leg.length - 1; i++) {
    let from = leg[i];
    let to = leg[i + 1];
    const distance = getDistance(from, to);
    if (distance > 100000) {
      const arcLine = greatCircle(from, to, {
        offset: -100000,
        npoints: Math.min(Math.ceil(distance / 200000), 50),
      });
      // @ts-ignore
      coords.push(...arcLine.geometry.coordinates);
    } else {
      coords.push(...[from, to]);
    }
  }
  return coords;
}

function splitLocationStateIntoParts(state: LocationState[]): LocationState[][] {
  const parts: LocationState[][] = [];
  let currentPart: LocationState[] = [];
  state.forEach((s) => {
    if (s.location === null || s.interpolate === false) {
      if (currentPart.length) parts.push(currentPart);
      currentPart = [];
    } else {
      currentPart.push(s);
    }
  });
  if (currentPart.length) parts.push(currentPart);
  return parts;
}
