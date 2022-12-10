<script lang="ts">
import { defineComponent, h } from "vue";

import ms from "milsymbol";

export default defineComponent({
  name: "MilSymbol",
  props: {
    sidc: { type: String },
    size: {
      type: Number,
      default: 32,
    },
    modifiers: {
      type: Object,
    },
  },

  setup(props) {
    const symb = new ms.Symbol(props.sidc || "", {
      size: props.size,
      simpleStatusModifier: true,
      outlineColor: "white",
      outlineWidth: 8,
      ...(props.modifiers ?? {}),
    });
    return () =>
      h("span", {
        class: "milsymbol",
        innerHTML: symb.asSVG(),
      });
  },
});
</script>
