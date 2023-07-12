<template>
  <div v-show="isActive" class="mt-6" :class="tabs.tabClass">
    <slot :is-active="isActive"></slot>
  </div>
</template>
<script>
export default {
  name: "TabItem",
};
</script>

<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { tabsProviderKey } from "@/components/types";
import { injectStrict } from "@/utils/index";

const props = defineProps({
  label: String,
});

const index = ref(0);
const isActive = ref(false);

const tabs = injectStrict(tabsProviderKey);

watch(
  () => tabs.selectedIndex,
  () => {
    isActive.value = index.value === tabs.selectedIndex;
  },
);

index.value = tabs.count;
tabs.count++;
isActive.value = index.value === tabs.selectedIndex;

onBeforeUnmount(() => {
  tabs.count--;
});
</script>
