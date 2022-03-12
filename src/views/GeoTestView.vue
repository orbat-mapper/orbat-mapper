<script setup lang="ts">
import MapContainer from "../components/MapContainer.vue";
</script>

<template>
  <div class="flex h-screen w-screen">
    <aside class="h-full w-96 flex-none bg-gray-50 p-4">
      <div class="border-b border-gray-200 pb-5">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Geo tests</h3>
      </div>
    </aside>
    <main class="flex-auto bg-green-100">
      <MapContainer></MapContainer>
    </main>
  </div>
</template>
