import { featureCollection } from "@turf/helpers";
import centerOfMass from "@turf/center-of-mass";
import turfCircle from "@turf/circle";
import type {
  ImageSourceSpecification,
  LayerSpecification,
  Map as MlMap,
} from "maplibre-gl";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import type { Feature as GeoJsonFeature, Position } from "geojson";
import type {
  RefreshScenarioFeatureLayersOptions,
  ScenarioLayerController,
  ScenarioLayerControllerEvent,
} from "@/geo/contracts/scenarioLayerController";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { TScenario } from "@/scenariostore";
import type { ActionLabel } from "@/scenariostore/newScenarioStore";
import { watch } from "vue";
import { MapLibreScenarioFeatureManager } from "@/modules/maplibreview/maplibreScenarioFeatures";
import { useSelectedItems } from "@/stores/selectedStore";
import { useRoutingStore } from "@/stores/routingStore";
import type {
  ScenarioImageLayerUpdate,
  ScenarioLayerUpdate,
  ScenarioMapLayerUpdate,
} from "@/types/internalModels";
import type {
  FeatureId,
  ScenarioImageLayer,
  ScenarioMapLayer,
} from "@/types/scenarioGeoModels";
import {
  isNGeometryLayerItem,
  type NGeometryLayerItem,
} from "@/types/scenarioLayerItems";
import { fixExtent } from "@/utils/geoConvert";

const undoActionLabels: ActionLabel[] = [
  "deleteLayer",
  "moveLayer",
  "updateLayer",
  "batchLayer",
  "moveFeature",
  "deleteFeature",
  "addFeature",
  "updateFeatureGeometry",
  "updateFeature",
];

const mapLayerUndoActionLabels = [
  "addMapLayer",
  "updateMapLayer",
  "deleteMapLayer",
  "moveMapLayer",
] as const;

const MAPLIBRE_IMAGE_SOURCE_PREFIX = "scenario-image-source-";
const MAPLIBRE_IMAGE_LAYER_PREFIX = "scenario-image-layer-";

function normalizeMapLayerExtent(
  extent: number[] | undefined,
): [number, number, number, number] | undefined {
  const fixedExtent = fixExtent(extent);
  if (!fixedExtent) return;
  const [minX, minY, maxX, maxY] = fixedExtent;
  const looksLikeLonLat =
    Math.abs(minX) <= 180 &&
    Math.abs(maxX) <= 180 &&
    Math.abs(minY) <= 90 &&
    Math.abs(maxY) <= 90;
  if (looksLikeLonLat) {
    return fixedExtent as [number, number, number, number];
  }
  return transformExtent(
    fixedExtent as [number, number, number, number],
    "EPSG:3857",
    "EPSG:4326",
  ) as [number, number, number, number];
}

function toCurrentFeature(feature: NGeometryLayerItem): GeoJsonFeature | undefined {
  const geometry = feature._state?.geometry ?? feature.geometry;
  if (!geometry) return;
  const radius = feature.geometryMeta.radius;
  if (typeof radius === "number" && geometry.type === "Point") {
    return turfCircle(geometry.coordinates as Position, radius / 1000, {
      steps: 48,
      units: "kilometers",
      properties: feature.userData ?? {},
    }) as GeoJsonFeature;
  }
  return {
    type: "Feature",
    id: feature.id,
    geometry,
    properties: feature.userData ?? {},
  };
}

function getMapLayerCenter(mapLayer: ScenarioMapLayer): Position | undefined {
  if (mapLayer.type === "ImageLayer" && mapLayer.imageCenter) {
    return mapLayer.imageCenter as Position;
  }
  const extent = normalizeMapLayerExtent(mapLayer.extent);
  if (!extent) return;
  return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
}

function isGeometryLayerItem(
  item: NGeometryLayerItem | undefined,
): item is NGeometryLayerItem {
  return Boolean(item);
}

function isImageLayer(layer: ScenarioMapLayer | undefined): layer is ScenarioImageLayer {
  return layer?.type === "ImageLayer";
}

function getImageSourceId(layerId: FeatureId) {
  return `${MAPLIBRE_IMAGE_SOURCE_PREFIX}${layerId}`;
}

function getImageLayerId(layerId: FeatureId) {
  return `${MAPLIBRE_IMAGE_LAYER_PREFIX}${layerId}`;
}

