/**
 * The viewsheds on the map: their coverage as images above the basemap, and the observers with
 * their ranges, and their pins, on top. Loaded and attached by `useMapViewshed` only while the
 * Labs viewshed is on, so the map carries none of it otherwise.
 */
import type { FeatureCollection, MultiPolygon } from "geojson";
import type {
  AddLayerObject,
  FilterSpecification,
  GeoJSONSource,
  ImageSource,
  Map as MlMap,
  MapMouseEvent,
} from "maplibre-gl";
import { computed, effectScope, watch } from "vue";
import circle from "@turf/circle";
import {
  combineViewsheds,
  distanceBetween,
  maskToPolygons,
  type Coverage,
  type LngLat,
  type ViewshedResult,
} from "@/lib/terrain";
import { viewshedImage, type ViewshedDisplay } from "@/geo/viewshedImage";
import { attachPointDrag } from "@/geo/pointDrag";
import { formatEyeHeight, observerPin, pinHead } from "@/geo/observerPin";
import { ANALYSIS_LAYER_PREFIX, underlayAnchor } from "@/modules/maplibreview/mapTerrain";
import { useTerrainStore } from "@/stores/terrainStore";
import { useViewshedStore } from "@/stores/viewshedStore";

/** Each id names a source and the layer that draws it; the images and outlines are analysis overlays. */
const IMAGE_ID = `${ANALYSIS_LAYER_PREFIX}viewshed`;
const OUTLINE_ID = `${ANALYSIS_LAYER_PREFIX}viewshed-outline`;
const OBSERVER_ID = "orbat-viewshed-observer";
const OBSERVER_LABEL_ID = "orbat-viewshed-observer-label";
const RANGE_ID = "orbat-viewshed-range";
const PIN_ID = "orbat-viewshed-pin";
const PIN_STICK_ID = "orbat-viewshed-pin-stick";
const PIN_HEAD_ID = "orbat-viewshed-pin-head";
const DRAG_ID = "orbat-viewshed-drag";
const DRAG_AREA_ID = "orbat-viewshed-drag-area";
const DRAG_CASING_ID = "orbat-viewshed-drag-casing";
const DRAG_RING_ID = "orbat-viewshed-drag-ring";
const DRAG_LABEL_ID = "orbat-viewshed-drag-label";
/** On the canvas container while a click picks a point, for a crosshair cursor (`styles.css`). */
const PICKING_CLASS = "map-picking";

/** The ids of the nth image drawn, and its outline: the first keeps the bare ids. */
const nth = (id: string, index: number) => (index ? `${id}-${index}` : id);

/**
 * The most cells a side of the combined coverage while any viewshed in it is a preview: a drag
 * next to a fine viewshed would otherwise combine at the fine one's cells across them all, for
 * every move.
 */
const COMBINED_PREVIEW_SIZE = 801;

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

/** One image to draw, and the outline drawn over it. */
export interface Drawn {
  coverage: Coverage;
  outline: () => MultiPolygon | null;
  /**
   * The masking map is the same for every target height from the same sweeps, so it keys on
   * them; the visible ground changes with every result.
   */
  maskingKey: string;
}

/**
 * What is drawn: the results combined into one coverage, or each on its own. An outline is traced
 * only once none is a preview, and only when asked for.
 */
export function drawnCoverages(
  results: readonly ViewshedResult[],
  combine: boolean,
): Drawn[] {
  if (!combine || results.length < 2)
    return results.map((one) => ({
      coverage: one,
      outline: () => one.outline,
      maskingKey: `masking:${one.sweep}`,
    }));
  // Only a preview comes without its outline.
  const preview = results.some((one) => !one.outline);
  const coverage = combineViewsheds(results, preview ? COMBINED_PREVIEW_SIZE : undefined);
  let outline: MultiPolygon | null | undefined;
  return [
    {
      coverage,
      outline: () =>
        (outline ??= preview ? null : maskToPolygons(coverage.grid, coverage.mask)),
      maskingKey: `masking:${results.map((one) => one.sweep).join(",")}`,
    },
  ];
}

/** What an image shows, and what it is drawn from: the same coverage looks different as visible or dead ground. */
type ImageKey = readonly [ViewshedDisplay, unknown];
const sameKey = (a: ImageKey | null | undefined, b: ImageKey) =>
  !!a && a[0] === b[0] && a[1] === b[1];

/**
 * Draws the viewsheds on a map with a style loaded, and follows them until the returned function
 * takes everything off it again. `basemapIds` are the basemap's own layers, which the images go
 * above.
 */
