import { describe, it, expect, vi, beforeEach } from "vitest";

import { useScenarioFileLoader } from "@/composables/useScenarioFileLoader";

describe("useScenarioFileLoader", () => {
  const onLoaded = vi.fn();

  beforeEach(() => {
    onLoaded.mockReset();
  });

  it("loads a valid scenario file", async () => {
    const { loadFile, isError } = useScenarioFileLoader(onLoaded);
    const file = new File(
      [JSON.stringify({ id: "s1", type: "ORBAT-mapper", sides: [] })],
      "scenario.json",
      { type: "application/json" },
    );

    await loadFile(file);

    expect(onLoaded).toHaveBeenCalledWith({ id: "s1", type: "ORBAT-mapper", sides: [] });
    expect(isError.value).toBe(false);
  });

  it("loads a valid encrypted scenario file", async () => {
    const { loadFile, isError } = useScenarioFileLoader(onLoaded);
    const file = new File(
      [JSON.stringify({ id: "s2", type: "ORBAT-mapper-encrypted", payload: "cipher" })],
      "encrypted.json",
      { type: "application/json" },
    );

    await loadFile(file);

    expect(onLoaded).toHaveBeenCalledWith({
      id: "s2",
      type: "ORBAT-mapper-encrypted",
      payload: "cipher",
    });
    expect(isError.value).toBe(false);
  });

  it("sets an error for invalid JSON", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadFile, isError } = useScenarioFileLoader(onLoaded);
    const file = new File(["not json"], "invalid.json", { type: "application/json" });

    await loadFile(file);

    expect(onLoaded).not.toHaveBeenCalled();
    expect(isError.value).toBe(true);
    consoleError.mockRestore();
  });

  it("sets an error for an unsupported payload type", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadFile, isError } = useScenarioFileLoader(onLoaded);
    const file = new File(
      [JSON.stringify({ type: "FeatureCollection" })],
      "wrong-type.json",
      { type: "application/json" },
    );

    await loadFile(file);

    expect(onLoaded).not.toHaveBeenCalled();
    expect(isError.value).toBe(true);
    consoleError.mockRestore();
  });
});
