<script setup lang="ts">
import { useVModel, useClipboard } from "@vueuse/core";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { useScenarioShare } from "@/composables/scenarioShare";
import { inject, onMounted, ref } from "vue";
import { activeScenarioKey } from "@/components/injects";
import InputGroup from "@/components/InputGroup.vue";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue"]);
const open = useVModel(props, "modelValue", emit);

const activeScenario = inject(activeScenarioKey)!;
const { shareScenario } = useScenarioShare();
const { copy, copied } = useClipboard();

const generatedUrl = ref("");
const urlWarning = ref("");
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const { url, warning } = await shareScenario(activeScenario);
    generatedUrl.value = url;
    urlWarning.value = warning;
  } finally {
    isLoading.value = false;
  }
});

function onCopy() {
  copy(generatedUrl.value);
}
</script>

<template>
  <NewSimpleModal v-model="open" dialog-title="Share as URL" class="sm:max-w-xl">
    <div class="space-y-4">
      <p class="text-muted-foreground text-sm">
        Share this scenario by copying the URL below. The URL contains all scenario data.
      </p>

      <div v-if="isLoading" class="flex justify-center py-4">Generating URL...</div>

      <div v-else class="space-y-4">
        <div class="flex items-end gap-2">
          <InputGroup
            v-model="generatedUrl"
            label="Sharable URL"
            class="grow"
            readonly
            @click="($event.target as HTMLInputElement).select()"
          />
          <Button @click="onCopy" class="mb-[2px]">
            {{ copied ? "Copied!" : "Copy" }}
          </Button>
        </div>

        <div class="text-sm">
          <span class="font-medium">URL length:</span>
          {{ generatedUrl.length }} characters
        </div>

        <div
          v-if="urlWarning"
          class="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
        >
          <ExclamationTriangleIcon class="h-5 w-5 shrink-0" />
          <p>{{ urlWarning }}</p>
        </div>

        <div
          class="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
        >
          <InformationCircleIcon class="h-5 w-5 shrink-0" />
          <p>
            Some browsers and chat applications may truncate very long URLs. If the URL
            doesn't work, try using a URL shortener or exporting the scenario as a file
            instead.
          </p>
        </div>
      </div>

      <div class="flex justify-end">
        <Button variant="secondary" @click="open = false">Close</Button>
      </div>
    </div>
  </NewSimpleModal>
</template>
