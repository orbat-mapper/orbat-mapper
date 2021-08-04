import { defineStore } from "pinia";
import { useScenarioStore, walkSide } from "./scenarioStore";
import dayjs, { OpUnitType } from "dayjs";

export const useScenarioTime = defineStore({
  id: "scenarioTime",
  actions: {
    jumpToNextEvent() {
      const scenarioStore = useScenarioStore();
      const timestamp = scenarioStore.currentTime;
      let newTime = Number.MAX_VALUE;
      for (const side of scenarioStore.scenario.sides) {
        walkSide(side, (unit) => {
          if (!unit?.state?.length) {
            return;
          }
          for (const s of unit.state) {
            if (s.t > timestamp) {
              if (s.t < newTime) newTime = s.t;
              break;
            }
          }
        });
      }
      if (newTime < Number.MAX_VALUE) scenarioStore.setCurrentTime(newTime);
    },

    jumpToPrevEvent() {
      const scenarioStore = useScenarioStore();
      const timestamp = scenarioStore.currentTime;
      let newTime = Number.MIN_VALUE;
      for (const side of scenarioStore.scenario.sides) {
        walkSide(side, (unit) => {
          if (!unit?.state?.length) {
            return;
          }
          for (const s of unit.state) {
            if (s.t < timestamp) {
              if (s.t > newTime) newTime = s.t;
              break;
            }
          }
        });
      }
      if (newTime > Number.MIN_VALUE) scenarioStore.setCurrentTime(newTime);
    },

    add(amount: number, unit: OpUnitType) {
      const scenarioStore = useScenarioStore();
      const newTime = dayjs(scenarioStore.currentTime).add(amount, unit);
      scenarioStore.setCurrentTime(newTime.valueOf());
    },

    subtract(amount: number, unit: OpUnitType) {
      const scenarioStore = useScenarioStore();
      const newTime = dayjs(scenarioStore.currentTime).subtract(amount, unit);
      scenarioStore.setCurrentTime(newTime.valueOf());
    },
  },
});
