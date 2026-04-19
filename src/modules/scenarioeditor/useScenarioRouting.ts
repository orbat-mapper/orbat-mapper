import {
  computed,
  inject,
  onUnmounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import { useDebounceFn } from "@vueuse/core";
import type { Position } from "geojson";
import type { MapAdapter, MapEvent } from "@/geo/contracts/mapAdapter";
import { activeLayerKey, activeScenarioKey } from "@/components/injects";
import { injectStrict, nanoid } from "@/utils";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useRoutingStore } from "@/stores/routingStore";
import { extractRoutingObstacles } from "@/geo/routing/obstacleExtraction";
import {
  DEFAULT_ROUTING_OPTIONS,
  getShortestPathService,
  prepareRoutingObstacles,
} from "@/geo/routing/shortestPathService";
import {
  RoutingError,
  type RoutingPreview,
  type RoutingObstacleCollection,
  type RoutingOutcome,
} from "@/geo/routing/types";
import { reduceObstacleSafeWaypoints } from "@/geo/routing/waypointReduction";
import { combineRouteWaypoints } from "@/geo/routing/routeWaypoints";
import { useSelectedItems } from "@/stores/selectedStore";
import { convertSpeedToMetric } from "@/utils/convert";
import type { NUnit } from "@/types/internalModels";
import type { FullScenarioLayerItemsLayer } from "@/types/scenarioLayerItems";

function getRouteErrorMessage(error: unknown) {
  if (error instanceof RoutingError) {
    if (error.code === "no-route")
      return "No route could be found for the current destination.";
    if (error.code === "blocked-endpoint") {
      return (
        error.message || "The route start or destination is inside a routing obstacle."
      );
    }
    if (error.code === "invalid-obstacles") {
      return error.message
        ? `Routing obstacles are invalid: ${error.message}`
        : "Routing obstacles are invalid.";
    }
    if (error.code === "worker-error") {
      return error.message
        ? `Routing failed while computing the path: ${error.message}`
        : "Routing failed while computing the path.";
    }
    return error.message;
  }
  return "Routing failed unexpectedly.";
}

