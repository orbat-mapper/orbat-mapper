import { describe, expect, it } from "vitest";
import { suggestExportNames } from "./exportNames";

const sides = [
  { id: "blue", name: "Blue", groups: ["b1", "b2"] },
  { id: "red", name: "Red", groups: ["r1"] },
];

describe("export name suggestions", () => {
  it.each([
    [["b1"], ["map"], "Northern Exercise — Blue", "northern-exercise-blue.json"],
    [["r1"], [], "Northern Exercise — Red", "northern-exercise-red.json"],
    [
      ["b1", "r1"],
      [],
      "Northern Exercise — Blue + Red",
      "northern-exercise-blue-red.json",
    ],
    [[], ["map"], "Northern Exercise — Layers", "northern-exercise-layers.json"],
    [["b1", "b2", "r1"], ["map"], "Northern Exercise", "northern-exercise.json"],
    [[], [], "Northern Exercise — Export", "northern-exercise-export.json"],
  ])("names selection %j / %j", (sideGroups, layerIds, scenarioName, fileName) => {
    expect(
      suggestExportNames("Northern Exercise", sides, ["map"], {
        sideGroups,
        layerIds,
        fileName: "",
        customColors: true,
      }),
    ).toEqual({ scenarioName, fileName });
  });

  it("includes selected sides without groups and keeps Unicode filenames", () => {
    expect(
      suggestExportNames(
        "Øvelse / 2026",
        [{ id: "blue", name: "Blue", groups: [] }],
        ["map"],
        {
          sideGroups: [],
          emptySideIds: ["blue"],
          layerIds: [],
          fileName: "",
          customColors: true,
        },
      ).fileName,
    ).toBe("øvelse-2026-blue.json");
  });
});
