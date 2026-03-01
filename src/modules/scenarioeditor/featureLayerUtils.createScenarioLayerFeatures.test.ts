import { describe, expect, it } from "vitest";
import { createScenarioLayerFeatures } from "@/modules/scenarioeditor/featureLayerUtils";

describe("createScenarioLayerFeatures", () => {
  it("sets OpenLayers feature name from scenario feature meta name", () => {
    const [olFeature] = createScenarioLayerFeatures(
      [
        {
          id: "f1",
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [10, 60],
          },
          properties: {},
          meta: { type: "Point", name: "Bridge Alpha" },
          style: {},
        } as any,
      ],
      "EPSG:3857",
    );

    expect(olFeature.get("name")).toBe("Bridge Alpha");
  });
});
