import { describe, expect, it } from "vitest";
import { parseApplicationOrbat } from "@/importexport/convertUtils";

describe("parseApplicationOrbat", () => {
  it("returns null for an empty string", () => {
    expect(parseApplicationOrbat("")).toBeNull();
  });

  it("returns null for whitespace-only text", () => {
    expect(parseApplicationOrbat("  \n\t  ")).toBeNull();
  });

  it("returns null for invalid json", () => {
    expect(parseApplicationOrbat("not json")).toBeNull();
  });

  it("returns parsed units for a valid unit array", () => {
    const payload = JSON.stringify([
      { id: "u1", name: "Unit 1", sidc: "10031000001211000000" },
    ]);

    expect(parseApplicationOrbat(payload)).toEqual([
      { id: "u1", name: "Unit 1", sidc: "10031000001211000000" },
    ]);
  });
});
