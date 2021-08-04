export interface SymbolSetMap {
  [code: string]: SymbolSet;
}

export interface SymbolSet {
  symbolSet: string;
  name: string;
  mainIcon: MainIconEntity[];
  modifierOne: ModifierEntity[];
  modifierTwo: ModifierEntity[];
}

export interface MainIconEntity {
  code: string;
  entity: string;
  entityType: string;
  entitySubtype: string;
  remarks: string;
  geometry?: string;
}

export interface ModifierEntity {
  code: string;
  category?: string;
  modifier: string;
  remarks: string;
}
