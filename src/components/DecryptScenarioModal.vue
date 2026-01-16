<script setup lang="ts">
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { ref } from "vue";
import InputGroup from "@/components/InputGroup.vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { Button } from "@/components/ui/button";
import { decryptScenario } from "@/utils/crypto";

import type { EncryptedScenario, Scenario } from "@/types/scenarioModels";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-vue-next";

const props = defineProps<{
  encryptedScenario: EncryptedScenario;
}>();

const emit = defineEmits<{
  decrypted: [scenario: Scenario];
  cancel: [];
}>();

const open = defineModel<boolean>({ default: false });

const password = ref("");
const showPassword = ref(false);
const isDecrypting = ref(false);
const error = ref("");

async function onDecrypt() {
  if (!password.value) return;

  isDecrypting.value = true;
  error.value = "";
  try {
    const decrypted = await decryptScenario(props.encryptedScenario, password.value);
    emit("decrypted", decrypted);
    open.value = false;
  } catch (e: any) {
    console.error(e);
    error.value = "Decryption failed. Invalid password or corrupted file.";
  } finally {
    isDecrypting.value = false;
  }
}

function onCancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Decrypt Scenario"
    class="sm:max-w-md"
    @cancel="onCancel"
  >
    <form class="space-y-4" @submit.prevent="onDecrypt">
      <p class="text-muted-foreground text-sm">
        This scenario is encrypted. Please enter the password to open it.
      </p>

      <InputGroup
        v-model="password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        autofocus
        placeholder="Enter password"
      />

      <InputCheckbox v-model="showPassword" label="Show password" />

      <Alert v-if="error" variant="destructive">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {{ error }}
        </AlertDescription>
      </Alert>

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" @click="onCancel">Cancel</Button>
        <Button type="submit" :disabled="!password || isDecrypting">
          {{ isDecrypting ? "Decrypting..." : "Open" }}
        </Button>
      </div>
    </form>
  </NewSimpleModal>
</template>
