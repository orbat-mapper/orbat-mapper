<template>
  <div class="w-full space-y-4 p-1 pb-8">
    <p>Convert from and to legacy letter based symbol identification codes</p>
    <div class="grid grid-cols-4 content-center items-center gap-8">
      <p class="col-span-3">
        <InputGroup
          label="Letter based SIDC"
          v-model="letterSidcInput"
          ref="letterTarget"
          id="letterSIDC"
        />
      </p>
      <MilSymbol :sidc="letterSidc" :size="30" />
      <p class="col-span-3">
        <InputGroup
          label="Number based SIDC"
          v-model="numberSidcInput"
          class=""
          ref="numberTarget"
        />
      </p>
      <MilSymbol :sidc="numberSidc" :size="30" />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { onMounted, ref, watch } from "vue";
import { useFocusWithin } from "@vueuse/core";
import MilSymbol from "@/components/MilSymbol.vue";
import {
  convertLetterSidc2NumberSidc,
  convertNumberSidc2LetterSidc,
} from "@orbat-mapper/convert-symbology";

const letterTarget = ref(null);
const numberTarget = ref(null);
const { focused: letterFocused } = useFocusWithin(letterTarget);
const { focused: numberFocused } = useFocusWithin(numberTarget);

const letterSidcInput = ref("SFGPUCRH----");
const numberSidcInput = ref("");

const letterSidc = ref("");
const numberSidc = ref("");

watch(
  letterSidcInput,
  (v) => {
    if (letterFocused.value || !numberFocused.value) {
      numberSidc.value = convertLetterSidc2NumberSidc(v).sidc || "Unknown value";
      numberSidcInput.value = numberSidc.value;
      letterSidc.value = v;
    }
  },
  { immediate: true }
);

watch(numberSidcInput, (v) => {
  if (numberFocused.value) {
    letterSidc.value = convertNumberSidc2LetterSidc(v).sidc || "Unknown value";
    letterSidcInput.value = letterSidc.value;
    numberSidc.value = v;
  }
});

onMounted(() => document.getElementById("letterSIDC")?.focus());
</script>
