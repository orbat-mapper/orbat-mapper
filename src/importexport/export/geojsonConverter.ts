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
} from "@/types/scenarioLayerItems";

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
    return featureCollection(
      geo.layerItemsLayers.value
        .map((layer) => layer.items)
        .flat(1)
        .filter((layerItem): layerItem is NScenarioLayerItem & GeometryLayerItem =>
          isNGeometryLayerItem(layerItem),
        )
        .map((f) => {
          const { id, geometry, properties, meta } = f;
          return {
            type: "Feature",
            id: options.includeId ? id : undefined,
            properties: {
              id: includeIdInProperties ? id : undefined,
              name: meta.name,
              description: meta.description,
              ...properties,
            },
            geometry,
          };
        }),
    );
  }

  return { convertUnitsToGeoJson, convertScenarioFeaturesToGeoJson };
}
