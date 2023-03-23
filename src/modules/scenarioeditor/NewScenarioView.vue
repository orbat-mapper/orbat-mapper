<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <header>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Create new scenario
        </h1>
        <div class="prose mt-4">
          <p>
            Here you can provide some initial data for your scenario if you want. You can
            always change these settings later.
          </p>
        </div>
      </div>
    </header>
    <div class="mx-auto my-10 max-w-7xl sm:px-6 lg:px-8">
      <form class="mt-6 space-y-6" @submit.prevent="create()">
        <div class="flex items-center justify-between space-x-3 px-4 sm:px-0">
          <a
            class="text-indigo-600 underline hover:text-indigo-900"
            href="https://docs.orbat-mapper.app/guide/getting-started"
            target="_blank"
            >View documentation</a
          >
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
              >Add sides and root units later
            </ToggleField>
          </div>
          <template v-if="!noInitialOrbat">
            <div
              v-for="(sideData, idx) in form.sides"
              class="relative rounded-md border bg-gray-50 p-4"
            >
              <div class="grid gap-4 md:grid-cols-2">
                <InputGroup v-model="sideData.name" label="Side name" />
              </div>
              <StandardIdentitySelect v-model="sideData.standardIdentity" />
              <SimpleDivider class="mt-2 mb-4">Root units</SimpleDivider>
              <div class="space-y-6">
                <template v-for="(unit, i) in sideData.units">
                  <div class="flex items-end gap-4 md:grid md:grid-cols-2">
                    <InputGroup label="Root unit name" v-model="unit.rootUnitName" />
                    <MilitarySymbol :size="32" :sidc="unitSidc(unit, sideData)" />
                  </div>
                  <div class="mt-4 grid gap-4 md:grid-cols-2">
                    <SymbolCodeSelect
                      class=""
                      label="Main icon"
                      v-model="unit.rootUnitIcon"
                      :items="iconItems(sideData.standardIdentity)"
                    />
                    <SymbolCodeSelect
                      class=""
                      label="Echelon"
                      v-model="unit.rootUnitEchelon"
                      :items="echelonItems(sideData.standardIdentity)"
                    />
                  </div>
                  <SimpleDivider v-if="i < sideData.units.length - 1" />
                </template>
              </div>
              <footer class="mt-6 flex justify-end gap-x-2">
                <button
                  type="button"
                  class="btn-link"
                  :disabled="!sideData.units.length"
                  @click="removeUnit(sideData, sideData.units[sideData.units.length - 1])"
                >
                  Remove unit
                </button>
                <span class="text-gray-300">|</span>
                <button type="button" class="btn-link" @click="addRootUnit(sideData)">
                  + Add root unit
                </button>
              </footer>
              <button
                v-if="idx === form.sides.length - 1"
                type="button"
                class="btn-link absolute top-2 right-4"
                @click="form.sides.pop()"
              >
                Remove side
              </button>
            </div>
            <footer class="mt-6 flex justify-end">
              <button type="button" class="btn-link" @click="addSide()">
                + Add side
              </button>
            </footer>
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
import { ScenarioInfo, SideData } from "@/types/scenarioModels";
import { SID, SidValue } from "@/symbology/values";
import { nanoid } from "@/utils";
import { Sidc } from "@/symbology/sidc";
import StandardIdentitySelect from "@/components/StandardIdentitySelect.vue";
import SimpleDivider from "@/components/SimpleDivider.vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import type { SymbolItem, SymbolValue } from "@/types/constants";
import { echelonItems } from "@/symbology/helpers";
import MilitarySymbol from "@/components/MilitarySymbol.vue";

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

interface RootUnit {
  rootUnitName?: string;
  rootUnitSidc?: string;
  rootUnitEchelon?: string;
  rootUnitIcon?: string;
}

interface InitialSideData extends SideData {
  units: RootUnit[];
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
  description: "",
  sides: [
    {
      name: "Side 1",
      standardIdentity: SID.Friend,
      units: [{ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121000" }],
    },
    {
      name: "Side 2",
      standardIdentity: SID.Hostile,
      units: [{ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "110000" }],
    },
  ],
});

function create() {
  const startTime = resDateTime.value.valueOf();
  newScenario.value.startTime = startTime;
  newScenario.value.name = form.name;
  newScenario.value.description = form.description;
  newScenario.value.layers = [{ name: "Features", id: nanoid(), features: [] }];

  scenario.value.io.loadFromObject(newScenario.value);
  scenario.value.time.setCurrentTime(startTime);
  const { state, clearUndoRedoStack } = scenario.value.store;
  const { unitActions } = scenario.value;
  if (!noInitialOrbat.value) {
    form.sides.forEach((sideData) => {
      const sideId = unitActions.addSide(sideData, { markAsNew: false });
      const parentId = state.getSideById(sideId).groups[0];
      sideData.units.forEach((u) => {
        const sidc = new Sidc("10031000000000000000");
        sidc.standardIdentity = sideData.standardIdentity;
        sidc.emt = u.rootUnitEchelon || "00";
        sidc.mainIcon = u.rootUnitIcon || "000000";
        unitActions.addUnit(
          {
            id: nanoid(),
            name: u.rootUnitName ?? "test",
            sidc: sidc.toString(),
            subUnits: [],
            _pid: "nn",
            _sid: "nn",
            _gid: "nn",
          },
          parentId
        );
      });
    });
  }
  clearUndoRedoStack();
  router.push({ name: SCENARIO_ROUTE });
}

function cancel() {
  router.back();
}

const icons: SymbolValue[] = [
  { code: "000000", text: "Unspecified" },
  { code: "110000", text: "Command and Control" },
  { code: "121100", text: "Infantry" },
  { code: "121000", text: "Combined Arms" },
  { code: "121102", text: "Mechanized" },
  { code: "130300", text: "Artillery" },
  { code: "120500", text: "Armor" },
  { code: "160600", text: "Combat Service Support" },
];

function iconItems(sid: SidValue) {
  return icons.map(({ code, text }): SymbolItem => {
    return {
      code,
      text,
      sidc: "100" + sid + "10" + "00" + "00" + code + "0000",
    };
  });
}

function unitSidc(
  { rootUnitEchelon, rootUnitIcon }: RootUnit,
  { standardIdentity }: SideData
) {
  return "100" + standardIdentity + "10" + "00" + rootUnitEchelon + rootUnitIcon + "0000";
}

function addSide() {
  form.sides.push({
    name: "Side",
    standardIdentity: SID.Friend,
    units: [{ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121000" }],
  });
}

function addRootUnit(side: InitialSideData) {
  side.units.push({ rootUnitName: "HQ", rootUnitEchelon: "18", rootUnitIcon: "121000" });
}

function removeUnit(side: InitialSideData, unit: RootUnit) {
  const idx = side.units.indexOf(unit);
  if (idx >= 0) side.units.splice(idx, 1);
}
</script>
