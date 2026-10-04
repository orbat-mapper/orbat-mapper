<script setup lang="ts">
import {
  ContextMenuCheckboxItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ELEVATION_UNAVAILABLE_MESSAGE, useTerrainStore } from "@/stores/terrainStore";
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
    Separator: ContextMenuSeparator,
    Label: ContextMenuLabel,
  },
  dropdown: {
    Sub: DropdownMenuSub,
    SubTrigger: DropdownMenuSubTrigger,
    SubContent: DropdownMenuSubContent,
    CheckboxItem: DropdownMenuCheckboxItem,
    Separator: DropdownMenuSeparator,
    Label: DropdownMenuLabel,
  },
};
const { Sub, SubTrigger, SubContent, CheckboxItem, Separator, Label } =
  MENU_ITEMS[props.kind];

const settings = useTerrainStore();
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
        :is="Label"
        :role="settings.elevationUnavailable ? 'status' : undefined"
        class="text-muted-foreground max-w-56 text-xs font-normal"
      >
        <template v-if="settings.elevationUnavailable">{{
          ELEVATION_UNAVAILABLE_MESSAGE
        }}</template>
        <template v-else
          >Elevation data from Mapterhorn requires a network connection.</template
        >
      </component>
    </component>
  </component>
</template>
