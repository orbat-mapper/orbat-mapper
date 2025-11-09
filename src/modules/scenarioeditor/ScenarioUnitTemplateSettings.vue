<script setup lang="ts">
import { LucideStamp as StampIcon, ArrowUpRightIcon } from "lucide-vue-next";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";
import { computed } from "vue";

const { store } = injectStrict(activeScenarioKey);

const unitTemplates = computed(() => {
  return Object.values(store.state.unitTemplateMap);
});
</script>
<template>
  <div v-if="unitTemplates.length > 0">
    {{ unitTemplates }}
  </div>
  <Empty v-else class="border border-dashed">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <StampIcon />
      </EmptyMedia>
      <EmptyTitle>No unit templates yet</EmptyTitle>
      <EmptyDescription>
        Import unit templates from another scenario or create them from existing units.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="link" as-child class="text-muted-foreground" size="sm">
        <a href="#">
          Learn More
          <ArrowUpRightIcon />
        </a>
      </Button>
    </EmptyContent>
  </Empty>
</template>
