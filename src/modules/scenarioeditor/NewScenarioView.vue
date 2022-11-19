<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <header>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Create new scenario
        </h1>
        <div class="prose mt-4">
          <p>
            Before you can start working on your new scenario we need some basic
            information and settings first. Remember that you can always change these
            settings later.
          </p>
        </div>
      </div>
    </header>
    <div class="mx-auto my-10 max-w-7xl sm:px-6 lg:px-8">
      <form class="mt-6 space-y-6" @submit.prevent="create()">
        <div class="flex justify-end space-x-3 px-4 sm:px-0">
          <BaseButton primary type="submit">Create scenario</BaseButton>
        </div>
        <FormCard
          class=""
          label="Basic scenario info"
          description="Provide a name and description for your scenario."
        >
          <InputGroup label="Name" v-model="form.name" id="name-input" />

          <SimpleMarkdownInput
            label="Description"
            v-model="form.description"
            description="Use markdown syntax for formatting"
          />
        </FormCard>
        <FormCard label="Initial ORBAT">
          <template #description> Sides and root units.</template>
          <div>
            <ToggleField v-model="noInitialOrbat"
              >Add sides and root units later</ToggleField
            >
          </div>
          <template v-if="!noInitialOrbat">
            <div
              v-for="sideData in form.sides"
              class="grid grid-cols-2 gap-4 rounded-md border bg-gray-50 p-4"
            >
              <InputGroup v-model="sideData.name" label="Side name" />
              <SymbolCodeSelect
                v-model="sideData.standardIdentity"
                label="Standard identity"
                :items="sidItems"
              />
              <InputGroup
                label="Root unit name"
                v-model="sideData.rootUnitName"
              ></InputGroup>
            </div>
          </template>
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
        <div class="flex justify-end space-x-3 px-4 sm:px-0">
          <BaseButton primary type="submit">Create scenario</BaseButton>
          <BaseButton @click="cancel()">Cancel</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import FormCard from "@/components/FormCard.vue";
import InputGroup from "@/components/InputGroup.vue";
import SimpleMarkdownInput from "@/components/SimpleMarkdownInput.vue";
import TimezoneSelect from "@/components/TimezoneSelect.vue";
import { useYMDElements } from "@/composables/scenarioTime";
import RadioGroupList from "@/components/RadioGroupList.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useRouter } from "vue-router";
import { SCENARIO_ROUTE } from "@/router/names";
import { useScenario } from "@/scenariostore";
import { createEmptyScenario } from "@/scenariostore/io";
import ToggleField from "@/components/ToggleField.vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { sidItems } from "@/symbology/helpers";
import { ScenarioInfo, SideData } from "@/types/scenarioModels";
import { SID } from "@/symbology/values";
import { nanoid } from "@/utils";
import { Sidc } from "@/symbology/sidc";

const router = useRouter();
const { scenario } = useScenario();

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

interface InitialSideData extends SideData {
  rootUnitName?: string;
  rootUnitSidc?: string;
}

interface NewScenarioForm extends ScenarioInfo {
  sides: InitialSideData[];
}

const noInitialOrbat = ref(false);

const newScenario = ref(createEmptyScenario());
const timeZone = ref(newScenario.value.timeZone || "UTC");
const { year, month, day, hour, minute, resDateTime } = useYMDElements({
  timestamp: newScenario.value.startTime!,
  isLocal: true,
  timeZone,
});

const form = reactive<NewScenarioForm>({
  name: "New scenario",
  description: "Scenario description",
  sides: [
    { name: "Side 1", standardIdentity: SID.Friend, rootUnitName: "HQ" },
    { name: "Side 2", standardIdentity: SID.Hostile, rootUnitName: "HQ" },
  ],
});

function create() {
  const startTime = resDateTime.value.valueOf();
  newScenario.value.startTime = startTime;
  newScenario.value.name = form.name;
  newScenario.value.description = form.description;
  scenario.value.io.loadFromObject(newScenario.value);
  scenario.value.time.setCurrentTime(startTime);
  const { state, clearUndoRedoStack } = scenario.value.store;
  const { unitActions } = scenario.value;
  if (!noInitialOrbat.value) {
    form.sides.forEach((sideData) => {
      const sideId = unitActions.addSide(sideData, { markAsNew: false });
      const parentId = state.getSideById(sideId).groups[0];
      const sidc = new Sidc("10031000000000000000");
      sidc.standardIdentity = sideData.standardIdentity;
      unitActions.addUnit(
        {
          id: nanoid(),
          name: sideData.rootUnitName ?? "test",
          sidc: sidc.toString(),
          subUnits: [],
          _pid: "nn",
        },
        parentId
      );
    });
  }
  clearUndoRedoStack();
  router.push({ name: SCENARIO_ROUTE });
}

function cancel() {
  router.back();
}
</script>
