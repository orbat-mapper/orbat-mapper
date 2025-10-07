import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed } from "vue";
import type { SymbolItem } from "@/types/constants.ts";

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
  return { rootUnitItems };
}
