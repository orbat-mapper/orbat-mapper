import OLMap from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import { click as clickCondition } from "ol/events/condition";
import { getCenter, isEmpty } from "ol/extent";
import { featureCollection } from "@turf/helpers";
import turfCircle from "@turf/circle";
import turfEnvelope from "@turf/envelope";
import { injectStrict, nanoid } from "@/utils";
import Collection from "ol/Collection";
import { getFeatureAndLayerById, useOlEvent } from "@/composables/openlayersHelpers";
import GeoJSON from "ol/format/GeoJSON";
import Feature, { type FeatureLike } from "ol/Feature";
import type { FeatureId, ScenarioFeature } from "@/types/scenarioGeoModels";
import Circle from "ol/geom/Circle";
import { fromLonLat, type ProjectionLike } from "ol/proj";
import LineString from "ol/geom/LineString";
import type { Feature as GeoJsonFeature, Point } from "geojson";
import destination from "@turf/destination";
import { type MaybeRef, onUnmounted, ref, watch } from "vue";
import { unByKey } from "ol/Observable";
import { type EventsKey } from "ol/events";
import {
  IconLayersOutline,
  IconMapMarker,
  IconVectorCircleVariant,
  IconVectorLine,
  IconVectorTriangle,
  IconMapMarkerMultipleOutline,
} from "@iconify-prerendered/vue-mdi";
import type { ScenarioFeatureActions } from "@/types/constants";
import Select, { SelectEvent } from "ol/interaction/Select";
import { activeFeatureStylesKey, activeScenarioKey } from "@/components/injects";
import type { NGeometryLayerItem, NScenarioLayer } from "@/types/internalModels";
import type { TScenario } from "@/scenariostore";
import type { UseFeatureStyles } from "@/geo/featureStyles";
import type { MenuItemData } from "@/components/types";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import { useSelectedItems } from "@/stores/selectedStore";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import type { GeometryLayerItem, ScenarioLayerItem } from "@/types/scenarioLayerItems";
import {
  isGeometryLayerItemLike,
  isNGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import { useScenarioFeatureSelection } from "@/modules/scenarioeditor/useScenarioFeatureSelection";
import { useSelectionActions } from "@/composables/selectionActions";

const selectStyle = new Style({
  stroke: new Stroke({ color: "#ffff00", width: 9 }),
  image: new CircleStyle({
    radius: 15,
    fill: new Fill({
      color: "#ffff00",
    }),
  }),
});
const selectMarkerStyle = new Style({
  image: new CircleStyle({
    radius: 15,
    fill: new Fill({
      color: "#ffff00",
    }),
  }),
});

export const LayerTypes = {
  scenarioFeature: "SCENARIO_FEATURE",
  units: "UNITS",
  labels: "LABELS",
} as const;

export type LayerType = (typeof LayerTypes)[keyof typeof LayerTypes];

const geometryIconMap: any = {
  Point: IconMapMarker,
  LineString: IconVectorLine,
  Polygon: IconVectorTriangle,
  Circle: IconVectorCircleVariant,
  GeometryCollection: IconMapMarkerMultipleOutline,
  layer: IconLayersOutline,
  annotation: IconMapMarker,
  tacticalGraphic: IconVectorLine,
  measurement: IconVectorCircleVariant,
};

type GeometryFeatureLike = GeometryLayerItem | NGeometryLayerItem | ScenarioFeature;

function isGeometryFeatureLike(
  item: ScenarioLayerItem | NGeometryLayerItem | ScenarioFeature,
): item is GeometryFeatureLike {
  return isGeometryLayerItemLike(item);
}

function getItemIconKey(
  item?: ScenarioFeature | NGeometryLayerItem | ScenarioLayerItem,
): string | undefined {
  if (!item) return undefined;
  if (isGeometryLayerItemLike(item)) return item.meta.type;
  return "kind" in item ? item.kind : undefined;
}

export function getGeometryIcon(
  feature?: ScenarioFeature | NGeometryLayerItem | ScenarioLayerItem,
) {
  const key = getItemIconKey(feature);
  return (key && geometryIconMap[key]) || geometryIconMap.Polygon;
}

export function getItemsIcon(type: string) {
  return geometryIconMap[type];
}

export const featureMenuItems: MenuItemData<ScenarioFeatureActions>[] = [
  { label: "Zoom to", action: "zoom" },
  { label: "Pan to", action: "pan" },
  { label: "Move up", action: "moveUp" },
  { label: "Move down", action: "moveDown" },
  { label: "Delete", action: "delete" },
  { label: "Duplicate", action: "duplicate" },
  { label: "Copy as GeoJSON", action: "copyAsGeoJson" },
];

export function layerItemsToGeoJsonString(
  items: (ScenarioLayerItem | NGeometryLayerItem | ScenarioFeature)[],
) {
  const fc = featureCollection(
    items.filter(isGeometryFeatureLike).map((f) => {
      const properties = {
        name: f.meta.name,
        description: f.meta.description,
        ...f.properties,
      };
      if (f.meta.type === "Circle" && f.meta.radius && f.geometry.type === "Point") {
        const poly = turfCircle(f.geometry.coordinates, f.meta.radius, {
          units: "meters",
        });
        return { ...poly, id: f.id, properties };
      }
      return {
        type: "Feature" as const,
        id: f.id,
        properties,
        geometry: f.geometry,
      };
    }),
  );
  return JSON.stringify(fc, null, 2);
}

const layersMap = new WeakMap<OLMap, LayerGroup>();

function convertRadius(center: GeoJsonFeature<Point>, radiusInMeters: number): number {
  const p = destination(center, radiusInMeters / 1000, 90);
  const line = new LineString([center.geometry.coordinates, p.geometry.coordinates]);
  line.transform("EPSG:4326", "EPSG:3857");
  return line.getLength();
}

export function getTopHitLayerType(
  olMap: OLMap,
  pixel: number[],
  hitTolerance = 0,
): string | undefined {
  let topLayerType: string | undefined;
  olMap.forEachFeatureAtPixel(
    pixel,
    (_feature, layer) => {
      topLayerType = layer?.get("layerType");
      return true;
    },
    { hitTolerance },
  );
  return topLayerType;
}

export function projectGeometryLayerItemToOlFeature(
  fullFeature: GeometryFeatureLike,
  index: number,
  featureProjection: ProjectionLike,
) {
  const gjson = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection,
  });
  let feature = fullFeature;
  if (fullFeature._state && "geometry" in fullFeature._state) {
    feature = {
      ...fullFeature,
      geometry: fullFeature._state.geometry || fullFeature.geometry,
    };
  }

  feature.meta._zIndex = index;
  if (feature.meta?.radius && feature.geometry.type === "Point") {
    const newRadius = convertRadius(
      feature as GeoJsonFeature<Point>,
      feature.meta.radius,
    );
    const circle = new Circle(
      fromLonLat(feature.geometry.coordinates as number[]),
      newRadius,
    );
    const f = new Feature({
      geometry: circle,
      ...feature.properties,
    });
    f.setId(feature.id);
    return f;
  }

  return gjson.readFeature(feature, {
    featureProjection,
    dataProjection: "EPSG:4326",
  }) as Feature;
}

