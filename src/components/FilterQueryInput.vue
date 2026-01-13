<script lang="ts">
export default { inheritAttrs: false };
</script>

<script setup lang="ts">
import { computed } from "vue";
import {
  IconClose as CloseIcon,
  IconCrosshairsGps,
  IconCrosshairsOff,
  IconFilterVariant,
  IconFilterVariantPlus,
} from "@iconify-prerendered/vue-mdi";
import { Toggle } from "reka-ui";

interface Props {
  id?: string;
  label?: string;
  description?: string;
}

const props = defineProps<Props>();

const localValue = defineModel<string | number>();
const hasLocationFilter = defineModel<boolean>("locationFilter");
const hasFilter = computed(() => {
  return !!(hasLocationFilter.value || localValue.value);
});

const updateValue = (event: Event) => {
  localValue.value = (<HTMLInputElement>event.target).value;
};
</script>

<template>
  <div class="relative rounded-md shadow-xs">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <IconFilterVariantPlus
        v-if="hasFilter"
        class="text-muted-foreground h-5 w-5"
        aria-hidden="true"
      />
      <IconFilterVariant
        v-else
        class="text-muted-foreground h-5 w-5"
        aria-hidden="true"
      />
    </div>
    <input
      :value="localValue"
      @input="updateValue"
      type="text"
      class="focus:border-primary focus:ring-ring dark:bg-muted/20 block w-full rounded-md border-gray-300 pr-10 pl-10 sm:text-sm"
      placeholder="Filter"
      v-bind="$attrs"
    />
    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
      <button
        class="text-muted-foreground hover:text-muted-foreground focus:ring-ring rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
        type="button"
        @click="localValue = ''"
      >
        <CloseIcon class="h-5 w-5" aria-hidden="true" />
      </button>
      <Toggle
        v-model="hasLocationFilter"
        title="Toggle location filter"
        @click="hasLocationFilter = !hasLocationFilter"
        class="text-muted-foreground hover:text-muted-foreground focus:ring-ring rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
      >
        <IconCrosshairsOff v-if="hasLocationFilter" class="h-5 w-5" aria-hidden="true" />
        <IconCrosshairsGps v-else class="h-5 w-5" aria-hidden="true" />
      </Toggle>
    </div>
  </div>
</template>
