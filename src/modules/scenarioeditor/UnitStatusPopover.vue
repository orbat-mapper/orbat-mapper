<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { Float } from "@headlessui-float/vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { RangeRingStyle } from "@/types/scenarioGeoModels";
import { SimpleStyleSpec } from "@/geo/simplestyle";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed } from "vue";
import { SelectItem } from "@/components/types";
import BaseButton from "@/components/BaseButton.vue";

interface Props {
  status: string;
}
const props = defineProps<Props>();
const emit = defineEmits(["update"]);

const {
  store: {
    state: { unitStatusMap },
  },
} = injectStrict(activeScenarioKey);

const unitStatusValues = computed<SelectItem[]>(() => {
  return sortBy(Object.values(unitStatusMap), "name").map((v) => ({
    value: v.id,
    label: v.name,
  }));
});

function updateValue(value: string) {
  emit("update", value);
}
</script>
<template>
  <Popover as="template">
    <Float placement="top-end" strategy="fixed">
      <PopoverButton
        title="Change style"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >Status
      </PopoverButton>
      <PopoverPanel v-slot="{ close }">
        <FloatingPanel class="p-4">
          <h3>Set unit status</h3>
          <form @submit.prevent="close()" class="mt-2">
            <SimpleSelect add-none :items="unitStatusValues" />
            <BaseButton small primary type="submit">Ok</BaseButton>
          </form>
        </FloatingPanel>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
