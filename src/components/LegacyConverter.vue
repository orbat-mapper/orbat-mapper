<template>
  <div class="w-full space-y-4 p-1 pb-8">
    <p>Convert legacy letter based symbol identification codes</p>
    <div class="grid grid-cols-4 content-center items-center gap-8">
      <p class="col-span-3">
        <InputGroup label="Letter based SIDC" v-model="letterSidc" class="" />
      </p>
      <MilSymbol :sidc="letterSidc" :size="30" />

      <InputGroupTemplate label="Number based SIDC" class="col-span-3">
        <div class="flex w-full items-center">
          {{ numberSidc }}
        </div>
      </InputGroupTemplate>
      <MilSymbol :sidc="numberSidc" :size="30" />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref } from "vue";
import { convertLetterSIDC2NumberSIDC } from "@/symbology/legacy";
import MilSymbol from "@/components/MilSymbol.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";

const letterSidc = ref("SFGPUCRH----");
const numberSidc = computed(() => {
  const c = convertLetterSIDC2NumberSIDC(letterSidc.value);
  return c || "Unknown symbol";
});
</script>
