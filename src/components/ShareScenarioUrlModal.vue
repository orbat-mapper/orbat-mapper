<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { useScenarioShare } from "@/composables/scenarioShare";
import { inject, onMounted, ref } from "vue";
import { activeScenarioKey } from "@/components/injects";
import InputGroup from "@/components/InputGroup.vue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCopyIcon, TriangleAlertIcon } from "lucide-vue-next";
import DocLink from "@/components/DocLink.vue";

const open = defineModel<boolean>({ default: false });

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
  <NewSimpleModal v-model="open" dialog-title="Share scenario as URL" class="sm:max-w-xl">
    <template #description
      >Share this scenario by copying the URL below. The URL contains all scenario data.
      <DocLink href="https://docs.orbat-mapper.app/guide/share-scenario"
        >Learn more.</DocLink
      ></template
    >
    <div class="space-y-4">
      <Alert>
        <TriangleAlertIcon />
        <AlertDescription>
          Only use this feature for small to medium scenarios. Browsers and servers have
          limits on URL lengths. Always try the generated URL before sharing it.
        </AlertDescription>
      </Alert>

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
          <Button @click="onCopy" class="mb-0.5">
            {{ copied ? "Copied!" : "Copy URL" }}
            <ClipboardCopyIcon class="" />
          </Button>
        </div>

        <div class="text-sm">
          <span class="font-medium">URL length:</span>
          {{ generatedUrl.length }} characters
        </div>

        <Alert v-if="urlWarning" variant="destructive">
          <TriangleAlertIcon class="size-4" />
          <AlertDescription>
            {{ urlWarning }}
          </AlertDescription>
        </Alert>
      </div>

      <div class="flex justify-end">
        <Button variant="secondary" @click="open = false">Close</Button>
      </div>
    </div>
  </NewSimpleModal>
</template>
