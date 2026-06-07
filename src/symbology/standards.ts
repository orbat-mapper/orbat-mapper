import type { ModifierEntity, SymbolSetMap } from "@/symbology/types";
import type { SymbologyStandard } from "@/types/scenarioModels";

export interface SymbologyStandardDefinition {
  value: SymbologyStandard;
  name: string;
  description: string;
  load: () => Promise<SymbolSetMap>;
}

export const symbologyStandards = {
  "2525d": {
    value: "2525d",
    name: "MIL-STD-2525D",
    description: "US version",
    load: async () => {
      const { ms2525d } = await import("@/symbology/standards/milstd2525");
      return ms2525d;
    },
  },
  "2525e": {
    value: "2525e",
    name: "MIL-STD-2525E",
    description: "",
    load: async () => {
      const { ms2525e, ms2525eCommonModifiers } =
        await import("@/symbology/standards/milstd2525e");
      return withCommonModifiers(ms2525e, ms2525eCommonModifiers);
    },
  },
  app6d: {
    value: "app6d",
    name: "APP-6D",
    description: "NATO version",
    load: async () => {
      const { app6d } = await import("@/symbology/standards/app6d");
      return app6d;
    },
  },
} satisfies Record<SymbologyStandard, SymbologyStandardDefinition>;

export const symbologyStandardOptions = Object.values(symbologyStandards).map(
  ({ value, name, description }) => ({
    value,
    name,
    description,
  }),
);

// MIL-STD-2525E support is still experimental and limited to the Symbol Browser for now
export const stableSymbologyStandardOptions = symbologyStandardOptions.filter(
  ({ value }) => value !== "2525e",
);

export function getSymbologyStandardName(standard?: SymbologyStandard): string {
  return standard ? symbologyStandards[standard].name : "";
}

function withCommonModifiers(
  symbolSets: SymbolSetMap,
  commonModifiers: {
    modifierOne: ModifierEntity[];
    modifierTwo: ModifierEntity[];
  },
): SymbolSetMap {
  return Object.fromEntries(
    Object.entries(symbolSets).map(([code, symbolSet]) => [
      code,
      {
        ...symbolSet,
        modifierOne: [...symbolSet.modifierOne, ...commonModifiers.modifierOne],
        modifierTwo: [...symbolSet.modifierTwo, ...commonModifiers.modifierTwo],
      },
    ]),
  );
}
