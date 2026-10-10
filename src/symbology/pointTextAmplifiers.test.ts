import { describe, expect, it } from "vitest";
import {
  pointTextAmplifierFields,
  pointTextAmplifierMilsymbolOptions,
} from "@/symbology/pointTextAmplifiers";
import { milsymbolPointSymbols } from "@orbat-mapper/point-symbols";
import "@/symbology/milsymbolLabelOverrides";

// The same wiring as the tactical-draw surface.
const pointSymbolCapability = milsymbolPointSymbols({
  resolveOptions: pointTextAmplifierMilsymbolOptions,
});

const sidcFor = (set: string) => `1503${set}000012110000000000000000`;

describe("point-symbol Text Amplifier metadata", () => {
  it("uses literal Table VI applicability, including its anomalous values", () => {
    const land = pointTextAmplifierFields(sidcFor("10")).map((field) => field.code);
    expect(land).toEqual(expect.arrayContaining(["C", "F", "G", "M", "T", "AA", "AD"]));
    expect(land).not.toContain("X");
    expect(land).not.toContain("Z");
    expect(land).not.toContain("V");

    expect(pointTextAmplifierFields(sidcFor("15")).map((field) => field.code)).toContain(
      "AE",
    );
    expect(pointTextAmplifierFields(sidcFor("52")).map((field) => field.code)).toContain(
      "AE",
    );
    expect(pointTextAmplifierFields(sidcFor("36"))).toEqual([]);
  });
});

describe("the TacTrace-local milsymbol adapter", () => {
  it.each([
    ["130100", "H1", "additionalInformation1"],
    ["130100", "T1", "uniqueDesignation1"],
    ["130200", "T1", "uniqueDesignation1"],
  ])("renders the numbered fields of %s", (entity, internal, alias) => {
    const sidc = `1503250000${entity}00000000000000`;
    const textAmplifiers = { [internal]: "INSIDE", W1: "END-TIME" };
    expect(pointTextAmplifierFields(sidc).map((field) => field.code)).toEqual(
      expect.arrayContaining([internal, "W1"]),
    );
    expect(pointTextAmplifierMilsymbolOptions({ sidc, textAmplifiers })).toEqual({
      [alias]: "INSIDE",
      dtg1: "END-TIME",
    });
    const render = pointSymbolCapability.render({
      id: "c2",
      kind: "point-symbol",
      sidc,
      position: [0, 0],
      rotation: 0,
      size: { value: 40, unit: "pixels" },
      textAmplifiers,
    });
    expect(render.svg).toContain("INSIDE");
    expect(render.svg).toContain("END-TIME");
  });

  it("maps applicable expanded values and omits dormant ones", () => {
    expect(
      pointTextAmplifierMilsymbolOptions({
        sidc: sidcFor("10"),
        textAmplifiers: { G: "Ready", M: "2 BDE", AE: "15 min" } as never,
      }),
    ).toEqual({ staffComments: "Ready", higherFormation: "2 BDE" });
  });

  it("feeds expanded applicable values into the generated point-symbol SVG", () => {
    const render = pointSymbolCapability.render({
      id: "amplified",
      kind: "point-symbol",
      sidc: "150310001512110000000000000000",
      position: [0, 0],
      rotation: 0,
      size: { value: 40, unit: "pixels" },
      textAmplifiers: { G: "READY-G-123", M: "2-BDE-M-123" } as never,
    });
    expect(render.svg).toContain("READY-G-123");
    expect(render.svg).toContain("2-BDE-M-123");
  });
});
