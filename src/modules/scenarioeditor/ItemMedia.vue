<script setup lang="ts">
import { type Media } from "@/types/scenarioModels";

const props = defineProps<{ media: Media }>();
</script>

<template>
  <div v-if="media" class="group @-lg:aspect-16/5 relative -mx-4 -mt-4 aspect-16/9">
    <img
      draggable="false"
      class="h-full w-full object-cover"
      :src="media.url"
      :alt="media.caption"
    />
    <p
      class="bg-background/75 text-foreground absolute right-0 bottom-0 left-0 hidden px-2 py-1 text-xs group-hover:block"
    >
      <a
        v-if="media.creditsUrl"
        :href="media.creditsUrl"
        target="_blank"
        class="hover:underline"
      >
        {{ media.credits }} </a
      ><span v-else>{{ media.credits }}</span>
    </p>
  </div>
</template>