function toPairScale(
  scale: ScenarioImageLayer["imageScale"] | undefined,
): [number, number] {
  if (Array.isArray(scale)) return [scale[0] ?? 1, scale[1] ?? scale[0] ?? 1];
  return [scale ?? 1, scale ?? 1];
}

function rotatePoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  rotation: number,
): [number, number] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = x - centerX;
  const dy = y - centerY;
  return [centerX + dx * cos - dy * sin, centerY + dx * sin + dy * cos];
}

function extentToImageCoordinates(extent: [number, number, number, number]) {
  const [minX, minY, maxX, maxY] = extent;
  return [
    [minX, maxY],
    [maxX, maxY],
    [maxX, minY],
    [minX, minY],
  ];
}

function projectedImageCoordinates(
  center: number[],
  scale: number[],
  rotation: number,
  width: number,
  height: number,
) {
  const [centerX, centerY] = center;
  const [scaleX, scaleY] = scale;
  const halfWidth = (width * scaleX) / 2;
  const halfHeight = (height * scaleY) / 2;
  return [
    [centerX - halfWidth, centerY + halfHeight],
    [centerX + halfWidth, centerY + halfHeight],
    [centerX + halfWidth, centerY - halfHeight],
    [centerX - halfWidth, centerY - halfHeight],
  ].map(([x, y]) => toLonLat(rotatePoint(x, y, centerX, centerY, rotation)));
}

function getImageLayerCoordinates(
  layer: ScenarioImageLayer,
  imageSize?: { width: number; height: number },
) {
  if (layer.imageCenter && layer.imageScale !== undefined) {
    if (imageSize) {
      return projectedImageCoordinates(
        fromLonLat(layer.imageCenter),
        toPairScale(layer.imageScale),
        -(layer.imageRotate ?? 0),
        imageSize.width,
        imageSize.height,
      );
    }
    return undefined;
  }
  const extent = normalizeMapLayerExtent(layer.extent);
  if (extent) return extentToImageCoordinates(extent);
  return undefined;
}

