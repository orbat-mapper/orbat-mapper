import { computed, ref, Ref, shallowRef, watch } from "vue";
import { SymbolItem, SymbolValue } from "@/types/constants";
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
} from "@/symbology/values";
import { Sidc } from "@/symbology/sidc";
import { SymbolSetMap } from "@/symbology/types";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import {
  mapReinforcedStatus2Field,
  ReinforcedStatus,
  SymbologyStandard,
} from "@/types/scenarioModels";

const symbology = shallowRef<SymbolSetMap | undefined>();
const isLoaded = ref(false);
const currentSymbologyStandard = ref<SymbologyStandard | undefined>();

const searchSymbolRef = computed(() => {
  return (
    symbology.value &&
    Object.values(symbology.value)
      .map((ss) => {
        return ss.mainIcon.map((e) => ({
          symbolSet: ss.symbolSet,
          name: ss.name,
          ...e,
        }));
      })
      .flat()
      .filter((e) =>
        e.symbolSet === CONTROL_MEASURE_SYMBOLSET_VALUE ? e.geometry === "Point" : true,
      )
      .map((e) => {
        const { entity, entityType, entitySubtype } = e;
        const text = [entity, entityType, entitySubtype].filter((e) => e).join(" - ");
        return {
          ...e,
          text: text.replaceAll("/", " / "),
        };
      })
  );
});

const searchModifierOneRef = computed(() => {
  return (
    symbology.value &&
    Object.values(symbology.value)
      .map((ss) => {
        return ss.modifierOne.map((e) => ({
          symbolSet: ss.symbolSet,
          name: ss.name,
          ...e,
        }));
      })
      .flat()
      .map((e) => {
        return {
          ...e,
          text: e.modifier,
        };
      })
  );
});

const searchModifierTwoRef = computed(() => {
  return (
    symbology.value &&
    Object.values(symbology.value)
      .map((ss) => {
        return ss.modifierTwo.map((e) => ({
          symbolSet: ss.symbolSet,
          name: ss.name,
          ...e,
        }));
      })
      .flat()
      .map((e) => {
        return {
          ...e,
          text: e.modifier,
        };
      })
  );
});

export function useSymbologyData() {
  async function loadData() {
    const settingsStore = useSymbolSettingsStore();
    if (
      symbology.value &&
      currentSymbologyStandard.value === settingsStore.symbologyStandard
    ) {
      return;
    }
    isLoaded.value = false;
    if (settingsStore.symbologyStandard === "app6") {
      const { app6d } = await import("../symbology/standards/app6d");
      symbology.value = app6d;
      currentSymbologyStandard.value = "app6";
    } else {
      const { ms2525d } = await import("../symbology/standards/milstd2525");
      symbology.value = ms2525d;
      currentSymbologyStandard.value = "2525";
    }
    isLoaded.value = true;
  }

  return {
    isLoaded,
    symbology,
    loadData,
    searchSymbolRef,
    searchModifierOneRef,
    searchModifierTwoRef,
  };
}

