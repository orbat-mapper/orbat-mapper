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
    <div class="flex min-w-0 items-start justify-between gap-2">
      <div
        v-if="$slots.leading"
        :class="[
          'flex shrink-0 items-center',
          leadingAlign === 'center' ? 'self-center' : 'mt-0.5',
        ]"
      >
        <slot name="leading" />
      </div>
      <div :class="['min-w-0 flex-1', density === 'compact' ? '-mt-1.5 space-y-0' : '']">
        <div class="min-w-0">
          <slot name="title" />
        </div>
        <div
          v-if="$slots.subtitle"
          :class="[
            'text-muted-foreground text-xs',
            density === 'compact' ? '-mt-4 leading-5' : 'leading-5',
          ]"
        >
          <slot name="subtitle" />
        </div>
        <div v-if="$slots.meta" class="text-muted-foreground text-sm leading-6">
          <slot name="meta" />
        </div>
      </div>
      <div v-if="$slots.trailing" class="flex shrink-0 items-center justify-end gap-1">
        <slot name="trailing" />
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
