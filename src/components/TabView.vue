<template>
  <div class="flex h-full flex-col">
    <header class="flex-shrink-0 overflow-auto">
      <div class="border-b border-gray-300 dark:border-gray-400" :class="extraClass">
        <div class="flex justify-between">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="(tab, index) in tabsInfo"
              :key="index"
              @click="selectTab(index)"
              :class="[
                index === state.selectedIndex
                  ? 'border-army text-army dark:border-amber-600 dark:text-amber-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              ]"
              :aria-current="index === state.selectedIndex ? 'page' : undefined"
            >
              {{ tab.label }}
            </button>
          </nav>
          <div class="">
            <slot name="extra" />
          </div>
        </div>
      </div>
    </header>
    <div class="flex-auto overflow-y-auto">
      <slot class="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeMount,
  onMounted,
  provide,
  reactive,
  ref,
  useSlots,
  VNode,
  watch,
} from "vue";

interface Props {
  currentTab?: number;
  extraClass?: string;
  tabClass?: string;
}

const props = defineProps<Props>();
const slots = useSlots();
const emit = defineEmits(["update:current-tab"]);

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
    tabs.value = slots.default().filter((child: any) => child.type.name === "TabItem");
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
</script>
