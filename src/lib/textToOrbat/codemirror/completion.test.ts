import { describe, expect, it } from "vitest";
import { createTextToOrbat } from "../engine";
import { completeUnitTypes } from "./completion";

const engine = createTextToOrbat();

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

describe("completeUnitTypes", () => {
  it("offers unit type completions for the current word or phrase", () => {
    const result = completeUnitTypes(
      createCompletionContext("1st Air", "1st Air".length) as never,
      engine,
    );

    expect(result?.from).toBe(4);
    expect(result?.options.some((option) => option.label === "Airborne Infantry")).toBe(
      true,
    );
  });

  it("offers echelon completions for the current phrase", () => {
    const result = completeUnitTypes(
      createCompletionContext("2nd Brig", "2nd Brig".length) as never,
      engine,
    );

    expect(result?.from).toBe(4);
    expect(result?.options.some((option) => option.label === "Brigade")).toBe(true);
  });

  it("offers alias completions like bn and coy", () => {
    const battalionResult = completeUnitTypes(
      createCompletionContext("2 bn", "2 bn".length) as never,
      engine,
    );
    const companyResult = completeUnitTypes(
      createCompletionContext("HQ coy", "HQ coy".length) as never,
      engine,
    );

    expect(battalionResult?.from).toBe(2);
    expect(battalionResult?.options.some((option) => option.label === "bn")).toBe(true);
    expect(companyResult?.from).toBe(3);
    expect(companyResult?.options.some((option) => option.label === "coy")).toBe(true);
  });

  it("offers literal pattern abbreviations like CV", () => {
    const result = completeUnitTypes(
      createCompletionContext("USS CV", "USS CV".length) as never,
      engine,
    );

    expect(result?.from).toBe(4);
    expect(result?.options.some((option) => option.label === "CV")).toBe(true);
  });

  it("does not offer suggestions when there is no active token", () => {
    const result = completeUnitTypes(
      createCompletionContext("1st Division ", "1st Division ".length) as never,
      engine,
    );

    expect(result).toBeNull();
  });
});
