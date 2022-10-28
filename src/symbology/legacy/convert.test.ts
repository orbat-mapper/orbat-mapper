import { convertLetterSIDC2NumberSIDC, replaceCharAt } from "./convert";
import { SID_MAP, STATUS_MAP } from "@/symbology/legacy/mappings";
import { expect } from "vitest";

describe("fromCharlie2Delta", function () {
  it("is exported", () => {
    expect(convertLetterSIDC2NumberSIDC).toBeDefined();
  });

  it("invalid SIDC should return empty string", () => {
    expect(convertLetterSIDC2NumberSIDC("ILLEGALVALUE")).toBe("");
  });

  describe("surface units", () => {
    it("frigate", () => {
      expect(convertLetterSIDC2NumberSIDC("SFSPCLFF----")).toBe("10033000001202040000");
    });

    it("littoral combatant towed array (short", () => {
      expect(convertLetterSIDC2NumberSIDC("SFSPCLLL--NS")).toBe("10033000611202060000");
    });
  });

  describe("installations", () => {
    it("dam", () => {
      expect(convertLetterSIDC2NumberSIDC("EFFPMB----H****")).toBe(
        "10032000001214020000"
      );
    });
  });

  it("infantry", () => {
    expect(convertLetterSIDC2NumberSIDC("SFGPUCI-----")).toBe("10031000001211000000");
  });

  it("arctic infantry company", () => {
    expect(convertLetterSIDC2NumberSIDC("SFGPUCIC---E---")).toBe("10031000151211000002");
  });

  it("arctic infantry squad", () => {
    expect(convertLetterSIDC2NumberSIDC("SFGPUCIC---A---")).toBe("10031000111211000002");
  });

  it("pumping station", () => {
    // EFFPME----H****
    expect(convertLetterSIDC2NumberSIDC("EFFPME----")).toBe("10032000001214050000");
  });

  it("converts status", () => {
    const convertStatus = (letterStatus: string): string => {
      return convertLetterSIDC2NumberSIDC(
        replaceCharAt("SFGPUCI-----", 3, letterStatus)
      )[6];
    };

    for (const [key, value] of Object.entries(STATUS_MAP)) {
      expect(convertStatus(key)).toBe(value);
    }
  });

  it("converts standard identity", () => {
    const convertSID = (letterSid: string): string => {
      return convertLetterSIDC2NumberSIDC(
        replaceCharAt("SFGPUCI-----", 1, letterSid)
      ).substring(2, 4);
    };

    for (const [key, value] of Object.entries(SID_MAP)) {
      expect(convertSID(key)).toBe(value);
    }
  });
});
