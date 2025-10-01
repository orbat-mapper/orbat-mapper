<script setup lang="ts">
import { computed } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { ExportFormat, ExportSettings, KmlKmzExportSettings } from "@/types/convert";
import { Slider } from "@/components/ui/slider";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import NewAccordionPanel from "@/components/NewAccordionPanel.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";
import InputRadio from "@/components/InputRadio.vue";
import { useSelectedItems } from "@/stores/selectedStore.ts";
import { useTimeFormatStore } from "@/stores/timeFormatStore.ts";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  format: ExportFormat;
  modelValue: ExportSettings;
}>();
const form = defineModel<KmlKmzExportSettings>({ required: true });

const { store, time } = injectStrict(activeScenarioKey);

const fmt = useTimeFormatStore();

const formattedTime = computed(() =>
  fmt.scenarioFormatter.format(+time.scenarioTime.value),
);
const isKml = computed(() => props.format === "kml");
const isKmz = computed(() => props.format === "kmz");

const { selectedUnitIds } = useSelectedItems();

const iconScale = computed({
  get: () => [form.value.iconScale ?? 1],
  set: ([value]: number[]) => {
    form.value.iconScale = value;
  },
});

const labelScale = computed({
  get: () => [form.value.labelScale ?? 1],
  set: ([value]: number[]) => {
    form.value.labelScale = value;
  },
});

const events = computed(() => {
  return store.state.events
    .map((e) => store.state.eventMap[e])
    .sort((a, b) => (a.startTime < b.startTime ? -1 : 1))
    .map((e) => ({
      label: `${fmt.scenarioFormatter.format(e.startTime)} - ${e.title}`,
      value: e.id,
    }));
});

if (!events.value.some((e) => e.value === form.value.exportEventId)) {
  form.value.exportEventId = events.value[0]?.value;
}

if (!Array.isArray(form.value.exportEventIds)) {
  form.value.exportEventIds = [];
} else {
  form.value.exportEventIds = form.value.exportEventIds.filter((id) =>
    events.value.some((e) => e.value === id),
  );
}

function toggleAllEvents() {
  if (form.value.exportEventIds.length === events.value.length) {
    form.value.exportEventIds = [];
  } else {
    form.value.exportEventIds = events.value.map((e) => e.value);
  }
}
</script>

<template>
  <fieldset class="space-y-4">
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <InputCheckbox
        label="Include units"
        description="Units with a location at current scenario time"
        v-model="form.includeUnits"
      />
      <InputCheckbox
        v-if="form.includeUnits"
        :label="`Include selected units only (${selectedUnitIds.size})`"
        description="Selected units with a location"
        v-model="form.includeSelectedUnitsOnly"
      />
      <div v-else />
      <InputCheckbox
        label="Include scenario features"
        v-model="form.includeFeatures"
        description=""
      />
      <InputCheckbox
        label="Use short unit names"
        v-if="isKml || isKmz"
        v-model="form.useShortName"
      />
      <InputCheckbox
        v-if="isKmz"
        label="Include unit icons"
        v-model="form.embedIcons"
        description="Embed icons as images"
      />
      <InputGroupTemplate class="col-span-full" label="Folder settings">
        <MRadioGroup class="mt-4 sm:flex sm:gap-6">
          <InputRadio v-model="form.folderMode" value="one">One folder</InputRadio>
          <InputRadio v-model="form.folderMode" value="side">One per side</InputRadio>
          <InputRadio v-model="form.folderMode" value="sideGroup"
            >Side and groups (nested)</InputRadio
          >
        </MRadioGroup>
      </InputGroupTemplate>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
      <InputGroupTemplate label="Label scale">
        <Slider v-model="labelScale" :min="0" :max="2" :step="0.1" class="mt-4" />
        <template #description>Setting it to 0 will hide the label</template>
        <template #hint
          ><span class="text-sm font-medium">{{ form.labelScale }}x</span></template
        >
      </InputGroupTemplate>
      <InputGroupTemplate label="Icon scale">
        <Slider v-model="iconScale" :min="0.5" :max="3" :step="0.1" class="mt-4" />
        <template #description>A scale of 1 is approximately 32x32 pixels</template>
        <template #hint
          ><span class="text-sm font-medium">{{ form.iconScale }}x</span></template
        >
      </InputGroupTemplate>
    </div>
    <NewAccordionPanel label="Time mode" default-open>
      <MRadioGroup class="mt-2 sm:flex sm:gap-6">
        <InputRadio v-model="form.timeMode" value="current"
          >Current time ({{ formattedTime }})</InputRadio
        >
        <InputRadio v-model="form.timeMode" value="event">Event</InputRadio>
        <InputRadio v-model="form.timeMode" value="multiple">Multiple events</InputRadio>
      </MRadioGroup>
      <SimpleSelect
        class="mt-4"
        label="Select event"
        v-if="form.timeMode === 'event'"
        :items="events"
        v-model="form.exportEventId"
      />
      <div v-else-if="form.timeMode === 'multiple'" class="mt-4 space-y-2">
        <Button type="button" variant="outline" size="sm" @click="toggleAllEvents()"
          >Toggle all</Button
        >
        <InputCheckbox
          v-for="e in events"
          :label="e.label"
          :value="e.value"
          v-model="form.exportEventIds"
        />
      </div>
    </NewAccordionPanel>

    <NewAccordionPanel label="Advanced settings" v-if="isKmz" default-open>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <InputCheckbox
          label="Draw symbol outline"
          v-model="form.drawSymbolOutline"
          description="Improves visibility"
        />
        <InputCheckbox
          label="Render symbol amplifiers"
          v-model="form.renderAmplifiers"
          description="Warning: will increase file size"
        />
      </div>
    </NewAccordionPanel>
  </fieldset>
</template>
