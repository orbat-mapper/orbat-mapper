/**
 * Viewsheds: the ground an observer standing at a point can see, within a radius, drawn over the
 * map. An experimental feature in Labs, ported from tactrace. They are live and ephemeral:
 * recomputed as their settings change, and nothing is written to the scenario.
 *
 * Several can be open at once. While placing, each map click adds an observer, and an observer can
 * be dragged; pressing one makes it current, and the deck edits the current one's settings.
 * Leaving placing keeps the viewsheds shown until closed.
 *
 * Their coverage is combined by default: ground is seen where any observer sees it, with the least
 * masking height of any. Otherwise each is drawn on its own, overlapping where they meet.
 *
 * The image shows either the ground a target is seen on, the dead ground no observer sees, or the
 * masking height map: how high a target must rise to be seen, in bands. The sweep yields all of
 * them at once, so switching recomputes nothing.
 *
 * As a pin, an observer also stands up from the map: a stick to eye height topped by a ball, with
 * a label reading the height, for a map tilted over the terrain (`observerPin`).
 *
 * The work runs in a worker (`viewshedClient`). One request is in flight at a time, and only each
 * viewshed's newest change waits behind it, so a drag shows each result as soon as the last one is
 * done rather than queueing every move.
 */
import type { FeatureCollection, MultiPolygon } from "geojson";
import type {
  AddLayerObject,
  GeoJSONSource,
  ImageSource,
  Map as MlMap,
  MapMouseEvent,
  RasterDEMSourceSpecification,
} from "maplibre-gl";
import { computed, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";
import circle from "@turf/circle";
import {
  combineViewsheds,
  maskToPolygons,
  type Coverage,
  type GridDetail,
  type LngLat,
  type ViewshedRequest,
  type ViewshedResult,
} from "@/lib/terrain";
import { viewshedClient } from "@/geo/viewshedClient";
import { viewshedImage, type ViewshedDisplay } from "@/geo/viewshedImage";
import { attachPointDrag } from "@/geo/pointDrag";
import { observerPin, pinHead } from "@/geo/observerPin";
import { HILLSHADE_LAYER_ID } from "@/modules/maplibreview/mapTerrain";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useTerrainStore } from "@/stores/terrainStore";

const VIEWSHED_PREFIX = "orbat-viewshed";
const IMAGE_SOURCE_ID = VIEWSHED_PREFIX;
const IMAGE_LAYER_ID = VIEWSHED_PREFIX;
const OUTLINE_SOURCE_ID = `${VIEWSHED_PREFIX}-outline`;
const OUTLINE_LAYER_ID = `${VIEWSHED_PREFIX}-outline`;
const OBSERVER_SOURCE_ID = `${VIEWSHED_PREFIX}-observer`;
const OBSERVER_LAYER_ID = `${VIEWSHED_PREFIX}-observer`;
const OBSERVER_LABEL_LAYER_ID = `${VIEWSHED_PREFIX}-observer-label`;
const RANGE_SOURCE_ID = `${VIEWSHED_PREFIX}-range`;
const RANGE_LAYER_ID = `${VIEWSHED_PREFIX}-range`;
const PIN_SOURCE_ID = `${VIEWSHED_PREFIX}-pin`;
const PIN_STICK_LAYER_ID = `${VIEWSHED_PREFIX}-pin-stick`;
const PIN_HEAD_LAYER_ID = `${VIEWSHED_PREFIX}-pin-head`;
const PIN_HEAD_IMAGE_ID = `${VIEWSHED_PREFIX}-pin-head`;
/** On the canvas container while placing, for a crosshair cursor (`styles.css`). */
const PLACING_CLASS = "viewshed-placing";

/** The ids of the nth image drawn, and its outline: the first keeps the bare ids. */
const nth = (id: string, index: number) => (index ? `${id}-${index}` : id);

/**
 * How fine the grid is: cells of up to `cellSize` metres where `maxSize` cells a side allow, and
 * never finer than the elevation data. A larger radius takes coarser cells once `maxSize` is
 * reached. Each step is about four times the work of the one before.
 */
