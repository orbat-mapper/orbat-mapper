import { describe, expect, it } from "vitest";
import { collectTrafficReports } from "@/modules/scenarioeditor/collectTrafficReports";
import { TRAFFIC_REPORTS_LAYER_ID } from "@/importexport/importTrafficReports";
import type { TScenario } from "@/scenariostore";

describe("collectTrafficReports", () => {
  it("collects report records from the traffic reports overlay layer", () => {
    const scenario = {
      store: {
        state: {
          layerStackMap: {
            [TRAFFIC_REPORTS_LAYER_ID]: {
              id: TRAFFIC_REPORTS_LAYER_ID,
              kind: "overlay",
              name: "Traffic Reports",
              items: ["feature-1"],
            },
          },
          layerItemMap: {
            "feature-1": {
              id: "feature-1",
              kind: "geometry",
              name: "HUMINT — 250000Z AUG 26",
              description: "HUMINT REPORT text",
              visibleFromT: Date.parse("2026-08-25T00:00:00Z"),
              userData: {
                timestamp_utc: "2026-08-25T00:00:00Z",
                report_type: "HUMINT",
                equipment: "BMP-2",
                mgrs: "34UFA5392257211",
              },
            },
          },
        },
      },
    } as unknown as TScenario;

    expect(collectTrafficReports(scenario)).toEqual([
      {
        report_text: "HUMINT REPORT text",
        timestamp_utc: "2026-08-25T00:00:00Z",
        report_type: "HUMINT",
        equipment: "BMP-2",
        report_id: "feature-1",
        mgrs: "34UFA5392257211",
      },
    ]);
  });
});
