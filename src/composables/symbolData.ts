import { app6d } from "../symbology/standards/app6d";
import { computed, ref, Ref, watch } from "vue";
import { SymbolItem, SymbolValue } from "../types/constants";
import {
  CONTROL_MEASURE_SYMBOLSET_VALUE,
  DISMOUNTED_SYMBOLSET_VALUE,
  echelonValues,
  EQUIPMENT_SYMBOLSET_VALUE,
  HQTFDummyValues,
  leadershipValues,
  mobilityValues,
  statusValues,
  SUBSURFACE_SYMBOLSET_VALUE,
  SURFACE_SYMBOLSET_VALUE,
  towedArrayValues,
  UNIT_SYMBOLSET_VALUE,
} from "../symbology/values";
import { Sidc } from "../symbology/sidc";

function useSymbologyData() {
  const isLoaded = ref(true);

  return { isLoaded, symbology: app6d };
}

export function useSymbolItems(sidc: Ref<string>) {
  const {
    symbolSetValue,
    sidValue,
    statusValue,
    hqtfdValue,
    csidc,
    iconValue,
    emtValue,
    mod1Value,
    mod2Value,
  } = useSymbolValues(sidc);

  const { symbology, isLoaded } = useSymbologyData();

  const symbolSets = computed(() => {
    const symbSets = Object.entries(symbology).map(([k, v]) => {
      return {
        code: k,
        text: v.name,
        sidc: "100" + sidValue.value + k + "00000000000000",
      } as SymbolItem;
    });
    symbSets.sort((a, b) => +a.code - +b.code);
    return symbSets;
  });

  const statusItems = computed((): SymbolItem[] => {
    return statusValues.map(({ code, text }) => ({
      code,
      text,
      sidc:
        "100" + sidValue.value + symbolSetValue.value + code + "0000000000000",
    }));
  });

  const hqtfdItems = computed((): SymbolItem[] => {
    return HQTFDummyValues.map(({ code, text }) => ({
      code,
      text,
      sidc:
        "100" +
        sidValue.value +
        symbolSetValue.value +
        "0" +
        code +
        "000000000000",
    }));
  });

  const icons = computed(() => {
    const symbolSetCode = symbolSetValue.value || "01";
    let mis = symbology[symbolSetCode].mainIcon;
    if (symbolSetCode === CONTROL_MEASURE_SYMBOLSET_VALUE)
      mis = mis.filter((v) => v.geometry === "Point");
    return mis.map((mi) => {
      let text = mi.entity;
      if (mi.entityType) text += " - " + mi.entityType;
      if (mi.entitySubtype) text += " - " + mi.entitySubtype;
      return {
        code: mi.code,
        text,
        sidc:
          "100" + sidValue.value + symbolSetCode + "0000" + mi.code + "0000",
        entity: mi.entity,
        entityType: mi.entityType,
        entitySubtype: mi.entitySubtype,
      };
    });
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
          "100" +
          sidValue.value +
          symbolSetValue.value +
          "00" +
          code +
          "0000000000",
      };
    });
  });

  const mod1Items = computed(() => {
    return symbology[symbolSetValue.value].modifierOne.map(
      ({ code, modifier }): SymbolItem => {
        return {
          code,
          text: modifier,
          sidc:
            "100" +
            sidValue.value +
            symbolSetValue.value +
            "0000000000" +
            code +
            "00",
        };
      }
    );
  });

  const mod2Items = computed(() => {
    return symbology[symbolSetValue.value].modifierTwo.map(
      ({ code, modifier }): SymbolItem => {
        return {
          code,
          text: modifier,
          sidc:
            "100" +
            sidValue.value +
            symbolSetValue.value +
            "0000000000" +
            "00" +
            code,
        };
      }
    );
  });

  return {
    symbolSets,
    icons,
    sidValue,
    symbolSetValue,
    iconValue,
    statusValue,
    statusItems,
    hqtfdItems,
    hqtfdValue,
    emtValue,
    emtItems,
    mod1Value,
    mod2Value,
    mod1Items,
    mod2Items,
    csidc,
    isLoaded,
  };
}

function useSymbolValues(sidc: Ref<string>) {
  const sidcObj = new Sidc(sidc.value);
  const sidValue = ref(sidcObj.standardIdentity);
  const symbolSetValue = ref(sidcObj.symbolSet);
  const statusValue = ref(sidcObj.status);
  const hqtfdValue = ref(sidcObj.hqtfd);
  const iconValue = ref(
    sidcObj.entity + sidcObj.entityType + sidcObj.entitySubType
  );
  const emtValue = ref(sidcObj.emt);
  const mod1Value = ref(sidcObj.modifierOne);
  const mod2Value = ref(sidcObj.modifierTwo);
  watch(sidc, (value) => {
    const sidcObj = new Sidc(value);
    sidValue.value = sidcObj.standardIdentity;
    symbolSetValue.value = sidcObj.symbolSet;
    statusValue.value = sidcObj.status;
    hqtfdValue.value = sidcObj.hqtfd;
    iconValue.value =
      sidcObj.entity + sidcObj.entityType + sidcObj.entitySubType;
    emtValue.value = sidcObj.emt;
    mod1Value.value = sidcObj.modifierOne;
    mod2Value.value = sidcObj.modifierTwo;
  });

  const csidc = computed(() => {
    return (
      "100" +
      sidValue.value +
      symbolSetValue.value +
      statusValue.value +
      hqtfdValue.value +
      emtValue.value +
      iconValue.value +
      mod1Value.value +
      mod2Value.value
    );
  });

  return {
    sidValue,
    symbolSetValue,
    statusValue,
    hqtfdValue,
    iconValue,
    emtValue,
    mod1Value,
    mod2Value,
    csidc,
  };
}
