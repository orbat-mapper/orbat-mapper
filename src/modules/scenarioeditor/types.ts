import { EntityId } from "@/types/base";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";

interface UnitItem {
  type: "unit";
  id: EntityId;
  unit: NUnit;
  level: number;
}

interface SideItem {
  type: "side";
  id: EntityId;
  side: NSide;
}

interface SideGroupItem {
  type: "sidegroup";
  id: EntityId;
  sideGroup: NSideGroup;
}

export type TableItem = SideItem | SideGroupItem | UnitItem;
