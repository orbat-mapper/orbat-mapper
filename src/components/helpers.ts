import { nextTick, onBeforeUpdate, onMounted, Ref } from "vue";
import { nanoid } from "nanoid";
import { promiseTimeout } from "@vueuse/core";

export function useExpandTree(isOpen?: Ref<boolean>) {
  let itemRefs: any[] = [];

  const expandChildren = async () => {
    if (isOpen) isOpen.value = true;
    await nextTick();
    if (itemRefs) itemRefs.forEach((i) => i.expandChildren());
  };

  const setItemRef = (el: any) => {
    if (el) itemRefs.push(el);
  };

  onBeforeUpdate(() => {
    itemRefs = [];
  });

  return { expandChildren, setItemRef };
}

export function inputEventFilter(event: Event) {
  return !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName);
}

export function setCharAt(str: string, index: number, chr: string) {
  if (index > str.length - 1) {
    return str;
  }
  return str.substr(0, index) + chr + str.substr(index + 1);
}

export function useFocusOnMount(id?: string, delay = 0) {
  const focusId = id || nanoid();
  onMounted(async () => {
    if (delay) await promiseTimeout(delay);
    const inputElement = document.getElementById(focusId);
    await nextTick();
    inputElement && inputElement.focus();
  });
  return { focusId };
}

// Copied from https://github.com/vueuse/vueuse/blob/main/packages/core/onStartTyping/index.ts
export const isTypedCharValid = ({
  keyCode,
  metaKey,
  ctrlKey,
  altKey,
}: KeyboardEvent) => {
  if (metaKey || ctrlKey || altKey) return false;

  // 0...9
  if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) return true;

  // a...z
  if (keyCode >= 65 && keyCode <= 90) return true;

  // All other keys.
  return false;
};
