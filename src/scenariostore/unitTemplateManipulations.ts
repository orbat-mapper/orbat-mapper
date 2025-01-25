import { NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { NUnitTemplate } from "@/types/internalModels";
import { klona } from "klona";

export function useUnitTemplateManipulations(store: NewScenarioStore) {
  const { state, update } = store;

  function addUnitTemplate(
    data: Partial<NUnitTemplate>,
    { noUndo = false, s = state } = {},
  ) {
    const newUnitTemplate = { id: nanoid(), name: "Unit Template", ...klona(data) };
    if (newUnitTemplate.id === undefined) {
      newUnitTemplate.id = nanoid();
    }
    const newId = newUnitTemplate.id;
    if (noUndo) {
      s.unitTemplateMap[newId] = newUnitTemplate;
    } else {
      update((s) => {
        s.unitTemplateMap[newId] = newUnitTemplate;
      });
    }
    return newId;
  }

  function createTemplateFromUnit(unitId: string) {
    const unit = state.unitMap[unitId];
    if (!unit) return;
    const { id, _pid, _gid, _sid, ...unitTemplate } = klona(unit);
    return addUnitTemplate(unitTemplate);
  }

  function updateUnitTemplate(id: string, data: UnitTemplateUpdate) {
    update((s) => {
      const unitTemplate = s.unitTemplateMap[id];
      if (!unitTemplate) return;
      Object.assign(unitTemplate, data);
    });
    state.settingsStateCounter++;
  }

  function deleteUnitTemplate(id: string) {
    update((s) => {
      delete s.unitTemplateMap[id];
    });
    state.settingsStateCounter++;
  }

  return {
    addUnitTemplate,
    updateUnitTemplate,
    deleteUnitTemplate,
    createTemplateFromUnit,
  };
}
