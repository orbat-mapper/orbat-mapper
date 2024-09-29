import type { Scenario } from "@/types/scenarioModels";
import { compare as compareVersions } from "compare-versions";
import type { ScenarioFeatureMeta } from "@/types/scenarioGeoModels";
import { SimpleStyleSpec } from "@/geo/simplestyle";

export function upgradeScenarioIfNecessary(scenario: Scenario): Scenario {
  if (compareVersions(scenario.version, "0.30.0", "<")) {
    console.log("Found outdated scenario version, upgrading from", scenario.version);
    const upgradedScenario = { ...scenario };
    upgradedScenario.layers = upgradedScenario.layers.map((layer) => {
      const upgradedLayer = { ...layer };
      upgradedLayer.features = upgradedLayer.features.map((feature) => {
        const upgradedFeature = { ...feature };
        const {
          visibleFromT,
          visibleUntilT,
          type,
          name,
          description,
          externalUrl,
          radius,
          _zIndex,
          "fill-opacity": fillOpacity,
          fill,
          showLabel,
          "stroke-opacity": strokeOpacity,
          stroke,
          "marker-color": markerColor,
          "marker-size": markerSize,
          "marker-symbol": markerSymbol,
          "stroke-width": strokeWidth,
          title,
          ...rest
        } = upgradedFeature.properties ?? {};

        const meta: Required<Omit<ScenarioFeatureMeta, "locked">> = {
          type,
          visibleFromT,
          visibleUntilT,
          name,
          description,
          externalUrl,
          radius,
          _zIndex,
        };

        const style: Omit<Required<SimpleStyleSpec>, "_fill" | "_stroke"> = {
          fill,
          "fill-opacity": fillOpacity,
          "stroke-opacity": strokeOpacity,
          showLabel,
          stroke,
          "marker-color": markerColor,
          "marker-size": markerSize,
          "marker-symbol": markerSymbol,
          "stroke-width": strokeWidth,
          title,
        };
        upgradedFeature.meta = meta;
        upgradedFeature.style = style;
        upgradedFeature.properties = rest;
        return upgradedFeature;
      });
      return upgradedLayer;
    });
    return upgradedScenario;
  }
  return scenario;
}
