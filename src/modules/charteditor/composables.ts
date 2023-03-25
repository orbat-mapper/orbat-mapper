import { type ChartItemType, ChartItemTypes, type ChartUnit } from "./orbatchart";
import {
  useMergedChartOptionsStore,
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";
import { computed } from "vue";

export function useChartSettings(chartElementType: ChartItemType) {
  const selectedElementStore = useSelectedChartElementStore();
  const specificOptionsStore = useSpecificChartOptionsStore();

  const mOptions = useMergedChartOptionsStore();
  const mergedOptions = computed(() => {
    switch (chartElementType) {
      case ChartItemTypes.Level:
        return mOptions.level;
      case ChartItemTypes.Branch:
        return mOptions.branch;
      case ChartItemTypes.Unit:
        return mOptions.unit;
      default:
        return {};
    }
  });

  const currentElement = computed(() => {
    switch (chartElementType) {
      case ChartItemTypes.Level:
        return selectedElementStore.level;
      case ChartItemTypes.Branch:
        return selectedElementStore.branch?.parent || null;
      case ChartItemTypes.Unit:
        return selectedElementStore.node?.unit || null;
      default:
        return null;
    }
  });

  const elementOptions = computed(() => {
    if (currentElement.value == null) return null;
    switch (chartElementType) {
      case ChartItemTypes.Level:
        return specificOptionsStore.level[currentElement.value as number];
      case ChartItemTypes.Branch:
        return specificOptionsStore.branch[currentElement.value as string | number];
      case ChartItemTypes.Unit:
        return specificOptionsStore.unit[(currentElement.value as ChartUnit).id] || null;
      default:
        return null;
    }
  });

  function setValue(name: string, value: any) {
    if (currentElement.value == null) return;
    const opts = { ...(elementOptions.value || {}), [name]: value };
    switch (chartElementType) {
      case ChartItemTypes.Level:
        specificOptionsStore.level[currentElement.value as number] = opts;
        break;
      case ChartItemTypes.Branch:
        specificOptionsStore.branch[currentElement.value as string | number] = opts;
        break;
      case ChartItemTypes.Unit:
        specificOptionsStore.unit[(currentElement.value as ChartUnit).id] = opts;
        break;
    }
  }

  function clearSpecificOptions() {
    const opts = {};
    if (currentElement.value == null) return;
    switch (chartElementType) {
      case ChartItemTypes.Level:
        specificOptionsStore.level[currentElement.value as number] = opts;
        break;
      case ChartItemTypes.Branch:
        specificOptionsStore.branch[currentElement.value as string | number] = opts;
        break;
      case ChartItemTypes.Unit:
        specificOptionsStore.unit[(currentElement.value as ChartUnit).id] = opts;
        break;
    }
  }

  const usedOptions = computed(() => new Set(Object.keys(elementOptions.value || {})));
  return { setValue, clearSpecificOptions, usedOptions, mergedOptions };
}
