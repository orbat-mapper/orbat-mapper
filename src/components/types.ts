import type { LayerFeatureItem } from "@/types/scenarioGeoModels";
import type { NUnit, ScenarioEventType } from "@/types/internalModels";
import type { ScenarioActions, UnitAction } from "@/types/constants";
import type { InjectionKey } from "vue";
import type { CurrentState, UnitSymbolOptions } from "@/types/scenarioModels";
import type { EntityId } from "@/types/base";

export interface ButtonGroupItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface RadioGroupItem<T = string> {
  name: string;
  description?: string;
  value: T;
}

export interface SelectItem<T = string | number> {
  label: string;
  value: T;
}

export interface SearchResult {
  category: "Units" | "Features" | "Events" | "Places" | "Actions" | "Map layers";
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
    symbolOptions?: UnitSymbolOptions;
  };
  symbolOptions?: UnitSymbolOptions;
  _state?: CurrentState;
}

export interface LayerFeatureSearchResult extends LayerFeatureItem, SearchResult {
  category: "Features";
}

export interface MapLayerSearchResult extends SearchResult {
  category: "Map layers";
  type: "ImageLayer" | "TileJSONLayer";
}

export interface EventSearchResult extends SearchResult {
  category: "Events";
  id: EntityId;
  _type: ScenarioEventType;
  startTime: number;
}

export interface ActionSearchResult extends SearchResult {
  category: "Actions";
  action: ScenarioActions;
  icon?: string;
}

export type DropTarget = "on" | "above" | "below";
export type CloneTarget = "end" | "above" | "below";

export interface UnitEmits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;
  (e: "unit-click", unit: NUnit): void;
  (e: "unit-drop", unit: NUnit, destinationUnit: NUnit, target: DropTarget): void;
}

export interface MenuItemData<T = string | Function> {
  label: string;
  action: T;
  disabled?: boolean;
  active?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  static?: boolean;
}

export interface TabsState {
  selectedIndex: number;
  count: number;
  tabClass?: string;
}

export const tabsProviderKey = Symbol("TabsProvider") as InjectionKey<TabsState>;

export type TabItem = string | { label: string; title?: string };
