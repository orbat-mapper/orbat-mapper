<template>
  <div
    v-if="scenarioStore.isLoaded"
    class="flex h-screen overflow-hidden bg-gray-300 pt-4"
  >
    <p
      class="absolute inset-x-0 top-0 h-4 border-b bg-amber-200 text-center text-xs text-amber-700"
    >
      Under development
    </p>
    <aside class="z-10 flex w-96 flex-col justify-between border-r-2 bg-gray-100">
      <TabView
        v-model:current-tab="currentScenarioTab"
        extra-class="px-6"
        tab-class=""
        class="mt-3 min-h-0"
      >
        <TabItem label="ORBAT" class="relative">
          <button
            @click="showSearch = true"
            class="absolute -top-1 right-6 text-gray-500 hover:text-gray-900"
          >
            <span class="sr-only">Search units</span>
            <SearchIcon class="h-5 w-5" />
          </button>
          <OrbatPanel class="pb-12" />
        </TabItem>
        <TabItem label="Scenario info">
          <ScenarioInfoPanel />
        </TabItem>
        <template #extra>
          <DotsMenu
            :items="scenarioMenuItems"
            class="relative -mr-2 pt-2"
            @action="onScenarioAction"
          />
        </template>
      </TabView>
      <footer
        class="flex flex-shrink-0 items-center border-t border-gray-300 bg-gray-200"
      >
        <div class="flex flex-col space-y-2">
          <router-link to="/" class="ml-2">
            <HomeIcon class="h-5 w-5 text-gray-500" />
          </router-link>
          <button
            type="button"
            class="ml-2 text-gray-500 hover:text-gray-700"
            @click="showKeyboardShortcuts"
            title="Show keyboard shortcuts"
          >
            <KeyboardIcon class="h-5 w-5" />
          </button>
        </div>
        <TimeController class="" />
      </footer>
    </aside>
    <aside class="flex w-96 flex-shrink-0 flex-col border-r-2 bg-gray-50">
      <TabView
        v-model:current-tab="currentTab"
        extra-class="px-6"
        tab-class="pl-6 pr-6"
        class="mt-3 min-h-0"
      >
        <TabItem label="Unit details">
          <UnitPanel :unit="activeUnit ? activeUnit : undefined" />
        </TabItem>
        <!--        <TabItem label="Layers">-->
        <!--          <LayersPanel />-->
        <!--        </TabItem>-->
      </TabView>
    </aside>
    <ScenarioMap class="flex-1" />
    <PlainButton class="fixed right-4 top-4 opacity-80" @click="isOpen = !isOpen">
      <MenuIcon class="h-5 w-5 opacity-100" />
    </PlainButton>
    <GlobalEvents
      v-if="shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.?="showKeyboardShortcuts"
      @keyup.c="createNewUnit"
      @keyup.d="duplicateUnit"
      @keyup.s="showSearch = true"
      @keyup.prevent.alt.k="showSearch = true"
    />
    <ShortcutsModal v-model="shortcutsModalVisible" />
    <MainViewSlideOver v-model="isOpen" />
    <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
    <AppNotifications />
    <LoadScenarioDialog
      v-if="showLoadModal"
      v-model="showLoadModal"
      @loaded="loadScenario"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  nextTick,
  onUnmounted,
  ref,
  toRefs,
  watch,
} from "vue";
import { GlobalEvents } from "vue-global-events";
import OrbatPanel from "../../components/OrbatPanel.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import ScenarioMap from "../../components/ScenarioMap.vue";
import UnitPanel from "../../components/UnitPanel.vue";
import { useActiveUnitStore } from "../../stores/dragStore";
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import InputGroup from "../../components/InputGroup.vue";
import SecondaryButton from "../../components/SecondaryButton.vue";
import ScenarioInfoPanel from "../../components/ScenarioInfoPanel.vue";
import ShortcutsModal from "../../components/ShortcutsModal.vue";
import TimeController from "../../components/TimeController.vue";
import PlainButton from "../../components/PlainButton.vue";

import { MenuIcon, SearchIcon } from "@heroicons/vue/outline";
import { inputEventFilter } from "../../components/helpers";
import SearchModal from "../../components/SearchModal.vue";
import { useRoute, useRouter } from "vue-router";
import { useScenarioIO } from "../../stores/scenarioIO";
import { useUiStore } from "../../stores/uiStore";
import { HomeIcon } from "@heroicons/vue/solid";
import { Keyboard as KeyboardIcon } from "mdue";
import { useTitle } from "@vueuse/core";
import { useUnitManipulationStore } from "../../stores/scenarioManipulation";
import WipBadge from "../../components/WipBadge.vue";
import MainViewSlideOver from "../../components/MainViewSlideOver.vue";
import DotsMenu, { MenuItemData } from "../../components/DotsMenu.vue";
import { ScenarioActions } from "../../types/constants";
import AppNotifications from "../../components/AppNotifications.vue";
import { useNotifications } from "../../composables/notifications";
import { Scenario } from "../../types/models";

