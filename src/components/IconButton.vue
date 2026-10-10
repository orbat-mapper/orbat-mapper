<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Button } from "@/components/ui/button";
import { omit } from "es-toolkit";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    // Shown on hover and keyboard focus, and used as the accessible name
    tooltip?: string;
    size?: "icon" | "icon-sm";
  }>(),
  { size: "icon" },
);

const attrs = useAttrs();
// A disabled button gets no hover or focus, so its tooltip could never explain why.
// Use aria-disabled instead and drop the click handler.
const tooltipAttrs = computed(() => {
  if (attrs.disabled === undefined || attrs.disabled === false) return attrs;
  return { ...omit(attrs, ["disabled", "onClick"]), "aria-disabled": "true" };
});
</script>

<template>
  <!-- Without a tooltip, stay a plain button so no tooltip provider is needed -->
  <Button
    v-if="!props.tooltip"
    v-bind="$attrs"
    variant="ghost"
    :size="props.size"
    class="text-foreground/80"
  >
    <slot />
  </Button>
  <Tooltip v-else>
    <TooltipTrigger as-child>
      <Button
        v-bind="tooltipAttrs"
        :aria-label="props.tooltip"
        variant="ghost"
        :size="props.size"
        class="text-foreground/80 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent"
      >
        <slot />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{{ props.tooltip }}</TooltipContent>
  </Tooltip>
</template>
