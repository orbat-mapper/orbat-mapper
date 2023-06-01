import { MenuItemData } from "@/components/types";
import { ComputedRef, InjectionKey, Ref } from "vue";

import { SelectedScenarioFeatures } from "@/stores/selectedStore";

export type CellType = "text" | "number" | "sidc" | "dots";
export type ColumnWidths = Record<string, number>;
export type SortDirection = "asc" | "desc";

export interface ColumnProperties<TData = Record<string, any>> {
  field: keyof TData | string;
  id?: string;
  label?: string;
  width?: number;
  type?: CellType;
  menu?: MenuItemData[];
  resizable?: boolean;
  sortable?: boolean;
  rowGroup?: boolean;
  hide?: boolean;
  groupOpen?: boolean;
}

export interface RuntimeColumnProperties extends Required<ColumnProperties> {
  sorted: SortDirection | null;
  objectPath: string[];
}

export interface IId {
  id: string;
}
export interface RowData<TData = any> extends IId {
  id: string;
}

export const GridDataKey = Symbol("ORBAT grid") as InjectionKey<{
  columnDefs: ComputedRef<RuntimeColumnProperties>;
}>;

export type CheckedState = "indeterminate" | "checked" | false;