export const VIEWSHED_DETAILS = {
  draft: { label: "Draft", cellSize: 20, maxSize: 201 },
  standard: { label: "Standard", cellSize: 10, maxSize: 401 },
  fine: { label: "Fine", cellSize: 5, maxSize: 801 },
  high: { label: "High", maxSize: 1601 },
  max: { label: "Max", maxSize: 3201 },
  extreme: { label: "Extreme", maxSize: 6401 },
} satisfies Record<string, GridDetail & { label: string }>;
export type ViewshedDetail = keyof typeof VIEWSHED_DETAILS;

/** Just what the worker reads, without the label. */
const detailOf = ({ cellSize, maxSize }: GridDetail): GridDetail => ({
  cellSize,
  maxSize,
});

/**
 * The grid while dragging, at any detail, so the drag keeps up; without the outline, which a drag
 * outruns, and which over terrain would cost another repaint of every tile under it.
 */
const PREVIEW = { ...detailOf(VIEWSHED_DETAILS.draft), outline: false };

/** How far the observer may look, in metres; the detail levels are sized for this range. */
export const VIEWSHED_RADIUS = { min: 500, max: 200_000, step: 500 };

/**
 * The most cells a side of the combined coverage while any viewshed in it is a preview: a drag
 * next to a fine viewshed would otherwise combine at the fine one's cells across them all, for
 * every move.
 */
const COMBINED_PREVIEW_SIZE = 801;

type ViewshedStatus = "loading" | "ready" | "error";

/**
 * One viewshed and its own settings. Replaced, never changed in place, so the list holds plain
 * data that goes to the worker and the map as it is.
 */
interface Viewshed {
  readonly id: string;
  /** What it is called on the map and in the deck: the lowest number free when it was opened. */
  readonly number: number;
  readonly observer: LngLat;
  /** Metres above the ground. */
  readonly observerHeight: number;
  readonly targetHeight: number;
  /** Metres from the observer, within `VIEWSHED_RADIUS`. */
  readonly metres: number;
  readonly detail: ViewshedDetail;
}

type Settings = {
  -readonly [K in "observerHeight" | "targetHeight" | "metres" | "detail"]: Viewshed[K];
};
const DEFAULT_SETTINGS: Settings = {
  observerHeight: 2,
  targetHeight: 2,
  metres: 5000,
  detail: "standard",
};

const clampRadius = (value: number) =>
  Math.min(Math.max(value, VIEWSHED_RADIUS.min), VIEWSHED_RADIUS.max);

