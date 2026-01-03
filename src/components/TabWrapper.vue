<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import type { TabItem } from "@/components/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useElementVisibility, useScroll, useVModel } from "@vueuse/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

interface Props {
  tabList: TabItem[];
  modelValue?: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const activeTab = useVModel(props, "modelValue", emit, {
  passive: true,
  defaultValue: 0,
});

const tabValue = computed({
  get: () => (activeTab.value ?? 0).toString(),
  set: (v) => {
    activeTab.value = parseInt(v, 10);
  },
});

const tabListItems = computed(() => {
  return props.tabList.map((i) => {
    if (typeof i === "string") return { label: i };
    return { label: i.label, title: i.title };
  });
});

const scrollRef = useTemplateRef("scrollRef");
const { x } = useScroll(scrollRef, { behavior: "smooth" });
const startTarget = useTemplateRef("startTarget");
const startMarkerIsVisible = useElementVisibility(startTarget);
const endTarget = useTemplateRef("endTarget");
const endMarkerIsVisible = useElementVisibility(endTarget);
</script>

<template>
  <Tabs v-model="tabValue" class="mt-2 text-sm">
    <div class="relative -ml-4 h-10 overflow-hidden border-b-2">
      <button
        class="bg-muted hover:text-foreground absolute inset-y-0 left-0 z-10 disabled:pointer-events-none disabled:opacity-0"
        :disabled="startMarkerIsVisible"
        aria-label="Scroll left"
        @click="x -= 100"
      >
        <ChevronLeftIcon class="text-muted-foreground mx-2 h-6 w-6" />
      </button>
      <button
        class="bg-muted hover:text-foreground absolute inset-y-0 right-0 z-10 disabled:pointer-events-none disabled:opacity-0"
        :disabled="endMarkerIsVisible"
        aria-label="Scroll right"
        @click="x += 100"
      >
        <ChevronRightIcon class="text-muted-foreground mx-2 h-6 w-6" />
      </button>

      <div class="h-20 overflow-x-auto" ref="scrollRef">
        <TabsList
          class="relative my-0.5 flex h-fit w-fit justify-start space-x-2 bg-transparent p-0 px-2"
        >
          <div ref="startTarget" class="absolute top-0 bottom-0 left-0 w-px" />
          <TabsTrigger
            v-for="({ label, title }, i) in tabListItems"
            :value="i.toString()"
            :key="i"
            class="data-[state=active]:border-b-accent-foreground data-[state=active]:text-accent-foreground text-muted-foreground hover:text-foreground relative h-9 flex-none rounded-none border-b-2 border-transparent bg-transparent px-1 pt-2 pb-3 font-medium shadow-none transition-none focus-visible:ring-0 data-[state=active]:shadow-none"
          >
            {{ label }}
          </TabsTrigger>
          <div ref="endTarget" class="w-4 flex-none" />
        </TabsList>
      </div>
    </div>
    <div class="mt-4">
      <slot />
    </div>
  </Tabs>
</template>