export function useSymbolItems(sidc: Ref<string>, reinforcedReduced?: ReinforcedStatus) {
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
    reinforcedReducedValue,
  } = useSymbolValues(sidc, reinforcedReduced);

  const {
    symbology,
    isLoaded,
    loadData,
    searchSymbolRef,
    searchModifierOneRef,
    searchModifierTwoRef,
  } = useSymbologyData();

  const symbolSets = computed(() => {
    const symbSets = Object.entries(symbology.value || {}).map(([k, v]) => {
      const iconValue =
        k === CONTROL_MEASURE_SYMBOLSET_VALUE ? "00001602050000" : "00000000000000";
      return {
        code: k,
        text: v.name,
        sidc: "100" + sidValue.value + k + iconValue,
      } as SymbolItem;
    });
    symbSets.sort((a, b) => +a.code - +b.code);
    return symbSets;
  });

  const statusItems = computed((): SymbolItem[] => {
    return statusValues.map(({ code, text }) => ({
      code,
      text,
      sidc: "100" + sidValue.value + symbolSetValue.value + code + "0000000000000",
    }));
  });

  const reinforcedReducedItems = computed((): SymbolItem[] => {
    return [
      {
        code: "None",
        text: "Not Applicable",
        symbolOptions: {},
      },
      {
        code: "Reinforced",
        text: "Reinforced",
        symbolOptions: { reinforcedReduced: mapReinforcedStatus2Field("Reinforced") },
      },
      {
        code: "Reduced",
        text: "Reduced",
        symbolOptions: { reinforcedReduced: mapReinforcedStatus2Field("Reduced") },
      },
      {
        code: "ReinforcedReduced",
        text: "Reinforced and reduced",
        symbolOptions: {
          reinforcedReduced: mapReinforcedStatus2Field("ReinforcedReduced"),
        },
      },
    ].map(({ code, text, symbolOptions }) => ({
      code,
      text,
      symbolOptions,
      sidc: "100" + sidValue.value + symbolSetValue.value + "000000000000000",
    }));
  });

  const hqtfdItems = computed((): SymbolItem[] => {
    return HQTFDummyValues.map(({ code, text }) => ({
      code,
      text,
      sidc: "100" + sidValue.value + symbolSetValue.value + "0" + code + "000000000000",
    }));
  });

  const icons = computed(() => {
    if (!isLoaded.value) return [];
    const symbolSetCode = symbolSetValue.value || "01";
    let mis = (symbology.value || {})[symbolSetCode]?.mainIcon || [];
    if (symbolSetCode === CONTROL_MEASURE_SYMBOLSET_VALUE)
      mis = mis.filter((v) => v.geometry === "Point");
    return mis.map((mi) => {
      let text = mi.entity;
      if (mi.entityType) text += " - " + mi.entityType;
      if (mi.entitySubtype) text += " - " + mi.entitySubtype;
      return {
        code: mi.code,
        text,
        sidc: "100" + sidValue.value + symbolSetCode + "0000" + mi.code + "0000",
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
        sidc: "100" + sidValue.value + symbolSetValue.value + "00" + code + "0000000000",
      };
    });
  });

  const mod1Items = computed(() => {
    if (!symbology.value) return [];
    return (
      symbology.value[symbolSetValue.value]?.modifierOne.map(
        ({ code, modifier }): SymbolItem => {
          return {
            code,
            text: modifier,
            sidc:
              "100" + sidValue.value + symbolSetValue.value + "0000000000" + code + "00",
          };
        },
      ) || []
    );
  });

  const mod2Items = computed(() => {
    if (!symbology.value) return [];
    return (
      symbology.value[symbolSetValue.value]?.modifierTwo.map(
        ({ code, modifier }): SymbolItem => {
          return {
            code,
            text: modifier,
            sidc:
              "100" + sidValue.value + symbolSetValue.value + "0000000000" + "00" + code,
          };
        },
      ) || []
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
    loadData,
    searchSymbolRef,
    searchModifierOneRef,
    searchModifierTwoRef,
    reinforcedReducedItems,
    reinforcedReducedValue,
  };
}

function useSymbolValues(sidc: Ref<string>, reinforcedReduced?: ReinforcedStatus) {
  const sidcObj = new Sidc(sidc.value);
  const sidValue = ref(sidcObj.standardIdentity);
  const symbolSetValue = ref(sidcObj.symbolSet);
  const statusValue = ref(sidcObj.status);
  const hqtfdValue = ref(sidcObj.hqtfd);
  const iconValue = ref(sidcObj.entity + sidcObj.entityType + sidcObj.entitySubType);
  const emtValue = ref(sidcObj.emt);
  const mod1Value = ref(sidcObj.modifierOne);
  const mod2Value = ref(sidcObj.modifierTwo);
  const reinforcedReducedValue = ref<ReinforcedStatus>(reinforcedReduced ?? "None");

  function setValues(value: string) {
    const sidcObj = new Sidc(value);
    sidValue.value = sidcObj.standardIdentity;
    symbolSetValue.value = sidcObj.symbolSet;
    statusValue.value = sidcObj.status;
    hqtfdValue.value = sidcObj.hqtfd;
    iconValue.value = sidcObj.entity + sidcObj.entityType + sidcObj.entitySubType;
    emtValue.value = sidcObj.emt;
    mod1Value.value = sidcObj.modifierOne;
    mod2Value.value = sidcObj.modifierTwo;
  }

  watch(sidc, (value) => {
    setValues(value);
  });

  const csidc = computed({
    get() {
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
    },
    set(newValue: string) {
      setValues(newValue);
    },
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
    reinforcedReducedValue,
  };
}
