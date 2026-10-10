<script setup lang="ts">
import ItemMedia from "@/modules/scenarioeditor/ItemMedia.vue";
import type { Media } from "@/types/scenarioModels";

defineProps<{
  media?: Media | null;
  leadingAlign?: "start" | "center";
  density?: "normal" | "compact";
}>();
</script>

<template>
  <header class="mb-3 flex flex-col gap-2">
    <slot v-if="$slots.media" name="media" />
    <ItemMedia v-else-if="media" :media="media" />
    <!-- Grid so subtitle and meta can extend under the trailing slot and share its right edge -->
    <div
      class="grid min-w-0 items-start gap-x-2"
      :style="{
        gridTemplateColumns: [
          $slots.leading && 'auto',
          'minmax(0, 1fr)',
          $slots.trailing && 'auto',
        ]
          .filter(Boolean)
          .join(' '),
      }"
    >
      <div
        v-if="$slots.leading"
        :class="[
          'row-span-3 flex items-center',
          leadingAlign === 'center' ? 'self-center' : 'mt-0.5',
        ]"
      >
        <slot name="leading" />
      </div>
      <div :class="['min-w-0', density === 'compact' ? '-mt-1.5' : '']">
        <slot name="title" />
      </div>
      <div v-if="$slots.trailing" class="flex items-center justify-end gap-1">
        <slot name="trailing" />
      </div>
      <div
        v-if="$slots.subtitle"
        :class="[
          'text-muted-foreground min-w-0 text-xs',
          $slots.leading ? 'col-[2/-1]' : 'col-span-full',
          density === 'compact' ? '-mt-4 leading-5' : 'leading-5',
        ]"
      >
        <slot name="subtitle" />
      </div>
      <div
        v-if="$slots.meta"
        :class="[
          'text-muted-foreground min-w-0 text-sm leading-6',
          $slots.leading ? 'col-[2/-1]' : 'col-span-full',
        ]"
      >
        <slot name="meta" />
      </div>
    </div>
    <div v-if="$slots.summary" class="min-w-0">
      <slot name="summary" />
    </div>
    <nav v-if="$slots.actions" class="flex min-w-0 items-center gap-2">
      <slot name="actions" />
    </nav>
  </header>
</template>
