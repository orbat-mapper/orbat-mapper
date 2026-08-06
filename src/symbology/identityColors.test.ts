import { describe, expect, it } from "vitest";
import ms from "milsymbol";
import { SATURATED_COLOR_MODE, identityColor } from "@/symbology/identityColors";
import { resolveStandardIdentity, symbolGenerator } from "@/symbology/milsymbwrapper";
import { SID } from "@/symbology/values";

const saturated = ms.getColorMode(SATURATED_COLOR_MODE);

/** milsymbol's public typings do not expose the resolved sidc/style; the tests do. */
interface MilSymbolInternals {
  options: { sidc: string };
  style: Record<string, unknown>;
}

/** `.Friend` off a resolved milsymbol ColorMode. */
const friendOf = (colorMode: unknown) => (colorMode as Record<string, string>).Friend;

describe("SATURATED_COLOR_MODE", () => {
  it("names a colour mode milsymbol actually ships", () => {
    // milsymbol has no mode literally named "Saturated"; Medium is its saturated tier.
    expect(saturated.Friend).toBeTypeOf("string");
    expect(saturated.Hostile).toBeTypeOf("string");
  });
});

describe("identityColor", () => {
  it("resolves each standard identity from the saturated colour mode", () => {
    expect(identityColor(SID.Pending)).toBe(saturated.Unknown);
    expect(identityColor(SID.Unknown)).toBe(saturated.Unknown);
    expect(identityColor(SID.AssumedFriend)).toBe(saturated.Friend);
    expect(identityColor(SID.Friend)).toBe(saturated.Friend);
    expect(identityColor(SID.Neutral)).toBe(saturated.Neutral);
    expect(identityColor(SID.Suspect)).toBe(saturated.Suspect);
    expect(identityColor(SID.Hostile)).toBe(saturated.Hostile);
  });

  it("resolves Custom 1 to this project's authored colour, not a colour-mode entry", () => {
    expect(identityColor(SID.Custom1)).toBe("rgb(170, 176, 116)");
    expect(identityColor(SID.Custom1)).not.toBe(saturated.Friend);
  });

  it("resolves Custom 2 to the Hostile colour, mirroring how it renders", () => {
    expect(identityColor(SID.Custom2)).toBe(saturated.Hostile);
  });

  it("falls back to Unknown for undefined, unmapped and Custom 3", () => {
    expect(identityColor(undefined)).toBe(saturated.Unknown);
    expect(identityColor(SID.Custom3)).toBe(saturated.Unknown);
    expect(identityColor("not-a-sid")).toBe(saturated.Unknown);
  });

  it("honours an explicit colour mode", () => {
    expect(identityColor(SID.Hostile, "Light")).toBe(ms.getColorMode("Light").Hostile);
  });

  it("gives friend and hostile visibly different colours", () => {
    expect(identityColor(SID.Friend)).not.toBe(identityColor(SID.Hostile));
  });
});

describe("resolveStandardIdentity", () => {
  it("rewrites only the two custom identities", () => {
    expect(resolveStandardIdentity(SID.Custom1).drawnSid).toBe(SID.Friend);
    expect(resolveStandardIdentity(SID.Custom2).drawnSid).toBe(SID.Friend);
    for (const sid of ["0", "1", "2", "3", "4", "5", "6", "9", undefined]) {
      expect(resolveStandardIdentity(sid).drawnSid).toBeUndefined();
      expect(resolveStandardIdentity(sid).symbolOptions).toBeUndefined();
    }
  });

  it("still produces the same symbols symbolGenerator always produced", () => {
    // Custom 1/2 are drawn as Friend with a swapped colour mode.
    const custom1 = symbolGenerator(
      "10071000001211000000",
    ) as unknown as MilSymbolInternals;
    expect(custom1.options.sidc).toBe("10031000001211000000");
    expect(friendOf(custom1.style.colorMode)).toBe("rgb(170, 176, 116)");
    expect(friendOf(custom1.style.frameColor)).toBe("rgb(65, 70, 22)");
    expect(friendOf(custom1.style.iconColor)).toBe("rgb(65, 70, 22)");

    const custom2 = symbolGenerator(
      "10081000001211000000",
    ) as unknown as MilSymbolInternals;
    expect(custom2.options.sidc).toBe("10031000001211000000");
    expect(friendOf(custom2.style.colorMode)).toBe(ms.getColorMode("Light").Hostile);

    const friend = symbolGenerator(
      "10031000001211000000",
    ) as unknown as MilSymbolInternals;
    expect(friend.options.sidc).toBe("10031000001211000000");
    expect(friend.style.colorMode).toBe("Light");
  });

  it("lets caller options win over the identity overrides, as before", () => {
    const symbol = symbolGenerator("10071000001211000000", {
      size: 42,
    }) as unknown as MilSymbolInternals;
    expect(symbol.style.size).toBe(42);
    expect(friendOf(symbol.style.colorMode)).toBe("rgb(170, 176, 116)");
  });
});
