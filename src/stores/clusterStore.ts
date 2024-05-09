import { defineStore } from "pinia";

export const useClusterSettingsStore = defineStore("cluster", {
  state: () => ({
    enabled: true,
    distance: 40,
    minDistance: 20,
    animationDuration: 250,
  }),
});
