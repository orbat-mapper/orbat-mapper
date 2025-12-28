<script setup lang="ts">
import DotsMenu from "@/components/DotsMenu.vue";
import type { MenuItemData } from "@/components/types";
import type { ScenarioEventAction } from "@/types/constants";
import { computed } from "vue";

const props = withDefaults(defineProps<{ hideEdit?: boolean }>(), {
  hideEdit: false,
});

const emit = defineEmits<{
  (e: "action", value: ScenarioEventAction): void;
}>();

const items = computed<MenuItemData<ScenarioEventAction | (() => void)>[]>(() => {
  const base: MenuItemData<ScenarioEventAction | (() => void)>[] = [
    { label: "Modify time", action: "changeTime" as ScenarioEventAction },
  ];
  if (!props.hideEdit) {
    base.push({ label: "Edit", action: "editMeta" as ScenarioEventAction });
    base.push({ label: "Edit media", action: "editMedia" as ScenarioEventAction });
  }
  base.push({ label: "Delete", action: "delete" as ScenarioEventAction });
  return base;
});

const onAction = (value: ScenarioEventAction | (() => void)) => {
  if (typeof value === "function") value();
  else emit("action", value as ScenarioEventAction);
};
</script>

<template>
  <DotsMenu :items="items" @action="onAction" />
</template>
