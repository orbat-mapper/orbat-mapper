import { describe, expect, it } from "vitest";
import { generateMissingShortNames } from "./shortNames";
import { unitsToText, type OrbatUnit } from "./parser";

describe("generateMissingShortNames", () => {
  it("fills only missing short names and preserves existing values", () => {
    const result = generateMissingShortNames<OrbatUnit>([
      {
        id: "1",
        name: "1st Battalion Alpha",
        sidc: "10031000161211000000",
        subUnits: [],
      },
      {
        id: "2",
        name: "1st Battalion Bravo",
        shortName: "EXISTING",
        sidc: "10031000161211000000",
        subUnits: [],
      },
    ]);

    expect(result.generatedCount).toBe(1);
    expect(result.units[0].shortName).toBeTruthy();
    expect(result.units[1].shortName).toBe("EXISTING");
  });

  it("uses sibling context per level and reserves existing sibling short names", () => {
    const result = generateMissingShortNames<OrbatUnit>([
      {
        id: "root",
        name: "5 Inf Bde",
        sidc: "10031000181211000000",
        subUnits: [
          {
            id: "a",
            name: "2nd Bn Scots Guards",
            sidc: "10031000161211000000",
            subUnits: [
              {
                id: "a1",
                name: "Left Flank",
                sidc: "10031000111211000000",
                subUnits: [],
              },
              {
                id: "a2",
                name: "Right Flank",
                sidc: "10031000111211000000",
                subUnits: [],
              },
            ],
          },
          {
            id: "b",
            name: "1st Bn Welsh Guards",
            shortName: "1 BN WEL",
            sidc: "10031000161211000000",
            subUnits: [],
          },
        ],
      },
    ]);

    expect(result.units[0].shortName).toBe("5 INF BDE");
    expect(result.units[0].subUnits?.[0].shortName).toBe("2 BN SCOT");
    expect(result.units[0].subUnits?.[1].shortName).toBe("1 BN WEL");
    expect(result.units[0].subUnits?.[0].subUnits?.[0].shortName).toBe("L FLK");
    expect(result.units[0].subUnits?.[0].subUnits?.[1].shortName).toBe("R FLK");
  });

  it("serializes generated short names back to comma-separated text", () => {
    const result = generateMissingShortNames<OrbatUnit>([
      {
        id: "1",
        name: "63 AD Squadron",
        sidc: "10031000161211000000",
        subUnits: [],
      },
    ]);

    expect(unitsToText(result.units)).toBe("63 AD Squadron, 63 AD SQN");
  });

  it("honors explicit short-name generation settings", () => {
    const result = generateMissingShortNames<OrbatUnit>(
      [
        {
          id: "1",
          name: "63 AD Squadron",
          sidc: "10031000161211000000",
          subUnits: [],
        },
      ],
      {
        maxLength: 4,
        uppercase: false,
        allowWhitespace: false,
        forceLength: true,
      },
    );

    expect(result.units[0].shortName).toBe("63AD");
  });

  it("does not assign a short name when it would be identical to the unit name", () => {
    const result = generateMissingShortNames<OrbatUnit>([
      {
        id: "1",
        name: "TGG",
        sidc: "10031000161211000000",
        subUnits: [],
      },
    ]);

    expect(result.generatedCount).toBe(0);
    expect(result.units[0].shortName).toBeUndefined();
  });
});
