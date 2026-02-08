import { describe, it, expect } from "vitest";
import { toCsv } from "./scenarioExport";

describe("toCsv", () => {
  it("should return empty string for empty data", () => {
    expect(toCsv([], ",")).toBe("");
  });

  it("should generate CSV with comma separator", () => {
    const data = [
      { name: "Unit A", sidc: "10031000001211000000", location: "12.5, 45.3" },
      { name: "Unit B", sidc: "10031000001211000001", location: "13.0, 46.0" },
    ];
    const result = toCsv(data, ",");
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("name,sidc,location");
    expect(lines[1]).toBe("Unit A,10031000001211000000,\"12.5, 45.3\"");
    expect(lines[2]).toBe("Unit B,10031000001211000001,\"13.0, 46.0\"");
  });

  it("should generate TSV with tab separator", () => {
    const data = [
      { name: "Unit A", sidc: "ABC" },
      { name: "Unit B", sidc: "DEF" },
    ];
    const result = toCsv(data, "\t");
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("name\tsidc");
    expect(lines[1]).toBe("Unit A\tABC");
    expect(lines[2]).toBe("Unit B\tDEF");
  });

  it("should generate with semicolon separator", () => {
    const data = [{ name: "Unit A", value: "100" }];
    const result = toCsv(data, ";");
    const lines = result.split("\n");
    expect(lines[0]).toBe("name;value");
    expect(lines[1]).toBe("Unit A;100");
  });

  it("should escape fields containing the separator", () => {
    const data = [{ name: "Unit A, Special", sidc: "ABC" }];
    const result = toCsv(data, ",");
    expect(result).toContain('"Unit A, Special"');
  });

  it("should escape fields containing double quotes", () => {
    const data = [{ name: 'Unit "Alpha"', sidc: "ABC" }];
    const result = toCsv(data, ",");
    expect(result).toContain('"Unit ""Alpha"""');
  });

  it("should escape fields containing newlines", () => {
    const data = [{ name: "Unit\nAlpha", sidc: "ABC" }];
    const result = toCsv(data, ",");
    expect(result).toContain('"Unit\nAlpha"');
  });

  it("should handle null and undefined values", () => {
    const data = [{ name: null, sidc: undefined }];
    const result = toCsv(data as any, ",");
    const lines = result.split("\n");
    expect(lines[1]).toBe(",");
  });
});
