import { defineStore } from "pinia";

export const useMapSelectStore = defineStore("uiMapSelect", {
  state: () => ({
    unitSelectEnabled: true,
    featureSelectEnabled: true,
  }),
});
