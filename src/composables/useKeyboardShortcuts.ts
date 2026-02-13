import { onMounted, onUnmounted, ref } from "vue";

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: (e: KeyboardEvent) => void;
};

const shortcuts = ref<Map<string, KeyboardShortcut>>(new Map());

export function useKeyboardShortcuts() {
  function addShortcut(id: string, shortcut: KeyboardShortcut): void {
    shortcuts.value.set(id, shortcut);
  }

  function removeShortcut(id: string): void {
    shortcuts.value.delete(id);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    shortcuts.value.forEach((shortcut) => {
      const matchKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchCtrl = (shortcut.ctrl ?? false) === event.ctrlKey;
      const matchShift = (shortcut.shift ?? false) === event.shiftKey;
      const matchAlt = (shortcut.alt ?? false) === event.altKey;
      const matchMeta = (shortcut.meta ?? false) === (event.metaKey || event.ctrlKey);

      if (matchKey && matchCtrl && matchShift && matchAlt && matchMeta) {
        event.preventDefault();
        shortcut.callback(event);
      }
    });
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return {
    addShortcut,
    removeShortcut,
    shortcuts: shortcuts.value,
  };
}

// Shortcuts pré-configurados
export const DEFAULT_SHORTCUTS = {
  UNDO: { key: "z", ctrl: true },
  REDO: { key: "z", ctrl: true, shift: true },
  DRAW: { key: "d", ctrl: true },
  MEASURE: { key: "m", ctrl: true },
  SELECT: { key: "s", ctrl: true },
  ESCAPE: { key: "Escape" },
};
