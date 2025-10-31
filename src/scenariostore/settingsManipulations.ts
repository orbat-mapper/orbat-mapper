import type { NewScenarioStore, ScenarioState } from "@/scenariostore/newScenarioStore";
import type {
  NSupplyCategory,
  NSupplyClass,
  NSupplyUoM,
  NSymbolFillColor,
  SupplyCategoryUpdate,
  SupplyClassUpdate,
  SupplyUomUpdate,
  SymbolFillColorUpdate,
} from "@/types/internalModels";
import { nanoid } from "@/utils";
import { klona } from "klona";
import type { EntityId } from "@/types/base";
import { updateCurrentUnitState } from "@/scenariostore/time";
import { removeUnusedUnitStateEntries } from "@/scenariostore/unitStateManipulations";
import { SYMBOL_FILL_COLORS, type SymbolFillColor } from "@/config/colors.ts";
import type { CustomSymbol } from "@/types/scenarioModels.ts";
import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants.ts";

export function useScenarioSettings(store: NewScenarioStore) {
  const { state, update } = store;

  function addColorIfAbsent(code: string) {
    const existing = [
      ...SYMBOL_FILL_COLORS,
      ...Object.values(state.symbolFillColorMap),
    ].find((color) => color.code.toLowerCase() === code.toLowerCase());
    if (!existing) {
      addSymbolFillColor({ code, text: `Custom color (${code})` });
    }
  }

  function addSymbolFillColor(
    data: Partial<NSymbolFillColor>,
    { noUndo = false, s = state } = {},
  ) {
    const newSymbolFillColor: NSymbolFillColor = {
      id: nanoid(),
      text: `Custom color (${data.code ?? ""})`,
      code: "#FF0000",
      ...klona(data),
    };
    if (newSymbolFillColor.id === undefined) {
      newSymbolFillColor.id = nanoid();
    }
    const newId = newSymbolFillColor.id;
    if (noUndo) {
      s.symbolFillColorMap[newId] = newSymbolFillColor;
    } else {
      update((s) => {
        s.symbolFillColorMap[newId] = newSymbolFillColor;
      });
    }
    return newId;
  }

  function updateSymbolFillColor(id: string, data: SymbolFillColorUpdate) {
    update((s) => {
      const symbolFillColor = s.symbolFillColorMap[id];
      if (!symbolFillColor) return;
      Object.assign(symbolFillColor, data);
    });
    state.settingsStateCounter++;
  }

  function deleteSymbolFillColor(id: string) {
    update((s) => {
      delete s.symbolFillColorMap[id];
    });
  }

  function deleteCustomSymbol(id: string): boolean {
    const isUsed = Object.values(state.unitMap).some((unit) => {
      const customId = `:${id}`;
      return !!(
        (unit.sidc.startsWith(CUSTOM_SYMBOL_PREFIX) && unit.sidc.endsWith(customId)) ||
        unit.state?.some(
          (st) => st.sidc?.startsWith(CUSTOM_SYMBOL_PREFIX) && st.sidc.endsWith(customId),
        )
      );
    });
    if (isUsed) return false;
    update((s) => {
      delete s.customSymbolMap[id];
    });
    return true;
  }

  function updateCustomSymbol(id: string, data: Partial<Omit<CustomSymbol, "id">>) {
    update((s) => {
      const customSymbol = s.customSymbolMap[id];
      if (!customSymbol) return;
      Object.assign(customSymbol, data);
    });
    state.settingsStateCounter++;
  }

  function addCustomSymbol(
    data: Partial<CustomSymbol>,
    { noUndo = false, s = state } = {},
  ) {
    const newCustomSymbol: CustomSymbol = {
      id: nanoid(),
      name: "Custom Symbol",
      src: "custom1:xxxxxx",
      sidc: "10031000001100000000",
      ...klona(data),
    };

    if (newCustomSymbol.id === undefined) {
      newCustomSymbol.id = nanoid();
    }
    const newId = newCustomSymbol.id;
    if (noUndo) {
      s.customSymbolMap[newId] = newCustomSymbol;
    } else {
      update((s) => {
        s.customSymbolMap[newId] = newCustomSymbol;
      });
    }
    return newCustomSymbol;
  }

  return {
    addSymbolFillColor,
    updateSymbolFillColor,
    deleteSymbolFillColor,
    addColorIfAbsent,
    deleteCustomSymbol,
    updateCustomSymbol,
    addCustomSymbol,
  };
}
