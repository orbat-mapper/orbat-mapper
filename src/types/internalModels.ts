import { Side, SideGroup, Unit } from "./scenarioModels";
import { EntityId } from "./base";

export interface NUnit extends Omit<Unit, "subUnits" | "_pid"> {
  subUnits: EntityId[];
  _pid: EntityId;
}

export interface NSide extends Omit<Side, "groups"> {
  groups: EntityId[];
  _isOpen?: boolean;
}

export interface SideUpdate extends Omit<NSide, "id"> {}

export interface NSideGroup extends Omit<SideGroup, "units"> {
  subUnits: EntityId[];
  _isOpen?: boolean;
}

export interface SideGroupUpdate extends Partial<Omit<NSideGroup, "id">> {}

export interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}

export const INTERNAL_NAMES = ["_state", "_pid", "_isOpen", "_isNew", "_zIndex"];