export function createScenarioLayerItemFeatures(
  items: Array<ScenarioLayerItem | NGeometryLayerItem | ScenarioFeature>,
  featureProjection: ProjectionLike,
) {
  return items
    .filter(isGeometryFeatureLike)
    .map((feature, index) =>
      projectGeometryLayerItemToOlFeature(feature, index, featureProjection),
    );
}

export function useScenarioFeatureSelect(
  olMap: OLMap,
  options: Partial<{
    enable: MaybeRef<boolean>;
  }> = {},
) {
  const { scenarioFeatureStyle } = injectStrict(activeFeatureStylesKey);
  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const scenarioLayersOl = scenarioLayersGroup.getLayers() as Collection<
    VectorLayer<any>
  >;
  const { applyScenarioFeatureSelection } = useScenarioFeatureSelection();
  const { canAdditivelySelectFeature } = useSelectionActions();

  const { selectedFeatureIds: selectedIds } = useSelectedItems();

  const enableRef = ref(options.enable ?? true);
  const hitTolerance = 20;

  const selectInteraction = new Select({
    condition: (event) => {
      if (!clickCondition(event)) return false;
      const topHitLayerType = getTopHitLayerType(olMap, event.pixel, hitTolerance);
      if (
        topHitLayerType !== undefined &&
        topHitLayerType !== LayerTypes.scenarioFeature
      ) {
        return false;
      }
      return !event.originalEvent.shiftKey || canAdditivelySelectFeature();
    },
    hitTolerance,
    layers: scenarioLayersOl.getArray(),
    style: (feature: FeatureLike, res: number): Style | Style[] => {
      const styleOrStyles = scenarioFeatureStyle(feature, res, true)!;
      // scenarioFeatureStyle may return an array when arrows are present
      const baseStyle = Array.isArray(styleOrStyles) ? styleOrStyles[0] : styleOrStyles;
      let activeSelectStyle: Style;
      if (feature.getGeometry()?.getType() === "Point") {
        activeSelectStyle = selectMarkerStyle;
      } else {
        selectStyle.getStroke()?.setWidth((baseStyle.getStroke()?.getWidth() || 0) + 8);
        activeSelectStyle = selectStyle;
      }
      if (Array.isArray(styleOrStyles)) {
        return [activeSelectStyle, ...styleOrStyles];
      }
      return [activeSelectStyle, baseStyle];
    },
  });
  const selectedFeatures = selectInteraction.getFeatures();
  let isInternal = false;

  useOlEvent(
    selectInteraction.on("select", (event: SelectEvent) => {
      isInternal = true;
      const featureIds = selectedFeatures
        .getArray()
        .map((feature) => feature.getId())
        .filter((featureId): featureId is FeatureId => featureId !== undefined);
      const primaryFeatureId = event.selected[0]?.getId() ?? featureIds[0];
      applyScenarioFeatureSelection({
        featureIds,
        primaryFeatureId,
        noZoom: true,
      });
    }),
  );

  watch(
    () => [...selectedIds.value],
    (v) => {
      if (!isInternal) {
        selectedFeatures.clear();
        v.forEach((fid) => {
          const { feature } = getFeatureAndLayerById(fid, scenarioLayersOl) || {};
          if (feature) selectedFeatures.push(feature);
        });
      }
      isInternal = false;
    },
    { immediate: true },
  );

  olMap.addInteraction(selectInteraction);

  watch(
    enableRef,
    (enabled) => {
      selectInteraction.getFeatures().clear();
      selectInteraction.setActive(enabled);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    olMap.removeInteraction(selectInteraction);
  });

  return { selectedIds, selectedFeatures, selectInteraction };
}

