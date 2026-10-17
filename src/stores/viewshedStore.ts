/**
 * Viewsheds: the ground an observer standing at a point can see, within a radius, drawn over the
 * map. An experimental feature in Labs, ported from tactrace. They are live and ephemeral:
 * recomputed as their settings change, and nothing is written to the scenario.
 *
 * Several can be open at once. While placing, each map click adds an observer, and an observer can
 * be dragged; pressing one makes it current, and the deck edits the current one's settings.
 * Leaving placing keeps the viewsheds shown until closed.
 *
 * While an observer is dragged, the ground under it reads beside it. It can snap to the highest or
 * lowest ground within a few pixels of the pointer (how many is set too), as chosen in the deck or,
 * for one drag, while Alt (with Shift, the lowest) is held, which finds a summit or a valley floor
 * without hunting for it.
 *
 * Their coverage is combined by default: ground is seen where any observer sees it, with the least
 * masking height of any. Otherwise each is drawn on its own, overlapping where they meet.
 *
 * The image shows either the ground a target is seen on, the dead ground no observer sees, or the
 * masking height map: how high a target must rise to be seen, in bands. The sweep yields all of
 * them at once, so switching recomputes nothing.
 *
 * This store holds only the state and the queue, so it costs nothing while the feature is off: the
 * map side (`viewshedLayers`), the deck and the worker are loaded once it is on.
 *
 * The work runs in a worker (`viewshedClient`). One request is in flight at a time, and only each
 * viewshed's newest change waits behind it, so a drag shows each result as soon as the last one is
 * done rather than queueing every move.
 */
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { computed, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";
import type {
  GridDetail,
  LngLat,
  ObserverAbove,
  ViewshedRequest,
  ViewshedResult,
} from "@/lib/terrain";
import type { ViewshedDisplay } from "@/geo/viewshedImage";
import type { PointerAt } from "@/geo/pointDrag";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useTerrainStore } from "@/stores/terrainStore";

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

type ViewshedStatus = "loading" | "ready" | "error";

/** Where a dragged observer goes: under the pointer, or to the highest or lowest ground near it. */
export type ViewshedSnap = "off" | "highest" | "lowest";
/**
 * How far from the pointer a snap looks, in screen pixels, so it feels the same at any zoom: a
 * ridge zoomed out, a knoll zoomed in.
 */
export const SNAP_AREA = { min: 8, max: 96, step: 4, fallback: 24 };
const clampSnapArea = (value: number) =>
  Number.isFinite(value)
    ? Math.min(SNAP_AREA.max, Math.max(SNAP_AREA.min, value))
    : SNAP_AREA.fallback;

/**
 * One viewshed and its own settings. Replaced, never changed in place, so the list holds plain
 * data that goes to the worker and the map as it is.
 */
interface Settings {
  /** Metres above the ground, or above sea level. */
  observerHeight: number;
  observerAbove: ObserverAbove;
  targetHeight: number;
  /** Whether `metres` is the straight-line distance from the eye. */
  slantRange: boolean;
  /** Metres from the observer, within `VIEWSHED_RADIUS`. */
  metres: number;
  detail: ViewshedDetail;
}

interface Viewshed extends Readonly<Settings> {
  readonly id: string;
  /** What it is called on the map and in the deck: the lowest number free when it was opened. */
  readonly number: number;
  readonly observer: LngLat;
}
const SETTING_KEYS = [
  "observerHeight",
  "observerAbove",
  "targetHeight",
  "slantRange",
  "metres",
  "detail",
] as const;
/** Just the settings of a viewshed, as a fresh object. */
const settingsOf = (from: Settings): Settings =>
  Object.fromEntries(SETTING_KEYS.map((key) => [key, from[key]])) as Settings;
