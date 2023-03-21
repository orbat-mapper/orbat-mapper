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
  },

  setup(props) {
    const settings = useSymbolSettingsStore();
    const symb = computed(() =>
      symbolGenerator(props.sidc || "", {
        size: props.size,
        ...settings.symbolOptions,
        ...(props.modifiers ?? {}),
      })
    );
    return () =>
      h("span", {
        class: "milsymbol",
        innerHTML: symb.value.asSVG(),
      });
  },
});
</script>
