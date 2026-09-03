import { computed, onScopeDispose, ref, shallowRef, watch, type ShallowRef } from "vue";
import type { Map as MlMap, SourceSpecification } from "maplibre-gl";
import type {
  LayerId,
  MapAdapter as TacticalDrawMapAdapter,
} from "@orbat-mapper/tactical-draw";
import {
  GRID_LABEL_HALO_COLOR,
  GRID_LABEL_METRICS,
  GRID_MAJOR_STROKE_FACTOR,
  LATLONG_DETAIL_MAJOR_LAYER_ID,
  LATLONG_DETAIL_MINOR_LAYER_ID,
  LATLONG_DETAIL_SOURCE_ID,
  LATLONG_MAJOR_TILE_LAYER,
  LATLONG_MINOR_TILE_LAYER,
  MGRS_DETAIL_LABEL_LAYER_ID,
  MGRS_DETAIL_MAJOR_LAYER_ID,
  MGRS_DETAIL_MINOR_LAYER_ID,
  MGRS_DETAIL_SOURCE_ID,
  MGRS_LABEL_TILE_LAYER,
  MGRS_MAJOR_TILE_LAYER,
  MGRS_MINOR_TILE_LAYER,
  MGRS_OVERVIEW_LABEL_LAYER_ID,
  MGRS_OVERVIEW_LABEL_SOURCE_ID,
  MGRS_OVERVIEW_LAYER_ID,
  MGRS_OVERVIEW_SOURCE_ID,
  NATIVE_LATLONG_PORTRAYAL_PARTS,
  NATIVE_PORTRAYAL_PARTS,
  acquireGridTileProtocols,
  buildGridPortrayal,
  gridSubdivisionOpacity,
  latLongTileSourceDefinition,
  mgrsTileSourceDefinition,
  mgrsVisibleSpacing,
  mgrsZoneOverviewLabelData,
  mgrsZoneOverviewLineData,
  releaseGridTileProtocols,
  visibleAngularInterval,
  type GridReferenceLabel,
  type MgrsPortrayalLevel,
} from "@/lib/grid";
import { useReferenceGridStore } from "@/stores/referenceGridStore";

interface TileGridSpec {
  sourceId: string;
  minorLayerId: string;
  majorLayerId: string;
  minorTileLayer: string;
  majorTileLayer: string;
  labelLayerId?: string;
  labelTileLayer?: string;
  key: () => string;
  source: () => SourceSpecification;
  visible: () => boolean;
}

function layerAnchor(map: MlMap) {
  return map.getLayer("unitLayer") ? "unitLayer" : undefined;
}

export interface ReferenceGridLayers {
  labels: ShallowRef<GridReferenceLabel[]>;
  refresh: () => void;
  dispose: () => void;
}

/**
 * Retains reference-grid tile layers in MapLibre while the reusable portrayal
 * module owns adaptive spacing, MGRS level hysteresis, and screen-edge labels.
 */
