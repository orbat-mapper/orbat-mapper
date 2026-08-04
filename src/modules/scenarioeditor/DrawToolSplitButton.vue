<script setup lang="ts">
import { computed, type Component } from "vue";
import { ChevronDown } from "@lucide/vue";
import {
  IconMapMarker as PointIcon,
  IconVectorCircleVariant as CircleIcon,
  IconVectorLine as LineStringIcon,
  IconVectorPolygon as PolygonIcon,
  IconVectorRectangle as RectangleIcon,
} from "@iconify-prerendered/vue-mdi";
import { storeToRefs } from "pinia";

import type { DrawType } from "@/geo/drawTypes";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** One pill, two hit areas: the main half re-arms the last-used plain draw tool (its
 *  icon previews which), the chevron half opens the shape menu. The last-used shape
 *  lives in the main toolbar store because this toolbar is `v-if`'d — a local ref
 *  would forget the shape every time the toolbar closes. */
const props = defineProps<{ currentDrawType: DrawType | null }>();
const emit = defineEmits<{ select: [drawType: DrawType] }>();

const DRAW_TOOLS: { type: DrawType; label: string; icon: Component }[] = [
  { type: "Point", label: "Point", icon: PointIcon },
  { type: "LineString", label: "Line", icon: LineStringIcon },
  { type: "Polygon", label: "Polygon", icon: PolygonIcon },
  { type: "Rectangle", label: "Rectangle", icon: RectangleIcon },
  { type: "Circle", label: "Circle", icon: CircleIcon },
];

const { lastDrawType } = storeToRefs(useMainToolbarStore());

const active = computed(() => props.currentDrawType !== null);
// While armed the pill mirrors the armed shape, even if something other than this
// button armed it.
const shownTool = computed(
  () =>
    DRAW_TOOLS.find(
      (tool) => tool.type === (props.currentDrawType ?? lastDrawType.value),
    ) ?? DRAW_TOOLS[0]!,
);

function armShown() {
  emit("select", shownTool.value.type);
}

function pickShape(drawType: DrawType) {
  lastDrawType.value = drawType;
  emit("select", drawType);
}
</script>

<template>
  <div class="ring-border flex items-center rounded-md ring-1 ring-inset">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      :title="shownTool.label"
      :class="[
        'rounded-r-none',
        active ? 'bg-army2 hover:bg-army2/90!' : 'hover:bg-army2/50!',
      ]"
      @click="armShown()"
    >
      <component :is="shownTool.icon" class="size-5" />
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Choose a shape to draw"
          :class="[
            'border-border w-5 rounded-l-none border-l',
            active ? 'bg-army2 hover:bg-army2/90!' : 'hover:bg-army2/50!',
          ]"
        >
          <ChevronDown class="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          v-for="tool in DRAW_TOOLS"
          :key="tool.type"
          @select="pickShape(tool.type)"
        >
          <component :is="tool.icon" class="size-5" />
          {{ tool.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
