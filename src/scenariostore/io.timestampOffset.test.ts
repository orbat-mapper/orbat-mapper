import { describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { countInvalidTimestamps, useScenarioIO } from "@/scenariostore/io";
import type { Scenario } from "@/types/scenarioModels";
import "@/dayjs";

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

function scenarioWithTime(t: string, timeZone: string): Scenario {
  return {
    id: "tz-test",
    type: "ORBAT-mapper",
    version: "3.6.0",
    name: "Time zone test",
    startTime: t,
    timeZone,
    symbologyStandard: "2525",
    sides: [
      {
        id: "side-1",
        name: "Side",
        standardIdentity: "3",
        groups: [
          {
            id: "group-1",
            name: "Group",
            subUnits: [
              {
                id: "unit-1",
                name: "Unit",
                sidc: "10031000001211000000",
                subUnits: [],
                state: [{ id: "s-1", t, location: [-70.5, -23] }],
              },
            ],
          },
        ],
      },
    ],
    events: [],
    layerStack: [],
  } as unknown as Scenario;
}

describe("timestamp serialization", () => {
  it("writes parseable timestamps when the zone offset is not whole minutes", () => {
    // America/Santiago used local mean time (-4:42:45) until 1910.
    const t = "1879-10-08T14:22:45Z";
    const store = useNewScenarioStore(scenarioWithTime(t, "America/Santiago"));
    const out = useScenarioIO(shallowRef(store)).serializeToObject();

    const unit = out.sides[0].groups[0].subUnits[0];
    expect(Date.parse(String(out.startTime))).toBe(Date.parse(t));
    expect(Date.parse(String(unit.state![0].t))).toBe(Date.parse(t));
  });

  it("keeps the local offset for whole-minute zones", () => {
    const store = useNewScenarioStore(
      scenarioWithTime("1982-05-01T12:00:00Z", "America/Santiago"),
    );
    const out = useScenarioIO(shallowRef(store)).serializeToObject();

    expect(out.startTime).toBe("1982-05-01T08:00:00-04:00");
  });

  it("still serializes a scenario that holds invalid timestamps", () => {
    const store = useNewScenarioStore(
      scenarioWithTime("1879-10-08T09:40:00-04:42.75", "America/Santiago"),
    );
    const io = useScenarioIO(shallowRef(store));

    expect(() => io.serializeToObject()).not.toThrow();
  });
});

describe("countInvalidTimestamps", () => {
  it("counts the timestamps that do not parse", () => {
    const scenario = scenarioWithTime("1879-10-08T09:40:00-04:42.75", "America/Santiago");

    expect(countInvalidTimestamps(scenario)).toBe(2);
  });

  it("is zero for a valid scenario", () => {
    const scenario = scenarioWithTime("1879-10-08T14:22:45Z", "America/Santiago");

    expect(countInvalidTimestamps(scenario)).toBe(0);
  });
});
