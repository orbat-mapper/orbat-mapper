<script lang="ts">
import { defineComponent, h } from "vue";

import { symbolGenerator } from "@/symbology/milsymbwrapper";

export default defineComponent({
  name: "MilSymbol",
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

  render() {
    const symb = symbolGenerator(this.sidc || "", {
      size: this.size,
      simpleStatusModifier: true,
      ...(this.modifiers ?? {}),
    });
    return h("span", {
      class: "milsymbol",
      innerHTML: symb.asSVG(),
    });
  },
});
</script>
