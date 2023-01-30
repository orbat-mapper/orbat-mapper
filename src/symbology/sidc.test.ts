import { describe, expect, it } from "vitest";
import { parseExtendedSidc, Sidc } from "@/symbology/sidc";

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