export function attachViewshedLayers(
  map: MlMap,
  basemapIds: ReadonlySet<string>,
): () => void {
  const viewshed = useViewshedStore();
  const terrain = useTerrainStore();
  const scope = effectScope();

  /**
   * What each shown image was drawn from, and the outline shown with it, and the rings: each source
   * is written only when it changes, since over terrain every write repaints the tiles under it.
   */
  let imageKeys: (ImageKey | null)[] = [];
  let outlinesShown: unknown[] = [];
  let rangeShown: string | null = null;
  /** Whether the pin source holds a pin, so a drag with pins off sends nothing. */
  let pinShown = false;

  const drawn = scope.run(() =>
    computed(() => drawnCoverages(viewshed.shown, viewshed.combine)),
  )!;
  /** How much the terrain on the map is stretched, which the pins follow. */
  const exaggeration = scope.run(() =>
    computed(() => (terrain.terrainEnabled ? terrain.exaggeration : 1)),
  )!;

  /** The observers' dots; the current one filled, and each labelled with its number once there are several. */
  function observerData(): FeatureCollection {
    return {
      type: "FeatureCollection",
      features: viewshed.viewsheds.map(({ id, number, observer }) => ({
        type: "Feature",
        properties: {
          id,
          current: id === viewshed.currentId,
          label: viewshed.several ? String(number) : "",
        },
        geometry: { type: "Point", coordinates: observer },
      })),
    };
  }

  function pinData(): FeatureCollection {
    if (!viewshed.pin) return EMPTY;
    return {
      type: "FeatureCollection",
      // The head reads the number too, in place of the ground label it hides.
      features: viewshed.viewsheds.flatMap(
        ({ id, number, observer, observerHeight, observerAbove }) => {
          // An altitude stands over the ground its result found, once there is one.
          const overGround =
            observerAbove === "ground"
              ? observerHeight
              : observerHeight - (viewshed.results.get(id)?.ground ?? NaN);
          if (Number.isNaN(overGround)) return [];
          return observerPin(observer, Math.max(0, overGround), exaggeration.value, {
            label: viewshed.several ? String(number) : undefined,
            reading: formatEyeHeight(observerHeight, observerAbove),
          }).features;
        },
      ),
    };
  }

  /** What a drag shows beside the observer: the ground under it, and the circle a snap searched. */
  function dragData(): FeatureCollection {
    const { ground, ring } = (viewshed.draggingId && viewshed.dragFeedback) || {};
    const features: FeatureCollection["features"] = [];
    if (ground)
      features.push({
        type: "Feature",
        properties: { text: `Ground ${Math.round(ground.height)} m` },
        geometry: { type: "Point", coordinates: ground.position },
      });
    if (ring)
      features.push(
        circle(ring.center, ring.radius / 1000, { steps: 64, units: "kilometers" }),
      );
    return { type: "FeatureCollection", features };
  }

  /** Metres on the ground `viewshed.snapPixels` from `point` on the map. */
  function snapRadius([x, y]: [number, number], position: LngLat): number {
    const { lng, lat } = map.unproject([x + viewshed.snapPixels, y]);
    return distanceBetween(position, [lng, lat]);
  }

  /**
   * The ring around each viewshed shown, so it moves with the image it bounds rather than ahead
   * of it; around the observer until there is one.
   */
  function rangesOf(): { center: LngLat; reach: number }[] {
    return viewshed.viewsheds.map(({ id, observer, metres }) => {
      const grid = viewshed.results.get(id)?.grid;
      return grid
        ? { center: grid.center, reach: grid.radius }
        : { center: observer, reach: metres };
    });
  }

  function renderRange() {
    const ranges = rangesOf();
    const key = JSON.stringify(ranges);
    if (key === rangeShown) return;
    rangeShown = key;
    (map.getSource(RANGE_ID) as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: ranges.map(({ center, reach }) =>
        circle(center, reach / 1000, { steps: 128, units: "kilometers" }),
      ),
    });
  }

  /** Removes the images from the nth on. */
  function removeImages(from: number) {
    for (let index = from; index < Math.max(imageKeys.length, from + 1); index++) {
      for (const id of [nth(OUTLINE_ID, index), nth(IMAGE_ID, index)]) {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      }
    }
    imageKeys = imageKeys.slice(0, from);
    outlinesShown = outlinesShown.slice(0, from);
  }

  /**
   * The shading, the outline of the visible area on top of it, and the rings around them, written
   * together: over terrain, MapLibre repaints the tiles under each, so landing them at once
   * repaints them once.
   */
  function renderResult() {
    const images = drawn.value;
    const display = viewshed.display;
    removeImages(images.length);
    images.forEach((image, index) => {
      const { grid } = image.coverage;
      const [west, south, east, north] = grid.bounds;
      const coordinates: [
        [number, number],
        [number, number],
        [number, number],
        [number, number],
      ] = [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
      ];
      const imageId = nth(IMAGE_ID, index);
      const outlineId = nth(OUTLINE_ID, index);
      if (!map.getSource(imageId)) {
        // Both go in under the same layer, the outline last, so it lands on top.
        const before = underlayAnchor(map, basemapIds, { overAnalysis: true });
        // No url: it starts empty, and takes each result's pixels as they are.
        map.addSource(imageId, { type: "image", coordinates });
        map.addLayer(
          {
            id: imageId,
            type: "raster",
            source: imageId,
            paint: { "raster-fade-duration": 0 },
          },
          before,
        );
        map.addSource(outlineId, { type: "geojson", data: EMPTY });
        map.addLayer(
          {
            id: outlineId,
            type: "line",
            source: outlineId,
            paint: { "line-color": "#15803d", "line-width": 1.5 },
          },
          before,
        );
        imageKeys[index] = null;
        outlinesShown[index] = undefined;
      }
      const key: ImageKey = [
        display,
        display === "masking" ? image.maskingKey : image.coverage,
      ];
      if (!sameKey(imageKeys[index], key)) {
        imageKeys[index] = key;
        (map.getSource(imageId) as ImageSource).updateImage({
          image: viewshedImage(image.coverage, display),
          coordinates,
        });
      }
      const outline = image.outline();
      if (outline !== outlinesShown[index]) {
        outlinesShown[index] = outline;
        (map.getSource(outlineId) as GeoJSONSource).setData(outline ?? EMPTY);
      }
    });
    renderRange();
  }

  /** A pin narrows to a point on the ground, under the head that marks it and reads its number. */
  function styleGroundPoint() {
    map.setPaintProperty(OBSERVER_ID, "circle-radius", viewshed.pin ? 3 : 6);
    map.setPaintProperty(OBSERVER_ID, "circle-stroke-width", viewshed.pin ? 1 : 2);
    map.setLayoutProperty(
      OBSERVER_LABEL_ID,
      "visibility",
      viewshed.pin ? "none" : "visible",
    );
  }

  function onClick(event: MapMouseEvent) {
    if (viewshed.placing) viewshed.place([event.lngLat.lng, event.lngLat.lat]);
  }

  const ensureSource = (id: string, data: FeatureCollection) =>
    map.getSource(id) || map.addSource(id, { type: "geojson", data });
  const ensureLayer = (layer: AddLayerObject) =>
    map.getLayer(layer.id) || map.addLayer(layer);
  ensureSource(RANGE_ID, EMPTY);
  ensureLayer({
    id: RANGE_ID,
    type: "line",
    source: RANGE_ID,
    paint: { "line-color": "#16a34a", "line-width": 1.5, "line-dasharray": [3, 2] },
  });
  ensureSource(OBSERVER_ID, observerData());
  ensureLayer({
    id: OBSERVER_ID,
    type: "circle",
    source: OBSERVER_ID,
    paint: {
      "circle-color": ["case", ["get", "current"], "#16a34a", "#ffffff"],
      "circle-stroke-color": ["case", ["get", "current"], "#ffffff", "#16a34a"],
    },
  });
  ensureLayer({
    id: OBSERVER_LABEL_ID,
    type: "symbol",
    source: OBSERVER_ID,
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
      "text-anchor": "bottom-left",
      "text-offset": [0.5, -0.3],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#14532d",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });
  styleGroundPoint();
  ensureSource(PIN_ID, pinData());
  pinShown = viewshed.pin && viewshed.viewsheds.length > 0;
  ensureLayer({
    id: PIN_STICK_ID,
    type: "fill-extrusion",
    source: PIN_ID,
    filter: ["==", ["get", "kind"], "stick"],
    paint: {
      "fill-extrusion-color": "#16a34a",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": 0,
    },
  });
  if (!map.hasImage(PIN_HEAD_ID)) {
    const pixelRatio = window.devicePixelRatio || 1;
    map.addImage(PIN_HEAD_ID, pinHead(pixelRatio), { pixelRatio });
  }
  ensureLayer({
    id: PIN_HEAD_ID,
    type: "symbol",
    source: PIN_ID,
    filter: ["==", ["get", "kind"], "head"],
    layout: {
      "symbol-height-offset": ["get", "lift"],
      "icon-image": PIN_HEAD_ID,
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "text-field": ["get", "text"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
      "text-anchor": "left",
      "text-offset": [1.1, 0],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "#15803d",
      "text-halo-width": 6,
      "text-halo-blur": 0,
    },
  });
  ensureSource(DRAG_ID, dragData());
  // The snap area: a faint fill, and a solid ring (the range's is dashed) on a white casing, which
  // reads over terrain, shading and dark basemaps.
  const isRing: FilterSpecification = ["==", ["geometry-type"], "Polygon"];
  ensureLayer({
    id: DRAG_AREA_ID,
    type: "fill",
    source: DRAG_ID,
    filter: isRing,
    paint: { "fill-color": "#16a34a", "fill-opacity": 0.12 },
  });
  ensureLayer({
    id: DRAG_CASING_ID,
    type: "line",
    source: DRAG_ID,
    filter: isRing,
    paint: { "line-color": "#ffffff", "line-width": 5, "line-opacity": 0.9 },
  });
  ensureLayer({
    id: DRAG_RING_ID,
    type: "line",
    source: DRAG_ID,
    filter: isRing,
    paint: { "line-color": "#15803d", "line-width": 2.5 },
  });
  ensureLayer({
    id: DRAG_LABEL_ID,
    type: "symbol",
    source: DRAG_ID,
    filter: ["==", ["geometry-type"], "Point"],
    layout: {
      "text-field": ["get", "text"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
      "text-anchor": "top",
      "text-offset": [0, 0.9],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#14532d",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });
  renderResult();

  scope.run(() => {
    watch([drawn, () => viewshed.display], renderResult);
    watch([() => viewshed.viewsheds, () => viewshed.currentId], () =>
      (map.getSource(OBSERVER_ID) as GeoJSONSource | undefined)?.setData(observerData()),
    );
    // Placed or closed with no result to wait for; while a result is shown the ring waits for it,
    // and an unchanged ring writes nothing.
    watch(
      () =>
        JSON.stringify(
          viewshed.viewsheds.map(({ observer, metres }) => [observer, metres]),
        ),
      renderRange,
    );
    // The ground under each observer that holds an altitude: all a pin reads from the results, so
    // other results leave the pins alone.
    const altitudeGrounds = () =>
      viewshed.viewsheds
        .map(({ id, observerAbove }) =>
          observerAbove === "sea-level" ? viewshed.results.get(id)?.ground : null,
        )
        .join();
    watch(
      [() => viewshed.viewsheds, () => viewshed.pin, exaggeration, altitudeGrounds],
      () => {
        if (!viewshed.pin && !pinShown) return;
        pinShown = viewshed.pin && viewshed.viewsheds.length > 0;
        (map.getSource(PIN_ID) as GeoJSONSource | undefined)?.setData(pinData());
      },
    );
    watch(() => viewshed.pin, styleGroundPoint);
    watch([() => viewshed.draggingId, () => viewshed.dragFeedback], () =>
      (map.getSource(DRAG_ID) as GeoJSONSource | undefined)?.setData(dragData()),
    );
    watch(
      () => viewshed.placing,
      (on) => map.getCanvasContainer().classList.toggle(PICKING_CLASS, on),
      { immediate: true, flush: "sync" },
    );
  });

  map.on("click", onClick);
  const detachDrag = attachPointDrag(map, {
    points: () => viewshed.viewsheds.map(({ observer }) => observer),
    // Pressing an observer makes it current, whether or not it moves.
    onStart: (index) => {
      const pressed = viewshed.viewsheds[index];
      if (pressed) viewshed.startDrag(pressed.id);
    },
    onMove: (position, pointer) =>
      viewshed.dragTo(position, pointer, () => snapRadius(pointer.point, position)),
    onEnd: () => viewshed.endDrag(),
  });

  return () => {
    scope.stop();
    map.off("click", onClick);
    detachDrag();
    map.getCanvasContainer().classList.remove(PICKING_CLASS);
    // The style may be gone already, after a style swap.
    if (!map.style) return;
    removeImages(0);
    for (const id of [
      DRAG_LABEL_ID,
      DRAG_RING_ID,
      DRAG_CASING_ID,
      DRAG_AREA_ID,
      PIN_HEAD_ID,
      PIN_STICK_ID,
      OBSERVER_LABEL_ID,
      OBSERVER_ID,
      RANGE_ID,
    ])
      if (map.getLayer(id)) map.removeLayer(id);
    for (const id of [DRAG_ID, PIN_ID, OBSERVER_ID, RANGE_ID])
      if (map.getSource(id)) map.removeSource(id);
    if (map.hasImage(PIN_HEAD_ID)) map.removeImage(PIN_HEAD_ID);
  };
}
