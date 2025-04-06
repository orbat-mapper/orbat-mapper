import { useConfirmDialog } from "@vueuse/core";
import { computed, ref } from "vue";
import NProgress from "nprogress";
import type { ReinforcedStatus, UnitSymbolOptions } from "@/types/scenarioModels";

export interface ModalTimestampOptions {
  timeZone: string;
  title: string;
}

export function useDateModal() {
  const { isRevealed, reveal, confirm, cancel } = useConfirmDialog<number>();
  const initialDateModalValue = ref(0);
  const dateModalTimeZone = ref("UTC");
  const dateModalTitle = ref("Set scenario time");

  const getModalTimestamp = async (
    initialValue: number,
    options: Partial<ModalTimestampOptions> = {},
  ): Promise<number | undefined> => {
    initialDateModalValue.value = initialValue;
    dateModalTimeZone.value = options.timeZone || "UTC";
    dateModalTitle.value = options.title || "Set scenario time";
    const { data, isCanceled } = await reveal();
    if (!isCanceled) {
      return data;
    }
  };
  const showDateModal = computed({
    get() {
      return isRevealed.value;
    },
    set(v: boolean) {},
  });
  return {
    isRevealed,
    showDateModal,
    revealDateModal: reveal,
    getModalTimestamp,
    confirmDateModal: confirm,
    cancelDateModal: cancel,
    initialDateModalValue,
    dateModalTimeZone,
    dateModalTitle,
  };
}

export interface ModalSidcOptions {
  title: string;
  hideModifiers: boolean;
  hideSymbolColor: boolean;
  symbolOptions: UnitSymbolOptions;
  inheritedSymbolOptions: UnitSymbolOptions;
  initialTab: number;
  reinforcedStatus: ReinforcedStatus;
}

export interface ModalSidcReturn {
  sidc: string;
  symbolOptions: UnitSymbolOptions;
  reinforcedStatus?: ReinforcedStatus;
}

export function useSidcModal() {
  const { isRevealed, reveal, confirm, cancel } = useConfirmDialog<string>();
  const initialSidcModalValue = ref("10031000001211000000");
  const sidcModalTitle = ref("Select symbol");
  const hideModifiers = ref(false);
  const hideSymbolColor = ref(false);
  const symbolOptions = ref<UnitSymbolOptions>({});
  const inheritedSymbolOptions = ref<UnitSymbolOptions>({});
  const initialTab = ref(0);
  const initialReinforcedReduced = ref<ReinforcedStatus>();

  const getModalSidc = async (
    initialValue: string,
    options: Partial<ModalSidcOptions> = {},
  ): Promise<ModalSidcReturn | undefined> => {
    NProgress.start();
    initialSidcModalValue.value = initialValue;
    sidcModalTitle.value = options.title || "Symbol picker";
    hideModifiers.value = options.hideModifiers || false;
    hideSymbolColor.value = options.hideSymbolColor || false;
    inheritedSymbolOptions.value = options.inheritedSymbolOptions || {};
    symbolOptions.value = options.symbolOptions || {};
    initialTab.value = options.initialTab ?? 0;
    initialReinforcedReduced.value = options.reinforcedStatus;
    const { data, isCanceled } = await reveal();
    if (!isCanceled) {
      return data;
    }
  };
  const showSidcModal = computed({
    get() {
      return isRevealed.value;
    },
    set(v: boolean) {},
  });
  return {
    isRevealed,
    showSidcModal,
    revealSidcModal: reveal,
    getModalSidc,
    confirmSidcModal: confirm,
    cancelSidcModal: cancel,
    initialSidcModalValue,
    sidcModalTitle,
    hideModifiers,
    hideSymbolColor,
    symbolOptions,
    inheritedSymbolOptions,
    initialTab,
    initialReinforcedReduced,
  };
}

export type TimeModalPromise = ReturnType<typeof useDateModal>["getModalTimestamp"];
export type SidcModalPromise = ReturnType<typeof useSidcModal>["getModalSidc"];
