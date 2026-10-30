import { describe, expect, it } from "vitest";
import { createTextToOrbat, extractEntityCode } from "@/lib/textToOrbat";
import {
  convertParsedUnitsToOrbatMapperScenario,
  convertParsedUnitsToSpatialIllusions,
} from "./orbatExports";

const engine = createTextToOrbat();
const ICON_MECHANIZED_INFANTRY = extractEntityCode(
  engine.mappings.iconDefinitions.find((d) => d.label === "Mechanized Infantry")!.sidc,
);

describe("convertParsedUnitsToOrbatMapperScenario", () => {
  it("creates a canonical v3 scenario with a default overlay layer", () => {
    const scenario = convertParsedUnitsToOrbatMapperScenario([]);

    expect(scenario.version).toBe("3.0.0");
    expect(scenario.layerStack).toHaveLength(1);
    expect(scenario.layerStack[0]).toMatchObject({
      kind: "overlay",
      name: "Features",
      items: [],
    });
    expect(scenario.layers).toBeUndefined();
    expect(scenario.mapLayers).toBeUndefined();
  });
});

describe("exports with hidden metadata", () => {
  it("exports scenario units without hidden metadata in the name", () => {
    const units = engine.parse("Alpha [brigade] |mechanized infantry|");
    const scenario = convertParsedUnitsToOrbatMapperScenario(units);
    const scenarioUnit = scenario.sides[0].groups[0].subUnits[0];

    expect(scenarioUnit.name).toBe("Alpha");
    expect(scenarioUnit.sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });

  it("exports Spatial Illusions designations without hidden metadata in the name", () => {
    const units = engine.parse("Alpha [brigade] |mechanized infantry|");
    const orbat = convertParsedUnitsToSpatialIllusions(units);

    expect(orbat.options.uniqueDesignation).toBe("Alpha");
    expect(orbat.options.sidc.substring(10, 20)).toBe(ICON_MECHANIZED_INFANTRY);
  });
});
