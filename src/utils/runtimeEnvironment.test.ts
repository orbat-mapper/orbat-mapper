import { afterEach, describe, expect, it, vi } from "vitest";
import {
  areDemoScenariosAvailable,
  canFetchAppAssets,
  isFileProtocol,
  isGeoSearchAvailable,
} from "@/utils/runtimeEnvironment";

function stubProtocol(protocol: string) {
  vi.stubGlobal("location", { ...globalThis.location, protocol });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runtime environment", () => {
  it("detects a standalone file", () => {
    stubProtocol("file:");

    expect(isFileProtocol()).toBe(true);
    expect(canFetchAppAssets()).toBe(false);
    expect(areDemoScenariosAvailable()).toBe(false);
    expect(isGeoSearchAvailable()).toBe(false);
  });

  it("treats a served app as fully capable", () => {
    stubProtocol("https:");

    expect(isFileProtocol()).toBe(false);
    expect(canFetchAppAssets()).toBe(true);
    expect(areDemoScenariosAvailable()).toBe(true);
    expect(isGeoSearchAvailable()).toBe(true);
  });

  it("treats a local dev server as served", () => {
    stubProtocol("http:");

    expect(isFileProtocol()).toBe(false);
  });

  it("does not assume a location exists", () => {
    vi.stubGlobal("location", undefined);

    expect(isFileProtocol()).toBe(false);
  });
});
