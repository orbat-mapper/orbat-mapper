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
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { TreeItem, TreeRoot } from "radix-vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

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
    class="select-none list-none rounded-lg text-sm"
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
      class="focus:ring-grass8 data-[selected]:bg-grass4 group my-0.5 flex items-center rounded px-2 py-1 outline-none even:bg-gray-100 hover:bg-gray-100 focus:ring-2"
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
            :options="{ monoColor: 'black' }"
            class="w-7"
          />
          <span>{{ item.value.label }}</span>
          <span class="muted-badge">{{ stats[item.value.key] }}</span>
        </div>
        <button
          v-if="selectedStats[item._id]"
          type="button"
          @click.stop="emit('clear', item._id)"
          class="badge"
          title="Clear selected"
        >
          {{ selectedStats[item._id] }}
        </button>
        <button
          v-else-if="!excludedKeys.has(item._id)"
          type="button"
          @click.stop="emit('exclude', item._id)"
          title="Exclude"
        >
          <IconMinusCircleOutline
            class="h-5 w-5 text-gray-200 group-hover:text-muted-foreground group-focus:text-muted-foreground"
          />
        </button>
        <button
          v-else
          type="button"
          @click.stop="emit('clearExclude', item._id)"
          title="Clear exclude"
        >
          <IconClose class="h-5 w-5 text-foreground" />
        </button>
      </div>
    </TreeItem>
  </TreeRoot>
</template>
