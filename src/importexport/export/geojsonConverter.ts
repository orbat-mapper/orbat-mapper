import type { TScenario } from "@/scenariostore";
import type { NUnit } from "@/types/internalModels";
import type { GeoJsonSettings } from "@/types/importExport.ts";
import { featureCollection, point } from "@turf/helpers";
import type {
  MilSymbolProperties,
  OrbatMapperGeoJsonCollection,
} from "@/importexport/jsonish/types.ts";
import {
  type GeometryLayerItem,
  type NScenarioLayerItem,
  isNGeometryLayerItem,
  isNTacticalGraphicLayerItem,
  toGeometryLayerItemGeoJsonProperties,
} from "@/types/scenarioLayerItems";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import { controlMeasureToGeoJsonFeatures } from "@/importexport/export/controlMeasureGeoJson";

export function useGeoJsonConverter(scenario: TScenario) {
  const { geo, unitActions } = scenario;
  function convertUnitsToGeoJson(units: NUnit[], options: Partial<GeoJsonSettings> = {}) {
    const features = units.map((unit) => {
      const includeIdInProperties = options.includeIdInProperties ?? false;
      const { id, name, sidc, shortName, description } = unit;

      const symbolOptions = unitActions.getCombinedSymbolOptions(unit);

      return point<MilSymbolProperties>(
        unit._state?.location!,
        {
          id: includeIdInProperties ? id : undefined,
          name,
          shortName,
          sidc: unit._state?.sidc || sidc,
          description,
          ...(unit.textAmplifiers ?? {}),
          ...symbolOptions,
        },
        { id: options.includeId ? id : undefined },
      );
    });
    return featureCollection(features) as OrbatMapperGeoJsonCollection;
  }

  function convertScenarioFeaturesToGeoJson(options: Partial<GeoJsonSettings> = {}) {
    const includeIdInProperties = options.includeIdInProperties ?? false;
    const layerItems = geo.layerItemsLayers.value.map((layer) => layer.items).flat(1);

    const geometryFeatures: Feature<Geometry, GeoJsonProperties>[] = layerItems
      .filter((layerItem): layerItem is NScenarioLayerItem & GeometryLayerItem =>
        isNGeometryLayerItem(layerItem),
      )
      .map((f) => {
        const { id, geometry } = f;
        const properties = toGeometryLayerItemGeoJsonProperties(f);
        return {
          type: "Feature",
          id: options.includeId ? id : undefined,
          properties: {
            id: includeIdInProperties ? id : undefined,
            ...properties,
          },
          geometry,
        };
      });

    // Control measures fan out: one stored item becomes N rendered features. They are
    // appended after the plain shapes rather than interleaved, mirroring the map, where
    // the tactical-draw stack draws above the flat scenario feature source (ADR-0006).
    const controlMeasureFeatures = layerItems
      .filter(isNTacticalGraphicLayerItem)
      .flatMap((item) => controlMeasureToGeoJsonFeatures(item, options));

    return featureCollection([...geometryFeatures, ...controlMeasureFeatures]);
  }

  return { convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson };
}
