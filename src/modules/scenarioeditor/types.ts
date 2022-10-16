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

export type ColumnField = "name" | "shortName" | "sidc" | "externalUrl" | "description";
export type CellType = "text" | "sidc" | "markdown";

export interface TableColumn extends SelectItem<ColumnField> {
  type: CellType;
  hidden?: boolean;
}
