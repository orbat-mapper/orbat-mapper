<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown } from "@lucide/vue";
import {
  IconMagnifyExpand as ZoomIcon,
  IconPan as PanIcon,
} from "@iconify-prerendered/vue-mdi";
import IconButton from "@/components/IconButton.vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/stores/settingsStore";
import { type UnitAction, UnitActions } from "@/types/constants";

const emit = defineEmits<{ locate: [action: UnitAction] }>();

const settings = useSettingsStore();

const modes = [
  {
    mode: "zoom",
    label: "Zoom to",
    shortcut: "Z",
    action: UnitActions.Zoom,
    icon: ZoomIcon,
  },
  { mode: "pan", label: "Pan to", shortcut: "P", action: UnitActions.Pan, icon: PanIcon },
] as const;

const active = computed(
  () => modes.find((m) => m.mode === settings.unitLocateMode) ?? modes[0],
);

// Picking a mode from the menu runs it and makes it what the button does next time
function select(m: (typeof modes)[number]) {
  settings.unitLocateMode = m.mode;
  emit("locate", m.action);
}
</script>

<template>
  <div class="flex items-center">
    <IconButton
      size="icon-sm"
      class="rounded-r-none"
      :tooltip="`${active.label} (${active.shortcut})`"
      @click="emit('locate', active.action)"
    >
      <component :is="active.icon" class="size-5" aria-hidden="true" />
    </IconButton>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          class="text-foreground/80 w-4 rounded-l-none"
          aria-label="Choose how to locate the unit"
          title="Choose how to locate the unit"
        >
          <ChevronDown class="size-3" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem v-for="m in modes" :key="m.mode" @select="select(m)">
          <component :is="m.icon" class="size-4" aria-hidden="true" />
          {{ m.label }}
          <DropdownMenuShortcut>{{ m.shortcut }}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
