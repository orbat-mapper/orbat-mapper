import type { Ref } from "vue";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { EncryptedScenario, Scenario } from "@/types/scenarioModels";
import { useNotifications } from "@/composables/notifications";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  convertGeoJSONFeatureToScenarioFeature,
  findLikelyNameColumn,
  getGeoJSONFeatures,
  getGeoJSONPropertyNames,
} from "@/importexport/geojsonScenarioFeatures";
import type { LoadableScenario } from "@/scenariostore/upgrade";

interface ScenarioClipboardImportOptions {
  activeScenario: TScenario;
  activeLayerId: Ref<FeatureId | undefined | null>;
  onScenarioLoaded: (scenario: Scenario | LoadableScenario) => void | Promise<void>;
  onEncryptedScenario: (scenario: EncryptedScenario) => void;
}

export function useScenarioClipboardImport(options: ScenarioClipboardImportOptions) {
  const { send } = useNotifications();
  const {
    clear: clearSelection,
    selectedFeatureIds,
    activeFeatureId,
  } = useSelectedItems();
  const {
    activeScenario: {
      store: { state, groupUpdate },
      geo,
    },
    activeLayerId,
    onScenarioLoaded,
    onEncryptedScenario,
  } = options;

  function getTargetLayerId() {
    if (
      activeLayerId.value &&
      state.layerStackMap[activeLayerId.value]?.kind === "overlay"
    ) {
      return activeLayerId.value;
    }

    return state.layerStack.find(
      (layerId) => state.layerStackMap[layerId]?.kind === "overlay",
    );
  }

  function pasteGeoJSON(data: unknown) {
    const clipboardFeatures = getGeoJSONFeatures(data);
    if (!clipboardFeatures) return false;

    const targetLayerId = getTargetLayerId();
    if (!targetLayerId) {
      send({
        message: "No scenario feature layer available for pasted GeoJSON",
        type: "error",
      });
      return false;
    }

    const nameColumn = findLikelyNameColumn(
      getGeoJSONPropertyNames({
        type: "FeatureCollection",
        features: clipboardFeatures,
      }),
    );
    const importedFeatures = clipboardFeatures
      .map((feature) =>
        convertGeoJSONFeatureToScenarioFeature(feature, targetLayerId, { nameColumn }),
      )
      .filter((feature) => !!feature);

    if (!importedFeatures.length) {
      send({
        message: "Clipboard GeoJSON has no importable features",
        type: "error",
      });
      return false;
    }

    const addedFeatureIds: string[] = [];
    groupUpdate(() => {
      importedFeatures.forEach((feature) => {
        addedFeatureIds.push(geo.addFeature(feature, targetLayerId));
      });
    });

    clearSelection();
    activeFeatureId.value = addedFeatureIds[0];
    addedFeatureIds
      .slice(1)
      .forEach((featureId) => selectedFeatureIds.value.add(featureId));
    send({
      message: `Pasted ${addedFeatureIds.length} GeoJSON feature${
        addedFeatureIds.length === 1 ? "" : "s"
      }`,
      type: "success",
    });
    return true;
  }

  function handlePastedText(text: string) {
    try {
      const scenarioData = JSON.parse(text) as LoadableScenario | EncryptedScenario;
      if (scenarioData?.type === "ORBAT-mapper") {
        void onScenarioLoaded(scenarioData);
        return true;
      }
      if (scenarioData?.type === "ORBAT-mapper-encrypted") {
        onEncryptedScenario(scenarioData as EncryptedScenario);
        return true;
      }
      return pasteGeoJSON(scenarioData);
    } catch {
      return false;
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !handlePastedText(text)) {
        send({
          message: "Clipboard does not contain a supported scenario or GeoJSON",
          type: "error",
        });
        return false;
      }
      return true;
    } catch {
      send({ message: "Failed to read clipboard", type: "error" });
      return false;
    }
  }

  return {
    handlePastedText,
    pasteFromClipboard,
  };
}
