<script setup lang="ts">
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import { type Scenario } from "@/types/scenarioModels";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { computed, ref } from "vue";
import { NEW_SCENARIO_ROUTE } from "@/router/names";
import SortDropdown from "@/components/SortDropdown.vue";
import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { defineAsyncComponent } from "vue";
import type { EncryptedScenario } from "@/types/scenarioModels";
import { Search } from "lucide-vue-next";

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
);

const open = defineModel({ default: false });
const inputSource = ref<"external" | "browser">("browser");
const showDecryptModal = ref(false);
const currentEncryptedScenario = ref<EncryptedScenario | null>(null);
const scenarioQuery = ref("");

const { loadScenario, storedScenarios, sortOptions, onAction } = useBrowserScenarios();
const normalizedScenarioQuery = computed(() => scenarioQuery.value.trim().toLowerCase());
const filteredStoredScenarios = computed(() => {
  if (!normalizedScenarioQuery.value) {
    return storedScenarios.value;
  }

  return storedScenarios.value.filter((scenario) => {
    const name = scenario.name.toLowerCase();
    const description = scenario.description?.toLowerCase() ?? "";

    return (
      name.includes(normalizedScenarioQuery.value) ||
      description.includes(normalizedScenarioQuery.value)
    );
  });
});

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

function onScenarioSearchKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !scenarioQuery.value) {
    return;
  }

  scenarioQuery.value = "";
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
        <header
          class="border-border flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-3">
            <div class="max-w-xl">
              <label for="load-scenario-search" class="sr-only">Search scenarios</label>
              <InputGroup>
                <InputGroupAddon aria-hidden="true">
                  <Search class="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="load-scenario-search"
                  v-model="scenarioQuery"
                  type="text"
                  placeholder="Search scenarios..."
                  autocomplete="off"
                  autofocus
                  class="h-full"
                  @keydown="onScenarioSearchKeydown"
                />
              </InputGroup>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-1 lg:ml-4 lg:justify-end">
            <SortDropdown :options="sortOptions" />
            <Button as-child variant="secondary">
              <router-link :to="{ name: NEW_SCENARIO_ROUTE }"> Create new </router-link>
            </Button>
          </div>
        </header>
        <ul
          v-if="filteredStoredScenarios.length > 0"
          class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          <ScenarioLinkCard
            v-for="info in filteredStoredScenarios"
            :key="info.id"
            :data="info"
            @action="onAction($event, info)"
          />
        </ul>
        <div
          v-else
          class="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm"
        >
          No recent scenarios match "{{ scenarioQuery.trim() }}".
        </div>
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
