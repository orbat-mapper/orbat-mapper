<script setup lang="ts">
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { ArrowUpRightIcon, ShapesIcon } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useDebounce } from "@vueuse/core";
import { injectStrict } from "@/utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { activeScenarioKey } from "@/components/injects.ts";
import { CUSTOM_SYMBOL_SLICE } from "@/config/constants.ts";
import { Button } from "@/components/ui/button";

interface Props {
  initialSidc?: string | null;
}

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits(["update-sidc"]);
const { store } = injectStrict(activeScenarioKey);
const searchQuery = ref("");
const debouncedQuery = useDebounce(searchQuery, 100);
const inputRef = ref();

const filteredIcons = computed(() => {
  const icons = Object.values(store.state.customSymbolMap);
  if (!debouncedQuery.value.trim()) {
    return icons;
  }
  const query = debouncedQuery.value.toLowerCase();
  return icons.filter((icon: any) => {
    return icon.name.toLowerCase().includes(query);
  });
});

function onEsc(e: KeyboardEvent) {
  if (searchQuery.value.length) {
    e.stopPropagation();
    searchQuery.value = "";
  }
}
</script>

<template>
  <div class="flex px-0.5">
    <div v-if="filteredIcons.length" class="flex-auto">
      <div class="relative">
        <MagnifyingGlassIcon
          class="text-muted-foreground pointer-events-none absolute top-3.5 left-0 h-5 w-5"
          aria-hidden="true"
        />
        <input
          type="text"
          class="text-foreground placeholder:text-muted-foreground h-12 w-full border-0 bg-transparent pr-4 pl-7 focus:ring-0 sm:text-sm"
          placeholder="Search custom symbol..."
          @keydown.esc="onEsc"
          v-model="searchQuery"
          ref="inputRef"
        />
      </div>

      <div class="mt-4 max-h-[40vh] overflow-auto sm:max-h-[50vh]">
        <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
          <button
            type="button"
            v-for="{ id, name, src } in filteredIcons"
            :key="id"
            @click="emit('update-sidc', id)"
            class="flex w-full scroll-m-12 flex-col items-center justify-center rounded border border-transparent p-3 hover:border-gray-500"
          >
            <span class="relative">
              <img :src :alt="name" class="w-24 flex-auto object-contain" />
              <!--              <span-->
              <!--                class="absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full bg-red-900 text-center text-red-900"-->
              <!--              />-->
            </span>
            <p
              class="mt-1 max-w-full shrink-0 overflow-hidden text-center text-sm font-medium break-words"
              :class="
                id === initialSidc?.slice(CUSTOM_SYMBOL_SLICE)
                  ? 'text-red-900'
                  : 'text-foreground'
              "
            >
              {{ name }}
            </p>
          </button>
        </div>
      </div>
    </div>
    <Empty v-else class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShapesIcon />
        </EmptyMedia>
        <EmptyTitle>No custom symbols available</EmptyTitle>
        <EmptyDescription>
          Go to <span class="font-medium">Settings -> Custom unit symbols</span> in the
          ORBAT panel to add new symbols/icons to your scenario.
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="link" as-child class="text-muted-foreground" size="sm">
        <a
          href="https://docs.orbat-mapper.app/guide/custom-symbols"
          target="_blank"
          rel="noreferrer"
        >
          Documentation <ArrowUpRightIcon />
        </a>
      </Button>
    </Empty>
  </div>
</template>
