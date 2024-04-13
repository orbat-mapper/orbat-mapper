import { defineStore } from "pinia";
import { computed, ref, watch, watchEffect } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { formatDateString, formatDTG } from "@/geo/utils";
import { TScenario } from "@/scenariostore";

export type TimeFormat = "iso" | "local" | "military" | "custom";

export const useTimeFormatSettingsStore = defineStore("timeFormatSettings", {
  state: () => {
    return {
      timeFormat: "local" as TimeFormat,
      locale: "",
      dateStyle: "short" as Intl.DateTimeFormatOptions["dateStyle"],
      timeStyle: "short" as Intl.DateTimeFormatOptions["timeStyle"],
    };
  },
});

export const useTimeFormatStore = defineStore("timeFormat", () => {
  const s = useTimeFormatSettingsStore();

  const timeZone = ref("UTC");
  const pathFormatter = computed(() => {
    const locale = s.locale || undefined;
    if (s.timeFormat === "iso") {
      return {
        format: (value: number) => formatDateString(value, timeZone.value),
      };
    }
    if (s.timeFormat === "military") {
      return {
        format: (value: number) => formatDTG(value, timeZone.value!),
      };
    }
    return new Intl.DateTimeFormat(locale, {
      timeZone: timeZone.value,
      dateStyle: s.dateStyle,
      timeStyle: s.timeStyle,
    });
  });
  return { timeZone, pathFormatter };
});

export function useTimeFormatterProvider(options: { activeScenario?: TScenario } = {}) {
  const { store } = options.activeScenario || injectStrict(activeScenarioKey);
  const s = useTimeFormatStore();
  watchEffect(() => {
    const tz = store.state.info.timeZone;
    s.timeZone = tz ?? "UTC";
  });
}
