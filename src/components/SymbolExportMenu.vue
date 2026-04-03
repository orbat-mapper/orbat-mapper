<script setup lang="ts">
import { type Ref, toRef } from "vue";
import {
  ChevronDownIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  SettingsIcon,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSymbolExport } from "@/composables/symbolExport";
import { useSymbolExportSettingsStore } from "@/stores/settingsStore";
import type { SymbolOptions } from "milsymbol";

const props = defineProps<{
  sidc: string;
  symbolOptions: Partial<SymbolOptions>;
}>();

const { exportSettings } = storeToRefs(useSymbolExportSettingsStore());

const { copySvg, copyPng, downloadSvg, downloadPng } = useSymbolExport(
  toRef(props, "sidc"),
  toRef(props, "symbolOptions") as Ref<Partial<SymbolOptions>>,
  exportSettings,
);

const sizeOptions = [
  { value: 64, label: "Small" },
  { value: 128, label: "Medium" },
  { value: 256, label: "Large" },
  { value: 512, label: "Extra Large" },
] as const;
</script>

<template>
  <div class="flex items-center gap-1">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm">
          <ClipboardCopyIcon class="size-3.5" />Copy<ChevronDownIcon class="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @select="copySvg">Copy as SVG</DropdownMenuItem>
        <DropdownMenuItem @select="copyPng">Copy as PNG</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm">
          <DownloadIcon class="size-3.5" />Save<ChevronDownIcon class="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @select="downloadSvg">Save as SVG</DropdownMenuItem>
        <DropdownMenuItem @select="downloadPng">Save as PNG</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon-sm" title="Export settings">
          <SettingsIcon class="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="min-w-44">
        <DropdownMenuLabel>Export settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Symbol size</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          :model-value="String(exportSettings.size)"
          @update:model-value="exportSettings.size = Number($event)"
        >
          <DropdownMenuRadioItem
            v-for="opt in sizeOptions"
            :key="opt.value"
            :value="String(opt.value)"
            @select.prevent
          >
            {{ opt.label }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuCheckboxItem v-model="exportSettings.showFrame" @select.prevent>
          Frame
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model="exportSettings.showIcon" @select.prevent>
          Icon
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model="exportSettings.showFill" @select.prevent>
          Fill
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model="exportSettings.showOutline" @select.prevent>
          Outline
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
