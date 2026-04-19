import type { Map as MlMap, MapMouseEvent, MapTouchEvent, PointLike } from "maplibre-gl";
import { onUnmounted, ref, watch, type Ref } from "vue";
import { storeToRefs } from "pinia";
import type { TScenario } from "@/scenariostore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useUnitSettingsStore } from "@/stores/geoStore";
import {
  normalizeRotation,
  ROTATION_EPSILON,
  shortestRotationDelta,
  toHeadingFromNorthDegrees,
} from "@/geo/rotation";

type RotateTarget = { id: string; initialRotation: number; rotation: number };

export interface MaplibreRotateInteractionOptions {
  /** Layer id of the unit symbol layer. Defaults to `"unitLayer"`. */
  unitLayerId?: string;
  /** Called on every drag frame with the current rotation overrides. */
  onPreview: (rotationOverrides: ReadonlyMap<string, number>) => void;
  /** Called when the drag ends (commit, cancel, or no movement). */
  onPreviewEnd: () => void;
}

export interface MaplibreRotateInteraction {
  /** True while the user is actively dragging to rotate. */
  isRotating: Ref<boolean>;
  /**
   * Returns the set of unit ids that would be rotated if the user clicked
   * `clickedUnitId`: the clicked unit and its selection group, minus locked
   * units. Exposed so the host can drive hover-cursor hints.
   */
  getRotatableUnitIds: (clickedUnitId: string | undefined) => string[];
}

/**
 * Drag-to-rotate interaction for unit symbols on a MapLibre map. Activates when
 * `rotateUnitEnabled` is true in the unit settings store and mirrors the
 * OpenLayers `useRotateInteraction` composable (`src/composables/geoUnitLayers.ts`).
 *
 * The host is responsible for re-rendering unit features in response to the
 * `onPreview` / `onPreviewEnd` callbacks.
 */
