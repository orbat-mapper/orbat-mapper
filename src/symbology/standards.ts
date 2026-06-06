import type { SymbolSetMap } from "@/symbology/types";
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

export function getSymbologyStandardName(standard?: SymbologyStandard): string {
  return standard ? symbologyStandards[standard].name : "";
}
