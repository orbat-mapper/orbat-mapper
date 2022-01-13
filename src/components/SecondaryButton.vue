<template>
  <BaseButton secondary small>
    <slot />
  </BaseButton>
</template>

<script>
import BaseButton from "./BaseButton.vue";

export default {
  name: "SecondaryButton",
  components: { BaseButton },
};
</script>
