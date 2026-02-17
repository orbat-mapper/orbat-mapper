<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { renderMarkdown } from "../composables/formatting";
import { GlobalEvents } from "vue-global-events";
import { Textarea } from "@/components/ui/textarea/index.js";
import { Label } from "@/components/ui/label/index.js";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const props = defineProps<{
  id?: string;
  label?: string;
  description?: string;
}>();

defineOptions({ inheritAttrs: false });

const localValue = defineModel<string>({ default: "" });
const computedId = props.id ?? useId();

const currentTab = ref(0);
const isPreview = computed(() => currentTab.value === 1);

const renderedMarkdown = computed(() => {
  if (!isPreview.value) return "";
  return renderMarkdown(localValue.value || "");
});

const togglePreview = () => {
  if (currentTab.value === 0) currentTab.value = 1;
  else currentTab.value = 0;
};
</script>
<template>
  <div>
    <div class="flex items-end justify-between">
      <Label :for="computedId">
        <slot name="label">{{ label }}</slot>
      </Label>
      <ToggleGroup v-model="currentTab" type="single" variant="outline" size="sm">
        <ToggleGroupItem :value="0" class="px-4">Write</ToggleGroupItem>
        <ToggleGroupItem :value="1" class="px-4">Preview</ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div class="mt-1.5">
      <Textarea
        v-show="!isPreview"
        v-model="localValue"
        :id="computedId"
        v-bind="$attrs"
      />
      <div
        v-if="isPreview"
        class="dark:prose-invert prose prose-sm mt-4"
        v-html="renderedMarkdown"
      ></div>
    </div>
    <p
      v-if="!isPreview && (description || $slots.description)"
      class="text-muted-foreground mt-2 text-sm"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    <GlobalEvents @keyup.alt.p="togglePreview"></GlobalEvents>
  </div>
</template>
