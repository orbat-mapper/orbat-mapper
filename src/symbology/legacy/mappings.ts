import letter2number from "./legacydata.json";

export { letter2number };

export const SID_MAP: Record<string, string> = {
  P: "00", // pending
  U: "01", // unknown
  A: "02", // assumed friend
  F: "03", // friend
  N: "04", // neutral
  S: "05", // suspect
  H: "06", // hostile
  G: "10", // exercise pending
  W: "11", // exercise unknown
  M: "12", // exercise assumed friend
  D: "13", // exercise friend
  L: "14", // exercise neutral
  J: "15", // joker
  K: "16", // faker
};
export const STATUS_MAP: Record<string, string> = {
  P: "0", // present
  A: "1", // anticipated/planned
  C: "2", // present fully capable
  D: "3", // present damaged
  X: "4", // present destroyed
  F: "5", // present full to capacity
};
export const SYMBOL_MODIFIER_MAP: Record<string, string> = {
  "--": "000", // null
  "-A": "011", // team/crew
  "-B": "012", // squad
  "-C": "013", // section
  "-D": "014", // platoon/detachment
  "-E": "015", // company/battery/troop
  "-F": "016", // battalion/squadron
  "-G": "017", // regiment/group
  "-H": "018", // brigade
  "-I": "021", // division
  "-J": "022", // corps/mef
  "-K": "023", // army
  "-L": "024", // army group/front
  "-M": "025", // region
  "-N": "026", // command
};
