import { computed, ref, type Ref, shallowRef, watch } from "vue";
import type { SymbolItem, SymbolValue } from "@/types/constants";
import {
  CONTROL_MEASURE_SYMBOLSET_VALUE,
  DISMOUNTED_SYMBOLSET_VALUE,
  echelonValues,
  EQUIPMENT_SYMBOLSET_VALUE,
  HQTFDummyValues,
  leadershipValues,
  mobilityValues,
  standardIdentityValues,
  statusValues,
  SUBSURFACE_SYMBOLSET_VALUE,
  SURFACE_SYMBOLSET_VALUE,
  symbolSetMap,
  towedArrayValues,
  UNIT_SYMBOLSET_VALUE,
} from "@/symbology/values";
import {
  buildSidc,
  isEditionESidcVersion,
  Sidc,
  type SidcBuildValues,
} from "@/symbology/sidc";
import type { SymbolSetMap } from "@/symbology/types";
import { symbologyStandards } from "@/symbology/standards";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import {
  mapReinforcedStatus2Field,
  type ReinforcedStatus,
  type SymbologyStandard,
} from "@/types/scenarioModels";

const symbology = shallowRef<SymbolSetMap | undefined>();
const isLoaded = ref(false);
const currentSymbologyStandard = ref<SymbologyStandard | undefined>();
let loadRequestId = 0;
let pendingLoad:
  | {
      standard: SymbologyStandard;
      promise: Promise<void>;
    }
  | undefined;

export type IconLabelData = {
  symbolSet?: string;
  entity?: string;
  entityType?: string;
};

export type ModifierLabelData = {
  symbolSet?: string;
  mod1?: string;
  mod2?: string;
};

function getSymbolSetLabel(symbolSet: string) {
  return symbolSetMap[symbolSet]?.text || symbolSet;
}

/**
 * Resolve a human-readable label for a main icon against the lazily-loaded
 * symbology data for the currently selected standard. Falls back to the raw
 * code/label when the lookup misses or the data has not loaded yet.
 */
function resolveIconLabel({ symbolSet, entity, entityType }: IconLabelData): string {
  const label = symbolSet ?? entity ?? entityType ?? "Unknown";
  if (symbolSet === undefined) {
    return label;
  }
  if (entity === undefined) {
    return getSymbolSetLabel(symbolSet);
  }
  const icon = symbology.value?.[symbolSet]?.mainIcon?.find((i) =>
    i.code.startsWith(entity + (entityType ?? "")),
  );
  return (entityType ? icon?.entityType : undefined) || icon?.entity || label;
}

/**
 * Resolve a human-readable label for a symbol modifier against the lazily-loaded
 * symbology data for the currently selected standard. Falls back to the raw
 * code/label when the lookup misses or the data has not loaded yet.
 */
function resolveModifierLabel({ symbolSet, mod1, mod2 }: ModifierLabelData): string {
  const label = symbolSet ?? mod1 ?? mod2 ?? "Unknown";
  if (symbolSet === undefined) {
    return label;
  }
  const ss = symbology.value?.[symbolSet];
  if (mod1) {
    const i = ss?.modifierOne.find((mod) => mod.code === mod1);
    return i?.modifier || label;
  }
  if (mod2) {
    const i = ss?.modifierTwo.find((mod) => mod.code === mod2);
    return i?.modifier || label;
  }
  return label;
}

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

export function useSymbologyData(standardRef?: Ref<SymbologyStandard | undefined>) {
  const settingsStore = useSymbolSettingsStore();
  const selectedStandard = computed(
    () => standardRef?.value ?? settingsStore.symbologyStandard,
  );

  async function loadData() {
    const standard = selectedStandard.value;
    if (symbology.value && currentSymbologyStandard.value === standard) {
      if (pendingLoad && pendingLoad.standard !== standard) {
        loadRequestId++;
        pendingLoad = undefined;
      }
      isLoaded.value = true;
      return;
    }
    if (pendingLoad?.standard === standard) {
      return pendingLoad.promise;
    }

    const requestId = ++loadRequestId;
    isLoaded.value = false;
    const promise = symbologyStandards[standard]
      .load()
      .then((data) => {
        if (requestId !== loadRequestId) return;
        symbology.value = data;
        currentSymbologyStandard.value = standard;
        isLoaded.value = true;
      })
      .finally(() => {
        if (pendingLoad?.promise === promise) {
          pendingLoad = undefined;
        }
      });
    pendingLoad = { standard, promise };
    return promise;
  }

  watch(
    selectedStandard,
    () => {
      void loadData().catch(() => undefined);
    },
    { immediate: true },
  );

  return {
    isLoaded,
    symbology,
    loadData,
    resolveIconLabel,
    resolveModifierLabel,
    searchSymbolRef,
    searchModifierOneRef,
    searchModifierTwoRef,
  };
}

