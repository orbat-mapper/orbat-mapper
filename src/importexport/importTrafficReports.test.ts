import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import {
  importTrafficReports,
  TRAFFIC_REPORTS_LAYER_ID,
  TRAFFIC_REPORTS_SIDE_ID,
  type TrafficReportsPayload,
} from "@/importexport/importTrafficReports";
import { createEmptyScenario } from "@/scenariostore/io";
import { useGeo } from "@/scenariostore/geo";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useScenarioTime } from "@/scenariostore/time";
import { useUnitManipulations } from "@/scenariostore/unitManipulations";

describe("importTrafficReports", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("adds overlay features and neutral units with locations", () => {
    const store = useNewScenarioStore(createEmptyScenario({ id: "test-scenario" }));
    const scenario = {
      store,
      unitActions: useUnitManipulations(store),
      geo: useGeo(store),
      time: useScenarioTime(store),
    } as unknown as Parameters<typeof importTrafficReports>[0];

    const payload: TrafficReportsPayload = {
      features: [
        {
          id: "feature-1",
          name: "SPOTREP — 080028Z JUN 14",
          description: "Report body",
          geometry: { type: "Point", coordinates: [22.546177, 50.056778] },
          visibleFromT: "2014-06-08T00:28:58Z",
          sidc: "10041000001205000000",
        },
      ],
      units: [
        {
          id: "unit-1",
          name: "SPOTREP — 080028Z JUN 14",
          description: "Report body",
          sidc: "10041000001205000000",
          location: [22.546177, 50.056778],
          visibleFromT: "2014-06-08T00:28:58Z",
        },
      ],
      center: [22.546177, 50.056778],
      startTime: "2014-06-08T00:28:58Z",
      currentTime: "2014-06-08T01:00:00Z",
    };

    const result = importTrafficReports(scenario, payload);

    expect(result.importedFeatures).toBe(1);
    expect(result.importedUnits).toBe(1);
    expect(store.state.layerStackMap[TRAFFIC_REPORTS_LAYER_ID]).toBeTruthy();
    expect(store.state.sideMap[TRAFFIC_REPORTS_SIDE_ID]?.standardIdentity).toBe("4");
    // The position is timed state only; an initial location would ignore the clock.
    expect(store.state.unitMap["unit-1"]?.location).toBeUndefined();
    expect(store.state.unitMap["unit-1"]?.state?.[0]).toMatchObject({
      t: Date.parse("2014-06-08T00:28:58Z"),
      location: [22.546177, 50.056778],
    });
    expect(store.state.currentTime).toBe(Date.parse("2014-06-08T01:00:00Z"));
    expect(store.state.layerItemMap["feature-1"]?.description).toBe("Report body");
  });
});
