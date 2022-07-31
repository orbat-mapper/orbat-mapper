<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed } from "vue";
import { formatDateString } from "@/geo/utils";

const {
  store,
  time: { timeZone, setCurrentTime },
} = injectStrict(activeScenarioKey);

const events = computed(() => store.state.mergedEvents);
const t = computed(() => store.state.currentTime);
</script>
<template>
  <div class="px-6">
    <h2 class="font-medium text-gray-900">Scenario events</h2>

    <div class="flow-root">
      <ul class="mt-4">
        <li v-for="(event, eventIdx) in events" :key="event.id">
          <div class="relative pb-4">
            <span
              v-if="eventIdx !== events.length - 1"
              class="absolute top-2 left-2 -ml-px h-full w-0.5 bg-gray-200"
              aria-hidden="true"
            />
            <div class="relative flex space-x-4">
              <button
                @click="setCurrentTime(event.startTime)"
                class="mt-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white"
                :class="{
                  'bg-amber-500': event.startTime > t,
                  'bg-gray-300': event.startTime < t,
                  'bg-red-900': event.startTime === t,
                }"
              ></button>
              <div class="min-w-0 flex-1 text-sm">
                <p class="text-xs font-medium text-red-900">
                  {{ formatDateString(event.startTime, timeZone).split("T")[0] }}
                </p>
                <p class="font-medium">{{ event.title }}</p>
                <p v-if="event.subTitle" class="text-gray-700">{{ event.subTitle }}</p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
