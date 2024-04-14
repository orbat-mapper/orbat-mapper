import { defineStore } from "pinia";
import { computed, ref, watch, watchEffect } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { formatDateString, formatDTG } from "@/geo/utils";
import { TScenario } from "@/scenariostore";
import { useLocalStorage } from "@vueuse/core";
import { RadioGroupItem } from "@/components/types";

export type TimeFormat = "iso" | "local" | "military" | "custom";

export interface TimeFormatSettings {
  timeFormat: TimeFormat;
  locale: string;
  dateStyle: Intl.DateTimeFormatOptions["dateStyle"];
  timeStyle: Intl.DateTimeFormatOptions["timeStyle"];
}

export const timeFormatItems: RadioGroupItem<TimeFormat>[] = [
  { name: "ISO 8601", value: "iso" },
  { name: "Localized", value: "local" },
  { name: "Military DTG", value: "military" },
];

export const intlItems = [
  { label: "Full", value: "full" },
  { label: "Long", value: "long" },
  { label: "Medium", value: "medium" },
  { label: "Short", value: "short" },
];

export const useTimeFormatSettingsStore = defineStore("timeFormatSettings", {
  state: () => {
    return {
      track: useLocalStorage("trackTimeFormat", {
        timeFormat: "local",
        locale: "",
        dateStyle: "short",
        timeStyle: "short",
      } as TimeFormatSettings),
      scenario: useLocalStorage("scenarioTimeFormat", {
        timeFormat: "local",
        locale: "",
        dateStyle: "medium",
        timeStyle: "short",
      } as TimeFormatSettings),
    };
  },
});

export const useTimeFormatStore = defineStore("timeFormat", () => {
  const s = useTimeFormatSettingsStore();

  const timeZone = ref("UTC");
  const trackFormatter = computed(() => {
    return createFormatter(timeZone.value, s.track);
  });

  const scenarioFormatter = computed(() => {
    return createFormatter(timeZone.value, s.scenario);
  });
  return { timeZone, trackFormatter, scenarioFormatter };
});

function createFormatter(timeZone: string, settings: TimeFormatSettings) {
  if (settings.timeFormat === "iso") {
    return {
      format: (value: number) => formatDateString(value, timeZone),
    };
  }
  if (settings.timeFormat === "military") {
    return {
      format: (value: number) => formatDTG(value, timeZone),
    };
  }
  return new Intl.DateTimeFormat(settings.locale || undefined, {
    timeZone,
    dateStyle: settings.dateStyle,
    timeStyle: settings.timeStyle,
  });
}

export function useTimeFormatterProvider(options: { activeScenario?: TScenario } = {}) {
  const { store } = options.activeScenario || injectStrict(activeScenarioKey);
  const s = useTimeFormatStore();
  watchEffect(() => {
    const tz = store.state.info.timeZone;
    s.timeZone = tz ?? "UTC";
  });
}
