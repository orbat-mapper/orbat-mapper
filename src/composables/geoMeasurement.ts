// Based on https://openlayers.org/en/latest/examples/measure-style.html
import OLMap from "ol/Map";
import { Circle as CircleStyle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import { Geometry, LineString, Point, Polygon, SimpleGeometry } from "ol/geom";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { getArea, getLength } from "ol/sphere";
import Feature from "ol/Feature";
import { MaybeRef, tryOnBeforeUnmount } from "@vueuse/core";
import { ref, unref, watch } from "vue";
import { primaryAction } from "ol/events/condition";
import Snap from "ol/interaction/Snap";
import { Collection } from "ol";
import { getSnappableFeatures } from "@/composables/openlayersHelpers";

export type MeasurementTypes = "LineString" | "Polygon";
export type MeasurementUnit = "metric" | "imperial" | "nautical";

const style = new Style({
  fill: new Fill({
    color: "rgba(255, 255, 255, 0.2)",
  }),
  stroke: new Stroke({
    color: "rgb(0, 0, 0)",
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.2)",
    }),
  }),
});

const lineBackgroundStyle = new Style({
  stroke: new Stroke({
    color: "rgba(255, 255, 255, 0.7)",
    width: 5,
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: "14px Calibri,sans-serif",
    fill: new Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    padding: [3, 3, 3, 3],
    textBaseline: "bottom",
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
    padding: [2, 2, 2, 2],
    textAlign: "left",
    offsetX: 15,
  }),
});

const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    fill: new Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
  }),
  text: new Text({
    text: "Drag to modify",
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    padding: [2, 2, 2, 2],
    textAlign: "left",
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
    padding: [2, 2, 2, 2],
    textBaseline: "bottom",
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
  }),
});

const formatLength = function (line: Geometry, unit: MeasurementUnit = "metric") {
  const length = getLength(line);
  let output: string = "";
  if (unit === "metric") {
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " km";
    } else {
      output = Math.round(length * 100) / 100 + " m";
    }
  } else if (unit === "imperial") {
    const miles = length * 0.000621371192;
    if (miles > 0.1) {
      output = miles.toFixed(2) + " mi";
    } else {
      output = (miles * 5280).toFixed(2) + " ft";
    }
  } else if (unit === "nautical") {
    const nm = length * 0.000539956803;
    if (nm > 0.1) {
      output = nm.toFixed(2) + " nm";
    } else {
      output = nm.toFixed(3) + " nm";
    }
  }
  return output;
};

const formatArea = function (
  polygon: Geometry,
  unit: MeasurementUnit = "metric"
): string {
  const area = getArea(polygon);
  let output = "";
  if (unit === "metric") {
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
    } else {
      output = Math.round(area * 100) / 100 + " m\xB2";
    }
  } else if (unit === "imperial") {
    const squareMiles = area * 0.0000003861021585424458;
    if (squareMiles > 0.1) {
      output = squareMiles.toFixed(2) + " mi\xB2";
    } else {
      output = (area * 10.7639104167097).toFixed(2) + " ft\xB2";
    }
  } else if (unit === "nautical") {
    const squareNM = area * 0.0000003599999999999999;
    if (squareNM > 0.1) {
      output = squareNM.toFixed(2) + " nm\xB2";
    } else {
      output = (area * 10.7639104167097).toFixed(2) + " ft\xB2";
    }
  }
  return output;
};

