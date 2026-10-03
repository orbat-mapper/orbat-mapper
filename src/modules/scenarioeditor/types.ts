import type { EntityId } from "@/types/base";
import type { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import type { SelectItem } from "@/components/types";

export interface UnitItem {
  type: "unit";
  id: EntityId;
  unit: NUnit;
  level: number;
}

export interface SideItem {
  type: "side";
  id: EntityId;
  side: NSide;
}

export interface SideGroupItem {
  type: "sidegroup";
  id: EntityId;
  sideGroup: NSideGroup;
}

export type TableItem = SideItem | SideGroupItem | UnitItem;

export type ColumnField =
  "id" | "name" | "shortName" | "sidc" | "externalUrl" | "description";
export type GridResizableColumnKey = "__indicator" | "__unit" | ColumnField;
export type CellType = "text" | "sidc" | "markdown";

export interface TableColumn extends SelectItem<ColumnField> {
  type: CellType;
  hidden?: boolean;
}

export type GridColumnWidths = Record<GridResizableColumnKey, number>;

export type DetailsPanel =
  | "unit"
  | "event"
  | "mapLayer"
  | "feature"
  | "tacticalGraphic"
  | "referenceFeature"
  | "scenario";

export type BreadcrumbItemType = {
  name: string;
  itemCount: number;
  // Built only when the dropdown opens. Building the items reads every sibling's
  // `_state`, so doing it eagerly re-ran the breadcrumbs on every playback tick.
  getItems?: () => ((NSide | NSideGroup | NUnit) & {
    symbolOptions: Record<string, any>;
    sidc: string;
    location?: boolean;
  })[];
  id?: EntityId;
  sidc?: string;
  symbolOptions?: Record<string, any>;
  location?: boolean;
};