export const useViewshedStore = defineStore("viewshed", () => {
  const terrain = useTerrainStore();
  const mapSelect = useMapSelectStore();

  /** Whether a map click places an observer. */
  const placing = shallowRef(false);

  const all = shallowRef<readonly Viewshed[]>([]);
  const currentId = shallowRef<string | null>(null);
  let nextId = 0;
  const current = computed(
    () => all.value.find(({ id }) => id === currentId.value) ?? null,
  );

  /** Replaces a viewshed with `changes` made. */
  function patch(id: string, changes: Partial<Viewshed>) {
    all.value = all.value.map((viewshed) =>
      viewshed.id === id ? { ...viewshed, ...changes } : viewshed,
    );
  }

  /** Every viewshed, by number. */
  const viewsheds = computed(() => [...all.value].sort((a, b) => a.number - b.number));

  /** The settings the next viewshed opens with while none is open: the last one closed leaves its own. */
  const fresh = ref<Settings>({ ...DEFAULT_SETTINGS });
  const settingsOf = ({
    observerHeight,
    targetHeight,
    metres,
    detail,
  }: Settings): Settings => ({
    observerHeight,
    targetHeight,
    metres,
    detail,
  });

  /** A setting of the current viewshed, or of the next while none is open. */
  function setting<K extends keyof Settings>(key: K) {
    return computed({
      get: (): Settings[K] => (current.value ?? fresh.value)[key],
      set: (value: Settings[K]) => {
        if (current.value) patch(current.value.id, { [key]: value });
        else fresh.value[key] = value;
      },
    });
  }

  /** Where the current observer stands. */
  const observer = computed(() => current.value?.observer ?? null);
  const number = computed(() => current.value?.number ?? null);
  const observerHeight = setting("observerHeight");
  const targetHeight = setting("targetHeight");
  /**
   * Whether setting the detail sets it for every viewshed, so a combined image doesn't mix grids.
   * Kept across viewsheds.
   */
  const detailForAll = shallowRef(true);
  /** Sets the current one's detail, or the next's while none is open; every viewshed's while `detailForAll`. */
  function setDetail(value: ViewshedDetail) {
    if (!current.value) fresh.value.detail = value;
    else if (!detailForAll.value) patch(current.value.id, { detail: value });
    else all.value = all.value.map((viewshed) => ({ ...viewshed, detail: value }));
  }
  const detail = computed({
    get: (): ViewshedDetail => (current.value ?? fresh.value).detail,
    set: setDetail,
  });
  // Set for all again, every viewshed takes the current one's detail.
  watch(detailForAll, (on) => on && setDetail(detail.value), { flush: "sync" });
  const radius = computed({
    get: () => (current.value ?? fresh.value).metres,
    set: (value: number) => {
      if (current.value) patch(current.value.id, { metres: clampRadius(value) });
      else fresh.value.metres = clampRadius(value);
    },
  });
  /** What the image shows. Kept across viewsheds. */
  const display = shallowRef<ViewshedDisplay>("visible");
  /** Whether observers are drawn as pins at eye height. Kept across viewsheds. */
  const pin = shallowRef(false);
  /** Whether the coverage of several viewsheds is drawn as one. */
  const combine = shallowRef(true);
  /** The viewshed whose observer is being dragged: its results are previews meanwhile. */
  const draggingId = shallowRef<string | null>(null);

  const results = shallowRef<ReadonlyMap<string, ViewshedResult>>(new Map());
  const statuses = shallowRef<ReadonlyMap<string, ViewshedStatus>>(new Map());
  const result = computed(
    () => (currentId.value && results.value.get(currentId.value)) || null,
  );
  const status = computed(
    () => (currentId.value && statuses.value.get(currentId.value)) || "loading",
  );
  /** The share of ground with data within the current radius that can be seen. */
  const visibleShare = computed(() => result.value?.visibleShare ?? null);

  const withEntry = <T>(map: ReadonlyMap<string, T>, id: string, value: T | null) => {
    const next = new Map(map);
    if (value === null) next.delete(id);
    else next.set(id, value);
    return next;
  };

  /** Whether the deck is up: placing, or a viewshed is open. */
  const active = computed(() => placing.value || all.value.length > 0);

  /** Adds an observer at `position`, with the current one's settings, and makes it current. */
  function place(position: LngLat) {
    const id = `viewshed-${nextId++}`;
    const taken = new Set(all.value.map((viewshed) => viewshed.number));
    let free = 1;
    while (taken.has(free)) free++;
    all.value = [
      ...all.value,
      {
        id,
        number: free,
        observer: position,
        ...settingsOf(current.value ?? fresh.value),
      },
    ];
    currentId.value = id;
  }

  function select(id: string) {
    if (all.value.some((viewshed) => viewshed.id === id)) currentId.value = id;
  }

  /** Makes the next observer by number current, or with -1 the one before; round from the last to the first. */
  function step(delta: 1 | -1) {
    const order = viewsheds.value;
    const at = order.findIndex(({ id }) => id === currentId.value);
    const next = order[(at + delta + order.length) % order.length];
    if (next) currentId.value = next.id;
  }

  function start() {
    placing.value = true;
  }

  /** Done placing. */
  function stop() {
    placing.value = false;
  }

  function remove(id: string) {
    const removed = all.value.find((viewshed) => viewshed.id === id);
    if (removed && all.value.length === 1) fresh.value = settingsOf(removed);
    all.value = all.value.filter((viewshed) => viewshed.id !== id);
    if (draggingId.value === id) draggingId.value = null;
    if (currentId.value === id)
      currentId.value = all.value[all.value.length - 1]?.id ?? null;
  }

  /** Closes the current viewshed; the last one opened before it is current then. Closing the last one stops placing. */
  function close() {
    if (currentId.value) remove(currentId.value);
    if (!all.value.length) stop();
  }

  function closeAll() {
    stop();
    if (current.value) fresh.value = settingsOf(current.value);
    all.value = [];
    currentId.value = null;
    draggingId.value = null;
  }

  watch(
    () => terrain.elevationSource,
    (source) => {
      if (!source) closeAll();
    },
  );

  interface Queued {
    source: RasterDEMSourceSpecification;
    request: ViewshedRequest;
  }
  let running = false;
  /** Each viewshed's newest request not yet sent. */
  const queued = new Map<string, Queued>();

  async function run() {
    if (running) return;
    running = true;
    while (queued.size) {
      const [id, { source, request }] = queued.entries().next().value!;
      queued.delete(id);
      try {
        const next = await (await viewshedClient(source)).compute(request);
        // Closed meanwhile; a newer request still shows this one until it lands.
        if (!all.value.some((viewshed) => viewshed.id === id)) continue;
        results.value = withEntry(results.value, id, next);
        if (!queued.has(id)) statuses.value = withEntry(statuses.value, id, "ready");
      } catch {
        if (queued.has(id) || !all.value.some((viewshed) => viewshed.id === id)) continue;
        results.value = withEntry(results.value, id, null);
        statuses.value = withEntry(statuses.value, id, "error");
      }
    }
    running = false;
  }

  /** What each viewshed asks of the worker now, with the source it reads. */
  const wanted = computed(() => {
    const source = terrain.elevationSource;
    const requests = new Map<string, Queued & { key: string }>();
    if (!source) return requests;
    for (const viewshed of all.value) {
      const request: ViewshedRequest = {
        center: viewshed.observer,
        radius: viewshed.metres,
        ...(draggingId.value === viewshed.id
          ? PREVIEW
          : detailOf(VIEWSHED_DETAILS[viewshed.detail])),
        observerHeight: viewshed.observerHeight,
        targetHeight: viewshed.targetHeight,
      };
      requests.set(viewshed.id, { source, request, key: JSON.stringify(request) });
    }
    return requests;
  });

  // Sync, so a placed observer reads as loading at once rather than after a tick. A request is
  // compared with what was last asked by its key, so an unrelated change computes nothing.
  watch(
    wanted,
    (requests, asked = new Map()) => {
      let loading = statuses.value;
      for (const id of asked.keys())
        if (!requests.has(id)) {
          queued.delete(id);
          loading = withEntry(loading, id, null);
        }
      let dropped = results.value;
      for (const id of dropped.keys())
        if (!requests.has(id)) dropped = withEntry(dropped, id, null);
      if (dropped !== results.value) results.value = dropped;
      for (const [id, { source, request, key }] of requests) {
        const before = asked.get(id);
        if (before && before.source === source && before.key === key) continue;
        queued.set(id, { source, request });
        loading = withEntry(loading, id, "loading");
      }
      statuses.value = loading;
      if (queued.size) void run();
    },
    { flush: "sync" },
  );

  /**
   * What is drawn: the combined coverage, or each viewshed's own, in the order opened. An outline
   * is traced only once none is a preview.
   */
  interface Drawn {
    coverage: Coverage;
    outline: () => MultiPolygon | null;
    /**
     * The masking map is the same for every target height from the same sweeps, so it keys on
     * them; the visible ground changes with every result.
     */
    maskingKey: string;
  }
  const drawn = computed<Drawn[]>(() => {
    const each = all.value.flatMap(({ id }) => results.value.get(id) ?? []);
    if (!combine.value || each.length < 2)
      return each.map((one) => ({
        coverage: one,
        outline: () => one.outline,
        maskingKey: `masking:${one.sweep}`,
      }));
    // Only a preview comes without its outline.
    const preview = each.some((one) => !one.outline);
    const coverage = combineViewsheds(each, preview ? COMBINED_PREVIEW_SIZE : undefined);
    let outline: MultiPolygon | null | undefined;
    return [
      {
        coverage,
        outline: () =>
          (outline ??= preview ? null : maskToPolygons(coverage.grid, coverage.mask)),
        maskingKey: `masking:${each.map((one) => one.sweep).join(",")}`,
      },
    ];
  });
  /** What is drawn, each as a grid of cells. */
  const coverages = computed(() => drawn.value.map(({ coverage }) => coverage));

  // The map: the coverage as images above the basemap, and the observers with their ranges, and
  // their pins, on top.
  let attachedMap: MlMap | null = null;
  let detachDrag: (() => void) | null = null;
  let releaseSelection: (() => void) | null = null;
  /** The basemap's layers, which the images go above. */
  let basemapIds = new Set<string>();

  const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

  /** Whether there are several observers, which their numbers tell apart. */
  const several = computed(() => viewsheds.value.length > 1);

  /** The observers' dots; the current one filled, and each labelled with its number once there are several. */
  function observerData(): FeatureCollection {
    return {
      type: "FeatureCollection",
      features: viewsheds.value.map(({ id, number: n, observer: position }) => ({
        type: "Feature",
        properties: {
          id,
          current: id === currentId.value,
          label: several.value ? String(n) : "",
        },
        geometry: { type: "Point", coordinates: position },
      })),
    };
  }

  /**
   * The ring around each viewshed shown, so it moves with the image it bounds rather than ahead
   * of it; around the observer until there is one.
   */
  function rangesOf(): { center: LngLat; reach: number }[] {
    return all.value.map(({ id, observer: position, metres }) => {
      const grid = results.value.get(id)?.grid;
      return grid
        ? { center: grid.center, reach: grid.radius }
        : { center: position, reach: metres };
    });
  }

  /** How much the terrain on the map is stretched, which the pins follow. */
  const exaggeration = computed(() =>
    terrain.terrainEnabled ? terrain.exaggeration : 1,
  );

  function pinData(): FeatureCollection {
    if (!pin.value) return EMPTY;
    return {
      type: "FeatureCollection",
      // The head reads the number too, in place of the ground label it hides.
      features: viewsheds.value.flatMap(
        ({ number: n, observer: position, observerHeight: height }) =>
          observerPin(position, height, exaggeration.value, {
            label: several.value ? String(n) : undefined,
          }).features,
      ),
    };
  }

  /**
   * Just above the basemap and its shading, under every scenario layer: the first layer that is
   * none of those, nor a raster overlay.
   */
  function overlayBottom(map: MlMap): string | undefined {
    return map
      .getLayersOrder()
      .find(
        (id) =>
          !basemapIds.has(id) &&
          id !== HILLSHADE_LAYER_ID &&
          !id.startsWith(VIEWSHED_PREFIX) &&
          map.getLayer(id)?.type !== "raster",
      );
  }

  /**
   * What each shown image was drawn from, and the outline shown with it, and the rings: each
   * source is written only when it changes, since over terrain every write repaints the tiles
   * under it.
   */
  let imageKeys: (ImageKey | null)[] = [];
  let outlinesShown: unknown[] = [];
  let rangeShown: string | null = null;

  /** What an image shows, and what it is drawn from: the same coverage looks different as visible or dead ground. */
  type ImageKey = readonly [ViewshedDisplay, unknown];
  const imageKeyOf = ({ coverage, maskingKey }: Drawn): ImageKey => [
    display.value,
    display.value === "masking" ? maskingKey : coverage,
  ];
  const sameKey = (a: ImageKey | null | undefined, b: ImageKey) =>
    !!a && a[0] === b[0] && a[1] === b[1];

  function renderRange(map: MlMap) {
    const ranges = rangesOf();
    const key = JSON.stringify(ranges);
    if (key === rangeShown) return;
    rangeShown = key;
    (map.getSource(RANGE_SOURCE_ID) as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: ranges.map(({ center, reach }) =>
        circle(center, reach / 1000, { steps: 128, units: "kilometers" }),
      ),
    });
  }

  /** Removes the images from the nth on. */
  function removeImages(map: MlMap, from: number) {
    for (let index = from; index < Math.max(imageKeys.length, from + 1); index++) {
      for (const id of [nth(OUTLINE_LAYER_ID, index), nth(IMAGE_LAYER_ID, index)])
        if (map.getLayer(id)) map.removeLayer(id);
      for (const id of [nth(OUTLINE_SOURCE_ID, index), nth(IMAGE_SOURCE_ID, index)])
        if (map.getSource(id)) map.removeSource(id);
    }
    imageKeys = imageKeys.slice(0, from);
    outlinesShown = outlinesShown.slice(0, from);
  }

  /**
   * The shading, the outline of the visible area on top of it, and the rings around them, written
   * together: over terrain, MapLibre repaints the tiles under each, so landing them at once
   * repaints them once.
   */
  function renderResult(map: MlMap) {
    const images = drawn.value;
    removeImages(map, images.length);
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
      const imageId = nth(IMAGE_SOURCE_ID, index);
      const outlineId = nth(OUTLINE_SOURCE_ID, index);
      if (!map.getSource(imageId)) {
        // Both go in under the same layer, the outline last, so it lands on top.
        const before = overlayBottom(map);
        // No url: it starts empty, and takes each result's pixels as they are.
        map.addSource(imageId, { type: "image", coordinates });
        map.addLayer(
          {
            id: nth(IMAGE_LAYER_ID, index),
            type: "raster",
            source: imageId,
            paint: { "raster-fade-duration": 0 },
          },
          before,
        );
        map.addSource(outlineId, { type: "geojson", data: EMPTY });
        map.addLayer(
          {
            id: nth(OUTLINE_LAYER_ID, index),
            type: "line",
            source: outlineId,
            paint: { "line-color": "#15803d", "line-width": 1.5 },
          },
          before,
        );
        imageKeys[index] = null;
        outlinesShown[index] = undefined;
      }
      const key = imageKeyOf(image);
      if (!sameKey(imageKeys[index], key)) {
        imageKeys[index] = key;
        (map.getSource(imageId) as ImageSource).updateImage({
          image: viewshedImage(image.coverage, display.value),
          coordinates,
        });
      }
      const outline = image.outline();
      if (outline !== outlinesShown[index]) {
        outlinesShown[index] = outline;
        (map.getSource(outlineId) as GeoJSONSource).setData(outline ?? EMPTY);
      }
    });
    renderRange(map);
  }

  watch([drawn, display], () => {
    if (attachedMap) renderResult(attachedMap);
  });
  watch([viewsheds, currentId], () => {
    (attachedMap?.getSource(OBSERVER_SOURCE_ID) as GeoJSONSource | undefined)?.setData(
      observerData(),
    );
  });
  // Placed or closed with no result to wait for; while a result is shown the ring waits for it,
  // and an unchanged ring writes nothing.
  watch(
    () => all.value.map(({ observer: position, metres }) => [position, metres]),
    () => {
      if (attachedMap) renderRange(attachedMap);
    },
  );
  /** Whether the pin source holds a pin, so a drag with pins off sends nothing. */
  let pinShown = false;
  watch([viewsheds, pin, exaggeration], () => {
    if (!attachedMap || (!pin.value && !pinShown)) return;
    pinShown = pin.value && viewsheds.value.length > 0;
    (attachedMap.getSource(PIN_SOURCE_ID) as GeoJSONSource | undefined)?.setData(
      pinData(),
    );
  });
  watch(pin, () => {
    if (attachedMap) styleGroundPoint(attachedMap);
  });

  /** While placing, a map click is the observer's, not a selection. */
  watch(
    placing,
    (on) => {
      if (on && !releaseSelection) releaseSelection = mapSelect.suppressSelection();
      else if (!on && releaseSelection) {
        releaseSelection();
        releaseSelection = null;
      }
      attachedMap?.getCanvasContainer().classList.toggle(PLACING_CLASS, on);
    },
    { flush: "sync" },
  );

  /** A pin narrows to a point on the ground, under the head that marks it and reads its number. */
  function styleGroundPoint(map: MlMap) {
    map.setPaintProperty(OBSERVER_LAYER_ID, "circle-radius", pin.value ? 3 : 6);
    map.setPaintProperty(OBSERVER_LAYER_ID, "circle-stroke-width", pin.value ? 1 : 2);
    map.setLayoutProperty(
      OBSERVER_LABEL_LAYER_ID,
      "visibility",
      pin.value ? "none" : "visible",
    );
  }

  function onClick(event: MapMouseEvent) {
    if (placing.value) place([event.lngLat.lng, event.lngLat.lat]);
  }

  /**
   * Adds the layers. Safe to repeat after a style swap. `basemap` lists the basemap's own layers,
   * which the images go above.
   */
  function attachMap(map: MlMap, basemap: Iterable<string>) {
    detach();
    basemapIds = new Set(basemap);
    const ensureSource = (id: string, data: FeatureCollection) =>
      map.getSource(id) || map.addSource(id, { type: "geojson", data });
    const ensureLayer = (layer: AddLayerObject) =>
      map.getLayer(layer.id) || map.addLayer(layer);
    ensureSource(RANGE_SOURCE_ID, EMPTY);
    rangeShown = null;
    ensureLayer({
      id: RANGE_LAYER_ID,
      type: "line",
      source: RANGE_SOURCE_ID,
      paint: { "line-color": "#16a34a", "line-width": 1.5, "line-dasharray": [3, 2] },
    });
    ensureSource(OBSERVER_SOURCE_ID, observerData());
    ensureLayer({
      id: OBSERVER_LAYER_ID,
      type: "circle",
      source: OBSERVER_SOURCE_ID,
      paint: {
        "circle-color": ["case", ["get", "current"], "#16a34a", "#ffffff"],
        "circle-stroke-color": ["case", ["get", "current"], "#ffffff", "#16a34a"],
      },
    });
    ensureLayer({
      id: OBSERVER_LABEL_LAYER_ID,
      type: "symbol",
      source: OBSERVER_SOURCE_ID,
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
    styleGroundPoint(map);
    ensureSource(PIN_SOURCE_ID, pinData());
    pinShown = pin.value && viewsheds.value.length > 0;
    ensureLayer({
      id: PIN_STICK_LAYER_ID,
      type: "fill-extrusion",
      source: PIN_SOURCE_ID,
      filter: ["==", ["get", "kind"], "stick"],
      paint: {
        "fill-extrusion-color": "#16a34a",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
      },
    });
    if (!map.hasImage(PIN_HEAD_IMAGE_ID)) {
      const pixelRatio = window.devicePixelRatio || 1;
      map.addImage(PIN_HEAD_IMAGE_ID, pinHead(pixelRatio), { pixelRatio });
    }
    ensureLayer({
      id: PIN_HEAD_LAYER_ID,
      type: "symbol",
      source: PIN_SOURCE_ID,
      filter: ["==", ["get", "kind"], "head"],
      layout: {
        "symbol-height-offset": ["get", "lift"],
        "icon-image": PIN_HEAD_IMAGE_ID,
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
    attachedMap = map;
    // A new style has none of the images.
    imageKeys = [];
    outlinesShown = [];
    renderResult(map);
    map.getCanvasContainer().classList.toggle(PLACING_CLASS, placing.value);
    map.on("click", onClick);
    detachDrag = attachPointDrag(map, {
      points: () => viewsheds.value.map(({ observer: position }) => position),
      enabled: () => all.value.length > 0,
      // Pressing an observer makes it current, whether or not it moves.
      onStart: (index) => {
        const pressed = viewsheds.value[index];
        if (!pressed) return;
        currentId.value = pressed.id;
        draggingId.value = pressed.id;
      },
      // The pressed one moves, whatever is made current meanwhile.
      onMove: (position) => {
        if (draggingId.value) patch(draggingId.value, { observer: position });
      },
      onEnd: () => (draggingId.value = null),
    });
  }

  function detach() {
    attachedMap?.off("click", onClick);
    attachedMap?.getCanvasContainer().classList.remove(PLACING_CLASS);
    detachDrag?.();
    detachDrag = null;
    attachedMap = null;
  }

  return {
    placing,
    active,
    viewsheds,
    currentId,
    number,
    observer,
    observerHeight,
    targetHeight,
    radius,
    detail,
    detailForAll,
    display,
    pin,
    combine,
    several,
    status,
    result,
    results,
    coverages,
    visibleShare,
    place,
    select,
    step,
    start,
    stop,
    close,
    closeAll,
    attachMap,
    detach,
  };
});
