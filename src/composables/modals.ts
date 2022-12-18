import { useConfirmDialog } from "@vueuse/core";
import { computed, ref } from "vue";
import NProgress from "nprogress";

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
    options: Partial<ModalTimestampOptions> = {}
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
}

export function useSidcModal() {
  const { isRevealed, reveal, confirm, cancel } = useConfirmDialog<string>();
  const initialSidcModalValue = ref("10031000001211000000");
  const sidcModalTitle = ref("Select symbol");

  const getModalSidc = async (
    initialValue: string,
    options: Partial<ModalSidcOptions> = {}
  ): Promise<string | undefined> => {
    NProgress.start();
    initialSidcModalValue.value = initialValue;
    sidcModalTitle.value = options.title || "Symbol picker";
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
  };
}

export type TimeModalPromise = ReturnType<typeof useDateModal>["getModalTimestamp"];
export type SidcModalPromise = ReturnType<typeof useSidcModal>["getModalSidc"];
