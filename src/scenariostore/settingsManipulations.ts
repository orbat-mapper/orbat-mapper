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

  return {
    addSymbolFillColor,
    updateSymbolFillColor,
    deleteSymbolFillColor,
    addColorIfAbsent,
  };
}
