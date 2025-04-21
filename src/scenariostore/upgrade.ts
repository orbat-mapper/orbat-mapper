import type { Scenario } from "@/types/scenarioModels";
import { compare as compareVersions } from "compare-versions";
import type { ScenarioFeatureMeta } from "@/types/scenarioGeoModels";
import { type SimpleStyleSpec } from "@/geo/simplestyle";

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
          "text-placement": textPlacement,
          "text-align": textAlign,
          "text-offset-x": textOffsetX,
          "text-offset-y": textOffsetY,
          limitVisibility,
          minZoom,
          maxZoom,
          textMinZoom,
          textMaxZoom,
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
          "stroke-style": "solid",
          showLabel,
          stroke,
          "marker-color": markerColor,
          "marker-size": markerSize,
          "marker-symbol": markerSymbol,
          "stroke-width": strokeWidth,
          "text-placement": textPlacement,
          "text-align": textAlign,
          "text-offset-x": textOffsetX,
          "text-offset-y": textOffsetY,
          title,
          limitVisibility,
          minZoom,
          maxZoom,
          textMinZoom,
          textMaxZoom,
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
