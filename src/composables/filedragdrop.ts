/*
Based on https://github.com/vueuse/vueuse/blob/main/packages/core/useDropZone/index.ts
and https://github.com/vueuse/vueuse/issues/2057#issuecomment-1215027426


 */
import { isClient, MaybeRefOrGetter, useEventListener } from "@vueuse/core";
import { ref, type Ref } from "vue";

export interface UseFileDropZoneReturn {
  isOverDropZone: Ref<boolean>;
}

function hasFiles(dataTransfer: DataTransfer): boolean {
  return (
    dataTransfer.items &&
    Array.from(dataTransfer.items).some((item) => item.kind === "file")
  );
}

export function useFileDropZone(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  onDrop?: (files: File[] | null) => void,
): UseFileDropZoneReturn {
  const isOverDropZone = ref(false);
  let counter = 0;

  if (isClient) {
    useEventListener<DragEvent>(target, "dragenter", (event) => {
      event.preventDefault();
      counter += 1;
      isOverDropZone.value = event.dataTransfer ? hasFiles(event.dataTransfer) : false;
    });
    useEventListener<DragEvent>(target, "dragover", (event) => {
      event.preventDefault();
    });
    useEventListener<DragEvent>(target, "dragleave", (event) => {
      event.preventDefault();
      counter -= 1;
      if (counter === 0) isOverDropZone.value = false;
    });
    useEventListener<DragEvent>(target, "drop", (event) => {
      event.preventDefault();
      if (isOverDropZone.value === false) return;
      counter = 0;
      isOverDropZone.value = false;
      const files = Array.from(event.dataTransfer?.files ?? []);
      onDrop?.(files.length === 0 ? null : files);
    });
  }

  return {
    isOverDropZone,
  };
}
