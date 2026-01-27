<script setup lang="ts">
import { ref } from "vue";
import { type EncryptedScenario, type Scenario } from "@/types/scenarioModels";
import { ClipboardPasteIcon } from "lucide-vue-next";

const emit = defineEmits(["loaded"]);

const isError = ref(false);

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      processContent(text);
    }
  } catch (err) {
    console.error("Failed to read clipboard:", err);
    isError.value = true;
  }
}

function processContent(content: string) {
  try {
    const scenarioData = JSON.parse(content) as Scenario | EncryptedScenario;
    if (
      scenarioData?.type === "ORBAT-mapper" ||
      scenarioData?.type === "ORBAT-mapper-encrypted"
    ) {
      emit("loaded", scenarioData);
      isError.value = false;
    } else {
      console.error("Invalid scenario format");
      isError.value = true;
    }
  } catch {
    console.error("Failed to parse clipboard content as JSON");
    isError.value = true;
  }
}

defineExpose({
  processContent,
});
</script>

<template>
  <div
    class="border-border focus-within:ring-ring hover:border-border/80 relative w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2"
  >
    <button
      class="text-foreground hover:text-muted-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium"
      @click="pasteFromClipboard()"
    >
      <ClipboardPasteIcon class="text-muted-foreground h-10 w-10" />

      <span class="mt-2 block text-center">Paste from clipboard</span>
    </button>

    <p
      v-if="isError"
      class="text-destructive-foreground absolute bottom-2 left-0 w-full text-center text-base"
    >
      Clipboard does not contain a valid scenario.
    </p>
  </div>
</template>