export default defineComponent({
  name: "MainView",
  components: {
    AppNotifications,
    DotsMenu,
    MainViewSlideOver,
    WipBadge,
    SearchModal,
    PlainButton,
    TimeController,
    ShortcutsModal,
    GlobalEvents,
    ScenarioInfoPanel,
    SecondaryButton,
    InputGroup,
    TabItem,
    TabView,
    UnitPanel,
    ScenarioMap,
    OrbatPanel,
    MenuIcon,
    HomeIcon,
    SearchIcon,
    KeyboardIcon,
    LoadScenarioDialog: defineAsyncComponent(() => import("./LoadScenarioDialog.vue")),
  },

  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const scenarioStore = useScenarioStore();
    const unitManipulationStore = useUnitManipulationStore();
    const scenarioIO = useScenarioIO();
    const currentTab = ref(0);
    const isOpen = ref(false);
    const showSearch = ref(false);
    const showLoadModal = ref(false);
    const shortcutsModalVisible = ref(false);
    const currentScenarioTab = ref(0);
    const activeUnitStore = useActiveUnitStore();
    const uiStore = useUiStore();
    const { activeUnit } = toRefs(activeUnitStore);
    const originalTitle = useTitle().value;
    const windowTitle = computed(() => scenarioStore.scenario.name);
    const { send } = useNotifications();

    useTitle(windowTitle);

    onUnmounted(() => {
      useTitle(originalTitle);
      activeUnitStore.clearActiveUnit();
    });

    if (route.query.load) {
      loadDemoScenario(route.query.load as string);
    } else {
      if (!scenarioStore.isLoaded) scenarioStore.loadEmptyScenario();
    }

    async function loadDemoScenario(name: string) {
      if (name === "empty") {
        scenarioStore.loadEmptyScenario();
        await router.replace("");
        return;
      }
      await scenarioIO.loadDemoScenario(name as string);
      // await router.replace("");
    }

    function loadScenario(scenarioData: Scenario) {
      scenarioIO.loadFromObject(scenarioData);
      send({ message: "Loaded scenario from file" });
    }

    watch(
      () => route.query.load,
      async (v) => {
        if (v) await loadDemoScenario(v as string);
      }
    );

    const createNewUnit = () => {
      const parent = activeUnit.value;
      if (!parent) return;
      unitManipulationStore.createSubordinateUnit(parent);
    };

    const duplicateUnit = () => {
      if (!activeUnit.value) return;

      unitManipulationStore.cloneUnit(activeUnit.value);
    };

    const shortcutsEnabled = computed(() => !uiStore.modalOpen);

    const onUnitSelect = (unitId: string) => {
      const unit = scenarioStore.getUnitById(unitId);
      if (unit) {
        activeUnit.value = unit;
        const { parents } = scenarioStore.getUnitHierarchy(unit);
        parents.forEach((p) => (p._isOpen = true));
        nextTick(() => {
          const el = document.getElementById(`o-${unitId}`);
          if (el) {
            el.scrollIntoView();
          }
        });
      }
    };

    const scenarioMenuItems: MenuItemData<ScenarioActions>[] = [
      { label: "Add new side", action: ScenarioActions.AddSide },
      { label: "Save to local storage", action: ScenarioActions.Save },
      { label: "Load from local storage", action: ScenarioActions.Load },
      { label: "Load scenario", action: ScenarioActions.LoadNew },
      { label: "Download as JSON", action: ScenarioActions.ExportJson },
    ];

    function onScenarioAction(action: ScenarioActions) {
      if (action === ScenarioActions.AddSide) {
        scenarioStore.addSide();
      }

      if (action === ScenarioActions.Save) {
        scenarioIO.saveToLocalStorage();
        send({ message: "Saved to local storage" });
      }

      if (action === ScenarioActions.Load) {
        scenarioIO.loadFromLocalStorage();
        send({ message: "Loaded from local storage" });
      }

      if (action === ScenarioActions.ExportJson) {
        scenarioIO.downloadAsJson();
      }

      if (action === ScenarioActions.LoadNew) {
        showLoadModal.value = true;
      }
    }

    return {
      activeUnit,
      currentTab,
      isOpen,
      currentScenarioTab,
      shortcutsModalVisible,
      createNewUnit,
      inputEventFilter,
      shortcutsEnabled,
      showSearch,
      onUnitSelect,
      scenarioStore,
      duplicateUnit,
      scenarioMenuItems,
      onScenarioAction,
      showLoadModal,
      loadScenario,
    };
  },

  methods: {
    showKeyboardShortcuts() {
      this.shortcutsModalVisible = true;
    },
  },
});
</script>
