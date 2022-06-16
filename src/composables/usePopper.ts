// Copied from headlessui
// https://github.com/tailwindlabs/headlessui/blob/452b2c2852950cd846fe58e49ad432bb160e6e66/packages/%40headlessui-vue/examples/src/playground-utils/hooks/use-popper.js
// Copyright (c) 2020 Tailwind Labs

import { onMounted, ref, VNode, watchEffect } from "vue";
import { createPopper } from "@popperjs/core";

export function usePopper(options: any) {
  let reference = ref<VNode | null>(null);
  let popper = ref<VNode | null>(null);

  onMounted(() => {
    watchEffect((onInvalidate) => {
      if (!popper.value) return;
      if (!reference.value) return;
      let popperEl = popper.value.el || popper.value;
      let referenceEl = reference.value.el || reference.value;

      if (!(referenceEl instanceof HTMLElement)) return;
      if (!(popperEl instanceof HTMLElement)) return;

      let { destroy } = createPopper(referenceEl, popperEl, options);

      onInvalidate(destroy);
    });
  });

  return [reference, popper];
}
