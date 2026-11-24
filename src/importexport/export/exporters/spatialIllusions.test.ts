import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { useStateHelpers } from "@/scenariostore/helpers";
import type { TScenario } from "@/scenariostore";
import type { Scenario } from "@/types/scenarioModels";
import { spatialIllusionsExporter } from "./spatialIllusions";

function loadScenario(): TScenario {
  const source = {
    id: "scn",
    type: "ORBAT-mapper",
    version: "2.0.0",
    name: "Test",
    description: "",
    startTime: 0,
    sides: [
      {
        id: "blue",
        name: "Blue",
        standardIdentity: "3",
        groups: [
          {
            id: "blue-group",
            name: "Units",
            subUnits: [
              {
                id: "bde",
                name: "1 BDE",
                sidc: "10031000001211000000",
                reinforcedStatus: "Reinforced",
                subUnits: [
                  {
                    id: "bn",
                    name: "1 BN",
                    sidc: "10031000001211000001",
                    textAmplifiers: { additionalInformation: "Mech" },
                    subUnits: [
                      {
                        id: "coy",
                        name: "A COY",
                        sidc: "10031000001211000002",
                        subUnits: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    events: [],
    layers: [],
  } as unknown as Scenario;
  const store = useNewScenarioStore(source);
  return {
    store,
    unitActions: useUnitManipulations(store),
    helpers: useStateHelpers(store),
  } as unknown as TScenario;
}

describe("spatialIllusionsExporter", () => {
  it("exports the unit hierarchy below the root unit, down to the max levels", async () => {
    const scenario = loadScenario();

    const file = await spatialIllusionsExporter.generate(
      { scenario },
      { rootUnit: "bde", maxLevels: 1 },
    );

    expect(JSON.parse(file.content as string)).toEqual({
      options: {
        uniqueDesignation: "1 BDE",
        sidc: "10031000001211000000",
        reinforced: "(+)",
      },
      subOrganizations: [
        {
          options: {
            uniqueDesignation: "1 BN",
            sidc: "10031000001211000001",
            additionalInformation: "Mech",
          },
          subOrganizations: [],
        },
      ],
    });
  });

  it("names the file for the ORBAT builder as JSON", async () => {
    const file = await spatialIllusionsExporter.generate(
      { scenario: loadScenario() },
      { rootUnit: "bde", maxLevels: 3 },
    );

    expect(file).toMatchObject({
      fileName: "spatialillusions-orbat.json",
      mimeType: "application/json",
      extension: ".json",
    });
  });
});
