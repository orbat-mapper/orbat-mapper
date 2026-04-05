import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumeImportedScenario,
  saveImportedScenario,
} from "@/composables/importScenarioTransfer";
import type { Scenario } from "@/types/scenarioModels";

const createScenario = (): Scenario =>
  ({
    id: "scenario-1",
    type: "ORBAT-mapper",
    version: "0.6.0",
    name: "Scenario",
    description: "",
    events: [],
    layerStack: [],
    layers: [{ id: "layer-1", name: "Features", items: [] }],
    mapLayers: [],
    sides: [],
    meta: {
      createdDate: "2026-03-04T10:00:00.000Z",
      lastModifiedDate: "2026-03-04T10:00:00.000Z",
    },
  }) as Scenario;

describe("importScenarioTransfer", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("saves and consumes scenario payload once", () => {
    const token = saveImportedScenario(createScenario());
    const consumed = consumeImportedScenario(token);

    expect(consumed).toBeTruthy();
    expect(consumed?.type).toBe("ORBAT-mapper");
    expect(consumeImportedScenario(token)).toBeNull();
  });

  it("returns null for expired payload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-04T10:00:00.000Z"));
    const token = saveImportedScenario(createScenario());

    vi.setSystemTime(new Date("2026-03-04T10:06:00.000Z"));
    expect(consumeImportedScenario(token)).toBeNull();
  });
});
