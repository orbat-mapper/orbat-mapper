<template>
  <div class="flex flex-col h-full">
    <header class="flex-shrink-0">
      <div class="border-b border-gray-300" :class="extraClass">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="(tab, index) in tabsInfo"
            :key="index"
            @click="selectTab(index)"
            :class="[
              index === selectedIndex
                ? 'border-army text-army'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
            :aria-current="index === selectedIndex ? 'page' : undefined"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </header>
    <div class="flex-auto overflow-y-auto">
      <slot class="" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  VNode,
  reactive,
  provide,
  onBeforeMount,
  toRefs,
  watch,
  ref,
} from "vue";

interface TabProps {
  label: string;
}

export default defineComponent({
  name: "TabView",
  props: {
    currentTab: Number,
    extraClass: String,
    tabClass: String,
  },
  emits: ["update:current-tab"],
  setup(props, { emit, slots }) {
    const state = reactive({
      selectedIndex: 0,
      count: 0,
      tabClass: props.tabClass,
    });

    const tabs = ref([] as VNode[]);

    provide("TabsProvider", state);

    const selectTab = (i: number) => {
      state.selectedIndex = i;
      emit("update:current-tab", state.selectedIndex);
    };

    onBeforeMount(() => {
      if (slots.default) {
        tabs.value = slots
          .default()
          .filter((child: any) => child.type.name === "TabItem");
      }
    });

    onMounted(() => {
      selectTab(props.currentTab ?? 0);
    });

    watch(
      () => props.currentTab,
      (v) => {
        state.selectedIndex = v ?? 0;
      }
    );

    const tabsInfo = computed(() => {
      return tabs.value.map((t) => ({ label: t.props?.label }));
    });

    // watch(
    //   () => state.count,
    //   () => {
    //     if (slots.default) {
    //       state.tabs = slots
    //         .default()
    //         //@ts-ignore
    //         .filter((child) => child.type.name === "TabItem");
    //     }
    //   }
    // );

    return { ...toRefs(state), selectTab, tabsInfo };
  },
});
</script>
