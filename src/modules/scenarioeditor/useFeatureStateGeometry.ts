import type { TGeo } from "@/scenariostore";
import type { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import {
  resolveStateGeometry,
  type StateGeometryResult,
} from "@/modules/scenarioeditor/featureStateGeometry";

const LOCKED: StateGeometryResult = { ok: false, message: "Feature is locked" };

/**
 * Record a geometry from outside the feature (pasted GeoJSON or another feature) as
 * a timed geometry of a feature at the current scenario time.
 */
export function useFeatureStateGeometry(scenario: {
  store: NewScenarioStore;
  geo: TGeo;
}) {
  const { store, geo } = scenario;

  function applyGeometry(targetId: FeatureId, input: unknown): StateGeometryResult {
    const target = geo.getGeometryLayerItemById(targetId).layerItem;
    if (!target) return { ok: false, message: "Feature not found" };
    // The store refuses a locked target too; checking first gives the reason.
    if (geo.isLayerItemLocked(targetId)) return LOCKED;
    const result = resolveStateGeometry(target, input);
    if (result.ok) {
      geo.addFeatureStateGeometry(targetId, result.geometry, store.state.currentTime);
    }
    return result;
  }

  function applyGeoJsonText(targetId: FeatureId, text: string): StateGeometryResult {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, message: "Clipboard does not contain GeoJSON" };
    }
    return applyGeometry(targetId, data);
  }

  async function pasteFromClipboard(targetId: FeatureId): Promise<StateGeometryResult> {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      return { ok: false, message: "Failed to read clipboard" };
    }
    return applyGeoJsonText(targetId, text);
  }

  /**
   * Use the geometry `sourceId` shows at the current time. With `deleteSource`, the
   * source feature is removed in the same undo step.
   */
  function applyFromFeature(
    targetId: FeatureId,
    sourceId: FeatureId,
    deleteSource = false,
  ): StateGeometryResult {
    const source = geo.getGeometryLayerItemById(sourceId).layerItem;
    if (!source || sourceId === targetId) {
      return { ok: false, message: "Select another feature" };
    }
    // `deleteFeature` silently keeps a locked source, so refuse before recording.
    if (deleteSource && geo.isLayerItemLocked(sourceId)) return LOCKED;
    let result!: StateGeometryResult;
    store.groupUpdate(() => {
      result = applyGeometry(targetId, source._state?.geometry ?? source.geometry);
      if (result.ok && deleteSource) geo.deleteFeature(sourceId);
    });
    return result;
  }

  return { applyGeoJsonText, pasteFromClipboard, applyFromFeature };
}
