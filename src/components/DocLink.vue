<template>
  <Button as-child variant="link"
    ><a target="_blank" class=""> <slot>Help</slot> &nearr;</a></Button
  >
</template>
<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>
