import { defineStore } from "pinia";

export const useGeoEditorViewStore = defineStore("geoEditorView", {
  state: () => ({
    panelWidthA: 382,
    detailsPanelWidth: 382,
    detailsRight: true,
    showDetailsPanel: true,
  }),
});
