import { onMounted, onUnmounted, ref, type Ref } from "vue";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { containsFiles, getFiles } from "@atlaskit/pragmatic-drag-and-drop/external/file";

export interface UseFileDropZoneReturn {
  isOverDropZone: Ref<boolean>;
}

export function useFileDropZone(
  target: Ref<HTMLElement | null | undefined>,
  onDropHandler?: (files: File[] | null) => void,
): UseFileDropZoneReturn {
  const isOverDropZone = ref(false);

  let cleanup: () => void;
  onMounted(() => {
    if (!target.value) return;
    cleanup = dropTargetForExternal({
      element: target.value,
      canDrop: containsFiles,
      onDragEnter: () => (isOverDropZone.value = true),
      onDragLeave: () => (isOverDropZone.value = false),
      onDrop({ source }) {
        const files: File[] = getFiles({ source });
        isOverDropZone.value = false;
        onDropHandler?.(files.length === 0 ? null : files);
      },
    });
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    isOverDropZone,
  };
}
