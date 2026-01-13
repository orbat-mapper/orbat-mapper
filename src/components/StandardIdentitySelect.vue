<script setup lang="ts">
import { computed } from "vue";
import { RadioGroupRoot, RadioGroupItem } from "reka-ui";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";
import type { SymbolItem, SymbolValue } from "@/types/constants";
import MilSymbol from "@/components/MilSymbol.vue";
import { useToggle } from "@vueuse/core";
import SymbolFillColorSelect from "@/components/SymbolFillColorSelect.vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

const data = defineModel<string>({ default: "3" });
const fillColorValue = defineModel<string | null>("fillColor");

const sidItems = [
  {
    code: "3",
    text: "Friend",
  },
  {
    code: "6",
    text: "Hostile",
  },
  {
    code: "4",
    text: "Neutral",
  },
  {
    code: "1",
    text: "Unknown",
  },
  {
    code: "0",
    text: "Pending",
  },
  {
    code: "2",
    text: "Assumed Friend",
  },
  {
    code: "5",
    text: "Suspect",
  },
].map(addSymbol);

function addSymbol({ code, text }: SymbolValue): SymbolItem {
  return {
    code,
    text,
    sidc: "100" + code + 10 + "00" + "00" + "0000000000",
  };
}

const [showAll, toggleShowAll] = useToggle(false);
const items = computed(() =>
  showAll.value
    ? sidItems
    : sidItems.filter((e) => ["1", "3", "6", "4", "7"].includes(e.code)),
);
</script>

<template>
  <div class="mt-4">
    <RadioGroupRoot v-model="data">
      <Label class="text-heading text-sm font-medium">Standard identity </Label>
      <div
        class="mt-1 grid gap-x-4 gap-y-4"
        :class="compact ? 'grid-cols-2' : 'sm:grid-cols-4'"
      >
        <RadioGroupItem
          v-for="sid in items"
          :key="sid.code"
          :value="sid.code"
          as="template"
        >
          <div
            class="data-[state=checked]:border-primary data-[state=checked]:ring-primary dark:bg-input/30 border-input relative flex cursor-pointer rounded-lg border bg-transparent p-4 shadow-xs focus:outline-hidden data-[state=checked]:ring-2"
          >
            <span class="flex flex-1">
              <span class="flex w-full flex-col items-center">
                <span class="text-heading block text-sm font-medium">{{ sid.text }}</span>
                <span class="mt-2 flex"
                  ><MilSymbol
                    :sidc="sid.sidc"
                    :size="32"
                    :modifiers="{ outlineColor: 'white', outlineWidth: 4 }"
                /></span>
              </span>
            </span>
            <CheckCircleIcon
              class="text-primary invisible absolute top-1 right-1 h-5 w-5 data-[state=checked]:visible"
              aria-hidden="true"
            />
            <span
              class="data-[state=checked]:border-primary pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent"
              aria-hidden="true"
            />
          </div>
        </RadioGroupItem>
      </div>
    </RadioGroupRoot>
    <div class="mt-2 flex justify-end">
      <Button type="button" variant="link" @click="toggleShowAll()" size="sm">
        <template v-if="showAll"><span aria-hidden="true"> ←</span> View less</template>
        <template v-else>View more<span aria-hidden="true"> →</span></template>
      </Button>
    </div>
    <div class="mt-0 grid gap-4" :class="compact ? 'grid-cols-1' : 'sm:grid-cols-2'">
      <SymbolFillColorSelect v-model="fillColorValue" :sid="data" />
    </div>
  </div>
</template>
