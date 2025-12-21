<template>
  <div class="flex h-full flex-col">
    <header class="shrink-0">
      <div class="border-border bg-background border-b" :class="extraClass">
        <div class="flex justify-between">
          <nav class="-mb-px flex" :class="gap" aria-label="Tabs">
            <button
              v-for="(tab, index) in tabsInfo"
              :key="index"
              @click="selectTab(index)"
              :class="[
                index === state.selectedIndex
                  ? 'border-primary text-primary dark:border-primary dark:text-primary'
                  : 'text-muted-foreground hover:border-border hover:text-foreground border-transparent',
                'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
              ]"
              :aria-current="index === state.selectedIndex ? 'page' : undefined"
            >
              {{ tab.label }}
            </button>
          </nav>
          <div>
            <slot name="extra" />
          </div>
        </div>
      </div>
    </header>
    <div class="bg-background text-foreground flex-auto overflow-y-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, reactive, useSlots, watch } from "vue";
import { tabsProviderKey, type TabsState } from "@/components/types";

interface Props {
  currentTab?: number;
  extraClass?: string;
  tabClass?: string;
  gap?: string;
}

const props = withDefaults(defineProps<Props>(), { gap: "gap-x-8" });
const slots = useSlots();
const emit = defineEmits(["update:current-tab"]);

const state: TabsState = reactive({
  selectedIndex: 0,
  count: 0,
  tabClass: props.tabClass,
});

provide(tabsProviderKey, state);

const selectTab = (i: number) => {
  state.selectedIndex = i;
  emit("update:current-tab", state.selectedIndex);
};

onMounted(() => {
  selectTab(props.currentTab ?? 0);
});

watch(
  () => props.currentTab,
  (v) => {
    state.selectedIndex = v ?? 0;
  },
);

const tabsInfo = computed(() => {
  if (slots.default) {
    return (
      slots
        //@ts-ignore
        .default()
        .filter((child: any) => child.type.name === "TabItem")
        .map((t: any) => ({ label: t.props?.label }))
    );
  }
  return [];
});
</script>
