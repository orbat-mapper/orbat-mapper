<script lang="ts">
export type NestedUnitStatItem = {
  key: string;
  label: string;
  sidc: string;
  children?: NestedUnitStatItem[];
};
</script>
<script setup lang="ts">
import { IconClose, IconMinusCircleOutline } from "@iconify-prerendered/vue-mdi";
import MilitarySymbol from "@/components/NewMilitarySymbol.vue";
import { TreeItem, TreeRoot } from "reka-ui";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  tree: NestedUnitStatItem[];
  stats: Record<string, number>;
  selectedStats: Record<string, number>;
  excludedKeys: Set<string>;
}>();
const emit = defineEmits(["select", "clearByKey", "clear", "exclude", "clearExclude"]);
const expandedKeys = defineModel<string[]>("expandedKeys");
</script>
<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    class="list-none rounded-lg text-sm select-none"
    :items="tree"
    :get-key="(item) => item.key"
    v-model:expanded="expandedKeys"
  >
    <TreeItem
      v-for="item in flattenItems"
      v-slot="{ isExpanded, handleToggle }"
      :key="item._id"
      :style="{ 'padding-left': `${item.level - 1}em` }"
      v-bind="item.bind"
      @select="emit('select', $event)"
      @toggle="
        (event) => {
          if (event.detail.originalEvent.type === 'click') event.preventDefault();
        }
      "
      class="focus:ring-grass8 data-selected:bg-grass4 group even:bg-muted/50 hover:bg-muted my-0.5 flex items-center rounded px-2 py-1 outline-hidden focus:ring-2"
      :class="{ 'opacity-50': excludedKeys.has(item._id) }"
    >
      <template v-if="item.hasChildren">
        <button type="button" tabindex="-1" @click.stop="handleToggle" class="">
          <ChevronRightIcon
            class="h-6 w-6 text-gray-500 transition hover:font-medium hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
            :class="{
              'rotate-90': isExpanded,
            }"
          />
        </button>
      </template>
      <span v-else class="h-6 w-6" />
      <div class="flex w-full items-center justify-between pl-0">
        <div class="flex cursor-pointer items-center gap-1">
          <MilitarySymbol
            :sidc="item.value.sidc"
            :size="16"
            :options="{ monoColor: 'currentColor' }"
            class="text-foreground/90 w-7"
          />
          <span>{{ item.value.label }}</span>
          <Badge variant="outline" class="ml-1">{{ stats[item.value.key] }}</Badge>
        </div>
        <Badge v-if="selectedStats[item._id]" as-child>
          <button
            type="button"
            @click.stop="emit('clear', item._id)"
            title="Clear selected"
          >
            {{ selectedStats[item._id] }}
          </button>
        </Badge>
        <button
          v-else-if="!excludedKeys.has(item._id)"
          type="button"
          @click.stop="emit('exclude', item._id)"
          title="Exclude"
        >
          <IconMinusCircleOutline
            class="group-hover:text-muted-foreground group-focus:text-muted-foreground h-5 w-5 text-gray-200"
          />
        </button>
        <button
          v-else
          type="button"
          @click.stop="emit('clearExclude', item._id)"
          title="Clear exclude"
        >
          <IconClose class="text-foreground h-5 w-5" />
        </button>
      </div>
    </TreeItem>
  </TreeRoot>
</template>
