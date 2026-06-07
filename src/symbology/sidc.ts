import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants.ts";
import type { SymbologyStandard } from "@/types/scenarioModels";
import { UNIT_SYMBOLSET_VALUE } from "@/symbology/values";

/**
 *  Symbol Identification Codes (SIDC)
 *
 */
export interface SicElements {
  version: string;
  context: string;
  standardIdentity: string;
  symbolSet: string;
  status: string;
  hqtfd: string;
  amplifier: string;
  amplifierDescriptor: string;
  entity: string;
  entityType: string;
  entitySubType: string;
  modifierOne: string;
  modifierTwo: string;
}

export interface ExtendedSidcElements {
  originatorIdentifier: string;
  originatorSymbolSet: string;
  data: string;
}

export class Sidc implements SicElements {
  version: string;
  context: string;
  standardIdentity: string;
  symbolSet: string;
  status: string;
  hqtfd: string;
  amplifier: string;
  amplifierDescriptor: string;
  entity: string;
  entityType: string;
  entitySubType: string;
  modifierOne: string;
  modifierTwo: string;
  private readonly extendedTail: string;

  constructor(private sic: string = "10000000000000000000") {
    this.version = sic.substring(0, 2) || MIL_STD_2525D_VERSION;
    this.context = sic.substring(2, 3) || "0";
    this.standardIdentity = sic.substring(3, 4) || "0";
    this.symbolSet = sic.substring(4, 6) || "10";
    this.status = sic.substring(6, 7) || "0";
    this.hqtfd = sic.substring(7, 8) || "0";
    this.amplifier = sic.substring(8, 9) || "0";
    this.amplifierDescriptor = sic.substring(9, 10) || "0";
    this.entity = sic.substring(10, 12) || "00";
    this.entityType = sic.substring(12, 14) || "00";
    this.entitySubType = sic.substring(14, 16) || "00";
    this.extendedTail = sic.substring(22, 30) || "00000000";
    if (this.isExtended) {
      const mod1xy = sic.substring(16, 18) || "00";
      const mod2xy = sic.substring(18, 20) || "00";
      const commonH1 = sic.substring(20, 21) || "0";
      const commonH2 = sic.substring(21, 22) || "0";
      this.modifierOne = (commonH1 !== "0" ? commonH1 : "") + mod1xy;
      this.modifierTwo = (commonH2 !== "0" ? commonH2 : "") + mod2xy;
    } else {
      this.modifierOne = sic.substring(16, 18) || "00";
      this.modifierTwo = sic.substring(18, 20) || "00";
    }
  }

  get isExtended() {
    return isEditionESidcVersion(this.version);
  }

  get emt() {
    return this.amplifier + this.amplifierDescriptor;
  }

  set emt(value: string) {
    this.amplifier = value[0];
    this.amplifierDescriptor = value[1];
  }

  get mainIcon() {
    return this.entity + this.entityType + this.entitySubType;
  }

  set mainIcon(value: string) {
    this.entity = value.substring(0, 2);
    this.entityType = value.substring(2, 4);
    this.entitySubType = value.substring(4, 6);
  }

  toString() {
    const head =
      this.version +
      this.context +
      this.standardIdentity +
      this.symbolSet +
      this.status +
      this.hqtfd +
      this.amplifier +
      this.amplifierDescriptor +
      this.entity +
      this.entityType +
      this.entitySubType;

    if (this.isExtended) {
      const mod1 = splitEditionEModifier(this.modifierOne);
      const mod2 = splitEditionEModifier(this.modifierTwo);
      return head + mod1.xy + mod2.xy + mod1.hundreds + mod2.hundreds + this.extendedTail;
    }

    return (
      head +
      formatLegacyModifier(this.modifierOne) +
      formatLegacyModifier(this.modifierTwo)
    );
  }
}

export const MIL_STD_2525E_VERSION = "15";
export const MIL_STD_2525D_VERSION = "10";
const EDITION_E_VERSIONS = [MIL_STD_2525E_VERSION, "13"];

export function isEditionESidcVersion(version: string) {
  return EDITION_E_VERSIONS.includes(version);
}

function splitEditionEModifier(code: string) {
  const padded = code.padStart(3, "0").slice(-3);
  return { hundreds: padded[0], xy: padded.slice(1) };
}

function formatLegacyModifier(code: string) {
  return code.slice(-2).padStart(2, "0");
}

export function sidcVersionForStandard(standard?: SymbologyStandard): string {
  return standard === "2525e" ? MIL_STD_2525E_VERSION : MIL_STD_2525D_VERSION;
}

/**
 * Inverse of {@link sidcVersionForStandard}: pick the symbology standard a SIDC
 * version belongs to. Legacy versions are ambiguous (both 2525D and APP-6D use
 * version "10"), so a `fallback` standard disambiguates — only coerced away from
 * "2525e" when the version itself is legacy.
 */
export function standardForSidcVersion(
  version: string,
  fallback: SymbologyStandard,
): SymbologyStandard {
  if (isEditionESidcVersion(version)) return "2525e";
  return fallback === "2525e" ? "2525d" : fallback;
}

export type SidcBuildValues = {
  standardIdentity: string;
  symbolSet: string;
  status: string;
  hqtfd: string;
  emt: string;
  mainIcon: string;
  modifierOne: string;
  modifierTwo: string;
};

export function buildSidc(version: string, values: Partial<SidcBuildValues> = {}) {
  const sidc = new Sidc(
    version +
      "0" +
      (values.standardIdentity ?? "0") +
      (values.symbolSet ?? UNIT_SYMBOLSET_VALUE) +
      (values.status ?? "0") +
      (values.hqtfd ?? "0") +
      (values.emt ?? "00") +
      (values.mainIcon ?? "000000") +
      "0000",
  );
  sidc.modifierOne = values.modifierOne ?? "00";
  sidc.modifierTwo = values.modifierTwo ?? "00";
  return sidc.toString();
}

export const SID_INDEX = 3;
export const ORBAT_MAPPER_ORIGINATOR = "987";
export const CUSTOM_SYMBOL_SID_INDEX = CUSTOM_SYMBOL_PREFIX.length + SID_INDEX;

export function parseExtendedSidc(sidc: string): ExtendedSidcElements {
  const originatorIdentifier = sidc.substring(20, 23);
  const originatorSymbolSet = sidc.substring(23, 24);
  const data = sidc.substring(24);
  return { originatorIdentifier, originatorSymbolSet, data };
}