export function useReferenceGridLayers(
  mapSource: () => MlMap | undefined,
  adapterSource: () => TacticalDrawMapAdapter | undefined,
): ReferenceGridLayers {
  const grid = useReferenceGridStore();
  const labels = shallowRef<GridReferenceLabel[]>([]);
  const resolution = ref<number | null>(null);
  const mgrsLevel = ref<MgrsPortrayalLevel | null>(null);
  const hasUtmDetail = ref(false);
  const appliedKeys = new Map<string, string>();
  let transientLayerId: LayerId | null = null;
  let transientAdapter: TacticalDrawMapAdapter | null = null;
  let frame: number | null = null;
  let disposed = false;

  const mgrsSpacing = computed(() =>
    mgrsVisibleSpacing(grid.mgrsInterval, resolution.value ?? Number.NaN),
  );
  const latLongSpacing = computed(() =>
    visibleAngularInterval(grid.latLongInterval, resolution.value ?? Number.NaN),
  );

  const specs: TileGridSpec[] = [
    {
      sourceId: MGRS_DETAIL_SOURCE_ID,
      minorLayerId: MGRS_DETAIL_MINOR_LAYER_ID,
      majorLayerId: MGRS_DETAIL_MAJOR_LAYER_ID,
      minorTileLayer: MGRS_MINOR_TILE_LAYER,
      majorTileLayer: MGRS_MAJOR_TILE_LAYER,
      labelLayerId: MGRS_DETAIL_LABEL_LAYER_ID,
      labelTileLayer: MGRS_LABEL_TILE_LAYER,
      key: () => String(mgrsSpacing.value),
      source: () => mgrsTileSourceDefinition(mgrsSpacing.value),
      visible: () =>
        grid.visible &&
        grid.mode === "mgrs" &&
        mgrsLevel.value === "detail" &&
        hasUtmDetail.value,
    },
    {
      sourceId: LATLONG_DETAIL_SOURCE_ID,
      minorLayerId: LATLONG_DETAIL_MINOR_LAYER_ID,
      majorLayerId: LATLONG_DETAIL_MAJOR_LAYER_ID,
      minorTileLayer: LATLONG_MINOR_TILE_LAYER,
      majorTileLayer: LATLONG_MAJOR_TILE_LAYER,
      key: () => String(latLongSpacing.value),
      source: () => latLongTileSourceDefinition(latLongSpacing.value),
      visible: () => grid.visible && grid.mode === "latlong",
    },
  ];

  function removeSpec(map: MlMap, spec: TileGridSpec) {
    for (const layerId of [spec.labelLayerId, spec.majorLayerId, spec.minorLayerId]) {
      if (layerId && map.getLayer(layerId)) map.removeLayer(layerId);
    }
    if (map.getSource(spec.sourceId)) map.removeSource(spec.sourceId);
    appliedKeys.delete(spec.sourceId);
  }

  function removeGridLayers(map: MlMap) {
    for (const spec of specs) removeSpec(map, spec);
    for (const layerId of [MGRS_OVERVIEW_LABEL_LAYER_ID, MGRS_OVERVIEW_LAYER_ID]) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    }
    for (const sourceId of [MGRS_OVERVIEW_LABEL_SOURCE_ID, MGRS_OVERVIEW_SOURCE_ID]) {
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
  }

  function addLineLayer(map: MlMap, spec: TileGridSpec, major: boolean) {
    const id = major ? spec.majorLayerId : spec.minorLayerId;
    if (map.getLayer(id)) return;
    map.addLayer(
      {
        id,
        type: "line",
        source: spec.sourceId,
        "source-layer": major ? spec.majorTileLayer : spec.minorTileLayer,
        layout: { visibility: "none" },
        paint: {
          "line-color": grid.color,
          "line-opacity": major ? grid.opacity : gridSubdivisionOpacity(grid.opacity),
          "line-width": major
            ? grid.strokeWidth * GRID_MAJOR_STROKE_FACTOR
            : grid.strokeWidth,
        },
      },
      layerAnchor(map),
    );
  }

  function ensureSpec(map: MlMap, spec: TileGridSpec) {
    const key = spec.key();
    if (map.getSource(spec.sourceId) && appliedKeys.get(spec.sourceId) !== key) {
      removeSpec(map, spec);
    }
    if (!map.getSource(spec.sourceId)) {
      map.addSource(spec.sourceId, spec.source());
      appliedKeys.set(spec.sourceId, key);
    }
    addLineLayer(map, spec, false);
    addLineLayer(map, spec, true);
    if (spec.labelLayerId && spec.labelTileLayer && !map.getLayer(spec.labelLayerId)) {
      map.addLayer(
        {
          id: spec.labelLayerId,
          type: "symbol",
          source: spec.sourceId,
          "source-layer": spec.labelTileLayer,
          layout: {
            visibility: "none",
            "text-field": ["concat", ["get", "designation"], " ", ["get", "identifier"]],
            "text-font": ["Noto Sans Regular"],
            "text-size": GRID_LABEL_METRICS.fontPx,
            "text-anchor": "left",
            "text-offset": [
              7 / GRID_LABEL_METRICS.fontPx,
              -7 / GRID_LABEL_METRICS.fontPx,
            ],
            "text-padding": GRID_LABEL_METRICS.paddingPx,
          },
          paint: {
            "text-color": grid.color,
            "text-opacity": grid.opacity,
            "text-halo-color": GRID_LABEL_HALO_COLOR,
            "text-halo-width": 2,
            "text-halo-blur": 0.5,
          },
        },
        layerAnchor(map),
      );
    }
  }

  function ensure(map: MlMap) {
    if (!map.getSource(MGRS_OVERVIEW_SOURCE_ID)) {
      map.addSource(MGRS_OVERVIEW_SOURCE_ID, {
        type: "geojson",
        data: mgrsZoneOverviewLineData(),
      });
    }
    if (!map.getSource(MGRS_OVERVIEW_LABEL_SOURCE_ID)) {
      map.addSource(MGRS_OVERVIEW_LABEL_SOURCE_ID, {
        type: "geojson",
        data: mgrsZoneOverviewLabelData(),
      });
    }
    if (!map.getLayer(MGRS_OVERVIEW_LAYER_ID)) {
      map.addLayer(
        {
          id: MGRS_OVERVIEW_LAYER_ID,
          type: "line",
          source: MGRS_OVERVIEW_SOURCE_ID,
          layout: { visibility: "none" },
          paint: {
            "line-color": grid.color,
            "line-opacity": grid.opacity,
            "line-width": grid.strokeWidth * GRID_MAJOR_STROKE_FACTOR,
          },
        },
        layerAnchor(map),
      );
    }
    if (!map.getLayer(MGRS_OVERVIEW_LABEL_LAYER_ID)) {
      map.addLayer(
        {
          id: MGRS_OVERVIEW_LABEL_LAYER_ID,
          type: "symbol",
          source: MGRS_OVERVIEW_LABEL_SOURCE_ID,
          layout: {
            visibility: "none",
            "text-field": ["get", "designation"],
            "text-font": ["Noto Sans Regular"],
            "text-size": GRID_LABEL_METRICS.fontPx,
            "text-anchor": "bottom-left",
            "text-offset": [0.25, -0.25],
            "text-padding": GRID_LABEL_METRICS.paddingPx,
          },
          paint: {
            "text-color": grid.color,
            "text-opacity": grid.opacity,
            "text-halo-color": GRID_LABEL_HALO_COLOR,
            "text-halo-width": 2,
            "text-halo-blur": 0.5,
          },
        },
        layerAnchor(map),
      );
    }
    for (const spec of specs) ensureSpec(map, spec);
  }

  function setVisibility(map: MlMap, layerId: string | undefined, visible: boolean) {
    if (layerId && map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    }
  }

  function applyLinePaint(map: MlMap, layerId: string, major: boolean) {
    if (!map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, "line-color", grid.color);
    map.setPaintProperty(
      layerId,
      "line-opacity",
      major ? grid.opacity : gridSubdivisionOpacity(grid.opacity),
    );
    map.setPaintProperty(
      layerId,
      "line-width",
      major ? grid.strokeWidth * GRID_MAJOR_STROKE_FACTOR : grid.strokeWidth,
    );
  }

  function applyLabelPaint(map: MlMap, layerId: string) {
    if (!map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, "text-color", grid.color);
    map.setPaintProperty(layerId, "text-opacity", grid.opacity);
    map.setPaintProperty(layerId, "text-halo-color", GRID_LABEL_HALO_COLOR);
  }

  function sync(map: MlMap) {
    ensure(map);
    const mgrsVisible = grid.visible && grid.mode === "mgrs";
    setVisibility(map, MGRS_OVERVIEW_LAYER_ID, mgrsVisible);
    setVisibility(
      map,
      MGRS_OVERVIEW_LABEL_LAYER_ID,
      mgrsVisible && mgrsLevel.value === "overview",
    );
    applyLinePaint(map, MGRS_OVERVIEW_LAYER_ID, true);
    applyLabelPaint(map, MGRS_OVERVIEW_LABEL_LAYER_ID);

    for (const spec of specs) {
      ensureSpec(map, spec);
      const visible = spec.visible();
      for (const layerId of [spec.minorLayerId, spec.majorLayerId, spec.labelLayerId]) {
        setVisibility(map, layerId, visible);
      }
      applyLinePaint(map, spec.minorLayerId, false);
      applyLinePaint(map, spec.majorLayerId, true);
      if (spec.labelLayerId) applyLabelPaint(map, spec.labelLayerId);
    }
  }

  function clearTransientFeatures() {
    if (transientAdapter && transientLayerId) {
      transientAdapter.setLayerFeatureGroups(transientLayerId, []);
    }
  }

  function refresh() {
    if (disposed) return;
    const map = mapSource();
    const adapter = adapterSource();
    if (!map || !adapter || !grid.visible) {
      labels.value = [];
      resolution.value = null;
      mgrsLevel.value = null;
      hasUtmDetail.value = false;
      clearTransientFeatures();
      if (map) sync(map);
      return;
    }

    const portrayal = buildGridPortrayal(adapter, {
      configuration:
        grid.mode === "mgrs"
          ? { mode: "mgrs", mgrs: { interval: grid.mgrsInterval } }
          : { mode: "latlong", latlong: { interval: grid.latLongInterval } },
      appearance: {
        color: grid.color,
        opacity: grid.opacity,
        strokeWidth: grid.strokeWidth,
      },
      mgrsLevel: mgrsLevel.value,
      parts: {
        mgrs: NATIVE_PORTRAYAL_PARTS,
        latlong: NATIVE_LATLONG_PORTRAYAL_PARTS,
      },
    });
    labels.value = portrayal.labels;
    resolution.value = portrayal.resolution;
    mgrsLevel.value = portrayal.mgrsLevel;
    hasUtmDetail.value = portrayal.hasUtmDetail;
    if (transientAdapter && transientLayerId) {
      transientAdapter.setLayerFeatureGroups(
        transientLayerId,
        portrayal.features.length
          ? [{ id: "reference-grid", features: portrayal.features, iconResources: [] }]
          : [],
      );
    }
    sync(map);
  }

  function queueRefresh() {
    if (disposed) return;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      refresh();
    });
  }

  function onStyleLoad() {
    const map = mapSource();
    if (map) {
      appliedKeys.clear();
      ensure(map);
    }
    queueRefresh();
  }

  acquireGridTileProtocols();

  watch(
    mapSource,
    (map, previous) => {
      previous?.off("style.load", onStyleLoad);
      if (previous) removeGridLayers(previous);
      if (map) {
        map.on("style.load", onStyleLoad);
        ensure(map);
      }
      queueRefresh();
    },
    { immediate: true },
  );

  watch(
    adapterSource,
    (adapter, previous) => {
      if (previous) {
        previous.offViewChange(queueRefresh);
        if (transientLayerId) previous.removeLayer(transientLayerId);
      }
      transientAdapter = adapter ?? null;
      transientLayerId = adapter?.addVectorLayer() ?? null;
      adapter?.onViewChange(queueRefresh);
      queueRefresh();
    },
    { immediate: true },
  );

  watch(
    () => [
      grid.visible,
      grid.mode,
      grid.mgrsInterval,
      grid.latLongInterval,
      grid.color,
      grid.opacity,
      grid.strokeWidth,
    ],
    queueRefresh,
  );

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    const map = mapSource();
    map?.off("style.load", onStyleLoad);
    if (map) removeGridLayers(map);
    if (transientAdapter) {
      transientAdapter.offViewChange(queueRefresh);
      if (transientLayerId) transientAdapter.removeLayer(transientLayerId);
    }
    releaseGridTileProtocols();
  }

  onScopeDispose(dispose);

  return { labels, refresh, dispose };
}
