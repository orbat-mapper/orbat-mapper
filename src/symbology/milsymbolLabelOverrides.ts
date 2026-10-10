// Ported from tactrace.
import ms from "milsymbol";

/** Milsymbol 3.0.4 omits T1 for General Action Point. Extending its label table
 *  makes the editable lower-interior slot render alongside H1 everywhere.
 *
 *  Kept in its own module, imported for effect by the milsymbol entry points
 *  that actually build symbols, so the amplifier metadata tables stay pure data
 *  — importing `pointTextAmplifiers` must not drag milsymbol into a chunk that
 *  only wanted a field table. */
const labelExtensions = ms as typeof ms & {
  // Present at runtime, absent from milsymbol's typings.
  addLabelOverrides(
    extend: (labels: Record<string, Record<string, unknown>>) => void,
    type: "number",
  ): void;
};

labelExtensions.addLabelOverrides((labels) => {
  labels["130100"] = {
    ...labels["130100"],
    uniqueDesignation1: {
      stroke: false,
      textanchor: "middle",
      x: 100,
      y: 30,
      fontsize: 30,
    },
  };
}, "number");
