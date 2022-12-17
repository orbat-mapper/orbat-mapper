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

  constructor(private sic: string = "10000000000000000000") {
    this.version = sic.substring(0, 2);
    this.context = sic.substring(2, 3);
    this.standardIdentity = sic.substring(3, 4);
    this.symbolSet = sic.substring(4, 6);
    this.status = sic.substring(6, 7);
    this.hqtfd = sic.substring(7, 8);
    this.amplifier = sic.substring(8, 9);
    this.amplifierDescriptor = sic.substring(9, 10);
    this.entity = sic.substring(10, 12);
    this.entityType = sic.substring(12, 14);
    this.entitySubType = sic.substring(14, 16);
    this.modifierOne = sic.substring(16, 18);
    this.modifierTwo = sic.substring(18, 20);
  }

  get emt() {
    return this.amplifier + this.amplifierDescriptor;
  }

  set emt(value: string) {
    this.amplifier = value[0];
    this.amplifierDescriptor = value[1];
  }

  toString() {
    return (
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
      this.entitySubType +
      this.modifierOne +
      this.modifierTwo
    );
  }
}

export const SID_INDEX = 3;
export const ORBAT_MAPPER_ORIGINATOR = "987";

export function parseExtendedSidc(sidc: string): ExtendedSidcElements {
  const originatorIdentifier = sidc.substring(20, 23);
  const originatorSymbolSet = sidc.substring(23, 24);
  const data = sidc.substring(24);
  return { originatorIdentifier, originatorSymbolSet, data };
}
