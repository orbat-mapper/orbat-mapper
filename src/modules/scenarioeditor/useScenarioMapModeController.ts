import { computed, nextTick, ref, watch } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import { useUiStore, useWidthStore } from "@/stores/uiStore";

export function useScenarioMapModeController(resizeMap: () => void) {
  const activeScenario = injectStrict(activeScenarioKey);
  const { getModalTimestamp } = injectStrict(timeModalKey);

  const ui = useUiStore();
  const widthStore = useWidthStore();
  const { showLeftPanel } = storeToRefs(ui);
  const { orbatPanelWidth, detailsWidth } = storeToRefs(widthStore);
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smallerOrEqual("md");

  const {
    selectedUnitIds,
    selectedFeatureIds,
    activeScenarioEventId,
    activeMapLayerId,
    showScenarioInfo,
    clear: clearSelected,
  } = useSelectedItems();

  const detailsPanelClosed = ref(false);
  const hasSelection = computed(() =>
    Boolean(
      selectedFeatureIds.value.size ||
      selectedUnitIds.value.size ||
      activeScenarioEventId.value ||
      activeMapLayerId.value ||
      showScenarioInfo.value,
    ),
  );

  const showDetailsPanel = computed(() => {
    if (detailsPanelClosed.value) return false;
    return hasSelection.value || ui.detailsPanelPinned;
  });

  const showDetailsSidebar = computed(
    () => showDetailsPanel.value && ui.detailsPanelMode === "sidebar",
  );

  watch(hasSelection, (value) => {
    if (value) detailsPanelClosed.value = false;
  });

  watch(
    [
      showLeftPanel,
      orbatPanelWidth,
      showDetailsSidebar,
      detailsWidth,
      () => ui.detailsPanelMode,
      isMobile,
    ],
    () => {
      nextTick(() => resizeMap());
    },
  );

  const {
    store: { state },
    time: { setCurrentTime, add, subtract, goToNextScenarioEvent, goToPrevScenarioEvent },
  } = activeScenario;

  const openTimeDialog = async () => {
    const newTimestamp = await getModalTimestamp(state.currentTime, {
      timeZone: state.info.timeZone,
    });
    if (newTimestamp !== undefined) {
      setCurrentTime(newTimestamp);
    }
  };

  function onIncDay() {
    add(1, "day", true);
  }

  function onDecDay() {
    subtract(1, "day", true);
  }

  function onShowPlaceSearch() {
    ui.searchGeoMode = true;
    ui.showSearch = true;
  }

  function onCloseDetailsPanel() {
    detailsPanelClosed.value = true;
    clearSelected();
  }

  return {
    ui,
    isMobile,
    showLeftPanel,
    detailsWidth,
    showDetailsPanel,
    openTimeDialog,
    onIncDay,
    onDecDay,
    onShowPlaceSearch,
    onCloseDetailsPanel,
    goToNextScenarioEvent,
    goToPrevScenarioEvent,
  };
}
