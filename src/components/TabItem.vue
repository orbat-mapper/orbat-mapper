<template>
  <div v-show="isActive" class="mt-6" :class="tabClass">
    <slot></slot>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  inject,
  onBeforeMount,
  watch,
  onBeforeUnmount,
} from "vue";

export default defineComponent({
  name: "TabItem",
  props: {
    label: String,
  },
  setup() {
    const index = ref(0);
    const isActive = ref(false);

    const tabs = inject("TabsProvider");

    watch(
      () => tabs.selectedIndex,
      () => {
        isActive.value = index.value === tabs.selectedIndex;
      }
    );

    onBeforeMount(() => {
      index.value = tabs.count;
      tabs.count++;
      isActive.value = index.value === tabs.selectedIndex;
    });

    onBeforeUnmount(() => {
      tabs.count--;
    });
    return { index, isActive, tabClass: tabs.tabClass };
  },
});
</script>
