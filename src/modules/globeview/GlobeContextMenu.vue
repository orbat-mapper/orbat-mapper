<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { computed } from "vue";
import {
  GLOBE_VECTOR_BASEMAP_ID,
  getSupportedGlobeBasemaps,
} from "@/modules/globeview/globeBasemaps";

const baseLayersStore = useBaseLayersStore();
const baseMapId = defineModel<string>("baseMapId", {
  default: GLOBE_VECTOR_BASEMAP_ID,
});

const basemapOptions = computed(() => getSupportedGlobeBasemaps(baseLayersStore.layers));
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <div class="h-full w-full">
        <slot />
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>Map base layer</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuRadioGroup v-model="baseMapId">
            <ContextMenuRadioItem
              v-for="option in basemapOptions"
              :key="option.id"
              :value="option.id"
              @select.prevent
            >
              {{ option.title }}
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  </ContextMenu>
</template>
