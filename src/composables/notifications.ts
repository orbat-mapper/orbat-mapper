import { ref } from "vue";
import { nanoid } from "nanoid";

export interface UiNotification {
  id: string;
  title?: string;
  message?: string;
  duration?: number;
  type?: string;
}

const notifications = ref<UiNotification[]>([]);

export function useNotifications() {
  function send(notification: Partial<UiNotification>) {
    notifications.value.push({ id: nanoid(), ...notification });
  }

  function clear() {
    notifications.value = [];
  }

  function deleteNotification(id: string) {
    const index = notifications.value.findIndex((e) => e.id === id);
    if (index < 0) return;

    //     const { onClose } = n.options;
    // onClose && onClose(n);
    notifications.value.splice(index, 1);
  }

  return { notifications, send, clear, deleteNotification };
}
