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

export type MeasurementTypes = "LineString" | "Polygon";

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

const formatLength = function (line: Geometry) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " km";
  } else {
    output = Math.round(length * 100) / 100 + " m";
  }
  return output;
};

const formatArea = function (polygon: Geometry) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
  } else {
    output = Math.round(area * 100) / 100 + " m\xB2";
  }
  return output;
};

function measurementInteractionWrapper(
  olMap: OLMap,
  drawType: MeasurementTypes,
  options = {
    showSegments: true,
    clearPrevious: true,
  }
) {
  let showSegments = options.showSegments;
  let clearPrevious = options.clearPrevious;
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
        label = formatArea(geometry);
        line = new LineString(geometry.getCoordinates()![0]);
      } else if (type === "LineString") {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry);
        line = geometry as LineString;
      }
    }
    if (segments && line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
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
    const activeTip =
      "Click to continue drawing the " + (drawType === "Polygon" ? "polygon" : "line");
    const idleTip = "Click to start measuring";
    let tip = idleTip;
    drawInteraction = new Draw({
      source: source,
      type: drawType,
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

  function cleanup() {
    vector.getSource()?.clear();
    olMap.removeLayer(vector);
    olMap.removeInteraction(modifyInteraction);
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
    cleanup,
    clear,
  };
}

export function useMeasurementInteraction(
  olMap: OLMap,
  measurementType: MaybeRef<MeasurementTypes>,
  options: Partial<{
    showSegments: MaybeRef<boolean>;
    clearPrevious: MaybeRef<boolean>;
    enable: MaybeRef<boolean>;
  }> = {}
) {
  const measurementTypeRef = ref(measurementType);
  const showSegmentsRef = ref(options.showSegments ?? true);
  const clearPreviousRef = ref(options.clearPrevious ?? true);
  const enableRef = ref(options.enable ?? true);

  const {
    changeMeasurementType,
    setShowSegments,
    setClearPrevious,
    setActive,
    cleanup,
    clear,
  } = measurementInteractionWrapper(olMap, unref(measurementTypeRef), {
    clearPrevious: unref(clearPreviousRef),
    showSegments: unref(showSegmentsRef),
  });

  watch(measurementTypeRef, (type) => changeMeasurementType(type));
  watch(showSegmentsRef, (v) => setShowSegments(v));
  watch(clearPreviousRef, (v) => setClearPrevious(v), { immediate: true });
  watch(enableRef, (enabled) => setActive(enabled), { immediate: true });

  tryOnBeforeUnmount(() => {
    cleanup();
  });

  return { clear };
}
