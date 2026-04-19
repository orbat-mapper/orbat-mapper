<script setup lang="ts">
import ScenarioEditor from "@/modules/scenarioeditor/ScenarioEditor.vue";
import { useScenario } from "@/scenariostore";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { computed, ref, watch } from "vue";
import { useSelectedItems } from "@/stores/selectedStore";
import { type ScenarioDraft, useIndexedDb } from "@/scenariostore/localdb";
import { useEventListener } from "@vueuse/core";
import ScenarioNotFoundPage from "@/modules/scenarioeditor/ScenarioNotFoundPage.vue";
import type { Scenario } from "@/types/scenarioModels";
import ScenarioDraftRecoveryModal from "@/modules/scenarioeditor/ScenarioDraftRecoveryModal.vue";
import ScenarioLeavePromptModal from "@/modules/scenarioeditor/ScenarioLeavePromptModal.vue";

const props = defineProps<{ scenarioId: string }>();

const { scenario, isReady } = useScenario();
const localReady = ref(false);
const scenarioNotFound = ref(false);
const showDraftRecoveryModal = ref(false);
const showLeavePromptModal = ref(false);
const pendingDraft = ref<ScenarioDraft | null>(null);
const canonicalScenario = ref<Scenario | null>(null);
const editorKey = computed(
  () => `${scenario.value.store.state.id}:${scenario.value.io.sessionRevision.value}`,
);

const currentDemo = "";
const selectedItems = useSelectedItems();
let resolveLeavePrompt:
  | ((choice: "save" | "discard" | "cancel") => void)
  | undefined;

watch(
  () => props.scenarioId,
  async (newScenarioId) => {
    await loadScenarioForEditor(newScenarioId);
  },
  { immediate: true },
);

function isDemoScenario(scenarioId: string) {
  return scenarioId.startsWith("demo-");
}

function showScenarioInfo() {
  selectedItems.clear();
  selectedItems.showScenarioInfo.value = true;
}

async function maybePromptForDraftRecovery(
  scenarioId: string,
  savedScenario: Scenario | null,
) {
  if (!savedScenario) return;
  const draft = await scenario.value.io.getNewerDraft(scenarioId, savedScenario);
  if (!draft) return;
  pendingDraft.value = draft;
  canonicalScenario.value = savedScenario;
  showDraftRecoveryModal.value = true;
}

async function loadScenarioForEditor(scenarioId: string) {
  localReady.value = false;
  scenarioNotFound.value = false;
  showDraftRecoveryModal.value = false;
  pendingDraft.value = null;
  canonicalScenario.value = null;

  if (isDemoScenario(scenarioId)) {
    const demoId = scenarioId.replace("demo-", "");
    if (demoId !== currentDemo) {
      const demoScenario = await scenario.value.io.loadDemoScenario(demoId);
      if (demoScenario) {
        showScenarioInfo();
        await maybePromptForDraftRecovery(scenarioId, demoScenario);
      }
    }
    localReady.value = true;
    return;
  }

  const { loadScenario } = await useIndexedDb();
  const idbscenario = await loadScenario(scenarioId);
  if (idbscenario) {
    scenario.value.io.loadFromObject(idbscenario);
    showScenarioInfo();
    await maybePromptForDraftRecovery(scenarioId, idbscenario);
  } else {
    scenarioNotFound.value = true;
    console.error("Scenario not found in indexeddb");
  }
  localReady.value = true;
}

function promptToSaveBeforeLeaving() {
  showLeavePromptModal.value = true;
  return new Promise<"save" | "discard" | "cancel">((resolve) => {
    resolveLeavePrompt = resolve;
  });
}

function resolvePendingLeavePrompt(choice: "save" | "discard" | "cancel") {
  showLeavePromptModal.value = false;
  resolveLeavePrompt?.(choice);
  resolveLeavePrompt = undefined;
}

async function confirmNavigationAway() {
  if (!scenario.value.io.hasUnsavedChanges()) {
    await scenario.value.io.flushDraft();
    return true;
  }

  const choice = await promptToSaveBeforeLeaving();
  if (choice === "save") {
    await scenario.value.io.saveToIndexedDb();
    return true;
  }
  if (choice === "discard") {
    await scenario.value.io.discardDraft();
    return true;
  }
  return false;
}

async function onRestoreDraft() {
  if (!pendingDraft.value || !canonicalScenario.value) return;
  scenario.value.io.loadFromObject(pendingDraft.value.scenario, {
    loadedBaseline: canonicalScenario.value,
    savedBaseline: canonicalScenario.value,
  });
  showScenarioInfo();
  showDraftRecoveryModal.value = false;
  pendingDraft.value = null;
  canonicalScenario.value = null;
}

async function onOpenSavedVersion() {
  if (pendingDraft.value) {
    await scenario.value.io.discardDraft(pendingDraft.value.scenarioId);
  }
  showDraftRecoveryModal.value = false;
  pendingDraft.value = null;
  canonicalScenario.value = null;
}

function onCancelDraftRecovery() {
  showDraftRecoveryModal.value = false;
  pendingDraft.value = null;
  canonicalScenario.value = null;
}

onBeforeRouteLeave(async () => {
  return await confirmNavigationAway();
});

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.scenarioId === from.params.scenarioId) {
    return true;
  }
  return await confirmNavigationAway();
});

useEventListener(document, "visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    void scenario.value.io.flushDraft();
  }
});

useEventListener(window, "pagehide", () => {
  void scenario.value.io.flushDraft();
});

useEventListener(window, "beforeunload", (event) => {
  void scenario.value.io.flushDraft();
  if (!scenario.value.io.hasUnsavedChanges()) return;
  event.preventDefault();
  event.returnValue = "";
});
</script>
<template>
  <ScenarioEditor
    v-if="localReady && isReady"
    :key="editorKey"
    :active-scenario="scenario"
  />
  <ScenarioNotFoundPage v-else-if="scenarioNotFound" />
  <ScenarioDraftRecoveryModal
    v-model="showDraftRecoveryModal"
    @restore-draft="onRestoreDraft"
    @open-saved="onOpenSavedVersion"
    @cancel="onCancelDraftRecovery"
  />
  <ScenarioLeavePromptModal
    v-model="showLeavePromptModal"
    @save="resolvePendingLeavePrompt('save')"
    @discard="resolvePendingLeavePrompt('discard')"
    @cancel="resolvePendingLeavePrompt('cancel')"
  />
</template>
