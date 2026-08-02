/**
 * Standard-identity colours, resolved from milsymbol's own colour modes.
 *
 * These exist so that things which are *not* milsymbol symbols — control measures,
 * first — can be coloured by identity from the same source as the unit symbols, and
 * so this project's Custom 1 / Custom 2 identities resolve for free rather than being
 * re-encoded per consumer. The identity-to-affiliation resolution is shared with
 * `symbolGenerator` via `resolveStandardIdentity`.
 */
import ms from "milsymbol";
import {
  type MilsymbolAffiliation,
  resolveStandardIdentity,
} from "@/symbology/milsymbwrapper";
import { SID, type SidValue } from "@/symbology/values";

/**
 * milsymbol 3.x ships no colour mode literally named "Saturated". Its saturated
 * affiliation tier — the full-strength 2525 affiliation hues, as opposed to the
 * pastel `Light` tier used for symbol *fills* — is `Medium`.
 *
 * This is the tier to use for strokes: a `Light` stroke is unreadable on a basemap.
 */
export const SATURATED_COLOR_MODE = "Medium";

/** Used when a colour mode has no usable value for the resolved affiliation. */
const FALLBACK_COLOR = "#000000";

type MilsymbolColorMode = Partial<Record<MilsymbolAffiliation, string | false>>;

/**
 * The colour for a standard identity.
 *
 * `sid` is a standard-identity digit (`SID` in `@/symbology/values`); anything
 * unrecognised, including `undefined`, resolves as Unknown. `colorModeName` is a
 * milsymbol colour-mode name and defaults to the saturated tier.
 */
export function identityColor(
  sid: SidValue | string | undefined,
  colorModeName: string = SATURATED_COLOR_MODE,
): string {
  const { affiliation, color } = resolveStandardIdentity(sid ?? SID.Pending);
  if (color !== undefined) return color;
  const colorMode = ms.getColorMode(colorModeName) as MilsymbolColorMode | undefined;
  const resolved = colorMode?.[affiliation];
  return typeof resolved === "string" ? resolved : FALLBACK_COLOR;
}
