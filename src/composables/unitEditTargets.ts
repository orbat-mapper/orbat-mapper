import { computed } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import type { EntityId } from "@/types/base";
import type { NUnit } from "@/types/internalModels";

/**
 * The units an edit in the unit details panel applies to: every selected unit
 * when more than one is selected, otherwise the unit shown in the panel.
 * Locked units are left out of `editableIds`.
 */
export function useUnitEditTargets(unitId: () => EntityId) {
  const {
    store,
    unitActions: { isUnitLocked },
    helpers: { getUnitById },
  } = injectStrict(activeScenarioKey);
  const { selectedUnitIds } = useSelectedItems();

  const isMultiMode = computed(() => selectedUnitIds.value.size > 1);
  const unitIds = computed((): EntityId[] =>
    isMultiMode.value ? [...selectedUnitIds.value] : [unitId()],
  );
  const units = computed(() =>
    unitIds.value.map((id) => getUnitById(id)).filter((unit): unit is NUnit => !!unit),
  );
  const editableIds = computed(() => unitIds.value.filter((id) => !isUnitLocked(id)));
  const lockedCount = computed(() => unitIds.value.length - editableIds.value.length);

  /** Runs `fn` for each editable unit as a single undo step. */
  function forEachEditableUnit(fn: (unitId: EntityId) => void) {
    const ids = editableIds.value;
    if (!ids.length) return;
    store.groupUpdate(() => ids.forEach(fn));
  }

  return { isMultiMode, unitIds, units, editableIds, lockedCount, forEachEditableUnit };
}
