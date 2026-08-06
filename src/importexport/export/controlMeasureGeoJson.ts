/**
 * Control measures in the GeoJSON export.
 *
 * **The export emits the rendered graphic, not its parameters.** One control measure
 * becomes N features — `renderControlMeasure`'s output — each carrying the full
 * item-level parameter bag plus a structural `cmId` that reunites them.
 *
 * This deliberately breaks with this project's own derived-render precedent: a circle
 * exports its stored Point plus `radius` and never the ring. That precedent is legible
 * for a circle, where a consumer can rebuild the ring from two numbers, and meaningless
 * for an axis of advance, where the doctrinal geometry *is* the content and no consumer
 * outside this library can derive it. See ADR-0006.
 *
 * The parameter bag is write-only until import reconstruction (#646) is built.
 */
import { renderControlMeasure } from "@orbat-mapper/control-measures";
import type { FeaturePartProps } from "@orbat-mapper/control-measures";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import {
  toControlMeasure,
  toTacticalGraphicGeoJsonProperties,
} from "@/geo/controlMeasures";
import { isSupportedTacticalGraphic } from "@/scenariostore/tacticalGraphics";
import type { GeoJsonSettings } from "@/types/importExport";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";

/**
 * Is this rendered part a label rather than graphic geometry?
 *
 * The test is `labelPlacementKey`, which the renderer stamps on **every** label it
 * emits (`FeaturePartProps.labelPlacementKey`: "stable key used to persist a
 * user-adjusted anchor for any rendered label"). It is deliberately *not* "a Point
 * carrying `text`": several kinds are genuinely made of text — `generic-text` is
 * nothing else, and `area-defense` renders its doctrinal glyph as text — so that test
 * would silently erase whole graphics rather than drop their labels.
 */
export function isControlMeasureLabelFeature(
  feature: Feature<Geometry, FeaturePartProps>,
): boolean {
  return feature.properties?.labelPlacementKey !== undefined;
}

/**
 * Render one stored control measure into its exported features.
 *
 * Returns an empty array for an unsupported `graphicKind` — the library's definition
 * registry throws on an unknown kind, and the same filter guards the render batch.
 * `validationMode: "silent"` (the library's own default, stated here because an export
 * must never warn or throw over a graphic the map is happily refusing to draw) means an
 * off-contract measure also contributes nothing.
 */
export function controlMeasureToGeoJsonFeatures(
  item: TacticalGraphicLayerItem,
  options: Partial<GeoJsonSettings> = {},
): Feature<Geometry, GeoJsonProperties>[] {
  if (!isSupportedTacticalGraphic(item)) return [];
  const render = renderControlMeasure(toControlMeasure(item), {
    validationMode: "silent",
  });
  const bag = toTacticalGraphicGeoJsonProperties(item);
  const includeIdInProperties = options.includeIdInProperties ?? false;

  return render.features
    .filter((feature) => !isControlMeasureLabelFeature(feature))
    .map((feature) => ({
      type: "Feature" as const,
      // The renderer's stable id is `${cmId}:${part}:${index}`.
      id: options.includeId ? feature.id : undefined,
      properties: {
        ...(includeIdInProperties ? { id: feature.id } : {}),
        ...bag,
        // Structural, and therefore unconditional: `includeId` is a preference about
        // identity, but without `cmId` the N features of one graphic are no longer
        // recognisable as one graphic and the export stops being reconstructable.
        // `part`/`index` are the same contract, and are all that survives of the
        // renderer's own per-feature props — the rest is library bookkeeping, and its
        // `style` key would collide with the item's authored style.
        cmId: item.id,
        part: feature.properties.part,
        index: feature.properties.index,
      },
      geometry: feature.geometry,
    }));
}
