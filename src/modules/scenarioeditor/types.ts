import { EntityId } from "@/types/base";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";

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

export type ColumnField = "name" | "shortName" | "sidc";

export interface TableColumn {
  title: string;
  field: ColumnField;
}
