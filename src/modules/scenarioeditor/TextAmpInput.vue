<template>
  <Input v-model="model" type="text" />
</template>
<script setup lang="ts">
import { Input } from "@/components/ui/input";

const model = defineModel<string>();
</script>
