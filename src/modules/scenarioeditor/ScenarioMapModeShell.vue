<script setup lang="ts">
import type { StyleValue } from "vue";
import { GlobalEvents } from "vue-global-events";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { PanelLeftOpenIcon as ShowPanelIcon } from "lucide-vue-next";
import MapTimeController from "@/components/MapTimeController.vue";
import IconButton from "@/components/IconButton.vue";
import { Button } from "@/components/ui/button";
import { inputEventFilter } from "@/components/helpers";
import MapEditorDesktopPanel from "@/modules/scenarioeditor/MapEditorDesktopPanel.vue";
import MapEditorDetailsPanel from "@/modules/scenarioeditor/MapEditorDetailsPanel.vue";
import MapEditorMobilePanel from "@/modules/scenarioeditor/MapEditorMobilePanel.vue";
import DetailsPanelContent from "@/modules/scenarioeditor/DetailsPanelContent.vue";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import ScenarioTimeline from "@/modules/scenarioeditor/ScenarioTimeline.vue";
import UnitBreadcrumbs from "@/modules/scenarioeditor/UnitBreadcrumbs.vue";
import { useUiStore } from "@/stores/uiStore";

withDefaults(
  defineProps<{
    mapReady: boolean;
    isMobile: boolean;
    showLeftPanel: boolean;
    showDetailsPanel: boolean;
    showSearchButton?: boolean;
    showKeyboardActions?: boolean;
    headerClass?: string;
    headerControlsClass?: string;
    headerControlsStyle?: StyleValue;
  }>(),
  {
    showSearchButton: true,
    showKeyboardActions: true,
    headerClass: "flex flex-none items-center justify-between sm:p-2",
    headerControlsClass: "pointer-events-auto mr-2 sm:ml-2",
    headerControlsStyle: undefined,
  },
);

const emit = defineEmits<{
  openLeftPanel: [];
  closeLeftPanel: [];
  showSettings: [];
  openTimeModal: [];
  incDay: [];
  decDay: [];
  nextEvent: [];
  prevEvent: [];
  showPlaceSearch: [];
  closeDetailsPanel: [];
}>();

const ui = useUiStore();
</script>

<template>
  <div class="relative flex min-h-0 flex-auto flex-col">
    <div class="relative flex min-h-0 flex-1">
      <template v-if="!isMobile">
        <MapEditorDesktopPanel v-if="showLeftPanel" @close="emit('closeLeftPanel')" />
      </template>
      <div class="relative flex min-w-0 flex-auto flex-col">
        <slot name="map" />
        <main
          v-if="mapReady"
          class="pointer-events-none absolute inset-0 flex flex-col justify-between"
        >
          <header :class="headerClass">
            <div class="ml-10 flex items-center sm:ml-8">
              <MapTimeController
                class="pointer-events-auto ml-1"
                :show-controls="false"
                @open-time-modal="emit('openTimeModal')"
                @show-settings="emit('showSettings')"
                @inc-day="emit('incDay')"
                @dec-day="emit('decDay')"
                @next-event="emit('nextEvent')"
                @prev-event="emit('prevEvent')"
              />
            </div>
            <div :class="headerControlsClass" :style="headerControlsStyle">
              <slot name="header-right-before-search" />
              <IconButton
                v-if="showSearchButton"
                @click.stop="emit('showPlaceSearch')"
                title="Search"
              >
                <MagnifyingGlassIcon class="h-5 w-5" />
              </IconButton>
              <slot name="header-right-after-search" />
            </div>
          </header>
          <Button
            v-if="!isMobile && !showLeftPanel"
            type="button"
            variant="secondary"
            class="pointer-events-auto absolute top-[45%] left-0 h-11 w-5 -translate-y-1/2 rounded-l-none rounded-r-md px-0"
            @click="emit('openLeftPanel')"
            title="Show panel"
          >
            <ShowPanelIcon class="size-4" />
          </Button>
          <slot name="footer-overlays" />
        </main>
        <MapEditorDetailsPanel
          v-if="!isMobile && showDetailsPanel && ui.detailsPanelMode === 'overlay'"
          :mode="ui.detailsPanelMode"
          @close="emit('closeDetailsPanel')"
        >
          <DetailsPanelContent />
        </MapEditorDetailsPanel>
      </div>
      <MapEditorDetailsPanel
        v-if="!isMobile && showDetailsPanel && ui.detailsPanelMode === 'sidebar'"
        :mode="ui.detailsPanelMode"
        @close="emit('closeDetailsPanel')"
      >
        <DetailsPanelContent />
      </MapEditorDetailsPanel>
    </div>
    <template v-if="isMobile">
      <UnitBreadcrumbs v-if="ui.showOrbatBreadcrumbs" />
      <MapEditorMobilePanel
        @open-time-modal="emit('openTimeModal')"
        @inc-day="emit('incDay')"
        @dec-day="emit('decDay')"
        @next-event="emit('nextEvent')"
        @prev-event="emit('prevEvent')"
        @show-settings="emit('showSettings')"
      />
    </template>
    <KeyboardScenarioActions v-if="showKeyboardActions && mapReady" />
    <GlobalEvents
      v-if="ui.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.t="emit('openTimeModal')"
      @keyup.s="emit('showPlaceSearch')"
    />
    <slot name="after-keyboard" />
    <UnitBreadcrumbs v-if="ui.showOrbatBreadcrumbs && !isMobile" />
    <ScenarioTimeline v-if="ui.showTimeline" />
    <slot name="modals" />
  </div>
</template>