export function useFeatureLayerUtils(
  olMap: OLMap,
  {
    activeScenario,
  }: { activeScenario?: TScenario; activeScenarioFeatures?: UseFeatureStyles } = {},
) {
  const {
    geo,
    store: { state },
  } = activeScenario || injectStrict(activeScenarioKey);

  const scenarioLayersGroup = getOrCreateLayerGroup(olMap);
  const scenarioLayersOl = scenarioLayersGroup.getLayers() as Collection<
    VectorLayer<any>
  >;

  function getOlLayerById(layerId: FeatureId) {
    return scenarioLayersOl
      .getArray()
      .find((e) => e.get("id") === layerId) as VectorLayer<any>;
  }

  function zoomToFeature(featureId: FeatureId) {
    const { feature: olFeature } =
      getFeatureAndLayerById(featureId, scenarioLayersOl) || {};
    if (!olFeature?.getGeometry()) return;
    olMap.getView().fit(olFeature.getGeometry() as SimpleGeometry, { maxZoom: 15 });
  }

  function zoomToFeatures(featureIds: FeatureId[]) {
    const c = featureCollection(
      featureIds.map((fid) => state.layerItemMap[fid]).filter(isNGeometryLayerItem),
    );
    const bb = new GeoJSON().readFeature(turfEnvelope(c), {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    }) as Feature<any>;
    if (!bb) return;
    olMap.getView().fit(bb.getGeometry(), { maxZoom: 17 });
  }

  function panToFeature(featureId: FeatureId) {
    const { feature: olFeature } =
      getFeatureAndLayerById(featureId, scenarioLayersOl) || {};
    if (!olFeature) return;
    const view = olMap.getView();
    const extent = olFeature?.getGeometry()?.getExtent();
    extent &&
      view.animate({
        center: getCenter(extent),
      });
  }

  function zoomToLayer(layerId: FeatureId) {
    const olLayer = getOlLayerById(layerId);
    if (!olLayer) return;
    const layerExtent = olLayer.getSource()?.getExtent();

    layerExtent && !isEmpty(layerExtent) && olMap.getView().fit(layerExtent);
  }

  function getLayerById(layerId: FeatureId): NScenarioLayer | undefined | null {
    return geo.getLayerById(layerId);
  }

  return {
    scenarioLayersGroup,
    scenarioLayers: geo.layerItemsLayers,
    getOlLayerById,
    zoomToFeature,
    zoomToFeatures,
    zoomToLayer,
    panToFeature,
    getLayerById,
  };
}

export function getOrCreateLayerGroup(olMap: OLMap) {
  if (layersMap.has(olMap)) return layersMap.get(olMap)!;

  const layerGroup = new LayerGroup({
    properties: { id: nanoid(), title: "Scenario layers" },
  });
  layersMap.set(olMap, layerGroup);
  olMap.addLayer(layerGroup);
  return layerGroup;
}

export function useScenarioLayerSync(olLayers: Collection<VectorLayer<any>>) {
  const { geo } = injectStrict(activeScenarioKey);

  const eventKeys = [] as EventsKey[];

  function addListener(l: VectorLayer<any>) {
    eventKeys.push(
      l.on("change:visible", (event) => {
        const isVisible = l.getVisible();
        geo.updateLayer(l.get("id"), { isHidden: !isVisible }, { undoable: false });
      }),
    );
  }

  olLayers.forEach((l) => {
    addListener(l);
  });
  useOlEvent(
    olLayers.on("add", (event) => {
      const addedLayer = event.element as VectorLayer<any>;
      addListener(addedLayer);
    }),
  );

  onUnmounted(() => {
    eventKeys.forEach((key) => unByKey(key));
  });
}
