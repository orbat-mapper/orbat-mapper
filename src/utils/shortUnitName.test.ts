import { describe, expect, it } from "vitest";
import { createShortUnitName } from "./shortUnitName";

describe("createShortUnitName", () => {
  it("creates token-initial abbreviations by default", () => {
    expect(createShortUnitName("1st Armored Brigade")).toBe("1AB");
  });

  it("respects explicit max length values", () => {
    expect(createShortUnitName("1st Armored Brigade", { maxLength: 2 })).toBe("1A");
    expect(createShortUnitName("Headquarters", { maxLength: 6 })).toBe("Headqu");
  });

  it("supports uppercase output", () => {
    expect(createShortUnitName("Alpha Company", { uppercase: true })).toBe("AC");
    expect(
      createShortUnitName("1st Battalion Alpha", {
        maxLength: 4,
        otherNames: ["1st Battalion Bravo"],
        uppercase: true,
      }),
    ).toBe("ALPH");
  });

  it("supports optional whitespace between token contributions", () => {
    expect(
      createShortUnitName("63 AD Squadron", {
        maxLength: 8,
        allowWhitespace: true,
        forceLength: true,
        uppercase: true,
      }),
    ).toBe("63 AD SQN");
    expect(
      createShortUnitName("Left Flank", {
        maxLength: 5,
        allowWhitespace: true,
        forceLength: true,
        uppercase: true,
      }),
    ).toBe("L FLK");
  });

  it("prioritizes meaningful unit abbreviations in whitespace mode", () => {
    expect(
      createShortUnitName("5 Inf Bde", {
        maxLength: 8,
        allowWhitespace: true,
        uppercase: true,
      }),
    ).toBe("5 INF BDE");
    expect(
      createShortUnitName("36 Engineer Regiment", {
        maxLength: 8,
        allowWhitespace: true,
        uppercase: true,
      }),
    ).toBe("36 ENGR");
  });

  it("prefers distinguishing sibling descriptors in whitespace mode", () => {
    const siblings = [
      "2nd Bn Scots Guards",
      "1st Bn Welsh Guards",
      "1st Bn 7th Gurkha Rifles",
    ];

    expect(
      createShortUnitName("2nd Bn Scots Guards", {
        maxLength: 8,
        allowWhitespace: true,
        uppercase: true,
        otherNames: siblings,
      }),
    ).toBe("2 BN SCOT");
    expect(
      createShortUnitName("1st Bn Welsh Guards", {
        maxLength: 8,
        allowWhitespace: true,
        uppercase: true,
        otherNames: siblings,
      }),
    ).toBe("1 BN WEL");
  });

  it("handles accented characters as letters", () => {
    expect(
      createShortUnitName("ARA Bahía Buen Suceso", {
        maxLength: 4,
        otherNames: ["ARA Bahía Paraíso", "ARA Punta Médanos"],
      }),
    ).toBe("BBSu");
    expect(
      createShortUnitName("ARA Hipólito Bouchard", {
        maxLength: 4,
        otherNames: ["ARA General Belgrano", "ARA Drummond"],
        forceLength: true,
        uppercase: true,
      }),
    ).toBe("HBOU");
  });

  it("supports forceLength output when enough source characters exist", () => {
    expect(
      createShortUnitName("Alpha Company", { maxLength: 4, forceLength: true }),
    ).toBe("ACoy");
    expect(
      createShortUnitName("2nd Battalion", { maxLength: 4, forceLength: true }),
    ).toBe("2Bn");
  });

  it("combines uppercase and forceLength", () => {
    expect(
      createShortUnitName("Alpha Company", {
        maxLength: 4,
        uppercase: true,
        forceLength: true,
      }),
    ).toBe("ACOY");
  });

  it("avoids existing short names when alternatives are available", () => {
    expect(
      createShortUnitName("Alpha Company", {
        maxLength: 4,
        forceLength: true,
        existingShortNames: ["AC", "ACom"],
      }),
    ).toBe("ACoy");
  });

  it("avoids existing short names for single-token names when a longer prefix is available", () => {
    expect(
      createShortUnitName("Alpha", {
        maxLength: 4,
        existingShortNames: ["A", "Al", "Alp"],
      }),
    ).toBe("Alph");
  });

  it("preserves numeric and designator tokens", () => {
    expect(createShortUnitName("2nd Battalion")).toBe("2B");
    expect(createShortUnitName("TF-1 Headquarters", { maxLength: 4 })).toBe("TF1H");
    expect(createShortUnitName("A/1 Platoon", { maxLength: 4 })).toBe("A1P");
  });

  it("supports common echelon abbreviations during expansion", () => {
    expect(
      createShortUnitName("1st Armored Brigade", { maxLength: 4, forceLength: true }),
    ).toBe("1ABd");
    expect(createShortUnitName("3rd Division", { maxLength: 4, forceLength: true })).toBe(
      "3Div",
    );
    expect(
      createShortUnitName("Recon Platoon", { maxLength: 4, forceLength: true }),
    ).toBe("RPlt");
  });

  it("skips stopwords when building abbreviations", () => {
    expect(createShortUnitName("Veinticinco de Mayo", { maxLength: 4 })).toBe("VM");
    expect(
      createShortUnitName("The General Belgrano", { maxLength: 4, forceLength: true }),
    ).toBe("GBel");
  });

  it("normalizes whitespace and separators", () => {
    expect(createShortUnitName("  1st   Armored / Brigade ")).toBe("1AB");
  });

  it("removes shared leading tokens when sibling names are provided", () => {
    expect(
      createShortUnitName("1st Battalion Alpha", {
        maxLength: 4,
        otherNames: ["1st Battalion Bravo", "1st Battalion Charlie"],
      }),
    ).toBe("Alph");
  });

  it("ignores outlier sibling names when a stronger shared prefix exists among the matching group", () => {
    const siblings = [
      "TGG",
      "ARA Veinticinco de Mayo",
      "ARA Comodoro Py",
      "ARA Comodoro Seguí",
      "ARA Hipólito Bouchard",
      "ARA Piedrabuena",
      "ARA Punta Médanos",
    ];

    expect(
      createShortUnitName("ARA Comodoro Py", {
        maxLength: 8,
        allowWhitespace: true,
        uppercase: true,
        otherNames: siblings,
      }),
    ).toBe("COM PY");
  });

  it("does not strip tokens when the sibling set does not share a true prefix", () => {
    expect(
      createShortUnitName("1st Battalion Alpha", {
        maxLength: 4,
        otherNames: ["2nd Battalion Alpha"],
      }),
    ).toBe("1BAl");
  });

  it("falls back to the original tokens if prefix stripping would remove the entire name", () => {
    expect(
      createShortUnitName("1st Battalion", {
        maxLength: 4,
        otherNames: ["1st Battalion"],
      }),
    ).toBe("1B");
  });

  it("keeps best-effort readable collisions within the limit", () => {
    expect(createShortUnitName("Alpha", { maxLength: 2, otherNames: ["Alpine"] })).toBe(
      "Al",
    );
    expect(createShortUnitName("Alpine", { maxLength: 2, otherNames: ["Alpha"] })).toBe(
      "Al",
    );
  });

  it("handles empty input and very small limits", () => {
    expect(createShortUnitName("")).toBe("");
    expect(createShortUnitName("   ")).toBe("");
    expect(createShortUnitName("Alpha Company", { maxLength: 1 })).toBe("A");
    expect(createShortUnitName("Alpha Company", { maxLength: 2 })).toBe("AC");
  });
});
