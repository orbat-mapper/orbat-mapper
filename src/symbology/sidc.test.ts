import { describe, expect, it } from "vitest";
import { parseExtendedSidc, sidcVersionForStandard, Sidc } from "@/symbology/sidc";

describe("Parse SIDC", function () {
  const testSidc = "11223344556677889900";
  const sidc = "100310001312110046009001234567";

  it("parses sidc", () => {
    const s = new Sidc(testSidc);
    expect(s.version).toBe("11");
    expect(s.context).toBe("2");
    expect(s.standardIdentity).toBe("2");
    expect(s.symbolSet).toBe("33");
    expect(s.status).toBe("4");
    expect(s.hqtfd).toBe("4");
    expect(s.amplifier).toBe("5");
    expect(s.amplifierDescriptor).toBe("5");
    expect(s.entity).toBe("66");
    expect(s.entityType).toBe("77");
    expect(s.entitySubType).toBe("88");
    expect(s.modifierOne).toBe("99");
    expect(s.modifierTwo).toBe("00");
  });

  it("parses edition E common modifiers as logical modifier codes", () => {
    const s = new Sidc("1513100012345678900011A0000840");
    expect(s.version).toBe("15");
    expect(s.context).toBe("1");
    expect(s.standardIdentity).toBe("3");
    expect(s.symbolSet).toBe("10");
    expect(s.modifierOne).toBe("190");
    expect(s.modifierTwo).toBe("100");
  });

  it("serializes edition E sidcs from logical modifier codes", () => {
    const sidc = new Sidc("1513100012345678900011A0000840");
    sidc.modifierOne = "107";
    sidc.modifierTwo = "00";
    expect(sidc.toString()).toBe("1513100012345678070010A0000840");
  });

  it("round-trips edition E sidcs without exposing set C fields", () => {
    const sidc = "1513100012345678900011A0000840";
    expect(new Sidc(sidc).toString()).toBe(sidc);
  });

  it("keeps legacy sidcs at 20 positions when serializing", () => {
    expect(new Sidc(testSidc).toString()).toBe(testSidc);
  });

  it("keeps legacy sidcs at 20 positions when assigned a common modifier code", () => {
    const sidc = new Sidc("10031000000000000000");
    sidc.modifierOne = "107";
    expect(sidc.toString()).toBe("10031000000000000700");
  });

  it("does not treat custom-symbol extended data as edition E layout", () => {
    const customSymbolSidc = "100310001312110046009001234567";
    const sidc = new Sidc(customSymbolSidc);
    expect(sidc.modifierOne).toBe("46");
    expect(sidc.modifierTwo).toBe("00");
    expect(sidc.toString()).toBe("10031000131211004600");
  });

  it("returns the SIDC version for each symbology standard", () => {
    expect(sidcVersionForStandard("2525e")).toBe("15");
    expect(sidcVersionForStandard("2525d")).toBe("10");
    expect(sidcVersionForStandard("app6d")).toBe("10");
    expect(sidcVersionForStandard()).toBe("10");
  });

  it("parses extended sidc", () => {
    const { originatorIdentifier, originatorSymbolSet, data } = parseExtendedSidc(sidc);
    expect(originatorIdentifier).toBe("900");
    expect(originatorSymbolSet).toBe("1");
    expect(data).toBe("234567");
  });

  it("gets main icon", () => {
    const s = new Sidc(testSidc);
    expect(s.mainIcon).toBe("667788");
  });

  it("sets main icon", () => {
    const s = new Sidc(testSidc);
    s.mainIcon = "123456";
    expect(s.entity).toBe("12");
    expect(s.entityType).toBe("34");
    expect(s.entitySubType).toBe("56");
    expect(s.mainIcon).toBe("123456");
  });
});
