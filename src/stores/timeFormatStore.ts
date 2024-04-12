import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

export const useTimeFormatStore = defineStore("timeFormat", () => {
  const { store } = injectStrict(activeScenarioKey);
  const pathFormatter = computed(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: store.state.info.timeZone,
      timeZoneName: "shortOffset",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "numeric",
    });
  });
  return { timeZone: store.state.info.timeZone, pathFormatter };
});
