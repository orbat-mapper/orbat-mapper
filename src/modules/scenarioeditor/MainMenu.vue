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

import { ScenarioActions, UiAction } from "@/types/constants";
import { useRoute } from "vue-router";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { storeToRefs } from "pinia";

const emit = defineEmits<{
  action: [value: ScenarioActions];
  uiAction: [value: UiAction];
}>();

const route = useRoute();
const uiSettings = useUiStore();
const { coordinateFormat } = storeToRefs(useMapSettingsStore());
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as="div">
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
        >Search <DropdownMenuShortcut>Ctrl K</DropdownMenuShortcut></DropdownMenuItem
      >
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>File</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem @select="emit('action', 'exportJson')"
            >Download scenario</DropdownMenuItem
          >
          <DropdownMenuItem @select="emit('action', 'save')">
            Save scenario
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'export')">
            Export scenario data
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'import')">
            Import data
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'duplicate')">
            Duplicate scenario
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'showInfo')">
            Show scenario info
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('action', 'exportToClipboard')">
            Copy scenario to clipboard
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          ><span class="mr-4">Preferences</span></DropdownMenuSubTrigger
        >
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem
            v-model:checked="uiSettings.showToolbar"
            @select.prevent
            >Show toolbar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            v-model:checked="uiSettings.showTimeline"
            @select.prevent
            >Show timeline
          </DropdownMenuCheckboxItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Coordinate format</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup v-model="coordinateFormat">
                <DropdownMenuRadioItem value="dms"
                  >Degrees, minutes, seconds
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dd">Decimal degrees</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="MGRS">MGRS</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
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
            <DropdownMenuShortcut class="ml-4">?</DropdownMenuShortcut></DropdownMenuItem
          >
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</template>