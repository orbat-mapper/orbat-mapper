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
  "A-": "211", // HQ
  AA: "211", // HQ team/crew
  AB: "212", // HQ squad
  AC: "213", // HQ section
  AD: "214", // HQ platoon/detachment
  AE: "215", // HQ company/battery/troop
  AF: "216", // HQ battalion/squadron
  AG: "217", // HQ regiment/group
  AH: "218", // HQ brigade
  AI: "221", // HQ division
  AJ: "222", // HQ corps/mef
  AK: "223", // HQ army
  AL: "224", // HQ army group/front
  AM: "225", // HQ region
  AN: "226", // HQ command
  "B-": "211", // TF HQ
  BA: "611", // TF HQ team/crew
  BB: "612", // TF HQ squad
  BC: "613", // TF HQ section
  BD: "614", // TF HQ platoon/detachment
  BE: "615", // TF HQ company/battery/troop
  BF: "616", // TF HQ battalion/squadron
  BG: "617", // TF HQ regiment/group
  BH: "618", // TF HQ brigade
  BI: "621", // TF HQ division
  BJ: "622", // TF HQ corps/mef
  BK: "623", // TF HQ army
  BL: "624", // TF HQ army group/front
  BM: "625", // TF HQ region
  BN: "626", // TF HQ command
  "C-": "211", // FD
  CA: "311", // FD HQ team/crew
  CB: "312", // FD HQ squad
  CC: "313", // FD HQ section
  CD: "314", // FD HQ platoon/detachment
  CE: "315", // FD HQ company/battery/troop
  CF: "316", // FD HQ battalion/squadron
  CG: "317", // FD HQ regiment/group
  CH: "318", // FD HQ brigade
  CI: "321", // FD HQ division
  CJ: "322", // FD HQ corps/mef
  CK: "323", // FD HQ army
  CL: "324", // FD HQ army group/front
  CM: "325", // FD HQ region
  CN: "326", // FD HQ command
  "D-": "711", // FD TF HQ
  DA: "711", // FD TF team/crew
  DB: "712", // FD TF squad
  DC: "713", // FD TF section
  DD: "714", // FD TF platoon/detachment
  DE: "715", // FD TF company/battery/troop
  DF: "716", // FD TF battalion/squadron
  DG: "717", // FD TF regiment/group
  DH: "718", // FD TF brigade
  DI: "721", // FD TF division
  DJ: "722", // FD TF corps/mef
  DK: "723", // FD TF army
  DL: "724", // FD TF army group/front
  DM: "725", // FD TF region
  DN: "726", // FD TF command
  "E-": "211", // TF
  EA: "411", // TF team/crew
  EB: "412", // TF squad
  EC: "413", // TF section
  ED: "414", // TF platoon/detachment
  EE: "415", // TF company/battery/troop
  EF: "416", // TF battalion/squadron
  EG: "417", // TF regiment/group
  EH: "418", // TF brigade
  EI: "421", // TF division
  EJ: "422", // TF corps/mef
  EK: "423", // TF army
  EL: "424", // TF army group/front
  EM: "425", // TF region
  EN: "426", // TF command
  "F-": "211", // FD
  FA: "111", // FD team/crew
  FB: "112", // FD squad
  FC: "113", // FD section
  FD: "114", // FD platoon/detachment
  FE: "115", // FD company/battery/troop
  FF: "116", // FD battalion/squadron
  FG: "117", // FD regiment/group
  FH: "118", // FD brigade
  FI: "121", // FD division
  FJ: "122", // FD corps/mef
  FK: "123", // FD army
  FL: "124", // FD army group/front
  FM: "125", // FD region
  FN: "126", // FD command
  "G-": "211", // FD TF
  GA: "511", // FD TF team/crew
  GB: "512", // FD TF squad
  GC: "513", // FD TF section
  GD: "514", // FD TF platoon/detachment
  GE: "515", // FD TF company/battery/troop
  GF: "516", // FD TF battalion/squadron
  GG: "517", // FD TF regiment/group
  GH: "518", // FD TF brigade
  GI: "521", // FD TF division
  GJ: "522", // FD TF corps/mef
  GK: "523", // FD TF army
  GL: "524", // FD TF army group/front
  GM: "525", // FD TF region
  GN: "526", // FD TF command
  "H-": "000", // Installation
  HB: "100", // FD Installation
  MO: "031", // Mobility wheeled limited
  MP: "032", // Mobility cross-country
  MQ: "033", // Tracked
  MR: "034", // Wheeled and tracked
  MS: "035", // Towed
  MT: "036", // Rail
  MU: "041", // Over snow
  MV: "042", // Sled
  MW: "047", // Pack animals
  MX: "051", // Barge
  MY: "052", // Amphibious
  NS: "061", // Towed array (short)
  NL: "062", // Towed array (long)
};
