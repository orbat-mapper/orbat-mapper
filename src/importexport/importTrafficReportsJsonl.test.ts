import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import {
  NEUTRAL_TRAFFIC_REPORT_SIDC,
  trafficReportsJsonlToPayload,
} from "@/importexport/importTrafficReportsJsonl";
import { importTrafficReports } from "@/importexport/importTrafficReports";
import { createEmptyScenario } from "@/scenariostore/io";
import { useGeo } from "@/scenariostore/geo";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";

const report = {
  report_id: "report-1",
  dtg: "080030Z JUN 14",
  timestamp_utc: "2014-06-08T00:30:59Z",
  report_type: "HUMINT",
  latitude: 50.147132,
  longitude: 23.15442,
  report_text: "Example report",
};

describe("trafficReportsJsonlToPayload", () => {
  it("creates neutral features and located units with timestamps in 2026", () => {
    const payload = trafficReportsJsonlToPayload(`${JSON.stringify(report)}\n`, {
      visibilityMinutes: 0,
    });
    const [feature] = payload.features;
    const [unit] = payload.units;

    expect(feature).toMatchObject({
      id: "traffic-report-feature-report-1",
      name: "HUMINT — 080030Z JUN 14",
      description: "Example report",
      geometry: { type: "Point", coordinates: [23.15442, 50.147132] },
      visibleFromT: "2026-06-08T00:30:59.000Z",
      userData: {
        timestamp_utc: "2026-06-08T00:30:59.000Z",
        sidc: NEUTRAL_TRAFFIC_REPORT_SIDC,
      },
    });
    expect(unit).toMatchObject({
      id: "traffic-report-unit-report-1",
      sidc: NEUTRAL_TRAFFIC_REPORT_SIDC,
      location: [23.15442, 50.147132],
      visibleFromT: "2026-06-08T00:30:59.000Z",
    });
    expect(payload.startTime).toBe("2026-06-08T00:30:59.000Z");
    expect(payload.currentTime).toBe("2026-06-08T00:30:59.000Z");
  });

  it("reports the line number for malformed input", () => {
    expect(() =>
      trafficReportsJsonlToPayload(`${JSON.stringify(report)}\nnot-json`),
    ).toThrow("Line 2: invalid JSON.");
  });

  it("rejects invalid coordinates before importing anything", () => {
    expect(() =>
      trafficReportsJsonlToPayload(JSON.stringify({ ...report, latitude: 91 })),
    ).toThrow("Line 1: latitude is outside its valid range.");
  });
});

describe("importing a traffic reports payload into a scenario", () => {
  beforeEach(() => setActivePinia(createPinia()));

  function importScenario(source: string, options = {}) {
    const store = useNewScenarioStore(createEmptyScenario({ id: "jsonl-scenario" }));
    const time = useScenarioTime(store);
    const scenario = {
      store,
      unitActions: useUnitManipulations(store),
      geo: useGeo(store),
      time,
    } as unknown as Parameters<typeof importTrafficReports>[0];

    importTrafficReports(scenario, trafficReportsJsonlToPayload(source, options));
    return { store, time };
  }

  it("gives every unit a timed state entry holding its coordinates", () => {
    const { store } = importScenario(JSON.stringify(report), { visibilityMinutes: 0 });

    const unit = store.state.unitMap["traffic-report-unit-report-1"];
    expect(unit.state).toEqual([
      {
        id: "traffic-report-unit-report-1-t0",
        t: Date.parse("2026-06-08T00:30:59Z"),
        location: [23.15442, 50.147132],
      },
    ]);
    // Without this projection the unit exists in the ORBAT tree but never renders.
    expect(unit._state?.location).toEqual([23.15442, 50.147132]);
  });

  it("keeps a report off the map until the clock reaches it", () => {
    const { store, time } = importScenario(JSON.stringify(report), {
      visibilityMinutes: 0,
    });
    const unitId = "traffic-report-unit-report-1";

    // An initial `location` would project from the beginning of time and show the whole
    // dataset at once, which is exactly what this import must not do.
    expect(store.state.unitMap[unitId].location).toBeUndefined();

    time.setCurrentTime(Date.parse("2026-06-08T00:00:00Z"));
    expect(store.state.unitMap[unitId]._state?.location).toBeFalsy();

    time.setCurrentTime(Date.parse("2026-06-08T00:30:59Z"));
    expect(store.state.unitMap[unitId]._state?.location).toEqual([23.15442, 50.147132]);
  });

  it("retires a report once its visibility window has passed", () => {
    const { store, time } = importScenario(JSON.stringify(report), {
      visibilityMinutes: 60,
    });
    const unitId = "traffic-report-unit-report-1";

    time.setCurrentTime(Date.parse("2026-06-08T01:00:00Z"));
    expect(store.state.unitMap[unitId]._state?.location).toEqual([23.15442, 50.147132]);

    time.setCurrentTime(Date.parse("2026-06-08T01:31:00Z"));
    expect(store.state.unitMap[unitId]._state?.location).toBeFalsy();
  });

  it("rebases reports onto the configured year", () => {
    const { store } = importScenario(JSON.stringify(report), { targetYear: 2030 });

    expect(store.state.unitMap["traffic-report-unit-report-1"].state?.[0].t).toBe(
      Date.parse("2030-06-08T00:30:59Z"),
    );
  });
});
