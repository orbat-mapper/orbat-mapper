<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/vue";
import { computed, ref } from "vue";
interface Props {
  tabList: string[];
  modelValue?: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
const $selectedTab = ref(0);

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
    <TabList class="mb-2 flex space-x-4 border-b-2 px-4" v-slot="{ selectedIndex }">
      <Tab
        v-for="(tab, i) in tabList"
        :class="[
          selectedIndex === i ? 'border-army  text-army' : 'border-transparent',
          'border-b-2 px-1 py-2 ',
        ]"
        >{{ tab }}</Tab
      >
    </TabList>
    <TabPanels class="w-full overflow-auto px-4">
      <slot />
    </TabPanels>
  </TabGroup>
</template>
