import { LayerFeatureItem } from "../types/scenarioGeoModels";
import { NUnit } from "../types/internalModels";
import { UnitActions } from "../types/constants";

export interface ButtonGroupItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface RadioGroupItem<T = string | number> {
  name: string;
  description?: string;
  value: T;
}

export interface SelectItem<T = string | number> {
  label: string;
  value: T;
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
export type CloneTarget = "end" | "above" | "below";

export interface UnitEmits {
  (e: "unit-action", unit: NUnit, action: UnitActions): void;
  (e: "unit-click", unit: NUnit): void;
  (e: "unit-drop", unit: NUnit, destinationUnit: NUnit, target: DropTarget): void;
}

export interface MenuItemData<T = string | Function> {
  label: string;
  action: T;
  disabled?: boolean;
}
