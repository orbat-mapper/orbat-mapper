<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { inject, ref } from "vue";
import { useShareHistory } from "@/composables/scenarioShare";
import { activeScenarioKey } from "@/components/injects";
import InputGroup from "@/components/InputGroup.vue";
import ToggleField from "@/components/ToggleField.vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardCopyIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-vue-next";
import { encryptScenario } from "@/utils/crypto";

const open = defineModel<boolean>({ default: false });

const activeScenario = inject(activeScenarioKey)!;
const { copy, copied } = useClipboard();
const { addToHistory } = useShareHistory();

const generatedUrl = ref("");
const error = ref("");
const isLoading = ref(false);

const useEncryption = ref(false);
const password = ref("");
const description = ref("");
const showPassword = ref(false);

const SHARE_API_URL = "/share";

async function generateLink() {
  isLoading.value = true;
  error.value = "";
  try {
    const scenarioData = activeScenario.io.serializeToObject();
    let uploadData: any = scenarioData;

    if (useEncryption.value) {
      if (!password.value) return;
      uploadData = await encryptScenario(scenarioData, password.value, {
        header: { description: description.value },
      });
    }

    const response = await fetch(SHARE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ORBAT-SECRET":
          import.meta.env.VITE_ORBAT_SECRET ||
          "I9ZJ4z4FDtLFXpvHKIT2TALl7k9BUDRYr5Jj3IBF7A7Jp8KJDOR",
      },
      body: JSON.stringify(uploadData),
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
    addToHistory({
      id,
      name: activeScenario.store.state.info.name || "Unnamed scenario",
      url: generatedUrl.value,
      encrypted: useEncryption.value,
    });
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
      >Share this scenario by copying the link below. The link will remain valid for 30
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
            Anyone with the link {{ useEncryption ? "and password" : "" }} can view the
            scenario.
          </AlertDescription>
        </Alert>

        <div class="space-y-4 pt-2">
          <ToggleField v-model="useEncryption">Encrypt scenario</ToggleField>

          <div v-if="useEncryption" class="space-y-4 rounded-md border p-4">
            <InputGroup
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
            />

            <ToggleField v-model="showPassword">Show password</ToggleField>

            <div>
              <InputGroup
                v-model="description"
                label="Description (optional)"
                placeholder="Description"
              />
              <p class="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                Warning: This description is visible without the password.
              </p>
            </div>
          </div>
        </div>
        <p>
          Click the button below to upload the scenario and generate a shareable link.
        </p>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" @click="open = false">Cancel</Button>
          <Button @click="generateLink" :disabled="useEncryption && !password"
            >Upload and generate link</Button
          >
        </div>
      </div>
    </div>
  </NewSimpleModal>
</template>
