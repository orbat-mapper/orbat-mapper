<template>
  <TransitionRoot :show="open" as="template" @after-leave="" appear>
    <Dialog as="div" class="relative z-10" @close="open = false">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
          >
            <Combobox @update:modelValue="onSelect">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  @change="rawQuery = $event.target.value"
                />
              </div>

              <ComboboxOptions
                v-if="groupedHits && hitCount > 0"
                static
                class="max-h-80 scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                <li v-for="[source, hits] in groupedHits">
                  <h2 class="text-xs font-semibold text-gray-900">{{ source }}</h2>
                  <ul class="-mx-4 mt-2 text-sm font-medium text-gray-700">
                    <ComboboxOption
                      v-for="item in hits"
                      :key="item.id"
                      :value="item"
                      as="template"
                      v-slot="{ active }"
                    >
                      <CommandPaletteUnitItem
                        v-if="item.category === 'Units'"
                        :item="item"
                        :active="active"
                        class=""
                      />
                      <CommandPaletteLayerFeatureItem
                        v-else-if="item.category === 'Features'"
                        :active="active"
                        :item="item"
                      />
                      <p v-else>Missing</p>
                    </ComboboxOption>
                  </ul>
                </li>
              </ComboboxOptions>

              <CommandPaletteHelp v-if="showHelp" />

              <div
                v-if="query !== '' && rawQuery !== '?' && hitCount === 0"
                class="px-6 py-14 text-center text-sm sm:px-14"
              >
                <ExclamationTriangleIcon
                  class="mx-auto h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                <p class="mt-4 font-semibold text-gray-900">No results found</p>
                <p class="mt-2 text-gray-500">
                  We couldn’t find anything with that term. Please try again.
                </p>
              </div>

              <CommandPaletteFooter :raw-query="rawQuery" />
            </Combobox>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { ExclamationTriangleIcon, FolderIcon } from "@heroicons/vue/24/outline";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import CommandPaletteFooter from "@/components/CommandPaletteFooter.vue";
import CommandPaletteHelp from "@/components/CommandPaletteHelp.vue";
import { useDebounce, useVModel } from "@vueuse/core";
import { useScenarioSearch } from "@/composables/searching";
import MilSymbol from "@/components/MilSymbol.vue";
import CommandPaletteUnitItem from "@/components/CommandPaletteUnitItem.vue";
import CommandPaletteLayerFeatureItem from "@/components/CommandPaletteLayerFeatureItem.vue";
import { LayerFeatureSearchResult, UnitSearchResult } from "@/components/types";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits([
  "update:modelValue",
  "select-unit",
  "select-layer",
  "select-feature",
]);

const open = useVModel(props, "modelValue", emit);

const rawQuery = ref("");
const query = computed(() => rawQuery.value.toLowerCase().replace(/^[#>]/, ""));
const debouncedQuery = useDebounce(query, 200);
const { searchUnits, search } = useScenarioSearch();

const filteredUnits = ref<any[]>([]);
const groupedHits = ref<ReturnType<typeof search>["groups"]>();
const hitCount = ref(0);

const showHelp = computed(() => rawQuery.value === "?");

watchEffect(() => {
  filteredUnits.value = showHelp.value ? [] : searchUnits(debouncedQuery.value);
  const { numberOfHits, groups } = search(debouncedQuery.value);
  hitCount.value = numberOfHits;
  groupedHits.value = groups;
});

function onSelect(item: UnitSearchResult | LayerFeatureSearchResult) {
  if (item.category === "Units") emit("select-unit", item.id);
  if (item.category === "Features") {
    if (item.type === "layer") {
      emit("select-layer", item.id);
    } else {
      emit("select-feature", item.id);
    }
  }
  open.value = false;
}
</script>