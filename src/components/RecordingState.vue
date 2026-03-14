<script setup lang="ts">
import { computed, ref } from "vue";
import { useRecordingStore } from "@/stores/recordingStore";
import { ChevronDown, Settings2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const store = useRecordingStore();
const lastRecordingMix = ref({
  hierarchy: false,
  geometry: false,
  location: true,
});

const isAnyRecording = computed(
  () =>
    store.isRecordingHierarchy || store.isRecordingGeometry || store.isRecordingLocation,
);

const applyRecordingMix = (mix: {
  hierarchy: boolean;
  geometry: boolean;
  location: boolean;
}) => {
  store.isRecordingHierarchy = mix.hierarchy;
  store.isRecordingGeometry = mix.geometry;
  store.isRecordingLocation = mix.location;
};

const toggleRecordingPrefix = () => {
  if (isAnyRecording.value) {
    lastRecordingMix.value = {
      hierarchy: store.isRecordingHierarchy,
      geometry: store.isRecordingGeometry,
      location: store.isRecordingLocation,
    };
    store.stopAllRecording();
  } else {
    applyRecordingMix(lastRecordingMix.value);
  }
};
</script>

<template>
  <div
    class="bg-card flex items-center overflow-hidden rounded-md border shadow-sm transition-all"
  >
    <Button
      variant="ghost"
      size="sm"
      class="h-9 gap-2 rounded-none px-3 transition-colors"
      :class="{ 'bg-red-50/50 dark:bg-red-950/20': isAnyRecording }"
      @click="toggleRecordingPrefix"
    >
      <span
        class="h-2 w-2 rounded-full transition-all duration-500"
        :class="
          isAnyRecording ? 'bg-red-600 ring-2 ring-red-500/20' : 'bg-muted-foreground/40'
        "
      />
      <span
        class="text-xs font-bold tracking-widest uppercase transition-colors"
        :class="
          isAnyRecording ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
        "
      >
        Rec
      </span>
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm" class="h-9 rounded-none border-l px-2">
          <Settings2 class="text-muted-foreground hidden h-4 w-4 sm:inline-block" />
          <ChevronDown class="text-muted-foreground/50 ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>Recording Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel class="text-muted-foreground text-xs">Units</DropdownMenuLabel>

        <DropdownMenuCheckboxItem v-model="store.isRecordingHierarchy" @select.prevent>
          Hierarchy
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model="store.isRecordingLocation" @select.prevent>
          Location
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel class="text-muted-foreground text-xs"
          >Features</DropdownMenuLabel
        >

        <DropdownMenuCheckboxItem v-model="store.isRecordingGeometry" @select.prevent>
          Geometry
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
