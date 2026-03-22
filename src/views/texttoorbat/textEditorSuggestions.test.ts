import { describe, expect, it } from "vitest";
import {
  completeUnitTypes,
  getEchelonCompletions,
  getTextToOrbatCompletions,
  type TextToOrbatCompletion,
  getUnitTypeCompletions,
} from "@/views/texttoorbat/textEditorSuggestions";

function createCompletionContext(value: string, position: number, explicit = false) {
  return {
    pos: position,
    explicit,
    state: {
      doc: {
        lineAt() {
          return {
            from: 0,
            text: value,
          };
        },
      },
    },
  };
}

describe("textEditorSuggestions", () => {
  it("builds unique completions from recognized unit labels", () => {
    const completions = getUnitTypeCompletions();
    const labels = completions.map((completion) => completion.label);

    expect(labels).toContain("Infantry");
    expect(labels).toContain("Armor");
    expect(labels).toContain("Airborne Infantry");
    expect(labels).toContain("CV");
    expect(new Set(labels).size).toBe(labels.length);
    expect(
      (
        completions.find(
          (completion) => completion.label === "Infantry",
        ) as TextToOrbatCompletion
      )?.previewSidc,
    ).toBe("10031000001211000000");
  });

  it("builds echelon completions from recognized echelon labels", () => {
    const completions = getEchelonCompletions();
    const labels = completions.map((completion) => completion.label);

    expect(labels).toContain("Division");
    expect(labels).toContain("Brigade");
    expect(labels).toContain("Battalion");
    expect(labels).toContain("coy");
    expect(labels).toContain("bn");
    expect(new Set(labels).size).toBe(labels.length);
    expect(
      (
        completions.find(
          (completion) => completion.label === "Division",
        ) as TextToOrbatCompletion
      )?.previewSidc,
    ).toBe("10031000211211000000");
  });

  it("combines unit type and echelon completions", () => {
    const labels = getTextToOrbatCompletions().map((completion) => completion.label);

    expect(labels).toContain("Infantry");
    expect(labels).toContain("Division");
  });

  it("offers unit type completions for the current word or phrase", () => {
    const result = completeUnitTypes(
      createCompletionContext("1st Air", "1st Air".length) as never,
    );

    expect(result?.from).toBe(4);
    expect(result?.options.some((option) => option.label === "Airborne Infantry")).toBe(
      true,
    );
  });

  it("offers echelon completions for the current phrase", () => {
    const result = completeUnitTypes(
      createCompletionContext("2nd Brig", "2nd Brig".length) as never,
    );

    expect(result?.from).toBe(4);
    expect(result?.options.some((option) => option.label === "Brigade")).toBe(true);
  });

  it("offers alias completions like bn and coy", () => {
    const battalionResult = completeUnitTypes(
      createCompletionContext("2 bn", "2 bn".length) as never,
    );
    const companyResult = completeUnitTypes(
      createCompletionContext("HQ coy", "HQ coy".length) as never,
    );

    expect(battalionResult?.from).toBe(2);
    expect(battalionResult?.options.some((option) => option.label === "bn")).toBe(true);
    expect(companyResult?.from).toBe(3);
    expect(companyResult?.options.some((option) => option.label === "coy")).toBe(true);
  });

  it("offers literal pattern abbreviations like CV", () => {
    const result = completeUnitTypes(
      createCompletionContext("USS CV", "USS CV".length) as never,
    );

    expect(result?.from).toBe(4);
    expect(result?.options.some((option) => option.label === "CV")).toBe(true);
  });

  it("does not offer suggestions when there is no active token", () => {
    const result = completeUnitTypes(
      createCompletionContext("1st Division ", "1st Division ".length) as never,
    );

    expect(result).toBeNull();
  });
});
