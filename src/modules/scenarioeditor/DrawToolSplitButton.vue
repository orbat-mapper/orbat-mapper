<script setup lang="ts">
import { computed, type Component } from "vue";
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
import SplitToolbarButton from "@/components/SplitToolbarButton.vue";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** One pill, two hit areas: the main half re-arms the last-used plain draw tool (its
 *  icon previews which), the chevron half opens the shape menu. Arming stays with the
 *  toolbar, which also records the last-used shape; this component only emits. That
 *  shape lives in the main toolbar store because this toolbar is `v-if`'d — a local ref
 *  would forget it every time the toolbar closes. */
const props = defineProps<{ currentDrawType: DrawType | null }>();
defineEmits<{ select: [drawType: DrawType] }>();

// Total over `DrawType`, so the shown shape is a lookup with no unreachable fallback.
const DRAW_TOOLS: Record<DrawType, { label: string; icon: Component }> = {
  Point: { label: "Point", icon: PointIcon },
  LineString: { label: "Line", icon: LineStringIcon },
  Polygon: { label: "Polygon", icon: PolygonIcon },
  Rectangle: { label: "Rectangle", icon: RectangleIcon },
  Circle: { label: "Circle", icon: CircleIcon },
};
const DRAW_TYPES = Object.keys(DRAW_TOOLS) as DrawType[];

const { lastDrawType } = storeToRefs(useMainToolbarStore());

const active = computed(() => props.currentDrawType !== null);
// While armed the pill mirrors the armed shape, even if something other than this
// button armed it.
const shownType = computed(() => props.currentDrawType ?? lastDrawType.value);
</script>

<template>
  <SplitToolbarButton
    :title="DRAW_TOOLS[shownType].label"
    menu-title="Choose a shape to draw"
    :active="active"
    @click="$emit('select', shownType)"
  >
    <template #icon>
      <component :is="DRAW_TOOLS[shownType].icon" class="size-5" />
    </template>
    <template #menu>
      <DropdownMenuItem
        v-for="drawType in DRAW_TYPES"
        :key="drawType"
        @select="$emit('select', drawType)"
      >
        <component :is="DRAW_TOOLS[drawType].icon" class="size-5" />
        {{ DRAW_TOOLS[drawType].label }}
      </DropdownMenuItem>
    </template>
  </SplitToolbarButton>
</template>
