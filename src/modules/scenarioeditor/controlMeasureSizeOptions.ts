import { switchSizePairUnit } from "@orbat-mapper/control-measures";
import type {
  ControlMeasureId,
  ControlMeasureKind,
  SizeUnit,
} from "@orbat-mapper/control-measures";
import { metadataFor } from "@/modules/scenarioeditor/controlMeasureStyleOptions";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { TacticalGraphicOptions } from "@/types/scenarioLayerItems";

export interface ControlMeasureSizeTarget {
  id: FeatureId;
  graphicKind: ControlMeasureKind;
  options?: TacticalGraphicOptions;
}

export interface ControlMeasureSizeUpdate {
  id: FeatureId;
  options: TacticalGraphicOptions;
}

/** Each item keeps its own options and size. A failed conversion writes nothing. */
export function editControlMeasureSizes(
  targets: readonly ControlMeasureSizeTarget[],
  dimension: string,
  unit: SizeUnit,
  constructionMetersPerCssPixel?: number,
  value?: number,
): ControlMeasureSizeUpdate[] | null {
  if (value !== undefined && (!Number.isFinite(value) || value <= 0)) return null;
  const updates: ControlMeasureSizeUpdate[] = [];
  for (const target of targets) {
    const pair = metadataFor(target.graphicKind)?.sizePairs?.find(
      (pair) => pair.id === dimension,
    );
    if (!pair) return null;
    const result = switchSizePairUnit({
      kind: target.graphicKind as ControlMeasureId,
      dimension,
      // A numeric edit explicitly authors the selected unit. Unit switches instead
      // convert each item's current size at the live construction resolution.
      options:
        value === undefined
          ? target.options
          : {
              ...target.options,
              [pair.pixels]: undefined,
              [pair.meters]: undefined,
              [unit === "px" ? pair.pixels : pair.meters]: value,
            },
      unit,
      constructionMetersPerCssPixel,
    });
    if (result.status !== "converted") return null;
    // This is a complete record, never spread over the old options: the inactive
    // key was deleted by the helper and must remain absent in storage.
    updates.push({ id: target.id, options: result.options as TacticalGraphicOptions });
  }
  return updates;
}
