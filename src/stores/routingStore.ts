import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { Feature, LineString, Position } from "geojson";
import type {
  RoutingErrorCode,
  RoutingDraftRoute,
  RoutingOutcome,
  RoutingPreview,
} from "@/geo/routing/types";
import { DEFAULT_ROUTING_OPTIONS } from "@/geo/routing/shortestPathService";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { combineRouteWaypoints } from "@/geo/routing/routeWaypoints";

export type UnitRouteTimingMode = "currentTime" | "speedArrival";

function positionsEqual(a: Position | null, b: Position | null) {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function createLinePath(coordinates: Position[]): Feature<LineString> | null {
  if (coordinates.length < 2) return null;
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {},
  };
}

export const useRoutingStore = defineStore("routing", () => {
  const active = ref(false);
  const outcome = ref<RoutingOutcome>("unitTrack");
  const start = ref<Position | null>(null);
  const routeOrigin = ref<Position | null>(null);
  const routeStartTime = ref<number | null>(null);
  const destination = ref<Position | null>(null);
  const destinationLocked = ref(false);
  const cursorDestination = ref<Position | null>(null);
  const draftLegs = ref<RoutingPreview[]>([]);
  const currentLegPreview = ref<RoutingPreview | null>(null);
  const isBusy = ref(false);
  const error = ref<string | null>(null);
  const errorCode = ref<RoutingErrorCode | null>(null);
  const drawingFinished = ref(false);
  const bufferRadius = ref(DEFAULT_ROUTING_OPTIONS.bufferRadius);
  const unitRouteTimingMode = ref<UnitRouteTimingMode>("currentTime");
  const obstacleLayerIds = ref<Set<FeatureId>>(new Set());
  const obstacleFeatureIds = ref<Set<FeatureId>>(new Set());
  const obstaclePickerOpen = ref(false);

  const obstacleSelectionKey = computed(() => {
    const layers = [...obstacleLayerIds.value]
      .map((id) => String(id))
      .sort()
      .join(",");
    const features = [...obstacleFeatureIds.value]
      .map((id) => String(id))
      .sort()
      .join(",");
    return `L:${layers}|F:${features}`;
  });

  function toggleSelection(set: Set<FeatureId>, id: FeatureId) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  function toggleObstacleLayer(id: FeatureId) {
    obstacleLayerIds.value = toggleSelection(obstacleLayerIds.value, id);
  }

  function toggleObstacleFeature(id: FeatureId) {
    obstacleFeatureIds.value = toggleSelection(obstacleFeatureIds.value, id);
  }

  function clearObstacleSelection() {
    obstacleLayerIds.value = new Set();
    obstacleFeatureIds.value = new Set();
  }

  const draftWaypoints = computed(() =>
    combineRouteWaypoints(draftLegs.value.map((leg) => leg.waypoints)),
  );
  const draftTotalLengthMeters = computed(() =>
    draftLegs.value.reduce((sum, leg) => sum + leg.totalLengthMeters, 0),
  );
  const hasDraftLegs = computed(() => draftLegs.value.length > 0);
  const hasPreview = computed(() => Boolean(currentLegPreview.value));
  const canAddLeg = computed(
    () =>
      active.value &&
      destinationLocked.value &&
      Boolean(currentLegPreview.value) &&
      !isBusy.value,
  );
  const canFinishRoute = computed(
    () => active.value && (hasDraftLegs.value || canAddLeg.value) && !isBusy.value,
  );
  const fullRouteWaypoints = computed(() =>
    combineRouteWaypoints([
      ...draftLegs.value.map((leg) => leg.waypoints),
      ...(currentLegPreview.value ? [currentLegPreview.value.waypoints] : []),
    ]),
  );
  const fullRouteTotalLengthMeters = computed(
    () =>
      draftTotalLengthMeters.value +
      (currentLegPreview.value ? currentLegPreview.value.totalLengthMeters : 0),
  );
  const draftRoutePath = computed(() => createLinePath(draftWaypoints.value));
  const fullRoutePath = computed(() => createLinePath(fullRouteWaypoints.value));
  const pendingLegPath = computed((): Feature<LineString> | null => {
    const previewMatchesDestination = positionsEqual(
      currentLegPreview.value?.end ?? null,
      destination.value,
    );
    if (
      !active.value ||
      !start.value ||
      !destination.value ||
      positionsEqual(start.value, destination.value) ||
      (!isBusy.value && previewMatchesDestination)
    ) {
      return null;
    }

    return createLinePath([start.value, destination.value]);
  });
  const cursorLegPath = computed((): Feature<LineString> | null => {
    if (
      !active.value ||
      !destinationLocked.value ||
      !cursorDestination.value ||
      drawingFinished.value
    ) {
      return null;
    }

    const confirmedPosition =
      draftWaypoints.value[draftWaypoints.value.length - 1] ?? start.value;
    if (
      !confirmedPosition ||
      positionsEqual(confirmedPosition, cursorDestination.value)
    ) {
      return null;
    }

    return createLinePath([confirmedPosition, cursorDestination.value]);
  });
  const previewRoutePath = computed(() =>
    pendingLegPath.value ? draftRoutePath.value : fullRoutePath.value,
  );
  const draftRoute = computed<RoutingDraftRoute | null>(() => {
    if (!routeOrigin.value || fullRouteWaypoints.value.length < 2) return null;
    return {
      routeOrigin: routeOrigin.value,
      waypoints: fullRouteWaypoints.value,
      totalLengthMeters: fullRouteTotalLengthMeters.value,
    };
  });
  const displayStart = computed(() => routeOrigin.value ?? start.value);
  const displayDestination = computed(() => {
    if (pendingLegPath.value) {
      return destination.value;
    }
    if (currentLegPreview.value) {
      return currentLegPreview.value.end;
    }
    const fullRouteCoordinates = fullRouteWaypoints.value;
    if (fullRouteCoordinates.length > 0) {
      return fullRouteCoordinates[fullRouteCoordinates.length - 1] ?? null;
    }
    return destination.value;
  });

  function startRouting(nextOutcome: RoutingOutcome = outcome.value) {
    active.value = true;
    outcome.value = nextOutcome;
    start.value = null;
    routeOrigin.value = null;
    routeStartTime.value = null;
    destination.value = null;
    destinationLocked.value = false;
    cursorDestination.value = null;
    draftLegs.value = [];
    currentLegPreview.value = null;
    isBusy.value = false;
    error.value = null;
    errorCode.value = null;
    drawingFinished.value = false;
  }

  function resetPreview() {
    destination.value = null;
    destinationLocked.value = false;
    cursorDestination.value = null;
    currentLegPreview.value = null;
    isBusy.value = false;
    error.value = null;
    errorCode.value = null;
  }

  function cancelRouting() {
    active.value = false;
    start.value = null;
    routeOrigin.value = null;
    routeStartTime.value = null;
    destination.value = null;
    destinationLocked.value = false;
    cursorDestination.value = null;
    draftLegs.value = [];
    currentLegPreview.value = null;
    isBusy.value = false;
    error.value = null;
    errorCode.value = null;
    drawingFinished.value = false;
  }

  function setDrawingFinished(next: boolean) {
    drawingFinished.value = next;
  }

  function setStart(position: Position | null) {
    start.value = position;
    destination.value = null;
    destinationLocked.value = false;
    cursorDestination.value = null;
    currentLegPreview.value = null;
    error.value = null;
    errorCode.value = null;
  }

  function setRouteOrigin(position: Position | null, startTime?: number | null) {
    routeOrigin.value = position;
    routeStartTime.value = position ? (startTime ?? routeStartTime.value) : null;
  }

  function setDestination(position: Position | null, locked = false) {
    destination.value = position;
    destinationLocked.value = locked;
    if (locked) cursorDestination.value = null;
  }

  function setCursorDestination(position: Position | null) {
    cursorDestination.value = position;
  }

  function setPreview(nextPreview: RoutingPreview | null) {
    currentLegPreview.value = nextPreview;
    error.value = null;
    errorCode.value = null;
  }

  function appendCurrentLeg() {
    if (!currentLegPreview.value) return false;

    draftLegs.value = [...draftLegs.value, currentLegPreview.value];
    start.value = currentLegPreview.value.end;
    destination.value = null;
    destinationLocked.value = false;
    cursorDestination.value = null;
    currentLegPreview.value = null;
    isBusy.value = false;
    error.value = null;
    errorCode.value = null;
    return true;
  }

  function clearCurrentLeg() {
    resetPreview();
  }

  function setBusy(nextBusy: boolean) {
    isBusy.value = nextBusy;
  }

  function setError(message: string | null, code: RoutingErrorCode | null = null) {
    error.value = message;
    errorCode.value = code;
    if (message) {
      currentLegPreview.value = null;
    }
  }

  return {
    active,
    outcome,
    start,
    routeOrigin,
    routeStartTime,
    destination,
    destinationLocked,
    draftLegs,
    currentLegPreview,
    isBusy,
    error,
    errorCode,
    drawingFinished,
    bufferRadius,
    unitRouteTimingMode,
    obstacleLayerIds,
    obstacleFeatureIds,
    obstaclePickerOpen,
    obstacleSelectionKey,
    hasPreview,
    draftWaypoints,
    draftTotalLengthMeters,
    hasDraftLegs,
    canAddLeg,
    canFinishRoute,
    fullRouteWaypoints,
    fullRouteTotalLengthMeters,
    draftRoutePath,
    fullRoutePath,
    pendingLegPath,
    cursorLegPath,
    previewRoutePath,
    draftRoute,
    displayStart,
    displayDestination,
    startRouting,
    resetPreview,
    cancelRouting,
    setStart,
    setRouteOrigin,
    setDestination,
    setCursorDestination,
    setPreview,
    appendCurrentLeg,
    clearCurrentLeg,
    setBusy,
    setError,
    setDrawingFinished,
    toggleObstacleLayer,
    toggleObstacleFeature,
    clearObstacleSelection,
  };
});
