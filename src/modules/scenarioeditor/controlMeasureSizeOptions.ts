import { roundToFixed, switchSizePairUnit } from "@orbat-mapper/control-measures";
import type {
  ControlMeasureId,
  ControlMeasureKind,
  ParamDescriptor,
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

export interface SizeSliderRange {
  min: number;
  max: number;
  step: number;
}

/**
 * How many decimals `step` carries, so a value quantised to it rounds free of float
 * noise (`0.30000000000000004`). Capped at 3: finer than any size step.
 */
export function decimalsForStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0 || step >= 1) return 0;
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Math.min(decimals, 3);
}

/** `value` rounded to the precision `step` can express. */
export function roundToStep(value: number, step: number): number {
  return roundToFixed(value, decimalsForStep(step));
}

/** A meter step snapped to 1, 2 or 5 times a power of ten. */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / magnitude;
  const nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return nice * magnitude;
}

/**
 * The slider range for the **ground** half of a size pair at the current zoom: the
 * pixel half's declared range expressed in meters.
 *
 * A meter param's static range (1 to 100 000 m for an arrowhead) is zoom-blind, so a
 * slider over it is useless; the pixel range is what the author can see, so the meter
 * slider borrows it. The slider widens it to reach a size set at another zoom.
 * `null` means "use the declared range".
 */
export function groundSizeRange(
  pixelParameter: ParamDescriptor | undefined,
  metersPerPixel: number | undefined,
): SizeSliderRange | null {
  if (metersPerPixel === undefined || !(metersPerPixel > 0)) return null;
  if (pixelParameter?.type !== "number") return null;
  if (pixelParameter.min === undefined || pixelParameter.max === undefined) return null;
  const step = niceStep((pixelParameter.step ?? 1) * metersPerPixel);
  // Snapped outward to whole steps; never below one step, so a zero size is out of reach.
  const min = Math.max(
    step,
    Math.floor((pixelParameter.min * metersPerPixel) / step) * step,
  );
  const max = Math.max(
    min + step,
    Math.ceil((pixelParameter.max * metersPerPixel) / step) * step,
  );
  return { min: roundToStep(min, step), max: roundToStep(max, step), step };
}
