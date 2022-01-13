<template>
  <div class="min-h-full">
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">Test components</h1>
        </div>
      </header>
      <main class="mt-4">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
          <section class="space-y-4">
            <h3>Basic button</h3>
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
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import PrimaryButton from "../components/PrimaryButton.vue";
import BaseButton from "../components/BaseButton.vue";

export default {
  components: { BaseButton, PrimaryButton },
  setup() {
    return {};
  },
};
</script>
