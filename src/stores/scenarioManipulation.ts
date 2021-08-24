import { defineStore } from "pinia";
import { SideGroup, Unit } from "../types/models";
import { useScenarioStore, walkSubUnits } from "./scenarioStore";
import { SID_INDEX, Sidc } from "../symbology/sidc";
import { nanoid } from "nanoid";
import { setCharAt } from "../components/helpers";

let counter = 1;

// https://gist.github.com/albertein/4496103
export function moveElement<T>(array: T[], element: T, delta: number) {
  const index = array.indexOf(element);
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex === array.length) {
    return;
  }
  const indexes = [index, newIndex].sort();
  array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]);
}

export const useUnitManipulationStore = defineStore("unitManipulationStore", {
  actions: {
    changeUnitParent(unit: Unit, newParent: Unit | SideGroup) {
      const scenarioStore = useScenarioStore();
      const oldParent = scenarioStore.getUnitParent(unit);
      if (!oldParent) return;

      if ("sidc" in oldParent) {
        const index = (oldParent as Unit).subUnits!.indexOf(unit);
        oldParent.subUnits!.splice(index, 1);
      } else {
        const index = (oldParent as SideGroup).units!.indexOf(unit);
        oldParent.units.splice(index, 1);
      }

      // update standard identity if necessary
      const { side } = scenarioStore.getUnitHierarchy(newParent);

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