export function createMapLibreScenarioLayerController(
  mapAdapter: MapAdapter,
): ScenarioLayerController {
  const mlMap = mapAdapter.getNativeMap() as MlMap;
  const { selectedFeatureIds } = useSelectedItems();
  const routingStore = useRoutingStore();
  const layerEventHandlers = new Set<(event: ScenarioLayerControllerEvent) => void>();
  let activeScenario: TScenario | null = null;
  let featureManager: MapLibreScenarioFeatureManager | null = null;
  const activeImageLayerIds = new Set<FeatureId>();
  const imageSizes = new Map<string, { width: number; height: number }>();
  const imageSizePromises = new Map<string, Promise<{ width: number; height: number }>>();
  let activeTransform: {
    layerId: FeatureId;
    overlay: HTMLDivElement;
    svg: SVGSVGElement;
    state: {
      center: number[];
      scale: [number, number];
      rotation: number;
      imageSize: { width: number; height: number };
    };
    cleanup: () => void;
  } | null = null;
  let currentFilterVisible = true;
  let cleanupScenarioBinding = () => {};

  function emitLayerEvent(event: ScenarioLayerControllerEvent) {
    layerEventHandlers.forEach((handler) => handler(event));
  }

  function getFeature(featureId: FeatureId) {
    return activeScenario?.geo.getGeometryLayerItemById(featureId).layerItem;
  }

  function getFeatureCollection(featureIds: FeatureId[]) {
    const features = featureIds
      .map((featureId) => getFeature(featureId))
      .filter(isGeometryLayerItem)
      .map(toCurrentFeature)
      .filter((feature): feature is GeoJsonFeature => Boolean(feature));
    if (!features.length) return;
    return featureCollection(features);
  }

  function zoomToFeature(featureId: FeatureId) {
    const collection = getFeatureCollection([featureId]);
    if (!collection) return;
    mapAdapter.fitGeometry(collection, { maxZoom: 15 });
  }

  function zoomToFeatures(featureIds: FeatureId[]) {
    const collection = getFeatureCollection(featureIds);
    if (!collection) return;
    mapAdapter.fitGeometry(collection, { maxZoom: 17 });
  }

  function panToFeature(featureId: FeatureId) {
    const collection = getFeatureCollection([featureId]);
    if (!collection) return;
    const center = centerOfMass(collection);
    mapAdapter.animateView({
      center: center.geometry.coordinates as Position,
      duration: 900,
    });
  }

  function zoomToScenarioLayer(layerId: FeatureId) {
    const fullLayer = activeScenario?.geo.getFullLayerItemsLayer(layerId);
    if (!fullLayer) return;
    const items = fullLayer.items.filter(isNGeometryLayerItem);
    const visible = items.filter((item) => !item._hidden);
    const picked = (visible.length ? visible : items).map((item) => item.id);
    zoomToFeatures(picked);
  }

  function zoomToMapLayer(layerId: FeatureId) {
    const mapLayer = activeScenario?.geo.getMapLayerById(layerId);
    if (!mapLayer) return;
    const extent = normalizeMapLayerExtent(mapLayer.extent);
    if (extent) {
      mapAdapter.fitExtent(extent, { maxZoom: 15 });
      return;
    }
    const center = getMapLayerCenter(mapLayer);
    if (center) {
      mapAdapter.animateView({ center, zoom: 12, duration: 900 });
    }
  }

  function refreshScenarioFeatureLayers(
    options: RefreshScenarioFeatureLayersOptions = {},
  ) {
    if (options.filterVisible !== undefined) {
      currentFilterVisible = options.filterVisible;
    }
    if (!activeScenario || !featureManager) return;
    featureManager.refresh(activeScenario.geo.layerItemsLayers.value, {
      doClearCache: options.doClearCache ?? false,
      filterVisible: currentFilterVisible,
    });
  }

  function refreshAfterFeatureUpdate(_featureId: FeatureId) {
    refreshScenarioFeatureLayers({ doClearCache: false });
  }

  function emitScenarioLayerVisibility(layerId: FeatureId, data: ScenarioLayerUpdate) {
    if (data.isHidden === undefined) return;
    emitLayerEvent({
      type: "scenario-layer-visibility-changed",
      layerId,
      isHidden: data.isHidden,
    });
  }

  function safeGetLayer(layerId: string) {
    try {
      return mlMap.getLayer(layerId);
    } catch {
      return undefined;
    }
  }

  function safeGetSource(sourceId: string) {
    try {
      return mlMap.getSource(sourceId);
    } catch {
      return undefined;
    }
  }

  function removeImageLayer(layerId: FeatureId) {
    const mlLayerId = getImageLayerId(layerId);
    const sourceId = getImageSourceId(layerId);
    try {
      if (safeGetLayer(mlLayerId)) mlMap.removeLayer(mlLayerId);
      if (safeGetSource(sourceId)) mlMap.removeSource(sourceId);
    } catch {
      // MapLibre can throw while a style is being replaced; the next style load rebuilds.
    }
    activeImageLayerIds.delete(layerId);
  }

  function addImageLayerWithCoordinates(
    layer: ScenarioImageLayer,
    coordinates: number[][],
  ) {
    const sourceId = getImageSourceId(layer.id);
    const mlLayerId = getImageLayerId(layer.id);
    if (!safeGetSource(sourceId)) {
      const source = {
        type: "image",
        url: layer.url,
        coordinates,
      } satisfies ImageSourceSpecification;
      mlMap.addSource(sourceId, source);
    }
    if (!safeGetLayer(mlLayerId)) {
      const rasterLayer = {
        id: mlLayerId,
        type: "raster",
        source: sourceId,
        layout: {
          visibility: layer.isHidden ? "none" : "visible",
        },
        paint: {
          "raster-opacity": layer.opacity ?? 0.7,
        },
      } satisfies LayerSpecification;
      mlMap.addLayer(rasterLayer);
    }
    activeImageLayerIds.add(layer.id);
  }

  function updateImageLayerStatus(
    layerId: FeatureId,
    status: NonNullable<ScenarioMapLayer["_status"]>,
  ) {
    const scenario = activeScenario;
    if (!scenario) return;
    const data: ScenarioMapLayerUpdate = { _status: status };
    scenario.geo.updateMapLayer(layerId, data, {
      noEmit: true,
      undoable: false,
    });
    emitLayerEvent({ type: "map-layer-updated", layerId, data });
  }

  function loadImageSize(url: string) {
    const cached = imageSizes.get(url);
    if (cached) return Promise.resolve(cached);
    const pending = imageSizePromises.get(url);
    if (pending) return pending;
    const promise = new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const size = {
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
        };
        imageSizes.set(url, size);
        imageSizePromises.delete(url);
        resolve(size);
      };
      image.onerror = () => {
        imageSizePromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      image.src = url;
    });
    imageSizePromises.set(url, promise);
    return promise;
  }

  function addImageLayer(layerId: FeatureId) {
    const scenario = activeScenario;
    const layer = scenario?.geo.getMapLayerById(layerId);
    if (!isImageLayer(layer)) return;
    const cachedImageSize = imageSizes.get(layer.url);
    const coordinates = getImageLayerCoordinates(layer, cachedImageSize);
    if (coordinates) {
      addImageLayerWithCoordinates(layer, coordinates);
      updateImageLayerStatus(layer.id, "initialized");
      return;
    }
    updateImageLayerStatus(layer.id, "loading");
    void loadImageSize(layer.url)
      .then((imageSize) => {
        const currentLayer = activeScenario?.geo.getMapLayerById(layerId);
        if (!isImageLayer(currentLayer)) return;
        const loadedCoordinates = projectedImageCoordinates(
          fromLonLat(
            currentLayer.imageCenter ?? getMapLayerCenter(currentLayer) ?? [0, 0],
          ),
          toPairScale(currentLayer.imageScale),
          -(currentLayer.imageRotate ?? 0),
          imageSize.width,
          imageSize.height,
        );
        if (!loadedCoordinates) {
          updateImageLayerStatus(layerId, "error");
          return;
        }
        addImageLayerWithCoordinates(currentLayer, loadedCoordinates);
        updateImageLayerStatus(layerId, "initialized");
      })
      .catch(() => {
        updateImageLayerStatus(layer.id, "error");
      });
  }

  function refreshImageLayers() {
    for (const layerId of [...activeImageLayerIds]) {
      removeImageLayer(layerId);
    }
    const scenario = activeScenario;
    if (!scenario) return;
    for (const mapLayer of scenario.geo.mapLayers?.value ?? []) {
      if (isImageLayer(mapLayer)) addImageLayer(mapLayer.id);
    }
  }

  function updateImageLayer(layerId: FeatureId, data: ScenarioMapLayerUpdate) {
    const source = safeGetSource(getImageSourceId(layerId)) as
      | { updateImage?: (options: { url?: string; coordinates?: number[][] }) => void }
      | undefined;
    const layer = activeScenario?.geo.getMapLayerById(layerId);
    if (!isImageLayer(layer)) return;
    const mlLayerId = getImageLayerId(layerId);

    if (
      "url" in data ||
      "imageCenter" in data ||
      "imageScale" in data ||
      "imageRotate" in data ||
      "extent" in data
    ) {
      const coordinates = getImageLayerCoordinates(layer, imageSizes.get(layer.url));
      if (coordinates && source?.updateImage) {
        source.updateImage({ url: layer.url, coordinates });
      } else {
        removeImageLayer(layerId);
        addImageLayer(layerId);
      }
    }
    if (data.isHidden !== undefined && safeGetLayer(mlLayerId)) {
      mlMap.setLayoutProperty(
        mlLayerId,
        "visibility",
        data.isHidden ? "none" : "visible",
      );
    }
    if (data.opacity !== undefined && safeGetLayer(mlLayerId)) {
      mlMap.setPaintProperty(mlLayerId, "raster-opacity", data.opacity);
    }
  }

  function refreshActiveTransform(layerId: FeatureId) {
    if (activeTransform?.layerId === layerId) {
      void startMapLayerTransform(layerId);
    }
  }

  function handleMapLayerUndoRedo(
    action: "undo" | "redo",
    label: string,
    layerId: FeatureId,
  ) {
    if (label === "addMapLayer") {
      if (action === "undo") {
        if (activeTransform?.layerId === layerId) endMapLayerTransform();
        removeImageLayer(layerId);
      } else {
        addImageLayer(layerId);
      }
      return;
    }
    if (label === "deleteMapLayer") {
      if (action === "undo") {
        addImageLayer(layerId);
      } else {
        if (activeTransform?.layerId === layerId) endMapLayerTransform();
        removeImageLayer(layerId);
      }
      return;
    }
    if (label === "updateMapLayer") {
      const layer = activeScenario?.geo.getMapLayerById(layerId);
      if (!layer) return;
      if (isImageLayer(layer)) {
        updateImageLayer(layerId, layer);
        refreshActiveTransform(layerId);
      }
      return;
    }
    if (label === "moveMapLayer") {
      refreshImageLayers();
    }
  }

  function getInitialTransformState(
    layer: ScenarioImageLayer,
    imageSize: { width: number; height: number },
  ) {
    if (layer.imageCenter && layer.imageScale !== undefined) {
      return {
        center: fromLonLat(layer.imageCenter),
        scale: toPairScale(layer.imageScale),
        rotation: layer.imageRotate ?? 0,
        imageSize,
      };
    }
    const extent = normalizeMapLayerExtent(layer.extent);
    if (extent) {
      const topLeft = fromLonLat([extent[0], extent[3]]);
      const bottomRight = fromLonLat([extent[2], extent[1]]);
      return {
        center: [(topLeft[0] + bottomRight[0]) / 2, (topLeft[1] + bottomRight[1]) / 2],
        scale: [
          Math.abs(bottomRight[0] - topLeft[0]) / imageSize.width,
          Math.abs(topLeft[1] - bottomRight[1]) / imageSize.height,
        ] as [number, number],
        rotation: 0,
        imageSize,
      };
    }
    return {
      center: fromLonLat(getMapLayerCenter(layer) ?? mapAdapter.getCenter() ?? [0, 0]),
      scale: toPairScale(layer.imageScale),
      rotation: layer.imageRotate ?? 0,
      imageSize,
    };
  }

  function getTransformCoordinates(state: NonNullable<typeof activeTransform>["state"]) {
    return projectedImageCoordinates(
      state.center,
      state.scale,
      -state.rotation,
      state.imageSize.width,
      state.imageSize.height,
    );
  }

  function updateImageLayerFromTransform(active: boolean) {
    const transform = activeTransform;
    const scenario = activeScenario;
    if (!(transform && scenario)) return;
    const data: ScenarioImageLayerUpdate = {
      imageCenter: toLonLat(transform.state.center) as Position,
      imageScale: transform.state.scale,
      imageRotate: transform.state.rotation,
    };
    scenario.geo.updateMapLayer(transform.layerId, data, {
      emitOnly: active,
      undoable: !active,
    });
    const source = safeGetSource(getImageSourceId(transform.layerId)) as
      | { updateImage?: (options: { coordinates?: number[][] }) => void }
      | undefined;
    source?.updateImage?.({ coordinates: getTransformCoordinates(transform.state) });
    emitLayerEvent({
      type: "map-layer-transform",
      layerId: transform.layerId,
      rotation: transform.state.rotation,
      center: data.imageCenter!,
      scale: transform.state.scale,
      active,
    });
  }

  function renderTransformOverlay() {
    const transform = activeTransform;
    if (!transform) return;
    const coordinates = getTransformCoordinates(transform.state);
    const points = coordinates.map((coordinate) => {
      const point = mlMap.project(coordinate as [number, number]);
      return [point.x, point.y] as [number, number];
    });
    const [topLeft, topRight] = points;
    const topMid = [(topLeft[0] + topRight[0]) / 2, (topLeft[1] + topRight[1]) / 2];
    const boxCenter = points.reduce(
      (sum, point) => [
        sum[0] + point[0] / points.length,
        sum[1] + point[1] / points.length,
      ],
      [0, 0],
    );
    const normal = [topMid[0] - boxCenter[0], topMid[1] - boxCenter[1]];
    const normalLength = Math.hypot(normal[0], normal[1]) || 1;
    const handle = [
      topMid[0] + (normal[0] / normalLength) * 34,
      topMid[1] + (normal[1] / normalLength) * 34,
    ];
    const canvas = mlMap.getCanvas();
    transform.svg.setAttribute(
      "viewBox",
      `0 0 ${canvas.clientWidth} ${canvas.clientHeight}`,
    );
    transform.svg.innerHTML = `
      <polygon points="${points.map((point) => point.join(",")).join(" ")}" fill="rgba(0,0,0,0)" stroke="rgb(238,3,3)" stroke-width="2" class="move" style="pointer-events:all;cursor:move" />
      <line x1="${topMid[0]}" y1="${topMid[1]}" x2="${handle[0]}" y2="${handle[1]}" stroke="rgb(238,3,3)" stroke-width="2" />
      <circle cx="${handle[0]}" cy="${handle[1]}" r="14" fill="rgba(255,255,255,0.001)" stroke="none" class="rotate" style="pointer-events:all;cursor:grab;touch-action:none" />
      <circle cx="${handle[0]}" cy="${handle[1]}" r="7" fill="white" stroke="rgb(238,3,3)" stroke-width="2" style="pointer-events:none" />
      ${points.map((point, index) => `<circle cx="${point[0]}" cy="${point[1]}" r="14" fill="rgba(255,255,255,0.001)" stroke="none" class="scale" style="pointer-events:all;cursor:nwse-resize;touch-action:none" data-index="${index}" /><circle cx="${point[0]}" cy="${point[1]}" r="7" fill="white" stroke="rgb(238,3,3)" stroke-width="2" style="pointer-events:none" />`).join("")}
    `;
  }

  function getProjectedPointer(event: PointerEvent) {
    const rect = mlMap.getCanvas().getBoundingClientRect();
    const lngLat = mlMap.unproject([event.clientX - rect.left, event.clientY - rect.top]);
    return fromLonLat([lngLat.lng, lngLat.lat]);
  }

  async function startMapLayerTransform(layerId: FeatureId) {
    endMapLayerTransform();
    const layer = activeScenario?.geo.getMapLayerById(layerId);
    if (!isImageLayer(layer)) return;
    let imageSize: { width: number; height: number };
    try {
      imageSize = await loadImageSize(layer.url);
    } catch {
      updateImageLayerStatus(layer.id, "error");
      return;
    }
    const container = mlMap.getContainer();
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "2";
    overlay.style.touchAction = "none";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.touchAction = "none";
    overlay.appendChild(svg);
    container.appendChild(overlay);
    const onMove = () => renderTransformOverlay();
    mlMap.on("move", onMove);
    let drag: {
      mode: "move" | "scale" | "rotate";
      pointerId: number;
      pointer: number[];
      center: number[];
      scale: [number, number];
      rotation: number;
      angle?: number;
      corner?: number;
    } | null = null;

    function cleanupPointerDrag(commitFinalUpdate: boolean) {
      if (!drag) return;
      svg.releasePointerCapture?.(drag.pointerId);
      drag = null;
      mlMap.dragPan.enable();
      if (commitFinalUpdate) {
        updateImageLayerFromTransform(false);
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    }

    function onPointerMove(event: PointerEvent) {
      const transform = activeTransform;
      if (!(transform && drag)) return;
      if (event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      const pointer = getProjectedPointer(event);
      if (drag.mode === "move") {
        transform.state.center = [
          drag.center[0] + pointer[0] - drag.pointer[0],
          drag.center[1] + pointer[1] - drag.pointer[1],
        ];
      } else if (drag.mode === "rotate") {
        const angle = Math.atan2(
          pointer[1] - transform.state.center[1],
          pointer[0] - transform.state.center[0],
        );
        transform.state.rotation = -(drag.rotation + angle - (drag.angle ?? angle));
      } else {
        const local = rotatePoint(
          pointer[0],
          pointer[1],
          transform.state.center[0],
          transform.state.center[1],
          transform.state.rotation,
        );
        transform.state.scale = [
          Math.max(
            0.000001,
            (Math.abs(local[0] - transform.state.center[0]) * 2) /
              transform.state.imageSize.width,
          ),
          Math.max(
            0.000001,
            (Math.abs(local[1] - transform.state.center[1]) * 2) /
              transform.state.imageSize.height,
          ),
        ];
      }
      renderTransformOverlay();
      updateImageLayerFromTransform(true);
    }

    function onPointerUp() {
      cleanupPointerDrag(true);
    }

    activeTransform = {
      layerId,
      overlay,
      svg,
      state: getInitialTransformState(layer, imageSize),
      cleanup: () => {
        cleanupPointerDrag(false);
        mlMap.off("move", onMove);
        overlay.remove();
      },
    };
    svg.addEventListener("pointerdown", (event) => {
      const target = event.target as Element;
      const mode = target.classList.contains("rotate")
        ? "rotate"
        : target.classList.contains("scale")
          ? "scale"
          : target.classList.contains("move")
            ? "move"
            : null;
      const transform = activeTransform;
      if (!(mode && transform)) return;
      event.preventDefault();
      event.stopPropagation();
      svg.setPointerCapture?.(event.pointerId);
      mlMap.dragPan.disable();
      const pointer = getProjectedPointer(event);
      drag = {
        mode,
        pointerId: event.pointerId,
        pointer,
        center: [...transform.state.center],
        scale: [...transform.state.scale],
        rotation:
          mode === "rotate" ? -transform.state.rotation : transform.state.rotation,
        angle: Math.atan2(
          pointer[1] - transform.state.center[1],
          pointer[0] - transform.state.center[0],
        ),
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    });
    renderTransformOverlay();
  }

  function endMapLayerTransform() {
    activeTransform?.cleanup();
    activeTransform = null;
  }

  function bindScenario(scenario: TScenario) {
    cleanupScenarioBinding();
    activeScenario = scenario;
    featureManager = new MapLibreScenarioFeatureManager(
      mlMap,
      () => selectedFeatureIds.value,
      () => ({
        active: routingStore.obstaclePickerOpen,
        layerIds: routingStore.obstacleLayerIds,
        featureIds: routingStore.obstacleFeatureIds,
      }),
    );
    refreshImageLayers();
    refreshScenarioFeatureLayers({ doClearCache: true, filterVisible: true });

    const stopObstacleHighlightWatch = watch(
      () => [routingStore.obstaclePickerOpen, routingStore.obstacleSelectionKey] as const,
      () => {
        refreshScenarioFeatureLayers({ doClearCache: false });
      },
    );

    const onStyleLoad = () => {
      refreshImageLayers();
      refreshScenarioFeatureLayers({ doClearCache: true });
    };
    mlMap.on("style.load", onStyleLoad);

    const cleanupMapLayers = scenario.geo.onMapLayerEvent((event) => {
      if (event.type === "add") {
        addImageLayer(event.id);
      } else if (event.type === "remove") {
        if (activeTransform?.layerId === event.id) {
          endMapLayerTransform();
        }
        removeImageLayer(event.id);
      } else if (event.type === "update") {
        updateImageLayer(event.id, event.data);
        emitLayerEvent({
          type: "map-layer-updated",
          layerId: event.id,
          data: event.data,
        });
      } else if (event.type === "move") {
        refreshImageLayers();
      }
    });

    const cleanupFeatureLayers = scenario.geo.onFeatureLayerEvent((event) => {
      switch (event.type) {
        case "removeLayer":
        case "addLayer":
        case "moveLayer":
        case "moveFeature":
          refreshScenarioFeatureLayers({ doClearCache: false });
          break;
        case "updateLayer":
          refreshScenarioFeatureLayers({ doClearCache: false });
          emitScenarioLayerVisibility(event.id, event.data);
          break;
        case "updateFeature":
        case "deleteFeature":
        case "addFeature":
          refreshAfterFeatureUpdate(event.id);
          break;
      }
    });

    const cleanupUndoRedo = scenario.store.onUndoRedo(({ action, meta }) => {
      if (!meta) return;
      if (undoActionLabels.includes(meta.label as ActionLabel)) {
        refreshScenarioFeatureLayers({ doClearCache: false });
      }
      if (
        (mapLayerUndoActionLabels as readonly string[]).includes(meta.label) &&
        typeof meta.value === "string"
      ) {
        handleMapLayerUndoRedo(action, meta.label, meta.value);
      }
    });

    cleanupScenarioBinding = () => {
      cleanupMapLayers.off();
      cleanupFeatureLayers.off();
      cleanupUndoRedo.off();
      stopObstacleHighlightWatch();
      mlMap.off("style.load", onStyleLoad);
      for (const layerId of [...activeImageLayerIds]) {
        removeImageLayer(layerId);
      }
      endMapLayerTransform();
      featureManager?.destroy();
      featureManager = null;
      activeScenario = null;
    };

    return cleanupScenarioBinding;
  }

  return {
    capabilities: {
      zoomToFeature: true,
      zoomToFeatureSet: true,
      panToFeature: true,
      zoomToScenarioLayer: true,
      zoomToMapLayer: true,
      featureTransform: true,
      mapLayerTransform: true,
      mapLayerExtent: true,
    },
    bindScenario,
    refreshScenarioFeatureLayers,
    zoomToFeature,
    zoomToFeatures,
    panToFeature,
    zoomToScenarioLayer,
    zoomToMapLayer,
    startMapLayerTransform,
    endMapLayerTransform,
    onLayerEvent(handler) {
      layerEventHandlers.add(handler);
      return () => {
        layerEventHandlers.delete(handler);
      };
    },
  };
}
