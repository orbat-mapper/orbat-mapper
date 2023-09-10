<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/vue";
import { computed, ref } from "vue";
import { TabItem } from "@/components/types";

interface Props {
  tabList: TabItem[];
  modelValue?: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
const $selectedTab = ref(0);

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
    <TabList class="mb-2 flex space-x-3 border-b-2 px-4" v-slot="{ selectedIndex }">
      <Tab
        v-for="({ label, title }, i) in tabListItems"
        :title="title"
        :class="[
          selectedIndex === i ? 'border-army  text-army' : 'border-transparent',
          'border-b-2 px-1 py-2 text-sm font-medium ',
        ]"
        >{{ label }}</Tab
      >
    </TabList>
    <TabPanels class="w-full overflow-auto px-4">
      <slot />
    </TabPanels>
  </TabGroup>
</template>
