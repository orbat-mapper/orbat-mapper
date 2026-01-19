import { describe, it, expect } from "vitest";
import { resolveTimeZone } from "./militaryTimeZones";

describe("militaryTimeZones", () => {
  it("resolves military time zones to IANA names", () => {
    expect(resolveTimeZone("Alpha")).toBe("Etc/GMT-1");
    expect(resolveTimeZone("Zulu")).toBe("UTC");
    expect(resolveTimeZone("November")).toBe("Etc/GMT+1");
    expect(resolveTimeZone("X-ray")).toBe("Etc/GMT+11");
  });

  it("returns the input if it is not a military time zone", () => {
    expect(resolveTimeZone("UTC")).toBe("UTC");
    expect(resolveTimeZone("Europe/Oslo")).toBe("Europe/Oslo");
    expect(resolveTimeZone("America/New_York")).toBe("America/New_York");
  });
});
