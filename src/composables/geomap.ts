import { createUnitFeatureAt, createUnitLayer } from "../geo/layers";
import { useScenarioStore } from "../stores/scenarioStore";
import Fade from "ol-ext/featureanimation/Fade";

export function useUnitLayer() {
  const scenarioStore = useScenarioStore();
  const unitLayer = createUnitLayer();
  const drawUnits = () => {
    unitLayer.getSource().clear();
    const units = scenarioStore.everyVisibleUnits.map((unit) => {
      return createUnitFeatureAt(unit._state!.coordinates!, unit);
    });
    unitLayer.getSource().addFeatures(units);
  };

  const animateUnits = () => {
    unitLayer.getSource().clear();
    const units = scenarioStore.everyVisibleUnits.map((unit) => {
      return createUnitFeatureAt(unit._state!.coordinates!, unit);
    });
    unitLayer.getSource().addFeatures(units);
    units.forEach((f) =>
      //@ts-ignore
      unitLayer.animateFeature(f, new Fade({ duration: 1000 }))
    );
  };

  return { unitLayer, drawUnits, animateUnits };
}
