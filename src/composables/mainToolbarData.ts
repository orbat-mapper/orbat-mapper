import { computed, ref, watch } from "vue";
import {
  DISMOUNTED_SYMBOLSET_VALUE,
  echelonValues,
  EQUIPMENT_SYMBOLSET_VALUE,
  leadershipValues,
  mobilityValues,
  SID,
  type SidValue,
  SUBSURFACE_SYMBOLSET_VALUE,
  SURFACE_SYMBOLSET_VALUE,
  towedArrayValues,
  UNIT_SYMBOLSET_VALUE,
} from "@/symbology/values";
import type { SymbolItem, SymbolValue } from "@/types/constants";
import { Sidc } from "@/symbology/sidc";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useActiveUnitStore } from "@/stores/dragStore";

export type SymbolPage = "land" | "sea" | "air" | "space" | "equipment";

interface ExtendedSymbolValue extends SymbolValue {
  symbolSet: string;
}

const landIcons: ExtendedSymbolValue[] = [
  { symbolSet: "10", code: "121100", text: "Infantry" },
  { symbolSet: "10", code: "121102", text: "Mechanized Infantry" },
  { symbolSet: "10", code: "121300", text: "Scout" },
  { symbolSet: "10", code: "130300", text: "Artillery" },
  { symbolSet: "10", code: "120500", text: "Armor" },
  { symbolSet: "10", code: "160600", text: "Combat Service Support" },
  { symbolSet: "10", code: "130100", text: "Air Defense" },
  { symbolSet: "10", code: "140700", text: "Engineer" },
];

const seaIcons: ExtendedSymbolValue[] = [
  { symbolSet: "30", code: "110000", text: "Military" },
  { symbolSet: "30", code: "120100", text: "Carrier" },
  { symbolSet: "30", code: "120204", text: "Frigate" },
  { symbolSet: "30", code: "120300", text: "Amphibious Warfare Ship" },
  { symbolSet: "30", code: "120500", text: "Patrol Boat" },
  { symbolSet: "35", code: "110100", text: "Submarine" },
  { symbolSet: "35", code: "130100", text: "Torpedo" },
];

const airIcons: ExtendedSymbolValue[] = [
  { symbolSet: "01", code: "110100", text: "Fixed Wing" },
  { symbolSet: "01", code: "110104", text: "Fighter" },
  { symbolSet: "01", code: "110103", text: "Bomber" },
  { symbolSet: "01", code: "110200", text: "Rotary Wing" },
  { symbolSet: "02", code: "110000", text: "Missile" },
];

const symbolPage = ref<SymbolPage>("land");
const currentSid = ref<SidValue | string>(SID.Friend);
const currentEchelon = ref("16");
const customIcon = ref<SymbolValue>({ code: "10031000141211000000", text: "Infantry" });
const activeSidc = ref("10031000141211000000");

export function useToolbarUnitSymbolData() {
  const emtStore: Record<string, string> = { [UNIT_SYMBOLSET_VALUE]: "16" };

  const symbolSetValue = computed(() => new Sidc(activeSidc.value).symbolSet);

  function mapSymbolCode({ code, text, symbolSet }: ExtendedSymbolValue): SymbolItem {
    return {
      code,
      text,
      sidc: "100" + currentSid.value + symbolSet + "00" + "00" + code + "0000",
    };
  }
  const iconItems = computed(() => {
    switch (symbolPage.value) {
      case "land":
        return landIcons.map(mapSymbolCode);
      case "sea":
        return seaIcons.map(mapSymbolCode);
      case "air":
        return airIcons.map(mapSymbolCode);
    }
    return [];
  });
  const seaItems = computed(() => seaIcons.map(mapSymbolCode));

  const echelonSidc = computed(
    () =>
      "100" +
      currentSid.value +
      symbolSetValue.value +
      "00" +
      currentEchelon.value +
      "0000000000",
  );

  const customSidc = computed(() => {
    const parsedSidc = new Sidc(customIcon.value.code);
    parsedSidc.standardIdentity = currentSid.value;
    parsedSidc.emt = "00";
    parsedSidc.hqtfd = "0";
    return parsedSidc.toString();
  });

  const emtItems = computed(() => {
    let values: SymbolValue[];
    switch (symbolSetValue.value) {
      case UNIT_SYMBOLSET_VALUE:
        values = echelonValues;
        break;
      case EQUIPMENT_SYMBOLSET_VALUE:
        values = mobilityValues;
        break;
      case DISMOUNTED_SYMBOLSET_VALUE:
        values = leadershipValues;
        break;
      case SURFACE_SYMBOLSET_VALUE:
      case SUBSURFACE_SYMBOLSET_VALUE:
        values = towedArrayValues;
        break;
      default:
        values = [{ code: "00", text: "Unspecified" }];
    }
    return values.map(({ code, text }): SymbolItem => {
      return {
        code,
        text,
        sidc:
          "100" + currentSid.value + symbolSetValue.value + "00" + code + "0000000000",
      };
    });
  });

  watch(symbolSetValue, (newSymbolSet, oldSymbolSet) => {
    emtStore[oldSymbolSet] = currentEchelon.value;
    currentEchelon.value = emtStore[newSymbolSet] || "00";
  });

  return {
    currentSid,
    currentEchelon,
    activeSidc,
    iconItems,
    echelonSidc,
    customSidc,
    customIcon,
    emtItems,
    seaItems,
    symbolPage,
  };
}

export function useActiveSidc() {
  const { unitActions } = injectStrict(activeScenarioKey);
  const { activeParent } = useActiveUnitStore();
  const sidc = computed(() => {
    const sidcObj = new Sidc(activeSidc.value);
    sidcObj.emt = currentEchelon.value;
    sidcObj.standardIdentity = currentSid.value;
    return sidcObj.toString();
  });
  const symbolOptions = computed(() =>
    activeParent.value
      ? {
          ...unitActions.getCombinedSymbolOptions(activeParent.value, true),
        }
      : {},
  );
  return { sidc, symbolOptions };
}
