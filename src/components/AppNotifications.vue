<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
  >
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <NotificationItem
        v-for="({ title, message, duration, id, type }, idx) in notificationsReversed"
        :key="id"
        :title="title"
        :message="message"
        :duration="duration"
        @close="deleteNotification(id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NotificationItem from "./NotificationItem.vue";
import { useNotifications } from "@/composables/notifications";

const { notifications, deleteNotification } = useNotifications();

const notificationsReversed = computed(() => [...notifications.value].reverse());
</script>
