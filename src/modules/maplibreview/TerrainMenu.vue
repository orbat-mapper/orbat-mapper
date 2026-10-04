<script setup lang="ts">
import { computed } from "vue";
import {
  ContextMenuCheckboxItem,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useElevationArchive } from "@/composables/elevationArchive";
import { elevationArchiveLabel, useTerrainStore } from "@/stores/terrainStore";
import HillshadeSettingsControl from "./HillshadeSettingsControl.vue";
import TerrainExaggerationControl from "./TerrainExaggerationControl.vue";

// The map context menu and the main menu need their own menu family's items, but
// the items take the same props, so one template serves both.
const props = defineProps<{ kind: "context" | "dropdown" }>();

const MENU_ITEMS = {
  context: {
    Sub: ContextMenuSub,
    SubTrigger: ContextMenuSubTrigger,
    SubContent: ContextMenuSubContent,
    CheckboxItem: ContextMenuCheckboxItem,
    Item: ContextMenuItem,
    Separator: ContextMenuSeparator,
    Label: ContextMenuLabel,
  },
  dropdown: {
    Sub: DropdownMenuSub,
    SubTrigger: DropdownMenuSubTrigger,
    SubContent: DropdownMenuSubContent,
    CheckboxItem: DropdownMenuCheckboxItem,
    Item: DropdownMenuItem,
    Separator: DropdownMenuSeparator,
    Label: DropdownMenuLabel,
  },
};
const { Sub, SubTrigger, SubContent, CheckboxItem, Item, Separator, Label } =
  MENU_ITEMS[props.kind];

const settings = useTerrainStore();
const {
  pendingElevationArchive,
  activatePendingElevationArchive,
  openElevationArchivePicker,
  removeElevationArchive,
  chooseOnlineElevation,
  stopOnlineElevation,
} = useElevationArchive();

const usingOnlineElevation = computed(
  () => settings.onlineElevationChosen && !settings.elevationArchive,
);

const statusText = computed(() => {
  const archive = settings.elevationArchive;
  if (settings.elevationUnavailable) return settings.elevationUnavailableMessage;
  if (pendingElevationArchive.value)
    return `${pendingElevationArchive.value.verb} the elevation archive to show terrain.`;
  if (!settings.elevationSource)
    return "Open an elevation archive to show terrain and hillshading.";
  if (archive) return `Elevation data from ${elevationArchiveLabel(archive)}.`;
  return "Elevation data from Mapterhorn requires a network connection.";
});
</script>

<template>
  <component :is="Sub">
    <component :is="SubTrigger" inset><span>Terrain</span></component>
    <component :is="SubContent">
      <component :is="CheckboxItem" v-model="settings.terrainEnabled" @select.prevent>
        3D terrain
      </component>
      <TerrainExaggerationControl />
      <component :is="CheckboxItem" v-model="settings.hillshadeEnabled" @select.prevent>
        Hillshading
      </component>
      <component :is="Sub">
        <component
          :is="SubTrigger"
          inset
          :disabled="!settings.hillshadeEnabled"
          class="data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >Hillshade settings</component
        >
        <component :is="SubContent">
          <HillshadeSettingsControl />
        </component>
      </component>
      <component :is="Separator" />
      <component
        :is="Item"
        v-if="pendingElevationArchive"
        inset
        class="max-w-56"
        @select="activatePendingElevationArchive()"
      >
        <span class="truncate">{{ pendingElevationArchive.menuText }}</span>
      </component>
      <component
        :is="Item"
        v-if="settings.onlineElevationOptional"
        inset
        @select="usingOnlineElevation ? stopOnlineElevation() : chooseOnlineElevation()"
      >
        {{ usingOnlineElevation ? "Stop using" : "Use" }} Mapterhorn online
      </component>
      <component :is="Item" inset @select="openElevationArchivePicker()">
        Open elevation archive…
      </component>
      <component
        :is="Item"
        v-if="settings.elevationArchive"
        inset
        @select="removeElevationArchive()"
      >
        Remove elevation archive
      </component>
      <component :is="Separator" />
      <component
        :is="Label"
        :role="settings.elevationUnavailable ? 'status' : undefined"
        class="text-muted-foreground max-w-56 text-xs font-normal break-words"
      >
        {{ statusText }}
      </component>
    </component>
  </component>
</template>
