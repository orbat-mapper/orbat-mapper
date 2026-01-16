<script setup lang="ts">
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import { type Scenario } from "@/types/scenarioModels";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ref } from "vue";
import { NEW_SCENARIO_ROUTE } from "@/router/names";
import SortDropdown from "@/components/SortDropdown.vue";
import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { defineAsyncComponent } from "vue";
import type { EncryptedScenario } from "@/types/scenarioModels";

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
);

const open = defineModel({ default: false });
const inputSource = ref<"external" | "browser">("browser");
const showDecryptModal = ref(false);
const currentEncryptedScenario = ref<EncryptedScenario | null>(null);

const { loadScenario, storedScenarios, sortOptions, onAction } = useBrowserScenarios();

function onLoaded(scenario: Scenario | EncryptedScenario) {
  if (scenario.type === "ORBAT-mapper-encrypted") {
    currentEncryptedScenario.value = scenario as EncryptedScenario;
    showDecryptModal.value = true;
    return;
  }
  loadScenario(scenario as Scenario);
  open.value = false;
}

function onDecrypted(scenario: Scenario) {
  loadScenario(scenario);
  open.value = false;
  showDecryptModal.value = false;
  currentEncryptedScenario.value = null;
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Load scenario"
    class="sm:max-w-xl md:max-w-4xl"
  >
    <Tabs v-model="inputSource" class="mt-4">
      <div class="flex items-center gap-x-4">
        <span class="text-muted-foreground text-sm font-medium">Source</span>
        <TabsList class="bg-transparent p-0">
          <TabsTrigger
            value="browser"
            class="text-muted-foreground hover:text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary cursor-pointer rounded-md px-3 py-2 text-sm font-medium shadow-none transition-none data-[state=active]:shadow-none"
          >
            Browser
          </TabsTrigger>
          <TabsTrigger
            value="external"
            class="text-muted-foreground hover:text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary cursor-pointer rounded-md px-3 py-2 text-sm font-medium shadow-none transition-none data-[state=active]:shadow-none"
          >
            Local file / URL
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="browser" class="mt-4">
        <header class="flex items-center justify-end border-b border-gray-200 pb-5">
          <div class="mt-3 flex items-center sm:mt-0 sm:ml-4">
            <SortDropdown class="mr-4" :options="sortOptions" />
            <Button as-child variant="secondary">
              <router-link :to="{ name: NEW_SCENARIO_ROUTE }"> Create new </router-link>
            </Button>
          </div>
        </header>
        <ul class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ScenarioLinkCard
            v-for="info in storedScenarios"
            :key="info.id"
            :data="info"
            @action="onAction($event, info)"
          />
        </ul>
      </TabsContent>
      <TabsContent value="external" class="mt-6">
        <LoadScenarioPanel class="h-40" @loaded="onLoaded" />
        <LoadScenarioUrlForm class="mt-4" @loaded="onLoaded" />
      </TabsContent>
    </Tabs>
  </NewSimpleModal>
  <DecryptScenarioModal
    v-if="showDecryptModal && currentEncryptedScenario"
    v-model="showDecryptModal"
    :encrypted-scenario="currentEncryptedScenario"
    @decrypted="onDecrypted"
  />
</template>
