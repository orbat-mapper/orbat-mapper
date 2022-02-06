import { MaybeRef } from "@vueuse/core";
import { computed, ref, unref, watch } from "vue";
import dayjs from "dayjs";

export function useDateElements({
  timestamp,
  isLocal,
  timeZone = "UTC",
}: {
  timestamp: number;
  isLocal: MaybeRef<boolean>;
  timeZone: string;
}) {
  const date = ref("");
  const hour = ref(12);
  const minute = ref(0);

  const inputDateTime = computed(() => {
    return unref(isLocal)
      ? dayjs.utc(unref(timestamp)).tz(unref(timeZone))
      : dayjs.utc(unref(timestamp));
  });
  watch(
    inputDateTime,
    (v) => {
      date.value = v.format().split("T")[0];
      hour.value = v.hour();
      minute.value = v.minute();
    },
    { immediate: true }
  );

  const resDateTime = computed(() => {
    try {
      if (unref(isLocal))
        return dayjs.tz(`${date.value} ${hour.value}:${minute.value}`, unref(timeZone));
      return dayjs.utc(`${date.value} ${hour.value}:${minute.value}`);
    } catch (e) {
      return dayjs(0);
    }
  });
  return { date, hour, minute, resDateTime };
}
