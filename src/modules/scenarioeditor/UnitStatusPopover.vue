<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { Float } from "@headlessui-float/vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref } from "vue";
import { SelectItem } from "@/components/types";
import BaseButton from "@/components/BaseButton.vue";

const props = defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ (e: "update", value: string | null | undefined): void }>();

const {
  store: {
    state: { unitStatusMap },
  },
} = injectStrict(activeScenarioKey);

const statusValue = ref<string | null>(null);

const unitStatusValues = computed<SelectItem[]>(() => {
  return sortBy(Object.values(unitStatusMap), "name").map((v) => ({
    value: v.id,
    label: v.name,
  }));
});

function onFormSubmit(closeFunction: () => void) {
  emit("update", statusValue.value);
  closeFunction();
}
</script>
<template>
  <Popover as="template">
    <Float placement="top-end" strategy="fixed" portal>
      <PopoverButton
        :disabled="disabled"
        title="Change style"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >Set status
      </PopoverButton>
      <PopoverPanel v-slot="{ close }">
        <FloatingPanel class="p-4">
          <h3>Set unit status</h3>
          <form @submit.prevent="onFormSubmit(close)" class="mt-2 space-y-2">
            <SimpleSelect add-none :items="unitStatusValues" v-model="statusValue" />
            <footer class="flex justify-end">
              <BaseButton small primary type="submit">Set</BaseButton>
            </footer>
          </form>
        </FloatingPanel>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