export function useSymbolItems(
  sidc: Ref<string>,
  reinforcedReduced?: ReinforcedStatus,
  standardRef?: Ref<SymbologyStandard | undefined>,
) {
  const {
    sidcVersion,
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
    resolveIconLabel,
    resolveModifierLabel,
    searchSymbolRef,
    searchModifierOneRef,
    searchModifierTwoRef,
  } = useSymbologyData(standardRef);
  const supportsCommonModifiers = computed(() =>
    isEditionESidcVersion(sidcVersion.value),
  );

  function buildSymbolSidc(values: Partial<SidcBuildValues> = {}) {
    return buildSidc(sidcVersion.value, {
      standardIdentity: sidValue.value,
      symbolSet: symbolSetValue.value,
      ...values,
    });
  }

  const symbolSets = computed(() => {
    const symbSets = Object.entries(symbology.value || {}).map(([k, v]) => {
      return {
        code: k,
        text: v.name,
        sidc: buildSymbolSidc({
          symbolSet: k,
          mainIcon: k === CONTROL_MEASURE_SYMBOLSET_VALUE ? "160205" : "000000",
        }),
      } as SymbolItem;
    });
    symbSets.sort((a, b) => +a.code - +b.code);
    return symbSets;
  });

  const statusItems = computed((): SymbolItem[] => {
    return statusValues.map(({ code, text }) => ({
      code,
      text,
      sidc: buildSymbolSidc({ status: code }),
    }));
  });

  const sidItems = computed((): SymbolItem[] => {
    // Exclude the non-standard "Custom" identities (codes 7+).
    return standardIdentityValues
      .filter(({ code }) => +code < 7)
      .map(({ code, text }) => ({
        code,
        text,
        sidc: buildSymbolSidc({ standardIdentity: code }),
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
      sidc: buildSymbolSidc(),
    }));
  });

  const hqtfdItems = computed((): SymbolItem[] => {
    return HQTFDummyValues.map(({ code, text }) => ({
      code,
      text,
      sidc: buildSymbolSidc({ hqtfd: code }),
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
        sidc: buildSymbolSidc({ symbolSet: symbolSetCode, mainIcon: mi.code }),
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
        sidc: buildSymbolSidc({ emt: code }),
      };
    });
  });

  const mod1Items = computed(() => {
    if (!symbology.value) return [];
    return (
      symbology.value[symbolSetValue.value]?.modifierOne
        .filter(({ code }) => supportsCommonModifiers.value || code.length <= 2)
        .map(({ code, modifier }): SymbolItem => {
          return {
            code,
            text: modifier,
            sidc: buildSymbolSidc({ modifierOne: code }),
          };
        }) || []
    );
  });

  const mod2Items = computed(() => {
    if (!symbology.value) return [];
    return (
      symbology.value[symbolSetValue.value]?.modifierTwo
        .filter(({ code }) => supportsCommonModifiers.value || code.length <= 2)
        .map(({ code, modifier }): SymbolItem => {
          return {
            code,
            text: modifier,
            sidc: buildSymbolSidc({ modifierTwo: code }),
          };
        }) || []
    );
  });

  return {
    symbolSets,
    icons,
    sidcVersion,
    sidValue,
    symbolSetValue,
    iconValue,
    statusValue,
    statusItems,
    sidItems,
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
    resolveIconLabel,
    resolveModifierLabel,
    searchSymbolRef,
    searchModifierOneRef,
    searchModifierTwoRef,
    reinforcedReducedItems,
    reinforcedReducedValue,
  };
}

function useSymbolValues(sidc: Ref<string>, reinforcedReduced?: ReinforcedStatus) {
  const sidcObj = new Sidc(sidc.value);
  const sidcVersion = ref(sidcObj.version);
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
    sidcVersion.value = sidcObj.version;
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
      return buildSidc(sidcVersion.value, {
        standardIdentity: sidValue.value,
        symbolSet: symbolSetValue.value,
        status: statusValue.value,
        hqtfd: hqtfdValue.value,
        emt: emtValue.value,
        mainIcon: iconValue.value,
        modifierOne: mod1Value.value,
        modifierTwo: mod2Value.value,
      });
    },
    set(newValue: string) {
      setValues(newValue);
    },
  });

  return {
    sidcVersion,
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
