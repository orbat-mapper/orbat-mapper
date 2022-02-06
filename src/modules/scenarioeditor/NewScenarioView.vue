<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <header>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Create new scenario
        </h1>
        <div class="prose prose-base mt-4">
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
          <InputGroup
            label="Name"
            v-model="scenarioStore.scenario.name"
            id="name-input"
          />

          <SimpleMarkdownInput
            label="Description"
            v-model="scenarioStore.scenario.description"
            description="Use markdown syntax for formatting"
          />
        </FormCard>
        <FormCard label="Scenario start time">
          <template #description>
            <p>Select a start time and time zone.</p>
          </template>
          <TimezoneSelect label="Time zone" v-model="scenarioStore.scenario.timeZone" />

          <InputGroup label="Date" type="date" v-model="date"></InputGroup>
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
            v-model="scenarioStore.scenario.symbologyStandard"
          />
        </FormCard>
        <!--        <FormCard label="Order of Battle"></FormCard>-->
        <div class="flex justify-end space-x-3">
          <BaseButton @click="cancel()">Cancel</BaseButton>
          <BaseButton primary @click="create()">Create scenario</BaseButton>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CheckIcon } from "@heroicons/vue/solid";
import ScenarioInfoPanel from "../../components/ScenarioInfoPanel.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import FormCard from "../../components/FormCard.vue";
import InputGroup from "../../components/InputGroup.vue";
import SimpleMarkdownInput from "../../components/SimpleMarkdownInput.vue";
import TimezoneSelect from "../../components/TimezoneSelect.vue";
import { useDateElements } from "../../composables/scenarioTime";
import RadioGroupList from "../../components/RadioGroupList.vue";
import BaseButton from "../../components/BaseButton.vue";
import { useRouter } from "vue-router";
import { SCENARIO_ROUTE } from "../../routes";

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

export default defineComponent({
  name: "NewScenarioView",
  components: {
    BaseButton,
    RadioGroupList,
    TimezoneSelect,
    SimpleMarkdownInput,
    InputGroup,
    FormCard,
    ScenarioInfoPanel,
    CheckIcon,
  },

  setup(props) {
    const scenarioStore = useScenarioStore();
    const router = useRouter();
    scenarioStore.loadEmptyScenario();

    const { date, hour, minute, resDateTime } = useDateElements({
      timestamp: scenarioStore.scenario.startTime!,
      isLocal: true,
      timeZone: scenarioStore.scenario.timeZone || "UTC",
    });

    function create() {
      scenarioStore.scenario.startTime = resDateTime.value.valueOf();
      scenarioStore.setCurrentTime(scenarioStore.scenario.startTime);
      router.push({ name: SCENARIO_ROUTE });
    }

    function cancel() {
      router.back();
    }

    return {
      scenarioStore,
      date,
      hour,
      minute,
      resDateTime,
      standardSettings,
      cancel,
      create,
    };
  },
});
</script>
