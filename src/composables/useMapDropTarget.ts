import { computed, onMounted, onUnmounted, ref } from "vue";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { isUnitDragItem } from "@/types/draggables";
import type { TScenario } from "@/scenariostore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";
import type { Position } from "geojson";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import { useRecordingStore } from "@/stores/recordingStore";
import { useNotifications } from "@/composables/notifications";

export interface MapDropTargetOptions {
  /** The scenario to add unit positions to */
  activeScenario: TScenario;
  /** Map adapter for coordinate conversion and DOM access */
  mapAdapter: MapAdapter;
  /** Called after units are dropped and positions updated */
  onUnitsDropped?: (unitIds: Set<string>, position: Position) => void;
}

export function useMapDropTarget(options: MapDropTargetOptions) {
  const { activeScenario, mapAdapter, onUnitsDropped } = options;
  const {
    geo,
    store: { groupUpdate },
  } = activeScenario;
  const mStore = useMapSettingsStore();
  const recordingStore = useRecordingStore();
  const { send } = useNotifications();
  const { selectedUnitIds } = useSelectedItems();
  let dndCleanup = () => {};
  const isDragging = ref(false);
  const dropPosition = ref<Position>([0, 0]);
  const blockedHintShown = ref(false);

  const formattedPosition = computed(() =>
    isDragging.value
      ? getCoordinateFormatFunction(mStore.coordinateFormat)(dropPosition.value)
      : "",
  );

  onMounted(() => {
    const element = mapAdapter.getTargetElement();
    if (!element) return;
    dndCleanup = dropTargetForElements({
      element,
      canDrop: ({ source }) => isUnitDragItem(source.data),
      getData: ({ input }) => {
        return { position: mapAdapter.getEventCoordinate(input as MouseEvent) };
      },
      onDragEnter: ({ source }) => {
        if (!isUnitDragItem(source.data)) return;
        if (!recordingStore.isRecordingLocation) {
          if (!blockedHintShown.value) {
            send({
              message: "Enable Unit position in Rec to place units on the map.",
            });
            blockedHintShown.value = true;
          }
          return;
        }
        isDragging.value = true;
      },
      onDragLeave: () => {
        isDragging.value = false;
        blockedHintShown.value = false;
      },
      onDrag: ({ self, source }) => {
        if (!isUnitDragItem(source.data) || !recordingStore.isRecordingLocation) return;
        dropPosition.value = self.data.position as Position;
      },
      onDrop: ({ source, self }) => {
        isDragging.value = false;
        blockedHintShown.value = false;
        if (!recordingStore.isRecordingLocation) return;
        const dragData = source.data;
        if (!isUnitDragItem(dragData)) return;

        const pos = self.data.position as Position;
        const unitIds = new Set([...selectedUnitIds.value, dragData.unit.id]);
        groupUpdate(() => {
          for (const unitId of unitIds) {
            geo.addUnitPosition(unitId, pos);
          }
        });
        onUnitsDropped?.(unitIds, pos);
      },
    });
  });

  onUnmounted(() => dndCleanup());

  return { isDragging, dropPosition, formattedPosition };
}
