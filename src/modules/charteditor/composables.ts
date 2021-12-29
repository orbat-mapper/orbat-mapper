import { ChartItemType, Unit } from "./orbatchart";
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
      case ChartItemType.Level:
        return mOptions.level;
      case ChartItemType.LevelGroup:
        return mOptions.levelGroup;
      case ChartItemType.Unit:
        return mOptions.unit;
      default:
        return null;
    }
  });

  const currentElement = computed(() => {
    switch (chartElementType) {
      case ChartItemType.Level:
        return selectedElementStore.level;
      case ChartItemType.LevelGroup:
        return selectedElementStore.levelGroup?.parent || null;
      case ChartItemType.Unit:
        return selectedElementStore.node?.unit || null;
      default:
        return null;
    }
  });

  const elementOptions = computed(() => {
    if (currentElement.value == null) return null;
    switch (chartElementType) {
      case ChartItemType.Level:
        return specificOptionsStore.level[currentElement.value as number];
      case ChartItemType.LevelGroup:
        return specificOptionsStore.levelGroup[currentElement.value as string | number];
      case ChartItemType.Unit:
        return specificOptionsStore.unit[(currentElement.value as Unit).id] || null;
      default:
        return null;
    }
  });

  function setValue(name: string, value: any) {
    if (currentElement.value == null) return;
    const opts = { ...(elementOptions.value || {}), [name]: value };
    switch (chartElementType) {
      case ChartItemType.Level:
        specificOptionsStore.level[currentElement.value as number] = opts;
        break;
      case ChartItemType.LevelGroup:
        specificOptionsStore.levelGroup[currentElement.value as string | number] = opts;
        break;
      case ChartItemType.Unit:
        specificOptionsStore.unit[(currentElement.value as Unit).id] = opts;
        break;
    }
  }

  function clearSpecificOptions() {
    const opts = {};
    if (currentElement.value == null) return;
    switch (chartElementType) {
      case ChartItemType.Level:
        specificOptionsStore.level[currentElement.value as number] = opts;
        break;
      case ChartItemType.LevelGroup:
        specificOptionsStore.levelGroup[currentElement.value as string | number] = opts;
        break;
      case ChartItemType.Unit:
        specificOptionsStore.unit[(currentElement.value as Unit).id] = opts;
        break;
    }
  }

  const usedOptions = computed(() => new Set(Object.keys(elementOptions.value || {})));
  return { setValue, clearSpecificOptions, usedOptions, mergedOptions };
}
