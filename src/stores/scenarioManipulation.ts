import { defineStore } from "pinia";
import { SideGroup, Unit } from "../types/scenarioModels";
import { useScenarioStore, walkSubUnits } from "./scenarioStore";
import { SID_INDEX, Sidc } from "../symbology/sidc";
import { moveElement, nanoid } from "../utils";
import { setCharAt } from "../components/helpers";
import { useNotifications } from "../composables/notifications";

let counter = 1;

export const useUnitManipulationStore = defineStore("unitManipulationStore", {
  actions: {
    changeUnitParent(unit: Unit, newParent: Unit | SideGroup) {
      const scenarioStore = useScenarioStore();
      const oldParent = scenarioStore.getUnitParent(unit);
      if (!oldParent) return;

      const { side, parents } = scenarioStore.getUnitHierarchy(newParent);
      if (parents.includes(unit)) {
        const { send } = useNotifications();

        send({
          message: `Operation not allowed. Unit ${newParent.name} is a child of ${unit.name}`,
        });

        return;
      }

      if ("sidc" in oldParent) {
        const index = (oldParent as Unit).subUnits!.indexOf(unit);
        oldParent.subUnits!.splice(index, 1);
      } else {
        const index = (oldParent as SideGroup).units!.indexOf(unit);
        oldParent.units.splice(index, 1);
      }

      // update standard identity if necessary

      if (side) {
        walkSubUnits(
          unit,
          (u) => {
            if (u.sidc[SID_INDEX] !== side.standardIdentity) {
              u.sidc = setCharAt(u.sidc, SID_INDEX, side.standardIdentity);
            }
          },
          true
        );
      }
      scenarioStore.addUnit(unit, newParent);
    },

    createSubordinateUnit(parent: Unit | SideGroup) {
      const scenarioStore = useScenarioStore();
      let sidc: Sidc;
      if ("sidc" in parent) {
        sidc = new Sidc(parent.sidc);
        const echelon = +sidc.amplifierDescriptor;
        if (echelon > 0) {
          // Todo: Fix hard coded values
          if (echelon === 8) {
            // brigade
            sidc.amplifierDescriptor = "6";
          } else {
            sidc.amplifierDescriptor = (echelon - 1).toString();
          }
        }
      } else {
        sidc = new Sidc("10031000000000000000");
        const side = scenarioStore.sideMap.get(parent._pid!);
        sidc.standardIdentity = side?.standardIdentity || "0";
      }
      const newUnit: Unit = {
        name: parent.name + counter++,
        sidc: sidc.toString(),
        id: nanoid(),
        state: [],
        _state: null,
        _pid: parent.id,
        subUnits: [],
      };
      scenarioStore.addUnit(newUnit, parent);
    },

    cloneUnit(unit: Unit) {
      const scenarioStore = useScenarioStore();
      let newUnit = { ...unit };
      newUnit.name += counter++;
      newUnit.id = nanoid();
      newUnit.state = [];
      newUnit._state = null;
      newUnit.subUnits = [];
      const parent = scenarioStore.getUnitParent(unit);
      if (parent) scenarioStore.addUnit(newUnit, parent);
    },

    reorderUnit(unit: Unit, direction: "up" | "down") {
      const scenarioStore = useScenarioStore();
      const parent = scenarioStore.getUnitParent(unit);
      if (!parent) return;
      if ("sidc" in parent) {
        moveElement(parent.subUnits!, unit, direction === "up" ? -1 : 1);
      } else {
        moveElement(parent.units!, unit, direction === "up" ? -1 : 1);
      }
    },
  },
});