function positionsEqual(a: Position | null, b: Position | null) {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function getUnitRouteOrigin(
  unit: NUnit | null | undefined,
  fallbackTime: number,
): { position: Position; time: number } | null {
  if (!unit) return null;
  const locationStates = unit.state?.filter((entry) => entry.location) ?? [];
  const lastLocationState = locationStates[locationStates.length - 1];
  if (lastLocationState?.location) {
    return {
      position: lastLocationState.location,
      time: lastLocationState.t,
    };
  }
  if (unit._state?.location) {
    return {
      position: unit._state.location,
      time: unit._state.t ?? fallbackTime,
    };
  }
  return unit.location ? { position: unit.location, time: fallbackTime } : null;
}

export function useScenarioRouting(
  mapSource: MaybeRefOrGetter<MapAdapter | null | undefined>,
) {
  const activeScenario = injectStrict(activeScenarioKey);
  const activeLayerId = inject(activeLayerKey, ref<string | number | null>(null));
  const toolbarStore = useMainToolbarStore();
  const mapSelectStore = useMapSelectStore();
  const routingStore = useRoutingStore();
  const service = getShortestPathService();
  const { activeUnitId, selectedUnitIds, activeFeatureId } = useSelectedItems();

  const previousSelectState = ref<null | {
    hoverEnabled: boolean;
    unitSelectEnabled: boolean;
    featureSelectEnabled: boolean;
  }>(null);
  const previewRequestToken = ref(0);
  let cachedObstacleLayers: FullScenarioLayerItemsLayer[] | null = null;
  let cachedObstacleSelectionKey: string | null = null;
  let cachedObstacleBufferRadius: number | null = null;
  let cachedExtractedObstacles: RoutingObstacleCollection | null = null;
  let cachedPreparedLayers: FullScenarioLayerItemsLayer[] | null = null;
  let cachedPreparedBufferRadius: number | null = null;
  let cachedPreparedSelectionKey: string | null = null;
  let cachedPreparedObstacles: RoutingObstacleCollection | null = null;
  let cachedPreparedObstacleKey: string | null = null;
  let nextPreparedObstacleKey = 1;

  let stopClick: (() => void) | null = null;
  let stopMove: (() => void) | null = null;
  let stopDblClick: (() => void) | null = null;

  const activeRoutingUnit = computed(() => {
    if (activeUnitId.value) {
      return activeScenario.helpers.getUnitById(activeUnitId.value) ?? null;
    }
    if (selectedUnitIds.value.size === 1) {
      const [unitId] = [...selectedUnitIds.value];
      return activeScenario.helpers.getUnitById(unitId) ?? null;
    }
    return null;
  });

  const activeRoutingUnitName = computed(
    () => activeRoutingUnit.value?.shortName || activeRoutingUnit.value?.name || null,
  );

  function restoreSelectionState() {
    if (!previousSelectState.value) return;
    mapSelectStore.hoverEnabled = previousSelectState.value.hoverEnabled;
    mapSelectStore.unitSelectEnabled = previousSelectState.value.unitSelectEnabled;
    mapSelectStore.featureSelectEnabled = previousSelectState.value.featureSelectEnabled;
    previousSelectState.value = null;
  }

  function detachListeners() {
    stopClick?.();
    stopMove?.();
    stopDblClick?.();
    stopClick = null;
    stopMove = null;
    stopDblClick = null;
  }

  function getExtractedRoutingObstacles() {
    const layers = activeScenario.geo.layerItemsLayers.value;
    const selectionKey = routingStore.obstacleSelectionKey;
    const bufferRadius = routingStore.bufferRadius;
    if (
      cachedObstacleLayers === layers &&
      cachedObstacleSelectionKey === selectionKey &&
      cachedObstacleBufferRadius === bufferRadius &&
      cachedExtractedObstacles
    ) {
      return cachedExtractedObstacles;
    }

    const obstacles = extractRoutingObstacles(
      layers,
      {
        layerIds: routingStore.obstacleLayerIds,
        featureIds: routingStore.obstacleFeatureIds,
      },
      {
        // Points need a minimal polygon footprint so the later route buffer can expand them.
        pointBufferMeters: bufferRadius > 0 ? 0.01 : 0,
      },
    );
    cachedObstacleLayers = layers;
    cachedObstacleSelectionKey = selectionKey;
    cachedObstacleBufferRadius = bufferRadius;
    cachedExtractedObstacles = obstacles;
    return obstacles;
  }

  function getPreparedRoutingObstacles() {
    const layers = activeScenario.geo.layerItemsLayers.value;
    const bufferRadius = routingStore.bufferRadius;
    const selectionKey = routingStore.obstacleSelectionKey;
    if (
      cachedPreparedLayers === layers &&
      cachedPreparedBufferRadius === bufferRadius &&
      cachedPreparedSelectionKey === selectionKey &&
      cachedPreparedObstacles &&
      cachedPreparedObstacleKey
    ) {
      return {
        obstacles: cachedPreparedObstacles,
        obstacleCacheKey: cachedPreparedObstacleKey,
      };
    }

    const routeOptions = {
      ...DEFAULT_ROUTING_OPTIONS,
      bufferObstacles: true,
      bufferRadius,
    };
    const obstacles = prepareRoutingObstacles(
      getExtractedRoutingObstacles(),
      routeOptions,
    );
    cachedPreparedLayers = layers;
    cachedPreparedBufferRadius = bufferRadius;
    cachedPreparedSelectionKey = selectionKey;
    cachedPreparedObstacles = obstacles;
    cachedPreparedObstacleKey = `prepared:${nextPreparedObstacleKey}`;
    nextPreparedObstacleKey += 1;
    return {
      obstacles,
      obstacleCacheKey: cachedPreparedObstacleKey,
    };
  }

  function clearSession(closeToolbar = false) {
    previewRequestToken.value += 1;
    routingStore.cancelRouting();
    detachListeners();
    restoreSelectionState();
    if (closeToolbar) {
      toolbarStore.clearToolbar();
    }
  }

  function initializeUnitOutcome() {
    const origin = getUnitRouteOrigin(
      activeRoutingUnit.value,
      activeScenario.store.state.currentTime,
    );
    if (!origin) {
      routingStore.setStart(null);
      routingStore.setRouteOrigin(null);
      routingStore.setError(null);
      return;
    }

    routingStore.setStart(origin.position);
    routingStore.setRouteOrigin(origin.position, origin.time);
    routingStore.setError(null);
  }

  function initializeOutcome() {
    if (!routingStore.active) return;
    if (routingStore.outcome === "unitTrack") {
      initializeUnitOutcome();
      return;
    }
    routingStore.setStart(null);
    routingStore.setRouteOrigin(null);
    routingStore.resetPreview();
  }

  function createRoutingPreview(
    result: Awaited<ReturnType<typeof service.computeRoute>>,
    start: Position,
    destination: Position,
  ): RoutingPreview {
    return {
      path: result.path,
      start,
      end: destination,
      totalLengthMeters: result.totalLengthMeters,
      waypoints: result.waypoints,
    };
  }

  async function updatePreview(destination: Position, locked = false) {
    const start = routingStore.start;
    if (!start) return;
    if (
      !locked &&
      positionsEqual(destination, routingStore.destination) &&
      (routingStore.isBusy ||
        positionsEqual(destination, routingStore.currentLegPreview?.end ?? null))
    ) {
      return;
    }

    const token = ++previewRequestToken.value;
    routingStore.setDestination(destination, locked);
    routingStore.setBusy(true);
    routingStore.setError(null);

    try {
      const routeOptions = {
        ...DEFAULT_ROUTING_OPTIONS,
        bufferObstacles: true,
        bufferRadius: routingStore.bufferRadius,
      };
      const { obstacles, obstacleCacheKey } = getPreparedRoutingObstacles();
      const result = await service.computeRoute({
        start,
        end: destination,
        obstacles,
        preparedObstacles: obstacles,
        obstacleCacheKey,
        options: routeOptions,
      });

      if (token !== previewRequestToken.value || !routingStore.active) return;

      routingStore.setPreview(createRoutingPreview(result, start, destination));
      routingStore.setDestination(destination, locked);
    } catch (error) {
      if (token !== previewRequestToken.value || !routingStore.active) return;
      if (error instanceof RoutingError && error.code === "cancelled") return;
      routingStore.setError(
        getRouteErrorMessage(error),
        error instanceof RoutingError ? error.code : null,
      );
    } finally {
      if (token === previewRequestToken.value) {
        routingStore.setBusy(false);
      }
    }
  }

  const debouncedPreviewUpdate = useDebounceFn((destination: Position) => {
    void updatePreview(destination);
  }, 120);

  function getEventUnitId(event: Pick<MapEvent, "targetUnitId" | "unitId">) {
    return event.targetUnitId ?? event.unitId ?? null;
  }

  function handleTrackUnitClick(unitId: string) {
    const currentUnitId = activeRoutingUnit.value?.id;
    if (currentUnitId === unitId) {
      return;
    }

    previewRequestToken.value += 1;
    activeUnitId.value = unitId;
    routingStore.startRouting("unitTrack");
    initializeUnitOutcome();
  }

  function handleMapClick(event: MapEvent) {
    if (!routingStore.active || !event.coordinate) return;
    event.stopPropagation();

    const eventUnitId = getEventUnitId(event);
    if (routingStore.outcome === "unitTrack" && eventUnitId) {
      handleTrackUnitClick(eventUnitId);
      return;
    }

    if (routingStore.drawingFinished) return;

    if (
      routingStore.destinationLocked &&
      routingStore.currentLegPreview &&
      positionsEqual(event.coordinate, routingStore.currentLegPreview.end)
    ) {
      addRouteLeg();
      return;
    }

    if (routingStore.outcome === "feature" && !routingStore.start) {
      routingStore.setRouteOrigin(
        event.coordinate,
        activeScenario.store.state.currentTime,
      );
      routingStore.setStart(event.coordinate);
      routingStore.resetPreview();
      return;
    }

    if (!routingStore.start) {
      routingStore.setError(
        "Routing needs a valid starting point before selecting a destination.",
      );
      return;
    }

    void updatePreview(event.coordinate, true);
  }

  function handlePointerMove(event: { coordinate?: Position }) {
    if (
      !routingStore.active ||
      routingStore.drawingFinished ||
      !event.coordinate ||
      !routingStore.start
    ) {
      return;
    }

    if (routingStore.destinationLocked) {
      routingStore.setCursorDestination(event.coordinate);
      return;
    }

    routingStore.setDestination(event.coordinate);
    debouncedPreviewUpdate(event.coordinate);
  }

  function attachListeners(map: MapAdapter) {
    if (!previousSelectState.value) {
      previousSelectState.value = {
        hoverEnabled: mapSelectStore.hoverEnabled,
        unitSelectEnabled: mapSelectStore.unitSelectEnabled,
        featureSelectEnabled: mapSelectStore.featureSelectEnabled,
      };
      mapSelectStore.hoverEnabled = false;
      mapSelectStore.unitSelectEnabled = false;
      mapSelectStore.featureSelectEnabled = false;
    }

    stopClick = map.on("click", handleMapClick);
    stopMove = map.on("pointermove", handlePointerMove);
    stopDblClick = map.on("dblclick", handleMapDoubleClick);
  }

  function handleMapDoubleClick(event: {
    coordinate?: Position;
    stopPropagation(): void;
  }) {
    if (!routingStore.active || routingStore.drawingFinished) return;
    event.stopPropagation();
    endRouting();
  }

  function endRouting() {
    if (!routingStore.active || routingStore.drawingFinished) return;
    if (routingStore.canAddLeg) {
      routingStore.appendCurrentLeg();
    } else {
      routingStore.clearCurrentLeg();
    }
    previewRequestToken.value += 1;
    routingStore.setDrawingFinished(true);
  }

  function getTravelEndTime(unit: NUnit, totalLengthMeters: number, startTime: number) {
    const speedValue = unit.properties?.averageSpeed || unit.properties?.maxSpeed;
    const speed = speedValue
      ? convertSpeedToMetric(speedValue.value, speedValue.uom)
      : convertSpeedToMetric(30, "km/h");

    if (speed <= 0) return startTime;
    return Math.round(startTime + (totalLengthMeters / speed) * 1000);
  }

  function getFinalLegs(includeCurrentPreview: boolean) {
    return [
      ...routingStore.draftLegs,
      ...(includeCurrentPreview && routingStore.currentLegPreview
        ? [routingStore.currentLegPreview]
        : []),
    ];
  }

  function getFinalTotalLengthMeters(includeCurrentPreview: boolean) {
    return getFinalLegs(includeCurrentPreview).reduce(
      (sum, leg) => sum + leg.totalLengthMeters,
      0,
    );
  }

  function getReducedCombinedWaypoints(legs: RoutingPreview[]) {
    const preparedObstacles = getPreparedRoutingObstacles().obstacles;
    return combineRouteWaypoints(
      legs.map((leg) => reduceObstacleSafeWaypoints(leg.waypoints, preparedObstacles)),
    );
  }

  function addRouteLeg() {
    if (!routingStore.canAddLeg) return false;
    return routingStore.appendCurrentLeg();
  }

  function clearCurrentLeg() {
    routingStore.clearCurrentLeg();
    return true;
  }

  function finishUnitRoute() {
    const unit = activeRoutingUnit.value;
    const includeCurrentPreview = routingStore.canAddLeg;
    const legs = getFinalLegs(includeCurrentPreview);
    if (!unit || legs.length === 0) {
      routingStore.setError("Select a single unit before finishing a routed track.");
      return false;
    }

    const reducedWaypoints = getReducedCombinedWaypoints(legs);
    const finalDestination = reducedWaypoints[reducedWaypoints.length - 1] ?? null;
    if (!finalDestination) {
      routingStore.setError("The routed track needs a valid destination before saving.");
      return false;
    }

    const currentTime = activeScenario.store.state.currentTime;
    const routeStartTime = routingStore.routeStartTime ?? currentTime;
    const destinationTime =
      routingStore.unitRouteTimingMode === "speedArrival"
        ? getTravelEndTime(
            unit,
            getFinalTotalLengthMeters(includeCurrentPreview),
            routeStartTime,
          )
        : currentTime;

    activeScenario.geo.addUnitPosition(unit.id, finalDestination, destinationTime, {
      via: reducedWaypoints.slice(1, -1),
      viaStartTime: routeStartTime,
    });
    return true;
  }

  function finishFeatureRoute() {
    const fullWaypoints = combineRouteWaypoints(
      getFinalLegs(routingStore.canAddLeg).map((leg) => leg.waypoints),
    );
    if (fullWaypoints.length < 2) {
      routingStore.setError("Finish at least one routed leg before saving a route.");
      return false;
    }
    const targetLayerId =
      activeLayerId.value ?? activeScenario.geo.layerItemsLayers.value[0]?.id;
    const targetLayer = targetLayerId
      ? activeScenario.geo.getLayerById(targetLayerId)
      : null;
    if (!targetLayer) {
      routingStore.setError(
        "Select a target overlay layer before saving a routed feature.",
      );
      return false;
    }

    const newFeatureId = activeScenario.geo.addFeature(
      {
        id: nanoid(),
        kind: "geometry",
        name: `Route ${targetLayer.items.length + 1}`,
        geometryMeta: {
          geometryKind: "LineString",
        },
        geometry: {
          type: "LineString",
          coordinates: fullWaypoints,
        },
        style: { ...toolbarStore.currentDrawStyle },
      },
      targetLayer.id,
    );

    activeFeatureId.value = newFeatureId;
    return true;
  }

  function finishRoute() {
    if (!routingStore.canFinishRoute) return false;

    const saved =
      routingStore.outcome === "unitTrack" ? finishUnitRoute() : finishFeatureRoute();
    if (!saved) return false;

    clearSession(true);
    return true;
  }

  function selectOutcome(nextOutcome: RoutingOutcome) {
    routingStore.startRouting(nextOutcome);
    initializeOutcome();
  }

  function cancelRoute() {
    clearSession(true);
  }

  function handleEscape() {
    if (toolbarStore.currentToolbar !== "route") return false;

    if (
      routingStore.destination ||
      routingStore.currentLegPreview ||
      routingStore.isBusy ||
      routingStore.error
    ) {
      routingStore.clearCurrentLeg();
      previewRequestToken.value += 1;
      return true;
    }

    clearSession(true);
    return true;
  }

  watch(
    () => toolbarStore.currentToolbar === "route",
    (isRouteToolbarActive) => {
      if (isRouteToolbarActive) {
        routingStore.startRouting(routingStore.outcome);
        initializeOutcome();
        return;
      }
      clearSession();
    },
    { immediate: true },
  );

  watch(
    () => [routingStore.active, toValue(mapSource)] as const,
    ([active, map]) => {
      detachListeners();
      restoreSelectionState();
      if (active && map) {
        attachListeners(map);
      }
    },
    { immediate: true },
  );

  watch(
    () => [
      routingStore.outcome,
      activeUnitId.value,
      [...selectedUnitIds.value.values()].join("|"),
    ],
    () => {
      if (routingStore.active) {
        routingStore.startRouting(routingStore.outcome);
        initializeOutcome();
      }
    },
  );

  onUnmounted(() => {
    clearSession();
  });

  return {
    routingStore,
    activeRoutingUnitName,
    addRouteLeg,
    clearCurrentLeg,
    finishRoute,
    cancelRoute,
    closeRouting: () => clearSession(true),
    endRouting,
    handleEscape,
    selectOutcome,
  };
}
