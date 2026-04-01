<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DEFAULT_RECORDING_MIX,
  useRecordingStore,
  type RecordingMix,
} from "@/stores/recordingStore";
import {
  ChevronDown,
  MapPinned,
  Settings2,
  SplinePointer,
  Workflow,
} from "lucide-vue-next";
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
const lastRecordingMix = ref<RecordingMix>({ ...DEFAULT_RECORDING_MIX });

const isAnyRecording = computed(
  () =>
    store.isRecordingHierarchy || store.isRecordingGeometry || store.isRecordingLocation,
);

const activeRecordingLabels = computed(() => {
  const labels = [];
  if (store.isRecordingHierarchy) labels.push("Unit hierarchy");
  if (store.isRecordingLocation) labels.push("Unit location");
  if (store.isRecordingGeometry) labels.push("Feature geometry");
  return labels;
});

const recordingSummary = computed(() =>
  activeRecordingLabels.value.length > 0 ? activeRecordingLabels.value.join(", ") : "Off",
);

watch(
  () => store.getRecordingMix(),
  (mix) => {
    if (mix.hierarchy || mix.geometry || mix.location) {
      lastRecordingMix.value = { ...mix };
    }
  },
  { immediate: true },
);

const toggleRecordingPrefix = () => {
  if (isAnyRecording.value) {
    store.stopAllRecording();
  } else {
    store.applyRecordingMix(lastRecordingMix.value);
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
      :aria-label="
        isAnyRecording
          ? `Stop recording. Currently recording ${recordingSummary}.`
          : `Resume recording. Last selection: ${recordingSummary}.`
      "
      :title="
        isAnyRecording
          ? `Stop recording. Currently recording ${recordingSummary}.`
          : `Resume recording. Last selection: ${recordingSummary}.`
      "
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
      <span class="text-muted-foreground hidden items-center gap-1 sm:inline-flex">
        <Workflow
          v-if="store.isRecordingHierarchy"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        />
        <MapPinned
          v-if="store.isRecordingLocation"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        />
        <SplinePointer
          v-if="store.isRecordingGeometry"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </span>
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="h-9 rounded-none border-l px-2"
          aria-label="Choose recording modes"
          title="Choose recording modes"
        >
          <Settings2 class="text-muted-foreground h-4 w-4" />
          <ChevronDown class="text-muted-foreground/50 ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>Recording Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel class="text-muted-foreground text-xs">Units</DropdownMenuLabel>

        <DropdownMenuCheckboxItem v-model="store.isRecordingHierarchy" @select.prevent>
          <span class="flex items-center gap-2">
            <Workflow class="h-4 w-4" />
            <span>Unit hierarchy</span>
          </span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem v-model="store.isRecordingLocation" @select.prevent>
          <span class="flex items-center gap-2">
            <MapPinned class="h-4 w-4" />
            <span>Unit location</span>
          </span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel class="text-muted-foreground text-xs"
          >Features</DropdownMenuLabel
        >

        <DropdownMenuCheckboxItem v-model="store.isRecordingGeometry" @select.prevent>
          <span class="flex items-center gap-2">
            <SplinePointer class="h-4 w-4" />
            <span>Feature geometry</span>
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
