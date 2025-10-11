<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { useUiStore } from "@/stores/uiStore";
import { LANDING_PAGE_ROUTE } from "@/router/names";

import type { ScenarioActions, UiAction } from "@/types/constants";
import { useRoute } from "vue-router";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { storeToRefs } from "pinia";
import { useMeasurementsStore } from "@/stores/geoStore";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const emit = defineEmits<{
  action: [value: ScenarioActions];
  uiAction: [value: UiAction];
}>();

const {
  store: { undo, redo, canRedo, canUndo },
} = injectStrict(activeScenarioKey);

const route = useRoute();
const uiSettings = useUiStore();
const mapSettings = useMapSettingsStore();

const { coordinateFormat, showLocation, showScaleLine, showDayNightTerminator } =
  storeToRefs(useMapSettingsStore());

const { measurementUnit } = storeToRefs(useMeasurementsStore());
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="div" class="bg-opacity-50 relative bg-gray-900">
      <button class="group flex items-center">
        <svg
          class="block h-7 w-auto shrink-0 fill-gray-700 stroke-gray-300"
          stroke="currentColor"
          viewBox="41 41 118 118"
        >
          <path d="m100 45 55 25v60l-55 25-55-25V70z" stroke-width="6" />
          <path d="m45 70 110 60m-110 0 110-60" stroke-width="6" />
          <circle cx="100" cy="70" r="10" class="fill-gray-300" />
        </svg>
        <span class="ml-2 hidden font-medium tracking-tight sm:block">ORBAT-Mapper</span>
        <ChevronDownIcon
          class="ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-200"
          aria-hidden="true"
        />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="" align="start" :side-offset="10">
      <DropdownMenuItem as-child>
        <router-link :to="{ name: LANDING_PAGE_ROUTE }" class="font-medium"
          >Home
        </router-link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem @select="emit('uiAction', 'showSearch')"
        >Search
        <DropdownMenuShortcut class="ml-4">Ctrl/⌘ K</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>File</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem @select="emit('action', 'exportJson')"
            >Download scenario
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'save')">
            Save scenario
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'loadNew')">
            Load scenario...
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'createNew')">
            New scenario...
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem @select="emit('action', 'export')">
            Export scenario data...
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'exportToImage')">
            Export as image
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'import')">
            Import data...
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'exportToClipboard')">
            Copy scenario to clipboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="emit('action', 'duplicate')">
            Duplicate scenario
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'showInfo')">
            Show scenario info
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger><span>Edit</span></DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem @select="undo()" :disabled="!canUndo">
            Undo
            <DropdownMenuShortcut class="ml-4">Ctrl/⌘ Z</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem @select="redo()" :disabled="!canRedo">
            Redo
            <DropdownMenuShortcut class="ml-4">Ctrl/⌘ shift Z</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger><span class="mr-4">View</span></DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem v-model="uiSettings.showToolbar" @select.prevent
            >Map toolbar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="uiSettings.showTimeline" @select.prevent
            >Timeline
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            v-if="!isMobile"
            v-model="uiSettings.showLeftPanel"
            @select.prevent
            >ORBAT panel
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            v-model="uiSettings.showOrbatBreadcrumbs"
            @select.prevent
            >Unit breadcrumbs</DropdownMenuCheckboxItem
          >
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem v-model="showScaleLine" @select.prevent>
            Scale line
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showLocation" @select.prevent>
            Pointer location
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showDayNightTerminator" @select.prevent>
            Day/nigth terminator
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            v-model="mapSettings.mapUnitLabelBelow"
            @select.prevent
          >
            Unit labels below icons
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            v-model="mapSettings.mapWrapUnitLabels"
            @select.prevent
            v-if="mapSettings.mapUnitLabelBelow"
          >
            Wrap long unit labels
          </DropdownMenuCheckboxItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset
              ><span class="pr-4">Measurement units</span></DropdownMenuSubTrigger
            >
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup v-model="measurementUnit">
                <DropdownMenuRadioItem value="metric" @select.prevent
                  >Metric
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="imperial" @select.prevent
                  >Imperial
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nautical" @select.prevent
                  >Nautical
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Coordinate format</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup v-model="coordinateFormat">
                <DropdownMenuRadioItem value="dms" @select.prevent
                  >Degrees, minutes, seconds
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dd" @select.prevent
                  >Decimal degrees
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="MGRS" @select.prevent
                  >MGRS
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Tools</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem @select="emit('action', 'browseSymbols')"
            >Browse symbols
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Help</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem as-child
            ><a
              :href="
                route.meta.helpUrl ||
                'https://docs.orbat-mapper.app/guide/about-orbat-mapper'
              "
              target="_blank"
            >
              Documentation
            </a></DropdownMenuItem
          >
          <DropdownMenuItem @select="emit('uiAction', 'showKeyboardShortcuts')"
            >Keyboard shortcuts
            <DropdownMenuShortcut class="ml-4">?</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
