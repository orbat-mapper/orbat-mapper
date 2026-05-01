import type {
  GeoJSONSource,
  LayerSpecification,
  MapGeoJSONFeature,
  Map as MlMap,
} from "maplibre-gl";
import type { Feature, FeatureCollection, Geometry, Point, Position } from "geojson";
import type { ReferenceFeatureSelection } from "@/types/referenceFeature";
import type { ScenarioKMLLayer } from "@/types/scenarioGeoModels";
import type { ScenarioMapLayerUpdate } from "@/types/internalModels";
import { loadKmlLayerData, type ParsedKmlLayerData } from "@/geo/kml";

const KML_SOURCE_PREFIX = "scenario-kml-source-";
const KML_LABEL_SOURCE_PREFIX = "scenario-kml-label-source-";
const KML_LAYER_PREFIX = "scenario-kml-layer-";

const KML_LAYER_SUFFIXES = [
  "polygon-fill",
  "polygon-outline",
  "line",
  "point-icon",
  "point-circle",
  "label",
] as const;

const KML_ICON_TARGET_SIZE_PX = 32;
const KML_LABEL_MINZOOM_SMALL = 0;
const KML_LABEL_MINZOOM_MEDIUM = 8;
const KML_LABEL_MINZOOM_LARGE = 10;
const KML_LABEL_MINZOOM_HUGE = 12;

type KmlLayerSuffix = (typeof KML_LAYER_SUFFIXES)[number];

type RendererCallbacks = {
  onStatus?: (layerId: string, status: NonNullable<ScenarioKMLLayer["_status"]>) => void;
  onExtent?: (layerId: string, extent: [number, number, number, number]) => void;
};

type ActiveKmlLayer = {
  layer: ScenarioKMLLayer;
  data?: ParsedKmlLayerData;
  loadToken: number;
};

export function getMapLibreKmlSourceId(layerId: string) {
  return `${KML_SOURCE_PREFIX}${layerId}`;
}

export function getMapLibreKmlLabelSourceId(layerId: string) {
  return `${KML_LABEL_SOURCE_PREFIX}${layerId}`;
}

export function getMapLibreKmlLayerId(layerId: string, suffix: KmlLayerSuffix) {
  return `${KML_LAYER_PREFIX}${layerId}-${suffix}`;
}

export function isMapLibreKmlRenderedLayerId(layerId: string | undefined | null) {
  return Boolean(layerId?.startsWith(KML_LAYER_PREFIX));
}

export function toReferenceFeatureSelection(
  feature: MapGeoJSONFeature,
): ReferenceFeatureSelection {
  const properties = { ...(feature.properties ?? {}) };
  const layerId = stringProp(properties.__kmlLayerId);
  const layerName = stringProp(properties.__kmlLayerName) ?? "Reference layer";
  const featureId =
    stringProp(properties.__kmlFeatureId) ??
    (feature.id !== undefined ? String(feature.id) : undefined);
  const name =
    stringProp(properties.__kmlName) ??
    stringProp(properties.name) ??
    stringProp(properties.title);

  delete properties.__kmlLayerId;
  delete properties.__kmlLayerName;
  delete properties.__kmlFeatureId;
  delete properties.__kmlName;
  delete properties.__kmlLabel;
  delete properties.__kmlIconHref;
  delete properties.__kmlIconImageId;
  delete properties.__kmlIconColor;
  delete properties.__kmlIconScale;
  delete properties.__kmlIconRotate;
  delete properties.__kmlStrokeColor;
  delete properties.__kmlStrokeOpacity;
  delete properties.__kmlStrokeWidth;
  delete properties.__kmlFillColor;
  delete properties.__kmlFillOpacity;
  delete properties.__kmlLabelColor;
  delete properties.__kmlLabelOpacity;
  delete properties.__kmlLabelScale;

  return {
    layerId,
    layerName,
    featureId,
    name,
    properties,
  };
}

