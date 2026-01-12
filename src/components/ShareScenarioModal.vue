<script setup lang="ts">
import { useClipboard, useVModel } from "@vueuse/core";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { inject, ref } from "vue";
import { activeScenarioKey } from "@/components/injects";
import InputGroup from "@/components/InputGroup.vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardCopyIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-vue-next";

const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue"]);
const open = useVModel(props, "modelValue", emit);

const activeScenario = inject(activeScenarioKey)!;
const { copy, copied } = useClipboard();

const generatedUrl = ref("");
const error = ref("");
const isLoading = ref(false);

const SHARE_API_URL = "/share";

async function generateLink() {
  isLoading.value = true;
  error.value = "";
  try {
    const scenarioData = activeScenario.io.serializeToObject();
    const response = await fetch(SHARE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ORBAT-SECRET":
          import.meta.env.VITE_ORBAT_SECRET ||
          "I9ZJ4z4FDtLFXpvHKIT2TALl7k9BUDRYr5Jj3IBF7A7Jp8KJDOR",
      },
      body: JSON.stringify(scenarioData),
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error("Scenario is too large to share.");
      }
      if (response.status === 429) {
        throw new Error("You have reached the hourly upload limit.");
      }
      throw new Error("Failed to share scenario.");
    }

    const { id } = await response.json();
    generatedUrl.value = `${window.location.origin}/import?id=${id}`;
  } catch (e: any) {
    console.error(e);
    error.value = e.message || "An unexpected error occurred.";
  } finally {
    isLoading.value = false;
  }
}

function onCopy() {
  copy(generatedUrl.value);
}
</script>

<template>
  <NewSimpleModal v-model="open" dialog-title="Share scenario" class="sm:max-w-xl">
    <template #description
      >Share this scenario by copying the link below. The link will remain valid for 7
      days.
    </template>
    <div class="space-y-4">
      <div
        v-if="isLoading"
        class="text-muted-foreground flex items-center justify-center gap-2 py-8"
      >
        <LoaderCircleIcon class="animate-spin" />
        Generating Link...
      </div>

      <div v-else-if="error" class="space-y-4">
        <Alert variant="destructive">
          <TriangleAlertIcon class="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {{ error }}
          </AlertDescription>
        </Alert>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" @click="open = false">Close</Button>
          <Button @click="generateLink">Try Again</Button>
        </div>
      </div>

      <div v-else-if="generatedUrl" class="space-y-4">
        <div class="flex items-end gap-2">
          <InputGroup
            v-model="generatedUrl"
            label="Sharable URL"
            class="grow"
            readonly
            @click="($event.target as HTMLInputElement).select()"
          />
          <Button @click="onCopy" class="mb-0.5">
            {{ copied ? "Copied!" : "Copy Link" }}
            <ClipboardCopyIcon class="" />
          </Button>
        </div>

        <Alert>
          <TriangleAlertIcon class="size-4" />
          <AlertDescription>
            Anyone with the link can view this scenario.
          </AlertDescription>
        </Alert>

        <div class="flex justify-end">
          <Button variant="secondary" @click="open = false">Close</Button>
        </div>
      </div>

      <div v-else class="space-y-4">
        <Alert>
          <TriangleAlertIcon class="size-4" />
          <AlertDescription>
            WARNING. Clicking the "upload" button will upload your scenario to the cloud.
            Anyone with the link can view the scenario.
          </AlertDescription>
        </Alert>
        <p>
          Click the button below to upload the scenario and generate a shareable link.
        </p>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" @click="open = false">Cancel</Button>
          <Button @click="generateLink">Upload and generate Link</Button>
        </div>
      </div>
    </div>
  </NewSimpleModal>
</template>
