<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/vue";
import { computed, ref } from "vue";
import { TabItem } from "@/components/types";
import { useElementVisibility, useScroll } from "@vueuse/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

interface Props {
  tabList: TabItem[];
  modelValue?: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
const $selectedTab = ref(0);
const scrollRef = ref(null);
const { x } = useScroll(scrollRef, { behavior: "smooth" });
const startTarget = ref(null);
const startMarkerIsVisible = useElementVisibility(startTarget);
const endTarget = ref(null);
const endMarkerIsVisible = useElementVisibility(endTarget);

const tabListItems = computed(() => {
  return props.tabList.map((i) => {
    if (typeof i === "string") return { label: i };
    return { label: i.label, title: i.title };
  });
});

const tabIndex = computed({
  get() {
    return props.modelValue === undefined ? $selectedTab.value : props.modelValue;
  },
  set(v) {
    if (props.modelValue === undefined) {
      $selectedTab.value = v;
    } else {
      emit("update:modelValue", v);
    }
  },
});

function changeTab(index: number) {
  tabIndex.value = index;
}
</script>

<template>
  <TabGroup :selected-index="tabIndex" @change="changeTab" class="-mx-4 mt-2" as="div">
    <div class="relative h-10 overflow-hidden border-b-2">
      <button
        class="absolute inset-y-0 left-0 bg-white hover:text-gray-800 disabled:pointer-events-none disabled:opacity-0"
        :disabled="startMarkerIsVisible"
        aria-label="Scroll left"
        @click="x -= 100"
      >
        <ChevronLeftIcon class="mx-2 h-6 w-6 text-gray-600" />
      </button>
      <button
        class="absolute inset-y-0 right-0 bg-white disabled:pointer-events-none disabled:opacity-0"
        :disabled="endMarkerIsVisible"
        aria-label="Scroll right"
        @click="x += 100"
      >
        <ChevronRightIcon class="mx-2 h-6 w-6 text-gray-600 hover:text-gray-800" />
      </button>

      <div class="h-20 overflow-x-auto" ref="scrollRef">
        <TabList class="mb-2 flex space-x-3 border-b-2 px-4" v-slot="{ selectedIndex }">
          <div ref="startTarget" class="-mr-3 flex-none" />
          <Tab
            v-for="({ label, title }, i) in tabListItems"
            :title="title"
            :class="[
              selectedIndex === i ? 'border-army text-army' : 'border-transparent',
              'flex-none border-b-2 px-1 py-2 text-sm font-medium',
            ]"
            >{{ label }}
          </Tab>
          <div ref="endTarget" class="w-4 flex-none" />
        </TabList>
      </div>
    </div>

    <TabPanels class="w-full overflow-auto px-4">
      <slot />
    </TabPanels>
  </TabGroup>
</template>
