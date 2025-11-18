<script setup lang="ts">
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import { type Scenario } from "@/types/scenarioModels";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { ref } from "vue";
import { NEW_SCENARIO_ROUTE } from "@/router/names";
import SortDropdown from "@/components/SortDropdown.vue";
import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Button } from "@/components/ui/button";

const open = defineModel({ default: false });
const inputSource = ref<"external" | "browser">("browser");

const { loadScenario, storedScenarios, sortOptions, onAction } = useBrowserScenarios();

function onLoaded(scenario: Scenario) {
  loadScenario(scenario);
  open.value = false;
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Load scenario"
    class="sm:max-w-xl md:max-w-4xl"
  >
    <RadioGroup v-model="inputSource" class="mt-4 flex items-center gap-x-4">
      <RadioGroupLabel class="text-muted-foreground text-sm font-medium"
        >Source</RadioGroupLabel
      >
      <RadioGroupOption
        v-for="{ label, value } in [
          { label: 'Browser', value: 'browser' },
          { label: 'Local file / URL', value: 'external' },
        ]"
        v-slot="{ checked }"
        :key="value"
        :value="value"
      >
        <span
          :class="[
            checked
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
            'cursor-pointer rounded-md px-3 py-2 text-sm font-medium',
          ]"
          >{{ label }}</span
        >
      </RadioGroupOption>
    </RadioGroup>
    <section v-if="inputSource === 'browser'" class="mt-4">
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
    </section>
    <div v-if="inputSource === 'external'" class="mt-6">
      <LoadScenarioPanel class="h-40" @loaded="onLoaded" />
      <LoadScenarioUrlForm class="mt-4" @loaded="onLoaded" />
    </div>
  </NewSimpleModal>
</template>
