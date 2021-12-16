<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
  >
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
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

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { InboxIcon } from "@heroicons/vue/outline";
import { XIcon } from "@heroicons/vue/solid";
import NotificationItem from "./NotificationItem.vue";
import { useNotifications } from "../composables/notifications";

export default defineComponent({
  name: "AppNotifications",
  components: {
    NotificationItem,
    InboxIcon,
    XIcon,
  },
  setup() {
    const { notifications, deleteNotification } = useNotifications();

    return {
      notificationsReversed: computed(() => [...notifications.value].reverse()),
      deleteNotification,
    };
  },
});
</script>
