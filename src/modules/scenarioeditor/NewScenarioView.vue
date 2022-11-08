<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <header>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Create new scenario
        </h1>
        <div class="prose-base prose mt-4">
          <p>
            Before you can start working on your new scenario we need some basic
            information and settings first. Remember that you can always change these
            settings later.
          </p>
        </div>
      </div>
    </header>
    <div class="mx-auto my-10 max-w-7xl sm:px-6 lg:px-8">
      <main class="mt-6 space-y-6">
        <FormCard
          class=""
          label="Basic scenario info"
          description="Provide a name and description for your scenario."
        >
          <InputGroup label="Name" v-model="newScenario.name" id="name-input" />

          <SimpleMarkdownInput
            label="Description"
            v-model="newScenario.description"
            description="Use markdown syntax for formatting"
          />
        </FormCard>
        <FormCard label="Scenario start time">
          <template #description>
            <p>Select a start time and time zone.</p>
          </template>
          <TimezoneSelect label="Time zone" v-model="timeZone" />

          <div class="grid grid-cols-3 gap-6">
            <InputGroup label="Year" type="number" v-model="year" />
            <InputGroup label="Month" type="number" v-model="month" />
            <InputGroup label="Day" type="number" v-model="day" />
          </div>
          <div class="grid grid-cols-2 gap-6">
            <InputGroup label="Hour" v-model="hour" type="number" min="0" max="23" />
            <InputGroup label="Minute" v-model="minute" type="number" min="0" max="59" />
          </div>
          <p class="font-mono text-gray-700">{{ resDateTime.format() }}</p>
        </FormCard>
        <FormCard
          label="Symbology standard"
          description="Select the symbology standard you prefer to use."
        >
          <RadioGroupList
            :settings="standardSettings"
            v-model="newScenario.symbologyStandard"
          />
        </FormCard>
        <!--        <FormCard label="Order of Battle"></FormCard>-->
        <div class="flex justify-end space-x-3 px-4 sm:px-0">
          <BaseButton primary @click="create()">Create scenario</BaseButton>
          <BaseButton @click="cancel()">Cancel</BaseButton>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FormCard from "../../components/FormCard.vue";
import InputGroup from "../../components/InputGroup.vue";
import SimpleMarkdownInput from "../../components/SimpleMarkdownInput.vue";
import TimezoneSelect from "../../components/TimezoneSelect.vue";
import { useYMDElements } from "@/composables/scenarioTime";
import RadioGroupList from "../../components/RadioGroupList.vue";
import BaseButton from "../../components/BaseButton.vue";
import { useRouter } from "vue-router";
import { SCENARIO_ROUTE } from "@/router/names";
import { useScenario } from "@/scenariostore";
import { createEmptyScenario } from "@/scenariostore/io";

const standardSettings = [
  {
    value: "2525",
    name: "MIL-STD-2525D",
    description: "US version",
  },
  {
    value: "app6",
    name: "APP-6",
    description: "NATO version",
  },
];

const newScenario = ref(createEmptyScenario());

const { scenario } = useScenario();

const router = useRouter();

const timeZone = ref(newScenario.value.timeZone || "UTC");

const { year, month, day, hour, minute, resDateTime } = useYMDElements({
  timestamp: newScenario.value.startTime!,
  isLocal: true,
  timeZone,
});

function create() {
  const startTime = resDateTime.value.valueOf();
  newScenario.value.startTime = startTime;
  scenario.value.io.loadFromObject(newScenario.value);
  scenario.value.time.setCurrentTime(startTime);

  router.push({ name: SCENARIO_ROUTE });
}

function cancel() {
  router.back();
}
</script>
