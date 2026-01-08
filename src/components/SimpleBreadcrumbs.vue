<script setup lang="ts">
import { ChevronRightIcon, HomeIcon } from "@heroicons/vue/20/solid";
import { type BreadcrumbItem } from "@/components/types";

interface Props {
  items: BreadcrumbItem[];
}

const props = defineProps<Props>();
</script>

<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-2">
      <li>
        <div>
          <p class="text-muted-foreground">
            <HomeIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span class="sr-only">Root</span>
          </p>
        </div>
      </li>
      <li v-for="item in items" :key="item.name">
        <div class="flex items-center">
          <ChevronRightIcon
            class="text-muted-foreground h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <span
            v-if="item.static"
            type="button"
            class="text-muted-foreground ml-2 text-sm font-medium"
          >
            {{ item.name }}
          </span>
          <button
            v-else
            type="button"
            class="text-muted-foreground hover:text-muted-foreground ml-2 text-sm font-medium"
          >
            {{ item.name }}
          </button>
        </div>
      </li>
    </ol>
  </nav>
</template>
