<script setup lang="ts">
import {
  TabsList,
  TabsRoot,
  type TabsRootEmits,
  type TabsRootProps,
  TabsTrigger,
  useForwardPropsEmits,
} from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/lib/utils.ts";
import type { MyTabItem } from "@/components/types.ts";

const props = defineProps<
  TabsRootProps & { class?: HTMLAttributes["class"] } & { items: MyTabItem[] }
>();
const emits = defineEmits<TabsRootEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);

const tabItems = computed(() => {
  return props.items.map((tab, index) => {
    if (typeof tab === "string") {
      return {
        label: tab,
        value: index.toString(),
        disabled: false,
      };
    } else
      return {
        label: tab.label,
        value: tab.value ?? index.toString(),
        disabled: tab.disabled ?? false,
      };
  });
});
</script>

<template>
  <TabsRoot
    v-slot="slotProps"
    data-slot="tabs"
    v-bind="forwarded"
    :class="cn('flex h-full flex-col', props.class)"
  >
    <div class="border-b-primary/20 flex flex-0 items-center justify-between border-b">
      <TabsList class="no-scrollbar flex gap-0 overflow-x-auto">
        <TabsTrigger
          v-for="{ value, label, disabled } in tabItems"
          :key="value"
          :value
          class="data-[state=active]:text-primary hover:text-primary/90 text-muted-foreground data-[state=active]:border-b-primary border-b-2 border-transparent px-3 py-4 text-sm font-medium whitespace-nowrap focus-visible:outline-1 focus-visible:outline-dashed disabled:pointer-events-none disabled:opacity-50 sm:py-3.5"
          :disabled
        >
          {{ label }}
        </TabsTrigger>
      </TabsList>
      <slot name="right" />
    </div>
    <div class="flex-auto overflow-y-auto">
      <slot v-bind="slotProps" />
    </div>
  </TabsRoot>
</template>
