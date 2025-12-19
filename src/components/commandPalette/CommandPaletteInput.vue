<script setup lang="ts">
import type { ListboxFilterProps } from "reka-ui";
import { ListboxFilter, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  ListboxFilterProps & {
    class?: HTMLAttributes["class"];
  }
>();

const query = defineModel<string>({ required: true });

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);

function onEscape(event: KeyboardEvent) {
  if (query.value.length > 0) {
    query.value = "";
    event.preventDefault();
    return;
  }
}
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="mr-4 flex h-12 items-center gap-2 border-b px-6"
  >
    <Search class="size-4 shrink-0 opacity-50" />
    <ListboxFilter
      v-bind="{ ...forwardedProps, ...$attrs }"
      v-model="query"
      data-slot="command-input"
      auto-focus
      :class="
        cn(
          'placeholder:text-muted-foreground border-muted flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
      @keydown.escape="onEscape"
    />
  </div>
</template>