export function useMaplibreRotateInteraction(
  mlMap: MlMap,
  activeScenario: TScenario,
  options: MaplibreRotateInteractionOptions,
): MaplibreRotateInteraction {
  const unitLayerId = options.unitLayerId ?? "unitLayer";
  const { unitActions } = activeScenario;
  const getUnitById = activeScenario.helpers?.getUnitById ?? (() => undefined);
  const { selectedUnitIds } = useSelectedItems();
  const { rotateUnitEnabled } = storeToRefs(useUnitSettingsStore());

  const isRotating = ref(false);

  let state: {
    anchorLngLat: [number, number];
    startHeading: number;
    targets: RotateTarget[];
    rotationOverrides: Map<string, number>;
    interactions: { dragPanEnabled: boolean; touchZoomRotateEnabled: boolean };
    moved: boolean;
  } | null = null;

  function suspendMapDragInteractions() {
    const dragPanEnabled = mlMap.dragPan.isEnabled();
    const touchZoomRotateEnabled = mlMap.touchZoomRotate.isEnabled();
    if (dragPanEnabled) mlMap.dragPan.disable();
    if (touchZoomRotateEnabled) mlMap.touchZoomRotate.disable();
    return { dragPanEnabled, touchZoomRotateEnabled };
  }

  function restoreMapDragInteractions(i: {
    dragPanEnabled: boolean;
    touchZoomRotateEnabled: boolean;
  }) {
    if (i.dragPanEnabled && !mlMap.dragPan.isEnabled()) mlMap.dragPan.enable();
    if (i.touchZoomRotateEnabled && !mlMap.touchZoomRotate.isEnabled()) {
      mlMap.touchZoomRotate.enable();
    }
  }

  function getRotatableUnitIds(clickedUnitId: string | undefined): string[] {
    if (!clickedUnitId || unitActions.isUnitLocked(clickedUnitId)) return [];
    const candidateIds = selectedUnitIds.value.has(clickedUnitId)
      ? [...selectedUnitIds.value]
      : [clickedUnitId];
    return candidateIds.filter((unitId) => {
      const unit = getUnitById(unitId);
      return !!unit?._state?.location && !unitActions.isUnitLocked(unitId);
    });
  }

  function pointerHeadingDegrees(
    anchorLngLat: [number, number],
    point: { x: number; y: number },
  ): number {
    const anchorPx = mlMap.project(anchorLngLat);
    // Pixel y increases downward; flip so positive y = screen-up. Combine with
    // map bearing so the stored rotation is a geographic compass heading.
    const screenHeading = toHeadingFromNorthDegrees(
      [anchorPx.x, -anchorPx.y],
      [point.x, -point.y],
    );
    return normalizeRotation(screenHeading + mlMap.getBearing());
  }

  function queryUnitIdAtPoint(point: PointLike): string | undefined {
    const hits = mlMap.queryRenderedFeatures(point);
    const topHit = hits.find((f) => f.layer.id === unitLayerId);
    const id = topHit?.properties?.id;
    return typeof id === "string" ? id : undefined;
  }

  function onRotateStart(e: MapMouseEvent | MapTouchEvent) {
    if (!rotateUnitEnabled.value) return;
    if (e.type === "mousedown" && (e.originalEvent as MouseEvent).button !== 0) return;

    const clickedUnitId = queryUnitIdAtPoint(e.point);
    const rotatableIds = getRotatableUnitIds(clickedUnitId);
    if (!rotatableIds.length) return;

    const anchorCoords = rotatableIds
      .map((id) => getUnitById(id)?._state?.location)
      .filter((c): c is [number, number] => !!c);
    if (!anchorCoords.length) return;

    const anchorLng = anchorCoords.reduce((s, c) => s + c[0], 0) / anchorCoords.length;
    const anchorLat = anchorCoords.reduce((s, c) => s + c[1], 0) / anchorCoords.length;
    const anchorLngLat: [number, number] = [anchorLng, anchorLat];

    const targets: RotateTarget[] = rotatableIds.map((id) => {
      const rotation = normalizeRotation(getUnitById(id)?._state?.symbolRotation ?? 0);
      return { id, initialRotation: rotation, rotation };
    });
    const rotationOverrides = new Map<string, number>(
      targets.map((t) => [t.id, t.rotation]),
    );

    state = {
      anchorLngLat,
      startHeading: pointerHeadingDegrees(anchorLngLat, e.point),
      targets,
      rotationOverrides,
      interactions: suspendMapDragInteractions(),
      moved: false,
    };
    isRotating.value = true;
    e.preventDefault();
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
    mlMap.getCanvas().style.cursor = "grabbing";
  }

  function onRotateMove(e: MapMouseEvent | MapTouchEvent) {
    if (!state) return;
    const currentHeading = pointerHeadingDegrees(state.anchorLngLat, e.point);
    const delta = shortestRotationDelta(currentHeading, state.startHeading);
    state.targets.forEach((target) => {
      target.rotation = normalizeRotation(target.initialRotation + delta);
      state!.rotationOverrides.set(target.id, target.rotation);
    });
    state.moved = true;
    mlMap.getCanvas().style.cursor = "grabbing";
    options.onPreview(state.rotationOverrides);
  }

  function finalize(commitChanges: boolean) {
    if (!state) return;
    const current = state;
    state = null;
    isRotating.value = false;
    restoreMapDragInteractions(current.interactions);
    mlMap.getCanvas().style.cursor = "";

    if (commitChanges && current.moved) {
      const changed = current.targets.filter(
        (t) => Math.abs(t.rotation - t.initialRotation) > ROTATION_EPSILON,
      );
      if (changed.length) {
        const commit = () => {
          changed.forEach((target) => {
            unitActions.addUnitStateEntry(
              target.id,
              {
                t: activeScenario.store.state.currentTime,
                symbolRotation: target.rotation,
              },
              true,
            );
          });
        };
        if (activeScenario.store.groupUpdate) {
          activeScenario.store.groupUpdate(commit);
        } else {
          commit();
        }
      }
    }
    options.onPreviewEnd();
  }

  function onRotateEnd() {
    finalize(true);
  }

  function cancel() {
    finalize(false);
  }

  const stopWatch = watch(rotateUnitEnabled, (enabled) => {
    if (!enabled) cancel();
  });

  mlMap.on("mousedown", onRotateStart);
  mlMap.on("touchstart", onRotateStart);
  mlMap.on("mousemove", onRotateMove);
  mlMap.on("touchmove", onRotateMove);
  mlMap.on("mouseup", onRotateEnd);
  mlMap.on("touchend", onRotateEnd);
  mlMap.on("touchcancel", onRotateEnd);

  onUnmounted(() => {
    stopWatch();
    mlMap.off("mousedown", onRotateStart);
    mlMap.off("touchstart", onRotateStart);
    mlMap.off("mousemove", onRotateMove);
    mlMap.off("touchmove", onRotateMove);
    mlMap.off("mouseup", onRotateEnd);
    mlMap.off("touchend", onRotateEnd);
    mlMap.off("touchcancel", onRotateEnd);
  });

  return { isRotating, getRotatableUnitIds };
}
