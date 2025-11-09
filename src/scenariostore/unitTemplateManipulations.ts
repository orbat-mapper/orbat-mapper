import { type NewScenarioStore } from "@/scenariostore/newScenarioStore";
import { type NUnitTemplate, type NUnitTemplateAdd } from "@/types/internalModels";
import { klona } from "klona";
import { nanoid } from "@/utils";

export function useUnitTemplateManipulations(store: NewScenarioStore) {
  const { update } = store;

  function addUnitTemplate(
    data: NUnitTemplateAdd,
    { noUndo = false, s = store.state } = {},
  ) {
    const newUnitTemplate = {
      id: nanoid(),
      name: "Unit Template",
      ...klona(data),
    };
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
    const unit = store.state.unitMap[unitId];
    if (!unit) return;
    const {
      id,
      _pid,
      _gid,
      _sid,
      state,
      _isOpen,
      _ikey,
      _lkey,
      _state,
      ...unitTemplate
    } = klona(unit);

    return addUnitTemplate(unitTemplate);
  }

  function updateUnitTemplate(id: string, data: Partial<NUnitTemplate>) {
    update((s) => {
      const unitTemplate = s.unitTemplateMap[id];
      if (!unitTemplate) return;
      Object.assign(unitTemplate, data);
    });
    store.state.settingsStateCounter++;
  }

  function deleteUnitTemplate(id: string) {
    update((s) => {
      delete s.unitTemplateMap[id];
    });
    store.state.settingsStateCounter++;
  }

  return {
    addUnitTemplate,
    updateUnitTemplate,
    deleteUnitTemplate,
    createTemplateFromUnit,
  };
}
