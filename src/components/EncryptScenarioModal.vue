<script setup lang="ts">
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { inject, ref } from "vue";
import { activeScenarioKey } from "@/components/injects";
import InputGroup from "@/components/InputGroup.vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { Button } from "@/components/ui/button";
import { useScenarioIO } from "@/scenariostore/io";
import { encryptScenario } from "@/utils/crypto";
import { saveBlobToLocalFile } from "@/utils/files";
import { useNotifications } from "@/composables/notifications";
import type { TScenario } from "@/scenariostore";

const open = defineModel<boolean>({ default: false });
const activeScenario = inject(activeScenarioKey)! as TScenario;
const { io } = activeScenario;
const { send } = useNotifications();

const password = ref("");
const showPassword = ref(false);
const isEncrypting = ref(false);

async function onDownload() {
  if (!password.value) return;

  isEncrypting.value = true;
  try {
    const scenario = io.serializeToObject();
    const encrypted = await encryptScenario(scenario, password.value);

    // @ts-ignore
    const { default: filenamify } = await import("filenamify/browser");
    const filename = filenamify(scenario.name || "scenario");

    await saveBlobToLocalFile(
      new Blob([JSON.stringify(encrypted, null, 2)], {
        type: "application/json",
      }),
      `${filename}.json`,
    );

    send({ message: "Encrypted scenario downloaded" });
    open.value = false;
    password.value = "";
  } catch (e) {
    console.error(e);
    send({ message: "Failed to encrypt scenario" });
  } finally {
    isEncrypting.value = false;
  }
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Download encrypted scenario"
    class="sm:max-w-md"
  >
    <form class="space-y-4" @submit.prevent="onDownload">
      <p class="text-muted-foreground text-sm">
        Enter a password to encrypt the scenario. You will need this password to open the
        scenario later.
      </p>

      <InputGroup
        v-model="password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        autofocus
        placeholder="Enter password"
      />

      <InputCheckbox v-model="showPassword" label="Show password" />

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" @click="open = false">Cancel</Button>
        <Button type="submit" :disabled="!password || isEncrypting">
          {{ isEncrypting ? "Encrypting..." : "Download Encrypted" }}
        </Button>
      </div>
    </form>
  </NewSimpleModal>
</template>