function measurementInteractionWrapper(
  olMap: OLMap,
  drawType: MeasurementTypes,
  options: {
    clearPrevious: boolean;
    showSegments: boolean;
    measurementUnit: MeasurementUnit;
  } = {
    showSegments: true,
    clearPrevious: true,
    measurementUnit: "metric",
  }
) {
  let showSegments = options.showSegments;
  let clearPrevious = options.clearPrevious;
  let measurementUnit = options.measurementUnit;
  let tipPoint: Point;
  let drawInteraction: Draw;
  const segmentStyles = [segmentStyle];
  const source = new VectorSource();
  const vector = new VectorLayer({
    source: source,
    style: function (feature) {
      return styleFunction(feature as Feature<SimpleGeometry>, showSegments);
    },
  });
  const modifyInteraction = new Modify({
    source,
    style: modifyStyle,
    pixelTolerance: 20,
  });

  function styleFunction(
    feature: Feature<SimpleGeometry>,
    segments: boolean,
    drawType?: "Polygon" | "LineString",
    tip?: string
  ) {
    const styles = [lineBackgroundStyle, style];
    const geometry = feature.getGeometry();
    if (!geometry) return styles;
    const type = geometry.getType();
    let point: Point | undefined;
    let label = "";
    let line: LineString | undefined;
    if (!drawType || drawType === type) {
      if (type === "Polygon") {
        point = (geometry as Polygon).getInteriorPoint();
        label = formatArea(geometry, measurementUnit);
        line = new LineString(geometry.getCoordinates()![0]);
      } else if (type === "LineString") {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry, measurementUnit);
        line = geometry as LineString;
      }
    }
    if (segments && line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment, measurementUnit);
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        segmentStyles[count].setGeometry(segmentPoint);
        segmentStyles[count].getText().setText(label);
        styles.push(segmentStyles[count]);
        count++;
      });
    }

    if (label && point) {
      labelStyle.setGeometry(point);
      labelStyle.getText().setText(label);
      styles.push(labelStyle);
    }
    if (
      tip &&
      type === "Point" &&
      !modifyInteraction.getOverlay().getSource().getFeatures().length
    ) {
      tipPoint = geometry as Point;
      tipStyle.getText().setText(tip);
      styles.push(tipStyle);
    }
    return styles;
  }

  function addInteraction(map: OLMap, drawType: MeasurementTypes) {
    // const activeTip =
    //   "Click to continue drawing the " + (drawType === "Polygon" ? "polygon" : "line");
    const activeTip = "";
    const idleTip = "Click to start measuring";
    let tip = idleTip;
    drawInteraction = new Draw({
      source: source,
      type: drawType,
      condition: primaryAction,
      style: function (feature) {
        return styleFunction(
          feature as Feature<SimpleGeometry>,
          showSegments,
          drawType,
          tip
        );
      },
    });
    drawInteraction.on("drawstart", function () {
      if (clearPrevious) {
        source.clear();
      }
      modifyInteraction.setActive(false);
      tip = activeTip;
    });
    drawInteraction.on("drawend", function () {
      modifyStyle.setGeometry(tipPoint);
      modifyInteraction.setActive(true);
      map.once("pointermove", function () {
        // @ts-ignore
        modifyStyle.setGeometry();
      });
      tip = idleTip;
    });
    modifyInteraction.setActive(true);
    map.addInteraction(drawInteraction);
  }

  function changeMeasurementType(type: MeasurementTypes) {
    olMap.removeInteraction(drawInteraction);
    addInteraction(olMap, type);
  }

  function setShowSegments(v: boolean) {
    showSegments = v;
    vector.changed();
    drawInteraction.getOverlay().changed();
  }

  function setClearPrevious(v: boolean) {
    clearPrevious = v;
  }

  function setActive(enabled: boolean) {
    modifyInteraction.setActive(enabled);
    drawInteraction.setActive(enabled);
  }

  function setUnit(newUnit: MeasurementUnit) {
    measurementUnit = newUnit;
    vector.changed();
    drawInteraction.getOverlay().changed();
  }

  function cleanup() {
    vector.getSource()?.clear();
    olMap.removeLayer(vector);
    olMap.removeInteraction(modifyInteraction);
    olMap.removeInteraction(drawInteraction);
  }

  function clear() {
    vector.getSource()?.clear();
  }

  olMap.addLayer(vector);
  addInteraction(olMap, drawType);
  olMap.addInteraction(modifyInteraction);

  return {
    changeMeasurementType,
    setShowSegments,
    setClearPrevious,
    setActive,
    setUnit,
    cleanup,
    clear,
  };
}

export interface MeasurementInteractionOptions {
  showSegments?: MaybeRef<boolean>;
  clearPrevious?: MaybeRef<boolean>;
  enable?: MaybeRef<boolean>;
  measurementUnit?: MaybeRef<MeasurementUnit>;
  snap?: MaybeRef<boolean>;
}

export function useMeasurementInteraction(
  olMap: OLMap,
  measurementType: MaybeRef<MeasurementTypes>,
  options: MeasurementInteractionOptions = {}
) {
  const measurementTypeRef = ref(measurementType);
  const showSegmentsRef = ref(options.showSegments ?? true);
  const clearPreviousRef = ref(options.clearPrevious ?? true);
  const enableRef = ref(options.enable ?? true);
  const measurementUnitRef = ref(options.measurementUnit ?? "metric");
  const snapRef = ref(options.snap ?? true);

  let snapInteraction: Snap | undefined | null;
  const featureCollection = new Collection<Feature<Geometry>>();

  const {
    changeMeasurementType,
    setShowSegments,
    setClearPrevious,
    setActive,
    setUnit,
    cleanup,
    clear,
  } = measurementInteractionWrapper(olMap, unref(measurementTypeRef), {
    clearPrevious: unref(clearPreviousRef),
    showSegments: unref(showSegmentsRef),
    measurementUnit: unref(measurementUnitRef),
  });

  watch(measurementTypeRef, (type) => changeMeasurementType(type));
  watch(showSegmentsRef, (v) => setShowSegments(v));
  watch(clearPreviousRef, (v) => setClearPrevious(v), { immediate: true });
  watch(
    enableRef,
    (enabled) => {
      if (enabled) {
        const features = getSnappableFeatures(olMap);
        featureCollection.clear();
        featureCollection.extend(features);
      } else {
        featureCollection.clear();
      }
      setActive(enabled);
    },
    { immediate: true }
  );
  watch(measurementUnitRef, (unit) => setUnit(unit), { immediate: true });
  watch(
    snapRef,
    (snap) => {
      if (snap) {
        if (snapInteraction) olMap.removeInteraction(snapInteraction);
        snapInteraction = new Snap({
          features: featureCollection,
        });
        olMap.addInteraction(snapInteraction);
      } else {
        if (snapInteraction) olMap.removeInteraction(snapInteraction);
      }
    },
    { immediate: true }
  );

  tryOnBeforeUnmount(() => {
    cleanup();
    if (snapInteraction) olMap.removeInteraction(snapInteraction);
    featureCollection.clear();
  });

  return { clear, enabled: enableRef };
}
