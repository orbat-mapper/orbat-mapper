import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import { EntityId, HistoryAction } from "@/types/base";
import { Coordinate } from "ol/coordinate";
import { toLonLat } from "ol/proj";
import { createHistoryFeature, VIA_TIME } from "@/geo/history";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { LineString } from "ol/geom";
import { Feature } from "ol";

import { createHistoryLayer } from "@/geo/layers";
import { MaybeRef } from "@vueuse/core";
import { ref, watch } from "vue";

import { useSelectedItems } from "@/stores/selectedStore";

/**
 * Code for displaying and manipulating unit history on the map
 */

export function useUnitHistory(
  options: Partial<{
    showHistory: MaybeRef<boolean>;
    editHistory: MaybeRef<boolean>;
  }> = {}
) {
  const showHistoryRef = ref(options.showHistory || true);
  const editHistoryRef = ref(options.editHistory || true);

  const {
    geo,
    unitActions,
    store: { onUndoRedo, state },
  } = injectStrict(activeScenarioKey);
  const { selectedUnitIds } = useSelectedItems();
  const historyLayer = createHistoryLayer();
  historyLayer.set("title", "History");

  onUndoRedo(({ meta }) => {
    if (meta?.value && selectedUnitIds.value.has(meta.value as string)) drawHistory();
  });

  const historyModify = new Modify({ source: historyLayer.getSource()! });
  watch(editHistoryRef, (v) => historyModify.setActive(v), { immediate: true });

  let preGeometry: LineString | undefined;
  historyModify.on(["modifystart", "modifyend"], (evt) => {
    const f = (evt as ModifyEvent).features.item(0) as Feature<LineString>;
    if (evt.type === "modifystart") {
      preGeometry = f.getGeometry()?.clone();
    } else if (evt.type === "modifyend") {
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

      handleHistoryFeatureChange(
        f.get("unitId"),
        action,
        elementIndex,
        isVia,
        postCoords,
        preCoords
      );

      const updatedGeometry = postGeometry
        ?.getCoordinates()
        .map((e) => [e[0], e[1], e[2] === 0 ? VIA_TIME : e[2]]);
      if (updatedGeometry) f.getGeometry()?.setCoordinates(updatedGeometry, "XYM");
    }
  });

  function handleHistoryFeatureChange(
    unitId: EntityId,
    action: HistoryAction,
    elementIndex: number,
    isVia: boolean,
    postCoordinates: Coordinate[],
    preCoordinates: Coordinate[]
  ) {
    const unit = unitActions.getUnitById(unitId);
    const changedCoords = postCoordinates[elementIndex];
    const llChangedCoords = toLonLat([changedCoords[0], changedCoords[1]]);
    if (!unit) return;
    if (isVia) {
      let stateElementIndex = -1;
      let viaElementIndex = -1;
      if (action === "remove") {
        const a = [...preCoordinates.entries()].filter(
          ([i, c]) => !(c[2] === VIA_TIME || c[2] === 0)
        );
        stateElementIndex = a.findIndex(([i]) => {
          return i > elementIndex;
        });
      } else {
        const a = [...postCoordinates.entries()].filter(
          ([i, c]) => !(c[2] === VIA_TIME || c[2] === 0)
        );
        stateElementIndex = a.findIndex(([i], idx) => {
          return i > elementIndex;
        });
        viaElementIndex = elementIndex - a[stateElementIndex - 1][0] - 1;
      }
      unitActions.updateUnitStateVia(
        unitId,
        action,
        stateElementIndex,
        viaElementIndex,
        llChangedCoords
      );
    } else {
      if (action === "remove") {
        unitActions.deleteUnitStateEntry(unitId, elementIndex);
      } else if (action === "modify") {
        geo.addUnitPosition(unitId, llChangedCoords, changedCoords[2]);
      }
    }
  }

  const drawHistory = () => {
    const historyLayerSource = historyLayer.getSource()!;
    historyLayerSource.clear();
    if (!showHistoryRef.value) return;
    selectedUnitIds.value.forEach((unitId) => {
      const unit = state.getUnitById(unitId);
      if (!unit) return;

      const historyFeature = createHistoryFeature(unit);
      historyLayerSource.addFeature(historyFeature);
    });
  };

  watch(
    () => showHistoryRef.value && [...selectedUnitIds.value.values()],
    () => drawHistory()
  );

  return {
    historyLayer,
    drawHistory,
    historyModify,
    showHistory: showHistoryRef,
    editHistory: editHistoryRef,
  };
}