export function createMapLibreKmlLayerRenderer(
  mlMap: MlMap,
  callbacks: RendererCallbacks = {},
) {
  const activeLayers = new Map<string, ActiveKmlLayer>();

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

  function getLayerIds(layerId?: string) {
    const ids = layerId ? [layerId] : [...activeLayers.keys()];
    return ids.flatMap((id) =>
      KML_LAYER_SUFFIXES.map((suffix) => getMapLibreKmlLayerId(id, suffix)),
    );
  }

  function removeLayer(layerId: string) {
    for (const mlLayerId of getLayerIds(layerId).reverse()) {
      try {
        if (safeGetLayer(mlLayerId)) mlMap.removeLayer(mlLayerId);
      } catch {
        // MapLibre can throw while the style graph is being replaced.
      }
    }
    try {
      const sourceId = getMapLibreKmlSourceId(layerId);
      if (safeGetSource(sourceId)) mlMap.removeSource(sourceId);
      const labelSourceId = getMapLibreKmlLabelSourceId(layerId);
      if (safeGetSource(labelSourceId)) mlMap.removeSource(labelSourceId);
    } catch {
      // MapLibre can throw while the style graph is being replaced.
    }
    activeLayers.delete(layerId);
  }

  async function addLayer(layer: ScenarioKMLLayer) {
    const layerId = String(layer.id);
    if (!layer.url) {
      callbacks.onStatus?.(layerId, "error");
      return;
    }
    const previous = activeLayers.get(layerId);
    const loadToken = (previous?.loadToken ?? 0) + 1;
    activeLayers.set(layerId, { layer, data: previous?.data, loadToken });
    callbacks.onStatus?.(layerId, "loading");
    try {
      const data = await loadKmlLayerData(layer.url, {
        layerId,
        layerName: layer.name,
        extractStyles: layer.extractStyles ?? false,
        showPointNames: layer.showPointNames ?? true,
      });
      if (activeLayers.get(layerId)?.loadToken !== loadToken) return;
      await addParsedLayer(layer, data);
      activeLayers.set(layerId, { layer, data, loadToken });
      if (data.bbox) callbacks.onExtent?.(layerId, data.bbox);
      callbacks.onStatus?.(layerId, "initialized");
    } catch {
      callbacks.onStatus?.(layerId, "error");
    }
  }

  async function addParsedLayer(layer: ScenarioKMLLayer, data: ParsedKmlLayerData) {
    const layerId = String(layer.id);
    removeMapLibreLayerObjects(layerId);
    const sourceId = getMapLibreKmlSourceId(layerId);
    mlMap.addSource(sourceId, {
      type: "geojson",
      data: data.featureCollection,
    });
    mlMap.addSource(getMapLibreKmlLabelSourceId(layerId), {
      type: "geojson",
      data: createKmlLabelFeatureCollection(data),
    });
    await registerIcons(data);
    addStyleLayers(layer, data);
  }

  function removeMapLibreLayerObjects(layerId: string) {
    for (const mlLayerId of getLayerIds(layerId).reverse()) {
      if (safeGetLayer(mlLayerId)) mlMap.removeLayer(mlLayerId);
    }
    const sourceId = getMapLibreKmlSourceId(layerId);
    if (safeGetSource(sourceId)) mlMap.removeSource(sourceId);
    const labelSourceId = getMapLibreKmlLabelSourceId(layerId);
    if (safeGetSource(labelSourceId)) mlMap.removeSource(labelSourceId);
  }

  async function registerIcons(data: ParsedKmlLayerData) {
    await Promise.all(
      [...data.icons].map(async ([imageId, href]) => {
        if (mlMap.hasImage(imageId)) return;
        try {
          const image = await loadMapImage(href);
          if (image && !mlMap.hasImage(imageId)) {
            const pixelRatio = getKmlIconPixelRatio(image);
            mlMap.addImage(
              imageId,
              image as any,
              pixelRatio > 1 ? { pixelRatio } : undefined,
            );
          }
        } catch {
          // Missing remote icons should not prevent the KML geometry from rendering.
        }
      }),
    );
  }

  function addStyleLayers(layer: ScenarioKMLLayer, data: ParsedKmlLayerData) {
    const layerId = String(layer.id);
    const source = getMapLibreKmlSourceId(layerId);
    const labelSource = getMapLibreKmlLabelSourceId(layerId);
    const visibility = layer.isHidden ? "none" : "visible";
    const opacity = layer.opacity ?? 0.7;
    const polygonFilter = [
      "any",
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "MultiPolygon"],
    ];
    const lineFilter = [
      "any",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["geometry-type"], "MultiLineString"],
    ];
    const pointFilter = [
      "any",
      ["==", ["geometry-type"], "Point"],
      ["==", ["geometry-type"], "MultiPoint"],
    ];

    const labelMinZoom = getKmlLabelMinZoom(data);
    const layers: LayerSpecification[] = [
      {
        id: getMapLibreKmlLayerId(layerId, "polygon-fill"),
        type: "fill",
        source,
        filter: polygonFilter as any,
        layout: { visibility },
        paint: {
          "fill-color": ["coalesce", ["get", "__kmlFillColor"], "#3388ff"],
          "fill-opacity": ["*", opacity, ["coalesce", ["get", "__kmlFillOpacity"], 0.25]],
        },
      },
      {
        id: getMapLibreKmlLayerId(layerId, "polygon-outline"),
        type: "line",
        source,
        filter: polygonFilter as any,
        layout: { visibility },
        paint: {
          "line-color": ["coalesce", ["get", "__kmlStrokeColor"], "#3388ff"],
          "line-opacity": ["*", opacity, ["coalesce", ["get", "__kmlStrokeOpacity"], 1]],
          "line-width": ["coalesce", ["get", "__kmlStrokeWidth"], 2],
        },
      },
      {
        id: getMapLibreKmlLayerId(layerId, "line"),
        type: "line",
        source,
        filter: lineFilter as any,
        layout: { visibility },
        paint: {
          "line-color": ["coalesce", ["get", "__kmlStrokeColor"], "#3388ff"],
          "line-opacity": ["*", opacity, ["coalesce", ["get", "__kmlStrokeOpacity"], 1]],
          "line-width": ["coalesce", ["get", "__kmlStrokeWidth"], 2],
        },
      },
      {
        id: getMapLibreKmlLayerId(layerId, "point-icon"),
        type: "symbol",
        source,
        filter: ["all", pointFilter, ["has", "__kmlIconImageId"]] as any,
        layout: {
          visibility,
          "icon-image": ["get", "__kmlIconImageId"],
          "icon-size": ["coalesce", ["get", "__kmlIconScale"], 1],
          "icon-rotate": ["coalesce", ["get", "__kmlIconRotate"], 0],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
        paint: {
          "icon-opacity": opacity,
        },
      },
      {
        id: getMapLibreKmlLayerId(layerId, "point-circle"),
        type: "circle",
        source,
        filter: ["all", pointFilter, ["!", ["has", "__kmlIconImageId"]]] as any,
        layout: { visibility },
        paint: {
          "circle-radius": 5,
          "circle-color": ["coalesce", ["get", "__kmlIconColor"], "#3388ff"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
          "circle-opacity": opacity,
        },
      },
      {
        id: getMapLibreKmlLayerId(layerId, "label"),
        type: "symbol",
        source: labelSource,
        filter: ["has", "__kmlLabel"] as any,
        minzoom: labelMinZoom,
        layout: {
          visibility,
          "text-field": ["get", "__kmlLabel"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["*", 12, ["coalesce", ["get", "__kmlLabelScale"], 1]],
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-ignore-placement": false,
          "text-optional": true,
        },
        paint: {
          "text-color": ["coalesce", ["get", "__kmlLabelColor"], "#111827"],
          "text-opacity": ["*", opacity, ["coalesce", ["get", "__kmlLabelOpacity"], 1]],
          "text-halo-color": "rgba(255, 255, 255, 0.9)",
          "text-halo-width": 1.5,
        },
      },
    ];

    for (const spec of layers) {
      if (!safeGetLayer(spec.id)) mlMap.addLayer(spec);
    }
  }

  function updateLayer(layer: ScenarioKMLLayer, data: ScenarioMapLayerUpdate) {
    const layerId = String(layer.id);
    if (
      "url" in data ||
      "extractStyles" in data ||
      "showPointNames" in data ||
      "name" in data
    ) {
      removeLayer(layerId);
      void addLayer(layer);
      return;
    }
    if (data.isHidden !== undefined) {
      for (const mlLayerId of getLayerIds(layerId)) {
        if (safeGetLayer(mlLayerId)) {
          mlMap.setLayoutProperty(
            mlLayerId,
            "visibility",
            data.isHidden ? "none" : "visible",
          );
        }
      }
    }
    if (data.opacity !== undefined) {
      refreshLayerPaintOpacity(layerId, layer.opacity ?? 0.7);
    }
  }

  function refreshLayerPaintOpacity(layerId: string, opacity: number) {
    const layerProps: Array<[KmlLayerSuffix, string, unknown]> = [
      [
        "polygon-fill",
        "fill-opacity",
        ["*", opacity, ["coalesce", ["get", "__kmlFillOpacity"], 0.25]],
      ],
      [
        "polygon-outline",
        "line-opacity",
        ["*", opacity, ["coalesce", ["get", "__kmlStrokeOpacity"], 1]],
      ],
      [
        "line",
        "line-opacity",
        ["*", opacity, ["coalesce", ["get", "__kmlStrokeOpacity"], 1]],
      ],
      ["point-icon", "icon-opacity", opacity],
      ["point-circle", "circle-opacity", opacity],
      [
        "label",
        "text-opacity",
        ["*", opacity, ["coalesce", ["get", "__kmlLabelOpacity"], 1]],
      ],
    ];
    for (const [suffix, prop, value] of layerProps) {
      const mlLayerId = getMapLibreKmlLayerId(layerId, suffix);
      if (safeGetLayer(mlLayerId)) mlMap.setPaintProperty(mlLayerId, prop, value as any);
    }
  }

  function refreshLayer(layer: ScenarioKMLLayer) {
    removeLayer(String(layer.id));
    return addLayer(layer);
  }

  function refreshAll(layers: ScenarioKMLLayer[]) {
    for (const layerId of [...activeLayers.keys()]) removeLayer(layerId);
    layers.forEach((layer) => void addLayer(layer));
  }

  function destroy() {
    for (const layerId of [...activeLayers.keys()]) removeLayer(layerId);
  }

  function getSource(layerId: string) {
    return safeGetSource(getMapLibreKmlSourceId(layerId)) as GeoJSONSource | undefined;
  }

  return {
    addLayer,
    updateLayer,
    removeLayer,
    refreshLayer,
    refreshAll,
    getLayerIds,
    getSource,
    destroy,
    isKmlRenderedLayerId: isMapLibreKmlRenderedLayerId,
    toReferenceFeatureSelection,
  };

  function loadMapImage(href: string) {
    const loader = (mlMap as unknown as { loadImage?: Function }).loadImage;
    if (typeof loader === "function") {
      return new Promise<unknown>((resolve, reject) => {
        const maybePromise = loader.call(mlMap, href);
        if (maybePromise?.then) {
          maybePromise.then(
            (response: unknown) => resolve(unwrapMapLibreImageResponse(response)),
            reject,
          );
        } else {
          reject(new Error(`Failed to load KML icon: ${href}`));
        }
      });
    }

    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load KML icon: ${href}`));
      image.src = href;
    });
  }
}

function stringProp(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function unwrapMapLibreImageResponse(response: unknown) {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as { data?: unknown }).data
  ) {
    return (response as { data: unknown }).data;
  }
  return response;
}

function getKmlIconPixelRatio(image: unknown) {
  const size = getImageSize(image);
  if (!size) return 1;
  const maxDimension = Math.max(size.width, size.height);
  if (!Number.isFinite(maxDimension) || maxDimension <= 0) return 1;
  return Math.max(1, maxDimension / KML_ICON_TARGET_SIZE_PX);
}

function getKmlLabelMinZoom(data: ParsedKmlLayerData) {
  const labelCount = data.features.reduce(
    (count, feature) => count + (feature.properties.__kmlLabel ? 1 : 0),
    0,
  );
  if (labelCount > 5000) return KML_LABEL_MINZOOM_HUGE;
  if (labelCount > 2000) return KML_LABEL_MINZOOM_LARGE;
  if (labelCount > 500) return KML_LABEL_MINZOOM_MEDIUM;
  return KML_LABEL_MINZOOM_SMALL;
}

function createKmlLabelFeatureCollection(
  data: ParsedKmlLayerData,
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: data.features.flatMap((feature) => {
      if (!feature.properties.__kmlLabel) return [];
      const coordinates = getPointCoordinates(feature.geometry);
      return coordinates.map(
        (coordinate, index) =>
          ({
            type: "Feature",
            id:
              feature.id !== undefined
                ? `${String(feature.id)}-label-${index}`
                : feature.properties.__kmlFeatureId
                  ? `${feature.properties.__kmlFeatureId}-label-${index}`
                  : undefined,
            geometry: {
              type: "Point",
              coordinates: coordinate,
            },
            properties: feature.properties,
          }) satisfies Feature<Point>,
      );
    }),
  };
}

function getPointCoordinates(geometry: Geometry): Position[] {
  if (geometry.type === "Point") return [geometry.coordinates];
  if (geometry.type === "MultiPoint") return geometry.coordinates;
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.flatMap(getPointCoordinates);
  }
  return [];
}

function getImageSize(image: unknown): { width: number; height: number } | undefined {
  if (!image || typeof image !== "object") return;
  const value = image as {
    width?: unknown;
    height?: unknown;
    naturalWidth?: unknown;
    naturalHeight?: unknown;
  };
  const width =
    typeof value.naturalWidth === "number" && value.naturalWidth > 0
      ? value.naturalWidth
      : value.width;
  const height =
    typeof value.naturalHeight === "number" && value.naturalHeight > 0
      ? value.naturalHeight
      : value.height;
  if (typeof width !== "number" || typeof height !== "number") return;
  return { width, height };
}
