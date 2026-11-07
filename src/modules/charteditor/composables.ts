import { type ChartItemType, ChartItemTypes, type ChartUnit } from "./orbatchart";
import {
  useChartSettingsStore,
  useMergedChartOptionsStore,
  useSelectedChartElementStore,
  useSpecificChartOptionsStore,
} from "./chartSettingsStore";
import { computed } from "vue";

export function useChartSettings(chartElementType: ChartItemType) {
  const options = useChartSettingsStore();
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
      case ChartItemTypes.Chart:
        return options;
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
    if (currentElement.value == null && chartElementType !== ChartItemTypes.Chart)
      return null;
    switch (chartElementType) {
      case ChartItemTypes.Level:
        return specificOptionsStore.level[currentElement.value as number];
      case ChartItemTypes.Branch:
        return specificOptionsStore.branch[currentElement.value as string | number];
      case ChartItemTypes.Unit:
        return specificOptionsStore.unit[(currentElement.value as ChartUnit).id] || null;
      case ChartItemTypes.Chart:
        return options.$state;
      default:
        return null;
    }
  });

  // Replaces the options of the selected level, branch or unit
  function writeElementOptions(opts: Record<string, unknown>) {
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

  const chartState = () => options.$state as unknown as Record<string, unknown>;

  function setValue(name: string, value: any) {
    if (chartElementType === ChartItemTypes.Chart) {
      chartState()[name] = value;
      return;
    }
    writeElementOptions({ ...(elementOptions.value || {}), [name]: value });
  }

  function clearSpecificOptions() {
    writeElementOptions({});
  }

  // Removes the options instead of setting them to undefined, which would hide the
  // values inherited from the chart, level or branch.
  function clearValues(names: readonly string[]) {
    if (chartElementType === ChartItemTypes.Chart) {
      for (const name of names) chartState()[name] = undefined;
      return;
    }
    const opts: Record<string, unknown> = { ...(elementOptions.value || {}) };
    for (const name of names) delete opts[name];
    writeElementOptions(opts);
  }

  // Options set at this scope. An option set to undefined is not set.
  const usedOptions = computed(
    () =>
      new Set(
        Object.entries(elementOptions.value || {})
          .filter(([, value]) => value !== undefined)
          .map(([key]) => key),
      ),
  );
  // Whether each option in `names` is inherited rather than set at this scope, keyed
  // like `names`.
  function inheritedOptions<K extends string>(names: Readonly<Record<K, string>>) {
    return Object.fromEntries(
      Object.entries<string>(names).map(([key, name]) => [
        key,
        !usedOptions.value.has(name),
      ]),
    ) as Record<K, boolean>;
  }

  return {
    setValue,
    clearValues,
    clearSpecificOptions,
    inheritedOptions,
    usedOptions,
    mergedOptions,
  };
}
