import fuzzysort from "fuzzysort";
import { NUnit } from "@/types/internalModels";
import { groupBy, htmlTagEscape, injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import {
  ActionSearchResult,
  EventSearchResult,
  MapLayerSearchResult,
  LayerFeatureSearchResult,
  UnitSearchResult,
} from "@/components/types";
import { ScenarioActions } from "@/types/constants";

export function useScenarioSearch() {
  const {
    unitActions,
    store: { state },
    geo,
  } = injectStrict(activeScenarioKey);

  function searchUnits(query: string, limitToPosition = false): UnitSearchResult[] {
    const q = query.trim();
    if (!q) return [];
    const hits = fuzzysort.go(q, unitActions.units.value, {
      keys: ["name", "shortName"],
    });
    return hits
      .filter((h) => {
        if (limitToPosition) return state.getUnitById(h.obj.id)?._state?.location;
        return true;
      })
      .slice(0, 10)
      .map((u, i) => {
        const parent = u.obj._pid && ({ ...state.getUnitById(u.obj._pid) } as NUnit);
        if (parent) {
          parent.symbolOptions = unitActions.getCombinedSymbolOptions(parent);
        }
        return {
          name: u.obj.name,
          sidc: u.obj.sidc,
          id: u.obj.id,
          index: i,
          parent,
          highlight:
            u[0] &&
            fuzzysort.highlight({
              ...u[0],
              score: u.score,
              target: htmlTagEscape(u[0].target),
            }),
          score: u.score,
          category: "Units",
          symbolOptions: unitActions.getCombinedSymbolOptions(u.obj),
          _state: u.obj._state,
        } as UnitSearchResult;
      });
  }

  function searchLayerFeatures(query: string) {
    const q = query.trim();
    if (!q) return [];

    const hits = fuzzysort.go(q, geo.itemsInfo.value, { key: ["name"] });

    return hits.slice(0, 10).map(
      (u, i) =>
        ({
          ...u.obj,
          highlight: fuzzysort.highlight({
            ...u,
            target: htmlTagEscape(u.target),
          }),
          score: u.score,
          category: "Features",
        }) as LayerFeatureSearchResult,
    );
  }

  function searchImageLayers(query: string) {
    const q = query.trim();
    if (!q) return [];

    const hits = fuzzysort.go(q, geo.mapLayers.value, { key: ["name"] });

    return hits.slice(0, 10).map(
      (u, i) =>
        ({
          ...u.obj,
          index: i,
          highlight: fuzzysort.highlight({
            ...u,
            target: htmlTagEscape(u.target),
          }),
          score: u.score,
          category: "Map layers",
        }) as MapLayerSearchResult,
    );
  }

  function searchEvents(query: string) {
    const q = query.trim();
    if (!q) return [];
    const mergedEvents = state.events.map((id) => state.eventMap[id]);

    const hits = fuzzysort.go(q, mergedEvents, { key: ["title"] });

    return hits.slice(0, 10).map(
      (u, i) =>
        ({
          ...u.obj,
          index: i,
          name: u.obj.title,
          highlight: fuzzysort.highlight({
            ...u,
            target: htmlTagEscape(u.target),
          }),
          score: u.score,
          category: "Events",
        }) as EventSearchResult,
    );
  }

  function combineHits(
    hits: (
      | UnitSearchResult[]
      | LayerFeatureSearchResult[]
      | EventSearchResult[]
      | MapLayerSearchResult[]
    )[],
  ) {
    const combinedHits = hits.sort((a, b) => {
      const scoreA = a[0]?.score ?? 1000;
      const scoreB = b[0]?.score ?? 1000;
      return scoreB - scoreA;
    });
    return [...combinedHits.flat()].map((e, index) => ({
      ...e,
      index,
    }));
  }

  function search(query: string) {
    const unitHits = searchUnits(query);
    const featureHits = searchLayerFeatures(query);
    const imageLayerHits = searchImageLayers(query);
    const eventHits = searchEvents(query);
    const allHits = combineHits([unitHits, featureHits, eventHits, imageLayerHits]);
    const numberOfHits =
      unitHits.length + featureHits.length + eventHits.length + imageLayerHits.length;
    return { numberOfHits, groups: groupBy(allHits, "category") };
  }

  return { search };
}

interface ActionItem {
  action: ScenarioActions;
  label: string;
  icon?: string;
}

const actionItems: ActionItem[] = [
  {
    action: "save",
    label: "Save scenario to local storage",
    icon: "save",
  },
  { action: "loadNew", label: "Load scenario", icon: "upload" },
  {
    action: "exportJson",
    label: "Download scenario",
    icon: "download",
  },
  {
    action: "import",
    label: "Import data",
    icon: "upload",
  },
  {
    action: "export",
    label: "Export data",
    icon: "download",
  },
  { action: "addEquipment", label: "Add new equipment", icon: "add" },
  { action: "addPersonnel", label: "Add new personnel category", icon: "add" },
  { action: "exportToClipboard", label: "Copy scenario to clipboard" },
  { action: "addSide", label: "Add side", icon: "add" },
  { action: "addTileJSONLayer", label: "Add TileJSON map layer", icon: "add" },
  { action: "addXYZLayer", label: "Add XYZ map layer", icon: "add" },
  { action: "addImageLayer", label: "Add image layer", icon: "add" },
];

export function useActionSearch() {
  function searchActions(query: string) {
    const q = query.trim();
    if (!q) return [];

    const hits = fuzzysort.go(q, actionItems, { key: ["label"] });

    return hits.map(
      (u, i) =>
        ({
          ...u.obj,
          id: i,
          name: u.obj.label,
          index: i,
          highlight: fuzzysort.highlight({
            ...u,
            target: htmlTagEscape(u.target),
          }),
          score: u.score,
          category: "Actions",
        }) as ActionSearchResult,
    );
  }

  return {
    searchActions,
    actionItems: actionItems.map(
      (a, i): ActionSearchResult => ({
        ...a,
        category: "Actions",
        index: i,
        id: i,
        name: a.label,
        highlight: "",
        score: 0,
      }),
    ),
  };
}
