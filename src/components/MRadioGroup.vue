<script setup lang="ts">
import { provide } from "vue";
import { nanoid } from "@/utils";

provide("radioGroupName", nanoid(5));
</script>
<template>
  <div><slot /></div>
</template>
