import { useConfirmDialog } from "@vueuse/core";
import { computed, ref } from "vue";
import { useScenario } from "@/scenariostore";

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

export type TimeModalPromise = ReturnType<typeof useDateModal>["getModalTimestamp"];
