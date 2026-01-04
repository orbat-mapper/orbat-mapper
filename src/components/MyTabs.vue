<script setup lang="ts">
import {
  TabsList,
  TabsRoot,
  type TabsRootEmits,
  type TabsRootProps,
  TabsTrigger,
  useForwardPropsEmits,
} from "reka-ui";
import { computed, type HTMLAttributes, nextTick, useTemplateRef, watch } from "vue";
import { reactiveOmit, useElementVisibility, useScroll } from "@vueuse/core";
import { cn } from "@/lib/utils.ts";
import type { MyTabItem } from "@/components/types.ts";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

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

const scrollRef = useTemplateRef("scrollRef");
const { x } = useScroll(scrollRef, { behavior: "smooth" });
const startTarget = useTemplateRef("startTarget");
const startMarkerIsVisible = useElementVisibility(startTarget, { initialValue: true });
const endTarget = useTemplateRef("endTarget");
const endMarkerIsVisible = useElementVisibility(endTarget, { initialValue: true });

watch(
  () => props.modelValue,
  async () => {
    await nextTick();
    const activeTab = scrollRef.value?.querySelector(
      '[data-state="active"]',
    ) as HTMLElement;
    if (!activeTab || !scrollRef.value) return;

    const container = scrollRef.value;
    const containerWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;

    const leftBuffer = 40;
    const rightBuffer = 40;

    const tabLeft = activeTab.offsetLeft;
    const tabRight = tabLeft + activeTab.offsetWidth;

    if (tabLeft < scrollLeft + leftBuffer) {
      x.value = tabLeft - leftBuffer;
    } else if (tabRight > scrollLeft + containerWidth - rightBuffer) {
      x.value = tabRight - containerWidth + rightBuffer;
    }
  },
);
</script>

<template>
  <TabsRoot
    v-slot="slotProps"
    data-slot="tabs"
    v-bind="forwarded"
    :class="cn('flex h-full flex-col', props.class)"
  >
    <div class="border-b-primary/20 flex shrink-0 items-center justify-between border-b">
      <div class="relative flex min-w-0 flex-1 overflow-hidden">
        <button
          class="hover:text-foreground bg-muted/80 absolute inset-y-0 left-0 z-10 flex cursor-pointer items-center justify-center px-1 disabled:pointer-events-none disabled:opacity-0"
          :disabled="startMarkerIsVisible"
          aria-label="Scroll left"
          @click="x -= 120"
        >
          <ChevronLeft class="text-muted-foreground size-6" />
        </button>

        <div class="no-scrollbar flex-1 overflow-x-auto" ref="scrollRef">
          <TabsList class="relative flex w-max gap-0 px-2">
            <div ref="startTarget" class="absolute top-0 bottom-0 left-0 w-px" />
            <TabsTrigger
              v-for="{ value, label, disabled } in tabItems"
              :key="value"
              :value
              class="data-[state=active]:text-primary hover:text-primary/90 text-muted-foreground data-[state=active]:border-b-primary border-b-2 border-transparent px-3 py-4 text-sm font-medium whitespace-nowrap focus-visible:outline-1 focus-visible:outline-dashed disabled:pointer-events-none disabled:opacity-50 sm:py-3.5"
              :disabled
            >
              {{ label }}
            </TabsTrigger>
            <div ref="endTarget" class="w-4 flex-none" />
          </TabsList>
        </div>

        <button
          class="hover:text-foreground bg-muted/80 absolute inset-y-0 right-0 z-10 flex cursor-pointer items-center justify-center px-1 disabled:pointer-events-none disabled:opacity-0"
          :disabled="endMarkerIsVisible"
          aria-label="Scroll right"
          @click="x += 120"
        >
          <ChevronRight class="text-muted-foreground size-6" />
        </button>
      </div>

      <slot name="right" />
    </div>
    <div class="flex-auto overflow-y-auto">
      <slot v-bind="slotProps" />
    </div>
  </TabsRoot>
</template>
