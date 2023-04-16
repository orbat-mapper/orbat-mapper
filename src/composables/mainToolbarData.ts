import { MaybeRef } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import {
  DISMOUNTED_SYMBOLSET_VALUE,
  echelonValues,
  EQUIPMENT_SYMBOLSET_VALUE,
  leadershipValues,
  mobilityValues,
  SID,
  SUBSURFACE_SYMBOLSET_VALUE,
  SURFACE_SYMBOLSET_VALUE,
  towedArrayValues,
  UNIT_SYMBOLSET_VALUE,
} from "@/symbology/values";
import { SymbolItem, SymbolValue } from "@/types/constants";
import { Sidc } from "@/symbology/sidc";

export interface UseToolbarUnitSymbolDataOptions {
  currentSid?: MaybeRef<string>;
  currentEchelon?: MaybeRef<string>;
  activeSidc?: MaybeRef<string>;
}

export function useToolbarUnitSymbolData(options: UseToolbarUnitSymbolDataOptions = {}) {
  const currentSid = ref(options.currentSid ?? SID.Friend);
  const currentEchelon = ref(options.currentEchelon ?? "16");
  const customIcon = ref<SymbolValue>({ code: "10031000141211000000", text: "Infantry" });
  const activeSidc = ref(options.activeSidc ?? "10031000141211000000");
  const emtStore: Record<string, string> = { [UNIT_SYMBOLSET_VALUE]: "16" };

  const icons: SymbolValue[] = [
    { code: "121100", text: "Infantry" },
    { code: "121000", text: "Combined Arms" },
    { code: "121102", text: "Mechanized" },
    { code: "130300", text: "Artillery" },
    { code: "120500", text: "Armor" },
    { code: "160600", text: "Combat Service Support" },
  ];

  const symbolSetValue = computed(() => new Sidc(activeSidc.value).symbolSet);

  const iconItems = computed(() => {
    return icons.map(({ code, text }): SymbolItem => {
      return {
        code,
        text,
        sidc: "100" + currentSid.value + "10" + "00" + "00" + code + "0000",
      };
    });
  });

  const echelonSidc = computed(
    () =>
      "100" +
      currentSid.value +
      symbolSetValue.value +
      "00" +
      currentEchelon.value +
      "0000000000"
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
  };
}
