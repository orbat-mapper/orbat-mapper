<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PanelHeading from "@/components/PanelHeading.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TabsContent } from "@/components/ui/tabs";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import CoaGenerationParametersTab from "@/modules/scenarioeditor/CoaGenerationParametersTab.vue";
import CoaGenerationRunTab from "@/modules/scenarioeditor/CoaGenerationRunTab.vue";
import CoaGenerationLogTab from "@/modules/scenarioeditor/CoaGenerationLogTab.vue";
import CoaGenerationSettingsTab from "@/modules/scenarioeditor/CoaGenerationSettingsTab.vue";
import {
  bindCoaGenerationScenario,
  coaGenerationActiveTab,
} from "@/modules/scenarioeditor/coaGenerationSession";
import { checkCoaApiHealth } from "@/modules/scenarioeditor/coaGenerationApi";
import { CircleHelpIcon } from "@lucide/vue";

const activeScenario = injectStrict(activeScenarioKey);
const apiOnline = ref(false);
const helpOpen = ref(false);
let helpCloseTimer: ReturnType<typeof setTimeout> | undefined;

function openHelp() {
  clearTimeout(helpCloseTimer);
  helpOpen.value = true;
}

function closeHelpSoon() {
  helpCloseTimer = setTimeout(() => {
    helpOpen.value = false;
  }, 120);
}

const tabList = [
  { label: "Parameters", value: "0" },
  { label: "Run", value: "1" },
  { label: "Log", value: "2" },
  { label: "Settings", value: "3" },
];

const selectedTab = computed({
  get: () => coaGenerationActiveTab.value,
  set: (value) => {
    coaGenerationActiveTab.value = value;
  },
});

onMounted(async () => {
  bindCoaGenerationScenario(activeScenario);
  apiOnline.value = await checkCoaApiHealth();
});
</script>

<template>
  <div>
    <div class="mb-2 flex items-center gap-1.5">
      <PanelHeading>COA generation</PanelHeading>
      <Popover v-model:open="helpOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none"
            aria-label="What does COA prediction do?"
            @mouseenter="openHelp"
            @mouseleave="closeHelpSoon"
            @focus="openHelp"
            @blur="closeHelpSoon"
          >
            <CircleHelpIcon class="size-4" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          align="start"
          class="w-72 p-3 text-xs leading-relaxed"
          @mouseenter="openHelp"
          @mouseleave="closeHelpSoon"
        >
          <p class="mb-2 font-medium">How MLCOA prediction works</p>
          <p>
            This predicts the likelihood of each enemy course of action from intelligence
            reports on the map. At each step, traffic reports show enemy positions spotted at
            that time.
          </p>
          <p class="mt-2">
            MLCOA combines those current sightings with prior observations and your FRAGO
            priors to infer what the enemy is most likely to do next.
          </p>
        </PopoverContent>
      </Popover>
    </div>
    <p class="text-muted-foreground mb-2 text-sm">
      Watchtower MLCOA console — parameters, run controls, and operation log.
    </p>
    <p
      class="mb-4 text-xs"
      :class="apiOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'"
    >
      {{
        apiOnline
          ? "ITDX engine connected."
          : "Start the ITDX API: uv sync --extra api && uv run uvicorn engine.api:app --port 8765"
      }}
    </p>

    <div class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTab">
        <TabsContent value="0" class="mx-4 pt-2">
          <CoaGenerationParametersTab />
        </TabsContent>
        <TabsContent value="1" class="mx-4 pt-2">
          <CoaGenerationRunTab />
        </TabsContent>
        <TabsContent value="2" class="mx-4 pt-2">
          <CoaGenerationLogTab />
        </TabsContent>
        <TabsContent value="3" class="mx-4 pt-2">
          <CoaGenerationSettingsTab />
        </TabsContent>
      </ScrollTabs>
    </div>
  </div>
</template>
