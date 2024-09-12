import { EntityId } from "@/types/base";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { SelectItem } from "@/components/types";

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
  | "id"
  | "name"
  | "shortName"
  | "sidc"
  | "externalUrl"
  | "description";
export type CellType = "text" | "sidc" | "markdown";

export interface TableColumn extends SelectItem<ColumnField> {
  type: CellType;
  hidden?: boolean;
}

export type DetailsPanel = "unit" | "event" | "mapLayer" | "feature" | "scenario";

export type BreadcrumbItemType = {
  name: string;
  items?: ((NSide | NSideGroup | NUnit) & {
    symbolOptions: Record<string, any>;
    sidc: string;
  })[];
  id?: EntityId;
  sidc?: string;
  symbolOptions?: Record<string, any>;
};
