<template>
  <div class="min-h-full">
    <div class="py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">Test components</h1>
        </div>
      </header>
      <main class="mt-4">
        <div class="mx-auto max-w-7xl space-y-4 sm:px-6 lg:px-8">
          <section class="space-y-4">
            <h3 class="border-b text-lg">Basic button</h3>
            <p class="flex items-start space-x-2">
              <BaseButton small>Basic small</BaseButton>
              <BaseButton>Basic default</BaseButton>
              <BaseButton large>Basic large</BaseButton>
              <BaseButton huge>Basic huge</BaseButton>
            </p>
            <p class="flex items-start space-x-2">
              <BaseButton primary small>Primary small</BaseButton>
              <BaseButton primary>Primary default</BaseButton>
              <BaseButton primary large>Primary large</BaseButton>
              <BaseButton primary huge>Primary huge</BaseButton>
            </p>
            <p class="flex items-start space-x-2">
              <BaseButton secondary small>Secondary small</BaseButton>
              <BaseButton secondary>Secondary default</BaseButton>
              <BaseButton secondary large>Secondary large</BaseButton>
              <BaseButton secondary huge>Secondary huge</BaseButton>
            </p>
          </section>
          <section class="space-y-4">
            <h3 class="border-b text-lg">Input groups</h3>
            <div class="grid grid-cols-3 gap-4">
              <InputGroup type="number" label="Label" description="Description" />
              <NumberInputGroup
                v-model="num"
                :max="10"
                :min="-3"
                label="Label"
                description="Description"
              />
            </div>
          </section>

          <section>
            <FormCard label="Label" description="A description">
              <InputGroup label="Label"></InputGroup>
              <InputGroup label="Label"></InputGroup>
            </FormCard>
          </section>
          <section>
            <div class="grid grid-cols-2 gap-4">
              <SimpleCombo label="A label" v-model="v" :values="values" />
              <p>{{ v }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <SimpleCombo label="A label" v-model="v2" :items="items" />
              <p>{{ v2 }}</p>
            </div>
          </section>
          <section>
            <ToggleField v-model="toggle">Test</ToggleField>
          </section>

          <section>
            <h3 class="border-b text-lg">Filters</h3>
            <div class="flex justify-end">
              <CheckboxDropdown :options="items" v-model="sel">Test</CheckboxDropdown>
            </div>
          </section>

          <section>
            <h3 class="border-b text-lg">Accordion panels</h3>

            <div class="grid grid-cols-3 gap-6">
              <AccordionPanel label="Accordion title"> Accordion content </AccordionPanel>
              <AccordionPanel label="Accordion with right slot">
                <template #right>
                  <Earth class="h-5 w-5" />
                </template>
                Accordion content
              </AccordionPanel>
              <AccordionPanel>
                <template #label
                  ><span class="text-red-900">Custom label slot</span></template
                >

                Accordion content
              </AccordionPanel>
            </div>
          </section>
          <section>
            <h3 class="border-b text-lg">Chevron panel</h3>
            <div class="grid grid-cols-3 gap-6">
              <ChevronPanel label="Chevron title">Panel content</ChevronPanel>
            </div>
          </section>

          <section>
            <h3 class="border-b text-lg">Settings panel</h3>
            <div class="grid gap-6 px-4 sm:grid-cols-3">
              <SettingsPanel label="Settings panel title">
                <template #right="{ open }">sdf {{ open }}</template>
                Panel content is
              </SettingsPanel>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "@/components/BaseButton.vue";
import FormCard from "@/components/FormCard.vue";
import { ref } from "vue";
import { Earth } from "mdue";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import InputGroup from "@/components/InputGroup.vue";
import SimpleCombo from "@/components/SimpleCombo.vue";
import AccordionPanel from "@/components/AccordionPanel.vue";
import ChevronPanel from "@/components/ChevronPanel.vue";
import SettingsPanel from "@/components/SettingsPanel.vue";
import ToggleField from "@/components/ToggleField.vue";
import CheckboxDropdown from "@/components/CheckboxDropdown.vue";

const num = ref(1);
const v = ref("Test");
const v2 = ref(1);
const values = ["Hello", "Test", "Another"];
const items = [
  { label: "Hello", value: 1 },
  { label: "Test", value: 2 },
  { label: "Another", value: 3 },
];

const sel = ref([]);

const toggle = ref(true);
</script>
