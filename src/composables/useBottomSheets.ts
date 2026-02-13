import { ref, computed } from "vue";

export interface BottomSheet {
  id: string;
  title: string;
  isOpen: boolean;
}

const sheets = ref<Map<string, BottomSheet>>(new Map());

export function useBottomSheets() {
  const sheetList = computed(() => Array.from(sheets.value.values()));

  function createSheet(id: string, title: string): BottomSheet {
    const sheet: BottomSheet = {
      id,
      title,
      isOpen: false,
    };
    sheets.value.set(id, sheet);
    return sheet;
  }

  function removeSheet(id: string) {
    sheets.value.delete(id);
  }

  function openSheet(id: string) {
    const sheet = sheets.value.get(id);
    if (sheet) {
      sheet.isOpen = true;
    }
  }

  function closeSheet(id: string) {
    const sheet = sheets.value.get(id);
    if (sheet) {
      sheet.isOpen = false;
    }
  }

  function toggleSheet(id: string) {
    const sheet = sheets.value.get(id);
    if (sheet) {
      sheet.isOpen = !sheet.isOpen;
    }
  }

  function closeAll() {
    sheets.value.forEach((sheet) => {
      sheet.isOpen = false;
    });
  }

  function getSheet(id: string) {
    return sheets.value.get(id);
  }

  return {
    sheets: sheetList,
    createSheet,
    removeSheet,
    openSheet,
    closeSheet,
    toggleSheet,
    closeAll,
    getSheet,
  };
}
