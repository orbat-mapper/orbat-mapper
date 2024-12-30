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

export const useTestStore2 = tableStoreFactory("testStore");
export const useSupplyCategoryTableStore = tableStoreFactory("supplyCategoryTableStore");
export type TableStore = ReturnType<ReturnType<typeof tableStoreFactory>>;
