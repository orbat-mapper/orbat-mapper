import { ref, computed } from "vue";

export interface FloatingWindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  zIndex: number;
}

const windows = ref<Map<string, FloatingWindowState>>(new Map());
let nextZIndex = 1000;

export function useFloatingWindows() {
  const windowList = computed(() => Array.from(windows.value.values()));

  function createWindow(
    id: string,
    title: string,
    options: Partial<FloatingWindowState> = {},
  ) {
    const newWindow: FloatingWindowState = {
      id,
      title,
      x: options.x ?? 50,
      y: options.y ?? 50,
      width: options.width ?? 400,
      height: options.height ?? 300,
      isMinimized: options.isMinimized ?? false,
      zIndex: nextZIndex++,
    };
    windows.value.set(id, newWindow);
    return newWindow;
  }

  function removeWindow(id: string) {
    windows.value.delete(id);
  }

  function updateWindow(
    id: string,
    updates: Partial<Omit<FloatingWindowState, "id">>,
  ) {
    const window = windows.value.get(id);
    if (window) {
      Object.assign(window, updates);
    }
  }

  function bringToFront(id: string) {
    const window = windows.value.get(id);
    if (window) {
      window.zIndex = nextZIndex++;
    }
  }

  function toggleMinimize(id: string) {
    const window = windows.value.get(id);
    if (window) {
      window.isMinimized = !window.isMinimized;
    }
  }

  function getWindow(id: string) {
    return windows.value.get(id);
  }

  function minimizeAll() {
    windows.value.forEach((w) => {
      w.isMinimized = true;
    });
  }

  function restoreAll() {
    windows.value.forEach((w) => {
      w.isMinimized = false;
    });
  }

  return {
    windows: windowList,
    createWindow,
    removeWindow,
    updateWindow,
    bringToFront,
    toggleMinimize,
    getWindow,
    minimizeAll,
    restoreAll,
  };
}
