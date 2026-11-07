<script setup lang="ts">
import { computed, useId } from "vue";
import {
  IconFormatBold as BoldIcon,
  IconFormatItalic as ItalicIcon,
  IconRestore as ResetIcon,
} from "@iconify-prerendered/vue-mdi";
import PopoverColorPicker from "@/components/PopoverColorPicker.vue";
import { Button } from "@/components/ui/button";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { Toggle } from "@/components/ui/toggle";
import { DEFAULT_OPTIONS, FONT_KEYS, type FontKey, type FontOptions } from "./orbatchart";

// Props are named after the chart's font options. `style` would clash with the
// attribute Vue reserves for inline styles.
interface Props extends Partial<FontOptions> {
  label: string;
  /** Options inherited rather than set at this scope are drawn dimmed. */
  inherited?: Partial<Record<FontKey, boolean>>;
  /** Label of the reset button, shown while any option is set at this scope. */
  resetLabel?: string;
}
const props = withDefaults(defineProps<Props>(), { inherited: () => ({}) });

const emit = defineEmits<{
  update: [key: FontKey, value: FontOptions[FontKey]];
  reset: [];
}>();

function onSize(value: number | undefined) {
  if (value != null && !Number.isNaN(value)) emit("update", "fontSize", value);
}

const sizeId = useId();

const size = computed(() => props.fontSize ?? DEFAULT_OPTIONS.fontSize);
const color = computed(() => props.fontColor ?? DEFAULT_OPTIONS.fontColor);

// A toggle only sets bold or normal; "bolder" and numeric weights from 600 show as bold.
const isBold = computed(() => {
  const w = props.fontWeight ?? DEFAULT_OPTIONS.fontWeight;
  return w === "bold" || w === "bolder" || (typeof w === "number" && w >= 600);
});
const isItalic = computed(
  () => (props.fontStyle ?? DEFAULT_OPTIONS.fontStyle) !== "normal",
);

// The shared toggle's accent fill is barely visible on light panels
const PRESSED =
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90";

const canReset = computed(
  () => !!props.resetLabel && FONT_KEYS.some((key) => !props.inherited[key]),
);

const dim = (key: FontKey) => (props.inherited[key] ? "opacity-60" : "");
const title = (name: string, key: FontKey) =>
  props.inherited[key] ? `${name} (inherited)` : name;
</script>

<template>
  <div role="group" :aria-label="label" class="space-y-1.5">
    <label :for="sizeId" class="text-sm font-medium">{{ label }}</label>
    <div class="flex items-center gap-1">
      <NumberField
        :model-value="size"
        @update:model-value="onSize"
        :min="1"
        :format-options="{ maximumFractionDigits: 1 }"
        :class="['w-24 shrink-0', dim('fontSize')]"
        :title="title('Font size', 'fontSize')"
      >
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput :id="sizeId" class="h-8" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
      <Toggle
        size="sm"
        :model-value="isBold"
        @update:model-value="emit('update', 'fontWeight', $event ? 'bold' : 'normal')"
        aria-label="Bold"
        :title="title('Bold', 'fontWeight')"
        :class="[PRESSED, dim('fontWeight')]"
      >
        <BoldIcon />
      </Toggle>
      <Toggle
        size="sm"
        :model-value="isItalic"
        @update:model-value="emit('update', 'fontStyle', $event ? 'italic' : 'normal')"
        aria-label="Italic"
        :title="title('Italic', 'fontStyle')"
        :class="[PRESSED, dim('fontStyle')]"
      >
        <ItalicIcon />
      </Toggle>
      <PopoverColorPicker
        :model-value="color"
        @update:model-value="emit('update', 'fontColor', $event)"
      >
        <template #trigger>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Font color"
            :title="title('Font color', 'fontColor')"
            :class="['flex-col gap-0 px-1.5', dim('fontColor')]"
          >
            <span aria-hidden="true" class="text-sm leading-none font-semibold">A</span>
            <span
              aria-hidden="true"
              class="mt-0.5 h-1 w-4 rounded-sm border"
              :style="{ backgroundColor: color }"
            />
          </Button>
        </template>
      </PopoverColorPicker>
      <Button
        v-if="canReset"
        type="button"
        variant="ghost"
        size="sm"
        class="ml-auto"
        :aria-label="resetLabel"
        :title="resetLabel"
        @click="emit('reset')"
      >
        <ResetIcon />
      </Button>
    </div>
  </div>
</template>
