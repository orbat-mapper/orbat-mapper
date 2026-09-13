<script setup lang="ts">
import { RouteIcon } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelectedItems } from "@/stores/selectedStore";
import { useUiStore } from "@/stores/uiStore";

const ui = useUiStore();
const { clear: clearSelected } = useSelectedItems();

function onGenerateCoa() {
  clearSelected();
  ui.showCoaGenerationPanel = true;
}
</script>

<template>
  <div
    id="coa-generation-menu"
    class="bg-muted-foreground/20 dark:bg-foreground/15 text-muted-foreground/80 hidden shrink-0 items-center rounded-lg px-1 lg:flex"
  >
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="hover:bg-muted hover:text-foreground focus:ring-ring gap-1.5 rounded-md px-2 focus:ring-2 focus:outline-hidden focus:ring-inset"
          title="COA generation"
        >
          <RouteIcon class="size-5" />
          <span class="hidden xl:inline">COA generation</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" :side-offset="10">
        <DropdownMenuItem @select="onGenerateCoa">Generate COA</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Import MLCOA overlay</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
