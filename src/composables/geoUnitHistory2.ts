import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { EntityId, HistoryAction } from "@/types/base";
import { Coordinate } from "ol/coordinate";
import { toLonLat } from "ol/proj";
import {
  createUnitHistoryLayers,
  createUnitPathFeatures,
  VIA_TIME,
} from "@/geo/history2";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { LineString, Point } from "ol/geom";
import { Feature, MapBrowserEvent } from "ol";
import { MaybeRef } from "@vueuse/core";
import { ref, watch } from "vue";

import { useSelectedItems } from "@/stores/selectedStore";
import { altKeyOnly, singleClick } from "ol/events/condition";

function squaredDistance(a: number[], b: number[]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function deleteCondition(mapBrowserEvent: any) {
  return altKeyOnly(mapBrowserEvent) && singleClick(mapBrowserEvent);
}

/**
 * Code for displaying and manipulating unit history on the map
 */
export function useUnitHistory2(
  options: Partial<{
    showHistory: MaybeRef<boolean>;
    editHistory: MaybeRef<boolean>;
  }> = {},
) {
  const showHistoryRef = ref(options.showHistory || true);
  const editHistoryRef = ref(options.editHistory || true);

  const {
    geo,
    unitActions,
    store: { onUndoRedo, state },
  } = injectStrict(activeScenarioKey);
  const { selectedUnitIds } = useSelectedItems();
  const { waypointLayer, historyLayer, legLayer, viaLayer, arcLayer } =
    createUnitHistoryLayers();
  historyLayer.set("title", "History");

  onUndoRedo(({ meta }) => {
    if (meta?.value && selectedUnitIds.value.has(meta.value as string)) drawHistory();
  });

  const historyModify = new Modify({ source: legLayer.getSource()!, deleteCondition });
  watch(
    editHistoryRef,
    (v) => {
      historyModify.setActive(v);
      drawHistory();
    },
    { immediate: true },
  );

  let preGeometry: LineString | undefined;
  let prePointGeometry: Point | undefined;

  function handleLineString(f: Feature<LineString>, evt: ModifyEvent) {
    const postGeometry = f.getGeometry();
    let action: HistoryAction;
    const preLength = preGeometry?.getCoordinates().length || 0;
    const postLength = postGeometry?.getCoordinates().length || 0;
    const preCoords = preGeometry?.getCoordinates() || [];
    const postCoords = postGeometry?.getCoordinates() || [];
    let elementIndex = -1;
    let isVia = false;
    if (preLength === postLength) {
      action = "modify";

      postCoords.every((v, i, a) => {
        const b = preCoords[i];
        const isEq = v[0] === b[0] && v[1] === b[1] && v[2] === b[2];
        if (!isEq) {
          elementIndex = i;
          if (v[2] === VIA_TIME) isVia = true;
        }
        return isEq;
      });
    } else if (preLength < postLength) {
      action = "add";
      elementIndex = postCoords.findIndex((e) => e[2] === 0);
      isVia = true;
    } else {
      action = "remove";
      preCoords.every((v, i, a) => {
        const b = postCoords[i];
        const isEq = b && v[0] === b[0] && v[1] === b[1] && v[2] === b[2];
        if (!isEq) {
          elementIndex = i;
          if (v[2] === VIA_TIME) isVia = true;
        }
        return isEq;
      });
    }

    if (elementIndex === -1) {
      if (postLength === 2) {
        action = "remove";
        const coordinate = (<ModifyEvent>evt).mapBrowserEvent.coordinate;
        const dista = squaredDistance(coordinate, postCoords[0]);
        const distb = squaredDistance(coordinate, postCoords[1]);
        if (dista < distb) {
          elementIndex = 0;
        } else {
          elementIndex = 1;
        }
      }
    }
    return { postGeometry, action, preCoords, postCoords, elementIndex, isVia };
  }

  historyModify.on(["modifystart", "modifyend"], (evt) => {
    const f = (evt as ModifyEvent).features.item(0) as Feature<LineString | Point>;
    const geometryType = f.getGeometry()?.getType();
    if (geometryType === "Point") {
    } else {
    }
    if (evt.type === "modifystart") {
      preGeometry =
        geometryType === "LineString" ? <LineString>f.getGeometry()?.clone() : undefined;
    } else if (evt.type === "modifyend") {
      if (geometryType === "LineString") {
        let { postGeometry, action, preCoords, postCoords, elementIndex, isVia } =
          handleLineString(f as Feature<LineString>, evt as ModifyEvent);

        if (elementIndex === -1) {
          console.warn("Cannot modify geometry");
          return;
        }

        handleHistoryFeatureChange(
          f.get("unitId"),
          action,
          elementIndex,
          isVia,
          postCoords,
          preCoords,
        );

        const updatedGeometry = postGeometry
          ?.getCoordinates()
          .map((e) => [e[0], e[1], e[2] === 0 ? VIA_TIME : e[2]]);
        if (updatedGeometry) f.getGeometry()?.setCoordinates(updatedGeometry, "XYM");
      } else if (geometryType === "Point") {
        const unitId = f.get("unitId");
        const unit = unitActions.getUnitById(unitId);
        if (!unit) return;
        const action = deleteCondition((<ModifyEvent>evt).mapBrowserEvent)
          ? "remove"
          : "modify";
        const postCoords = [(<Feature<Point>>f).getGeometry()?.getCoordinates()!];
        const elementIndex = 0;
        handleHistoryFeatureChange(
          unitId,
          action,
          elementIndex,
          false,
          postCoords,
          postCoords,
        );
      }
      drawHistory();
    }
  });

  function handleHistoryFeatureChange(
    unitId: EntityId,
    action: HistoryAction,
    elementIndex: number,
    isVia: boolean,
    postCoordinates: Coordinate[],
    preCoordinates: Coordinate[],
  ) {
    const unit = unitActions.getUnitById(unitId);
    const changedCoords = postCoordinates[elementIndex];
    const llChangedCoords =
      changedCoords && toLonLat([changedCoords[0], changedCoords[1]]);
    if (!unit) return;
    if (isVia) {
      let stateElementIndex = -1;
      let viaElementIndex = -1;
      let newIndex = -1;
      if (action === "remove") {
        const a = [...preCoordinates.entries()].filter(
          ([i, c]) => !(c[2] === VIA_TIME || c[2] === 0),
        );
        stateElementIndex = a.findIndex(([i]) => {
          return i > elementIndex;
        });
        viaElementIndex = elementIndex - a[stateElementIndex - 1][0] - 1;
        // @ts-ignore
        newIndex = unit?.state?.findIndex((s) => s.t === a[stateElementIndex][1][2]);
      } else {
        const a = [...postCoordinates.entries()].filter(
          ([i, c]) => !(c[2] === VIA_TIME || c[2] === 0),
        );
        stateElementIndex = a.findIndex(([i], idx) => {
          return i > elementIndex;
        });
        viaElementIndex = elementIndex - a[stateElementIndex - 1][0] - 1;
        // @ts-ignore
        newIndex = unit?.state?.findIndex((s) => s.t === a[stateElementIndex][1][2]);
      }
      unitActions.updateUnitStateVia(
        unitId,
        action,
        newIndex,
        viaElementIndex,
        llChangedCoords,
      );
    } else {
      if (action === "remove") {
        const index = unit?.state?.findIndex(
          (s) => s.t === preCoordinates[elementIndex][2],
        );
        if (index !== undefined) unitActions.deleteUnitStateEntry(unitId, index);
      } else if (action === "modify") {
        geo.addUnitPosition(unitId, llChangedCoords, changedCoords[2]);
      }
    }
  }

  function drawHistory() {
    const historyLayerSource = legLayer.getSource()!;
    const waypointLayerSource = waypointLayer.getSource()!;
    const viaLayerSource = viaLayer.getSource()!;
    const arcLayerSource = arcLayer.getSource()!;
    arcLayer.setOpacity(editHistoryRef.value ? 0.4 : 1);
    historyLayerSource.clear();
    waypointLayerSource.clear();
    arcLayerSource.clear();
    if (!showHistoryRef.value) return;
    selectedUnitIds.value.forEach((unitId) => {
      const unit = state.getUnitById(unitId);
      if (!unit) return;

      const { legFeatures, waypointFeatures, viaPointFeatures, arcFeatures } =
        createUnitPathFeatures(unit, editHistoryRef.value);
      arcLayerSource.addFeatures(arcFeatures);
      historyLayerSource.addFeatures(editHistoryRef.value ? legFeatures : []);
      waypointLayerSource.addFeatures(waypointFeatures);
      viaLayerSource.addFeatures(viaPointFeatures);
    });
  }

  watch(
    () => showHistoryRef.value && [...selectedUnitIds.value.values()],
    () => drawHistory(),
  );

  return {
    historyLayer,
    drawHistory,
    historyModify,
    showHistory: showHistoryRef,
    editHistory: editHistoryRef,
  };
}
