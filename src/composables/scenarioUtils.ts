import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed } from "vue";
import type { SymbolGroup, SymbolItem } from "@/types/constants.ts";

export function useActiveScenario() {
  const activeScenario = injectStrict(activeScenarioKey);
  return activeScenario;
}

export function useRootUnits() {
  const {
    store: { state },
    unitActions,
  } = useActiveScenario();

  const rootUnitItems = computed((): SymbolItem[] => {
    const getUnitItems = (map: Record<string, any>) =>
      Object.values(map)
        .flatMap((value) => value.subUnits)
        .map((id) => {
          const u = state.unitMap[id];
          return {
            text: u.name,
            code: u.id,
            sidc: u.sidc,
            symbolOptions: unitActions.getCombinedSymbolOptions(u),
          };
        });

    return [...getUnitItems(state.sideMap), ...getUnitItems(state.sideGroupMap)];
  });

  const groupedRootUnitItems = computed((): SymbolGroup[] => {
    const groups: SymbolGroup[] = [];

    const mapUnit = (unitId: string) => {
      const unit = state.unitMap[unitId];
      return {
        text: unit.name,
        code: unit.id,
        sidc: unit.sidc,
        symbolOptions: unitActions.getCombinedSymbolOptions(unit),
      };
    };

    Object.values(state.sideMap).forEach((side) => {
      if (!side.subUnits?.length) return;
      groups.push({
        name: side.name,
        items: side.subUnits.map(mapUnit),
      });
    });

    Object.values(state.sideGroupMap).forEach((group) => {
      if (!group.subUnits?.length) return;
      let name = group.name;
      if (group._pid) {
        const side = state.sideMap[group._pid];
        if (side) {
          name = `${side.name} > ${group.name}`;
        }
      }
      groups.push({
        name,
        items: group.subUnits.map(mapUnit),
      });
    });

    return groups;
  });

  return { rootUnitItems, groupedRootUnitItems };
}
