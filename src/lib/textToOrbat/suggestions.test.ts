import { describe, expect, it } from "vitest";
import { MappingRegistry } from "./mappingRegistry";
import { buildRegistrySuggestions } from "./suggestions";

const suggestions = buildRegistrySuggestions(new MappingRegistry());
const iconSuggestions = suggestions.filter((s) => s.kind === "icon");
const echelonSuggestions = suggestions.filter((s) => s.kind === "echelon");

describe("buildRegistrySuggestions", () => {
  it("builds unique suggestions from recognized unit labels", () => {
    const labels = iconSuggestions.map((s) => s.label);

    expect(labels).toContain("Infantry");
    expect(labels).toContain("Armor");
    expect(labels).toContain("Airborne Infantry");
    expect(labels).toContain("CV");
    expect(new Set(labels).size).toBe(labels.length);
    expect(iconSuggestions.find((s) => s.label === "Infantry")?.previewSidc).toBe(
      "10031000001211000000",
    );
  });

  it("builds echelon suggestions from recognized echelon labels", () => {
    const labels = echelonSuggestions.map((s) => s.label);

    expect(labels).toContain("Division");
    expect(labels).toContain("Brigade");
    expect(labels).toContain("Battalion");
    expect(labels).toContain("coy");
    expect(labels).toContain("bn");
    expect(new Set(labels).size).toBe(labels.length);
    expect(echelonSuggestions.find((s) => s.label === "Division")?.previewSidc).toBe(
      "10031000211211000000",
    );
  });

  it("lists icon suggestions before echelon suggestions", () => {
    const firstEchelon = suggestions.findIndex((s) => s.kind === "echelon");
    expect(suggestions.slice(firstEchelon).every((s) => s.kind === "echelon")).toBe(true);
  });
});
