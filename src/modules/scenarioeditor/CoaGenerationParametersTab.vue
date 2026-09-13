<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useNotifications } from "@/composables/notifications";
import {
  COA_HYPOTHESIS_NAMES,
  coaGenerationParameters,
  formatCoaPriors,
  type CoaHypothesisName,
} from "@/modules/scenarioeditor/coaGenerationParameters";
import { useCoaGenerationSession } from "@/modules/scenarioeditor/coaGenerationSession";

const { send: notify } = useNotifications();
const { syncBeliefFromFrago } = useCoaGenerationSession();

const currentBeliefText = computed(() =>
  formatCoaPriors(coaGenerationParameters.value.appliedPriors),
);

function setDraftPrior(name: CoaHypothesisName, value: number | undefined) {
  coaGenerationParameters.value.draftPriors[name] = value ?? 0;
}

async function applyFrago() {
  coaGenerationParameters.value.appliedPriors = {
    ...coaGenerationParameters.value.draftPriors,
  };
  await syncBeliefFromFrago();
  notify({
    type: "success",
    message: `Applied FRAGO priors: ${formatCoaPriors(coaGenerationParameters.value.appliedPriors)}`,
  });
}

function useBelief() {
  coaGenerationParameters.value.draftPriors = {
    ...coaGenerationParameters.value.appliedPriors,
  };
}
</script>

<template>
  <section class="space-y-3">
    <p class="text-muted-foreground text-xs">
      Set target P₀, then Apply. Incoming reports still update P(c) each step once the engine
      is connected.
    </p>
    <p class="text-sm">
      Current belief:
      <span class="font-medium">{{ currentBeliefText }}</span>
    </p>

    <div v-for="name in COA_HYPOTHESIS_NAMES" :key="name" class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <FieldLabel :for="`coa-prior-${name}`">{{ name }}</FieldLabel>
        <span class="text-muted-foreground font-mono text-xs">
          {{ (coaGenerationParameters.draftPriors[name] * 100).toFixed(0) }}%
        </span>
      </div>
      <Slider
        :id="`coa-prior-${name}`"
        :model-value="[coaGenerationParameters.draftPriors[name]]"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="([value]) => setDraftPrior(name, value)"
      />
    </div>

    <div class="flex gap-2">
      <Button type="button" size="sm" class="flex-1" @click="applyFrago">Apply FRAGO</Button>
      <Button type="button" size="sm" variant="outline" class="flex-1" @click="useBelief">
        Use belief
      </Button>
    </div>
  </section>
</template>
