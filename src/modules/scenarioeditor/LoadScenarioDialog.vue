<script setup lang="ts">
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import { type Scenario } from "@/types/scenarioModels";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";
import StoredScenarioBrowser from "@/components/StoredScenarioBrowser.vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ref } from "vue";
import { MAP_EDIT_MODE_ROUTE, NEW_SCENARIO_ROUTE } from "@/router/names";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";
import { defineAsyncComponent } from "vue";
import type { EncryptedScenario } from "@/types/scenarioModels";
import type { LoadableScenario } from "@/scenariostore/upgrade";

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
);

const props = withDefaults(defineProps<{ routeName?: string }>(), {
  routeName: MAP_EDIT_MODE_ROUTE,
});
const open = defineModel({ default: false });
const inputSource = ref<"external" | "browser">("browser");
const showDecryptModal = ref(false);
const currentEncryptedScenario = ref<EncryptedScenario | null>(null);

const {
  loadScenario,
  storedScenarios,
  sortOptions,
  sortDirection,
  toggleSortDirection,
  onAction,
} = useBrowserScenarios({
  routeName: props.routeName,
});

function onLoaded(scenario: LoadableScenario | EncryptedScenario) {
  if (scenario.type === "ORBAT-mapper-encrypted") {
    currentEncryptedScenario.value = scenario as EncryptedScenario;
    showDecryptModal.value = true;
    return;
  }
  loadScenario(scenario, props.routeName);
  open.value = false;
}

function onDecrypted(scenario: Scenario) {
  loadScenario(scenario, props.routeName);
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
        <StoredScenarioBrowser
          :scenarios="storedScenarios"
          :sort-options="sortOptions"
          :sort-direction="sortDirection"
          :route-name="props.routeName"
          search-input-id="load-scenario-search"
          autofocus
          empty-message="No recent scenarios match"
          grid-class="mt-4 grid grid-cols-1 gap-6 @xl:grid-cols-2"
          @action="onAction"
          @toggle-sort-direction="toggleSortDirection"
        >
          <template #actions>
            <Button as-child variant="secondary">
              <router-link :to="{ name: NEW_SCENARIO_ROUTE }"> Create new </router-link>
            </Button>
          </template>
        </StoredScenarioBrowser>
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