const DEFAULT_SETTINGS: Settings = {
  observerHeight: 2,
  observerAbove: "ground",
  targetHeight: 2,
  slantRange: false,
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

  /** A setting of the current viewshed, or of the next while none is open; `normalize` cleans what is set. */
  function setting<K extends keyof Settings>(
    key: K,
    normalize = (value: Settings[K]) => value,
  ) {
    return computed({
      get: (): Settings[K] => (current.value ?? fresh.value)[key],
      set: (value: Settings[K]) => {
        if (current.value) patch(current.value.id, { [key]: normalize(value) });
        else fresh.value[key] = normalize(value);
      },
    });
  }

  /** Where the current observer stands. */
  const observer = computed(() => current.value?.observer ?? null);
  const number = computed(() => current.value?.number ?? null);
  const observerHeight = setting("observerHeight");
  const observerAbove = setting("observerAbove");
  const targetHeight = setting("targetHeight");
  const slantRange = setting("slantRange");
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
  const radius = setting("metres", clampRadius);
  /** What the image shows. Kept across viewsheds. */
  const display = shallowRef<ViewshedDisplay>("visible");
  /** Whether observers are drawn as pins at eye height. Kept across viewsheds. */
  const pin = shallowRef(false);
  /** Whether the coverage of several viewsheds is drawn as one. */
  const combine = shallowRef(true);
  /** Where a dragged observer goes. Kept across viewsheds. */
  const snap = shallowRef<ViewshedSnap>("off");
  const snapArea = shallowRef(SNAP_AREA.fallback);
  /** How far round the pointer a snap looks, within `SNAP_AREA`. Kept across viewsheds. */
  const snapPixels = computed({
    get: () => snapArea.value,
    set: (value: number) => (snapArea.value = clampSnapArea(value)),
  });
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
  /**
   * Each viewshed's cell size at its own detail, in metres: held through a drag, whose previews
   * compute on a coarser grid.
   */
  const cellSizes = shallowRef<ReadonlyMap<string, number>>(new Map());
  const cellSize = computed(() =>
    currentId.value ? (cellSizes.value.get(currentId.value) ?? null) : null,
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

  /** Escape's first refusal: stops placing, and says whether it did. */
  function handleEscape(): boolean {
    if (!placing.value) return false;
    stop();
    return true;
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

  // The worker holds a tile cache, which nothing needs once every viewshed is closed.
  watch(active, (on) => {
    if (on || !workerStarted) return;
    workerStarted = false;
    void import("@/geo/viewshedClient").then((client) => client.stopViewshedWorker());
  });

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

  /** Whether the worker was asked for, so it is stopped once nothing needs it. */
  let workerStarted = false;

  async function run() {
    if (running) return;
    running = true;
    workerStarted = true;
    while (queued.size) {
      const [id, { source, request }] = queued.entries().next().value!;
      queued.delete(id);
      try {
        const { viewshedClient } = await import("@/geo/viewshedClient");
        const next = await (await viewshedClient(source)).compute(request);
        // Closed meanwhile; a newer request still shows this one until it lands.
        if (!all.value.some((viewshed) => viewshed.id === id)) continue;
        results.value = withEntry(results.value, id, next);
        if (request.outline !== PREVIEW.outline)
          cellSizes.value = withEntry(cellSizes.value, id, next.grid.cellSize);
        if (!queued.has(id)) statuses.value = withEntry(statuses.value, id, "ready");
      } catch {
        if (queued.has(id) || !all.value.some((viewshed) => viewshed.id === id)) continue;
        results.value = withEntry(results.value, id, null);
        cellSizes.value = withEntry(cellSizes.value, id, null);
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
        observerAbove: viewshed.observerAbove,
        slantRange: viewshed.slantRange,
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
      let held = cellSizes.value;
      for (const id of held.keys())
        if (!requests.has(id)) held = withEntry(held, id, null);
      if (held !== cellSizes.value) cellSizes.value = held;
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
   * The results in the order opened: the same array until one of them changes, so a drag move or a
   * setting that has no new result yet neither combines nor redraws anything.
   */
  let lastShown: readonly ViewshedResult[] = [];
  const shown = computed(() => {
    const each = all.value.flatMap(({ id }) => results.value.get(id) ?? []);
    const same =
      each.length === lastShown.length && each.every((one, i) => one === lastShown[i]);
    return same ? lastShown : (lastShown = each);
  });
  /** Whether the image combines several viewsheds, and shades the ground by how many see it. */
  const combined = computed(() => combine.value && shown.value.length > 1);

  /** Whether there are several observers, which their numbers tell apart. */
  const several = computed(() => viewsheds.value.length > 1);

  /**
   * What a drag shows beside the observer: the ground under it, and the circle a snap searched.
   * Set once a move lands, so the map is written once for it.
   */
  const dragFeedback = shallowRef<{
    ground: { position: LngLat; height: number } | null;
    ring: { center: LngLat; radius: number } | null;
  } | null>(null);
  /**
   * The newest move of a drag, which letting go waits for. Moves are numbered, and a search lands
   * unless a later one landed first: while tiles load, the observer keeps up as each arrives
   * rather than waiting for the pointer to stop.
   */
  let lastMove: Promise<void> = Promise.resolve();
  let moves = 0;
  let landedMove = 0;
  /**
   * Where this drag last snapped, kept while it stays in reach and as high (or low) as any, so the
   * observer holds a summit as the pointer wanders.
   */
  let snapped: LngLat | null = null;

  function clearDrag() {
    dragFeedback.value = null;
    snapped = null;
  }

  /** Presses an observer, which makes it current; its results are previews until let go. */
  function startDrag(id: string) {
    select(id);
    draggingId.value = id;
    clearDrag();
  }

  /**
   * Moves the observer pressed, whatever is made current meanwhile: to the pointer, or to a summit
   * or pit near there, and reads the ground where it lands. With no summit in reach, as on a slope,
   * it follows the pointer until one comes into reach. `snapRadius` is the metres on the ground
   * that `snapPixels` span, asked for only when snapping.
   */
  async function moveDragged(
    id: string,
    position: LngLat,
    { altKey, shiftKey }: Pick<PointerAt, "altKey" | "shiftKey">,
    snapRadius: () => number,
  ) {
    const move = ++moves;
    const mode: ViewshedSnap = altKey ? (shiftKey ? "lowest" : "highest") : snap.value;
    const ring = mode === "off" ? null : { center: position, radius: snapRadius() };
    if (!ring) {
      // A plain move lands at once, so no older search may move it back.
      landedMove = move;
      snapped = null;
      patch(id, { observer: position });
    }
    const source = terrain.elevationSource;
    if (!source) return;
    try {
      const [{ demSampler }, { extremeNear }] = await Promise.all([
        import("@/geo/demTileProvider"),
        import("@/lib/terrain"),
      ]);
      const sampler = await demSampler(source);
      const found = ring
        ? await extremeNear(sampler, position, {
            radius: ring.radius,
            find: mode === "lowest" ? "lowest" : "highest",
            prefer: snapped ?? undefined,
          })
        : null;
      const height = found?.height ?? (await sampler.heights([position]))[0]!;
      if (move < landedMove || draggingId.value !== id) return;
      landedMove = move;
      const landed = found?.position ?? position;
      // Holding a summit, there is nothing to move.
      const placed = all.value.find((viewshed) => viewshed.id === id)?.observer;
      if (placed?.[0] !== landed[0] || placed[1] !== landed[1])
        patch(id, { observer: landed });
      snapped = found?.position ?? null;
      dragFeedback.value = {
        ground: Number.isNaN(height) ? null : { position: landed, height },
        ring,
      };
    } catch {
      // No ground to read; the observer stays where it last was.
    }
  }

  function dragTo(
    position: LngLat,
    pointer: Pick<PointerAt, "altKey" | "shiftKey">,
    snapRadius: () => number,
  ) {
    if (draggingId.value)
      lastMove = moveDragged(draggingId.value, position, pointer, snapRadius);
  }

  /** A snap still searching lands first, so the full viewshed is computed once, where the observer ends up. */
  function endDrag() {
    const id = draggingId.value;
    void lastMove.then(() => {
      if (draggingId.value !== id) return;
      draggingId.value = null;
      clearDrag();
    });
  }

  // While placing, a map click is the observer's, not a selection.
  let releaseSelection: (() => void) | null = null;
  watch(
    placing,
    (on) => {
      if (on) releaseSelection ??= mapSelect.suppressSelection();
      else {
        releaseSelection?.();
        releaseSelection = null;
      }
    },
    { flush: "sync" },
  );

  return {
    placing,
    active,
    viewsheds,
    currentId,
    number,
    observer,
    observerHeight,
    observerAbove,
    targetHeight,
    slantRange,
    radius,
    detail,
    detailForAll,
    display,
    pin,
    combine,
    snap,
    snapPixels,
    several,
    status,
    result,
    results,
    cellSize,
    draggingId,
    dragFeedback,
    shown,
    combined,
    visibleShare,
    place,
    select,
    step,
    start,
    stop,
    close,
    closeAll,
    handleEscape,
    startDrag,
    dragTo,
    endDrag,
  };
});
