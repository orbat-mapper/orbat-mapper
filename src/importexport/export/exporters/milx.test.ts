import { describe, expect, it } from "vitest";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";
import { useStateHelpers } from "@/scenariostore/helpers";
import { useGeo } from "@/scenariostore/geo";
import { useScenarioTime } from "@/scenariostore/time";
import type { TScenario } from "@/scenariostore";
import type { Scenario } from "@/types/scenarioModels";
import { milxExporter } from "./milx";

function side(id: string, name: string, units: { id: string; location?: number[] }[]) {
  return {
    id,
    name,
    standardIdentity: id === "blue" ? "3" : "6",
    groups: [
      {
        id: `${id}-group`,
        name: "Units",
        subUnits: units.map((u) => ({
          id: u.id,
          name: u.id,
          sidc: "10031000001211000000",
          location: u.location,
          subUnits: [],
        })),
      },
    ],
  };
}

function loadScenario(): TScenario {
  const source = {
    id: "scn",
    type: "ORBAT-mapper",
    version: "2.0.0",
    name: "Test",
    description: "",
    startTime: 0,
    sides: [
      side("blue", "Blue", [
        { id: "b1", location: [10, 60] },
        { id: "b2", location: [11, 60] },
        { id: "b3" },
      ]),
      side("red", "Red", [{ id: "r1", location: [12, 61] }]),
    ],
    events: [],
    layers: [],
  } as unknown as Scenario;
  const store = useNewScenarioStore(source);
  useScenarioTime(store).setCurrentTime(0, { force: true });
  return {
    store,
    unitActions: useUnitManipulations(store),
    helpers: useStateHelpers(store),
    geo: useGeo(store),
  } as unknown as TScenario;
}

/** Each MilX layer's name and how many graphics it has. */
function layersOf(xml: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.getElementsByTagName("MilXLayer")).map((layer) => ({
    name: layer.getElementsByTagName("Name")[0]?.textContent,
    graphics: layer.getElementsByTagName("MilXGraphic").length,
  }));
}

describe("milxExporter", () => {
  it("writes one layer per side with the side's located units", async () => {
    const file = await milxExporter.generate(
      { scenario: loadScenario() },
      { includeUnits: true, oneFolderPerSide: true },
    );

    expect(layersOf(file.content as string)).toEqual([
      { name: "Blue", graphics: 2 },
      { name: "Red", graphics: 1 },
    ]);
  });

  it("writes all located units into one layer", async () => {
    const file = await milxExporter.generate(
      { scenario: loadScenario() },
      { includeUnits: true, oneFolderPerSide: false },
    );

    expect(layersOf(file.content as string)).toEqual([{ name: "Units", graphics: 3 }]);
  });

  it("writes no layers without units", async () => {
    const file = await milxExporter.generate(
      { scenario: loadScenario() },
      { includeUnits: false, oneFolderPerSide: true },
    );

    expect(layersOf(file.content as string)).toEqual([]);
  });

  it("names the file as a MilX layer file", async () => {
    const file = await milxExporter.generate(
      { scenario: loadScenario() },
      { includeUnits: true, oneFolderPerSide: true },
    );

    expect(file).toMatchObject({
      fileName: "scenario.milxly",
      mimeType: "application/xml",
      extension: ".milxly",
    });
  });
});
