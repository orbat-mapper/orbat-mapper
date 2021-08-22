<template>
  <div
    v-if="scenarioStore.isLoaded"
    class="h-screen flex overflow-hidden bg-gray-300"
  >
    <!--    <div class="flex flex-shrink-0 bg-gray-700">-->
    <!--      <nav class="w-16"></nav>-->
    <!--    </div>-->
    <aside
      class="w-96 bg-gray-100 border-r-2 flex flex-col justify-between z-10"
    >
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
      </TabView>
      <footer
        class="
          bg-gray-200
          flex-shrink-0
          border-t border-gray-300
          flex
          items-center
        "
      >
        <div class="flex flex-col space-y-2">
          <router-link to="/" class="ml-2">
            <HomeIcon class="w-5 h-5 text-gray-500" />
          </router-link>
          <button
            type="button"
            class="ml-2 text-gray-500 hover:text-gray-700"
            @click="showKeyboardShortcuts"
            title="Show keyboard shortcuts"
          >
            <KeyboardIcon class="w-5 h-5" />
          </button>
        </div>
        <TimeController class="" />
      </footer>
    </aside>
    <aside class="flex-shrink-0 w-96 bg-gray-50 border-r-2 flex flex-col">
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
    <PlainButton
      class="fixed right-4 top-4 opacity-80"
      @click="isOpen = !isOpen"
    >
      <MenuIcon class="w-5 h-5 opacity-100" />
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
    <SlideOver v-model="isOpen" title="Layers">
      <LayersPanel />
    </SlideOver>
    <SearchModal v-model="showSearch" @select-unit="onUnitSelect" />
    <div class="fixed top-6 left-60 z-10">
      <WipBadge />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  toRefs,
  ref,
  computed,
  watch,
  onUnmounted,
} from "vue";
import { GlobalEvents } from "vue-global-events";
import OrbatPanel from "../components/OrbatPanel.vue";
import { useScenarioStore } from "../stores/scenarioStore";
import ScenarioMap from "../components/ScenarioMap.vue";
import UnitPanel from "../components/UnitPanel.vue";
import { useActiveUnitStore } from "../stores/dragStore";
import TabView from "../components/TabView.vue";
import TabItem from "../components/TabItem.vue";
import InputGroup from "../components/InputGroup.vue";
import SecondaryButton from "../components/SecondaryButton.vue";
import LayersPanel from "../components/LayersPanel.vue";
import ScenarioInfoPanel from "../components/ScenarioInfoPanel.vue";
import ShortcutsModal from "../components/ShortcutsModal.vue";
import TimeController from "../components/TimeController.vue";
import SlideOver from "../components/SlideOver.vue";
import PlainButton from "../components/PlainButton.vue";

import { MenuIcon, SearchIcon } from "@heroicons/vue/outline";
import { inputEventFilter } from "../components/helpers";
import SearchModal from "../components/SearchModal.vue";
import { useRoute, useRouter } from "vue-router";
import { useScenarioIO } from "../stores/scenarioIO";
import { useUiStore } from "../stores/uiStore";
import { HomeIcon } from "@heroicons/vue/solid";
import { Keyboard as KeyboardIcon } from "mdue";
import { useTitle } from "@vueuse/core";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";
import WipBadge from "../components/WipBadge.vue";

export default defineComponent({
  name: "MainView",
  components: {
    WipBadge,
    SearchModal,
    PlainButton,
    SlideOver,
    TimeController,
    ShortcutsModal,
    GlobalEvents,
    ScenarioInfoPanel,
    LayersPanel,
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
    const shortcutsModalVisible = ref(false);
    const currentScenarioTab = ref(0);
    const activeUnitStore = useActiveUnitStore();
    const uiStore = useUiStore();
    const { activeUnit } = toRefs(activeUnitStore);
    const originalTitle = useTitle().value;
    const windowTitle = computed(() => scenarioStore.scenario.name);
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
      await router.replace("");
    }

    watch(
      () => route.query.load,
      async (v) => {
        await loadDemoScenario(v as string);
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
      if (unit) activeUnit.value = unit;
    };

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
    };
  },

  methods: {
    showKeyboardShortcuts() {
      this.shortcutsModalVisible = true;
    },
  },
});
</script>
