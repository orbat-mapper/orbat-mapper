import { LayerFeatureItem } from "../types/scenarioGeoModels";

export interface ButtonGroupItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SelectItem {
  label: string;
  value: string | number;
}

export interface SearchResult {
  category: "Units" | "Features";
  index: number;
  id: string | number;
  score: number;
  name: string;
  highlight: string;
}

export interface UnitSearchResult extends SearchResult {
  category: "Units";
  sidc: string;
  parent?: {
    sidc: string;
    name: string;
  };
}

export interface LayerFeatureSearchResult extends LayerFeatureItem, SearchResult {
  category: "Features";
}

export type DropTarget = "on" | "above" | "below";
