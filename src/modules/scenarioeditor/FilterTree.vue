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
  addableStats: Record<string, number>;
  excludedKeys: Set<string>;
}>();
const emit = defineEmits(["select", "exclude", "clearExclude"]);
const expandedKeys = defineModel<string[]>("expandedKeys");

function selectionState(key: string): "none" | "some" | "all" {
  const selected = props.selectedStats[key] || 0;
  if (!selected) return "none";
  return selected >= (props.stats[key] || 0) ? "all" : "some";
}

function units(count: number) {
  return `${count} ${count === 1 ? "unit" : "units"}`;
}

// Says what clicking the row will do.
function rowTitle(item: NestedUnitStatItem) {
  const { key, label } = item;
  if (!props.stats[key]) return `${label}: no units`;
  const selected = props.selectedStats[key] || 0;
  if (selected) return `${label}: click to remove ${units(selected)} from the selection`;
  if (props.excludedKeys.has(key))
    return `${label}: excluded, so clicking selects nothing`;
  const addable = props.addableStats[key] || 0;
  if (!addable) return `${label}: every unit is in an excluded category`;
  const skipped = (props.stats[key] || 0) - addable;
  const note = skipped ? ` (${skipped} excluded)` : "";
  return `${label}: click to add ${units(addable)} to the selection${note}`;
}

const ariaChecked = { none: "false", some: "mixed", all: "true" } as const;
const badgeProps = {
  none: { variant: "outline" },
  some: { variant: "secondary", class: "border-border" },
  all: { variant: "default" },
} as const;
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
      :aria-checked="ariaChecked[selectionState(item._id)]"
      :title="rowTitle(item.value)"
      @select="emit('select', $event)"
      @toggle="
        (event) => {
          if (event.detail.originalEvent.type === 'click') event.preventDefault();
        }
      "
      class="focus:ring-accent-foreground/50 data-selected:bg-accent/50 group even:bg-muted/60 dark:even:bg-muted/50 hover:bg-muted my-0.5 flex items-center rounded px-2 py-1 outline-hidden focus:ring-2"
      :class="{ 'opacity-50': excludedKeys.has(item._id) || !stats[item._id] }"
    >
      <template v-if="item.hasChildren">
        <button type="button" tabindex="-1" @click.stop="handleToggle" class="">
          <ChevronRightIcon
            class="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 transition hover:font-medium"
            :class="{
              'rotate-90': isExpanded,
            }"
          />
        </button>
      </template>
      <span v-else class="h-6 w-6" />
      <div class="flex w-full min-w-0 items-center gap-2">
        <div class="flex min-w-0 cursor-pointer items-center gap-1">
          <MilitarySymbol
            :sidc="item.value.sidc"
            :size="16"
            :options="{ monoColor: 'currentColor' }"
            class="text-foreground/90 w-7 shrink-0"
          />
          <span>{{ item.value.label }}</span>
        </div>
        <Badge
          v-bind="badgeProps[selectionState(item._id)]"
          class="ml-auto shrink-0 tabular-nums"
          ><template v-if="selectedStats[item._id]"
            >{{ selectedStats[item._id] }}/</template
          >{{ stats[item._id] }}</Badge
        >
        <!-- Fixed-width slot keeps the badges aligned when the button is absent. -->
        <span class="flex size-5 shrink-0 items-center justify-center">
          <button
            v-if="excludedKeys.has(item._id)"
            type="button"
            @click.stop="emit('clearExclude', item._id)"
            title="Clear exclude"
          >
            <IconClose class="text-foreground size-5" />
          </button>
          <button
            v-else-if="stats[item._id] && !selectedStats[item._id]"
            type="button"
            @click.stop="emit('exclude', item._id)"
            title="Exclude"
          >
            <IconMinusCircleOutline class="text-muted-foreground size-5" />
          </button>
        </span>
      </div>
    </TreeItem>
  </TreeRoot>
</template>
