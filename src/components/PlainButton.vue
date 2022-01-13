<template>
  <BaseButton small>
    <slot />
  </BaseButton>
</template>

<script>
import BaseButton from "./BaseButton.vue";

export default {
  name: "PlainButton",
  components: { BaseButton },
};
</script>

<style scoped></style>
