import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

function tableStoreFactory(storeName: string) {
  return defineStore(storeName, () => {
    const columnVisibility = useLocalStorage<Record<string, boolean>>(
      storeName + "-columnVisibility",
      {},
    );
    const columnSizing = useLocalStorage<Record<string, number>>(
      storeName + "-columnWidth",
      {},
    );
    return { columnVisibility, columnSizing };
  });
}

export type TableStore = ReturnType<ReturnType<typeof tableStoreFactory>>;

export const useTestStore2 = tableStoreFactory("testStore");
export const useSupplyCategoryTableStore = tableStoreFactory("supplyCategoryTableStore");
export const useSupplyClassTableStore = tableStoreFactory("supplyClassTableStore");
export const useEquipmentTableStore = tableStoreFactory("equipmentTableStore");
export const usePersonnelTableStore = tableStoreFactory("personnelTableStore");
