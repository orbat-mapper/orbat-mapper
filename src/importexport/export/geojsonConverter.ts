import type { TScenario } from "@/scenariostore";
import type { NUnit } from "@/types/internalModels";
import type { GeoJsonSettings } from "@/types/convert";
import { featureCollection, point } from "@turf/helpers";
import type {
  MilSymbolProperties,
  OrbatMapperGeoJsonCollection,
} from "@/importexport/jsonish/types.ts";

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
      geo.layers.value
        .map((layer) => layer.features)
        .flat(1)
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
