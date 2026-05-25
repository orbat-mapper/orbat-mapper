<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch, type Component } from "vue";
import { Map as MlMap } from "maplibre-gl";
import { ArrowLeftIcon, ChevronRightIcon, ImageDownIcon } from "@lucide/vue";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import PanelHeading from "@/components/PanelHeading.vue";
import { useGeoStore } from "@/stores/geoStore";
import { useUiStore } from "@/stores/uiStore";
import { useBoxDraw } from "@/composables/geoBoxDraw";

// Lazy-loaded on demand: the export form and its rendering dependencies are
// only fetched once the user opens the export tool.
const ExportImageForm = defineAsyncComponent(
  () => import("@/modules/maplibreview/ExportImageForm.vue"),
);

type Bbox = [number, number, number, number];
type ToolId = "export";

interface ToolDef {
  id: ToolId;
  name: string;
  description: string;
  icon: Component;
  /** Whether the tool can be opened in the current map context. */
  available: boolean;
  /** Shown in place of the description when the tool is unavailable. */
  unavailableHint?: string;
}

const geoStore = useGeoStore();
const uiStore = useUiStore();

const activeToolId = ref<ToolId | null>(null);
const drawnExportBounds = ref<Bbox | null>(null);

// The image export is MapLibre-specific, so only expose it when the active
// map engine is a MapLibre map.
const mlMap = computed(() => {
  const native = geoStore.mapAdapter?.getNativeMap();
  return native instanceof MlMap ? native : null;
});

const tools = computed<ToolDef[]>(() => [
  {
    id: "export",
    name: "Export map image",
    description: "Save the map as a PNG, with optional print sizing and a custom area.",
    icon: ImageDownIcon,
    available: !!mlMap.value,
    unavailableHint: "Only available with the MapLibre map engine.",
  },
]);

const activeTool = computed(
  () => tools.value.find((t) => t.id === activeToolId.value) ?? null,
);

// Expand the export tool when something (e.g. the map context menu) requests it.
// `immediate` covers the case where the request was set before this lazily
// mounted panel existed.
watch(
  () => uiStore.requestExportTool,
  (requested) => {
    if (!requested) return;
    if (mlMap.value) activeToolId.value = "export";
    uiStore.requestExportTool = false;
  },
  { immediate: true },
);

const exportBoxDraw = useBoxDraw(() => geoStore.mapAdapter);
exportBoxDraw.onDrawEnd((bbox) => {
  drawnExportBounds.value = bbox;
});

function onRequestDrawRect() {
  // Keep the panel mounted so the form's mode stays on "rect"; clear any prior
  // rectangle so it doesn't linger on the map while the new one is drawn.
  drawnExportBounds.value = null;
  exportBoxDraw.start();
}

function openTool(tool: ToolDef) {
  if (!tool.available) return;
  activeToolId.value = tool.id;
}

function closeActiveTool() {
  // Cancelling while a rectangle draw is in progress must tear the interaction
  // down; otherwise the map stays in crosshair mode with hover disabled and
  // clicks swallowed by the dangling draw handler.
  if (exportBoxDraw.isActive.value) exportBoxDraw.cancel();
  activeToolId.value = null;
}
</script>

<template>
  <!-- Detail view: the selected tool replaces the panel content. -->
  <div v-if="activeTool" class="space-y-4">
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        class="-ml-1 shrink-0"
        aria-label="Back to tools"
        @click="closeActiveTool"
      >
        <ArrowLeftIcon class="size-4" />
      </Button>
      <PanelHeading>{{ activeTool.name }}</PanelHeading>
    </div>

    <ExportImageForm
      v-if="activeTool.id === 'export' && mlMap"
      :map="mlMap"
      :drawn-bounds="drawnExportBounds"
      cancelable
      @request-draw-rect="onRequestDrawRect"
      @cancel="closeActiveTool"
    />
  </div>

  <!-- List view: pick a tool. -->
  <div v-else class="space-y-4">
    <PanelHeading>Tools</PanelHeading>
    <ItemGroup class="gap-2">
      <Item
        v-for="tool in tools"
        :key="tool.id"
        as="button"
        type="button"
        variant="outline"
        size="sm"
        :aria-disabled="!tool.available"
        :tabindex="tool.available ? 0 : -1"
        class="w-full text-left"
        :class="
          tool.available
            ? 'hover:bg-accent/50 cursor-pointer'
            : 'cursor-not-allowed opacity-60'
        "
        @click="openTool(tool)"
      >
        <ItemMedia variant="icon">
          <component :is="tool.icon" class="size-4" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{{ tool.name }}</ItemTitle>
          <ItemDescription>
            {{ tool.available ? tool.description : tool.unavailableHint }}
          </ItemDescription>
        </ItemContent>
        <ChevronRightIcon
          v-if="tool.available"
          class="text-muted-foreground size-4 shrink-0 self-center"
        />
      </Item>
    </ItemGroup>
  </div>
</template>
