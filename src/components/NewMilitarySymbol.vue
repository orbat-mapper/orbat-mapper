<script lang="ts">
import { computed, defineComponent, h } from "vue";

import { symbolGenerator } from "@/symbology/milsymbwrapper";
import { useSymbolSettingsStore } from "@/stores/settingsStore";

export default defineComponent({
  name: "MilitarySymbol",
  props: {
    sidc: { type: String },
    size: {
      type: Number,
      default: 15,
    },
    modifiers: {
      type: Object,
    },
    options: {
      type: Object,
    },
  },

  setup(props) {
    const settings = useSymbolSettingsStore();
    const symb = computed(() =>
      symbolGenerator(props.sidc || "", {
        size: props.size,
        ...settings.symbolOptions,
        ...(props.options ?? {}),
        ...(props.modifiers ?? {}),
      }),
    );
    return () => {
      const node = symb.value.asDOM();
      return h(node.tagName, {
        class: "milsymbol",
        ...getAttributes(node),
        innerHTML: node.innerHTML,
      });
    };
  },
});

function getAttributes(node: Element) {
  return Array.from(node.attributes).reduce(
    (attrs, attr) => {
      attrs[attr.name] = attr.value;
      return attrs;
    },
    {} as Record<string, any>,
  );
}
</script>
