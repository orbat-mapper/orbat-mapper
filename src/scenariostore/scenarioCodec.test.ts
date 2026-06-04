import { describe, expect, it } from "vitest";
import {
  type ResourceNameToIdMaps,
  type ResourceResolvers,
  unitResourcesToInternal,
  unitStateToExternal,
  unitStateToInternal,
} from "./scenarioCodec";
import type { ScenarioState } from "./newScenarioStore";
import type { State, Unit } from "@/types/scenarioModels";

// The codec is the single home for the unit-state external⇄internal mapping. These tests
// pin the round-trip invariant: external --toInternal--> internal --toExternal--> external
// must return the same names, counts and onHand values for update/diff toe groups + status.

const nameToId: ResourceNameToIdMaps = {
  equipment: { Rifle: "eq-1", Radio: "eq-2" },
  personnel: { Officer: "pe-1" },
  supplies: { Ammo: "su-1" },
};

// A minimal ScenarioState carrying only the lookup maps the reverse direction reads.
const scnState = {
  equipmentMap: {
    "eq-1": { id: "eq-1", name: "Rifle" },
    "eq-2": { id: "eq-2", name: "Radio" },
  },
  personnelMap: { "pe-1": { id: "pe-1", name: "Officer" } },
  supplyCategoryMap: { "su-1": { id: "su-1", name: "Ammo" } },
  unitStatusMap: { "st-1": { id: "st-1", name: "Dug in" } },
} as unknown as ScenarioState;

describe("ScenarioCodec unit-state round-trip", () => {
  it("translates update/diff names to ids on the way in", () => {
    const external: State = {
      id: "s1",
      t: 1000,
      update: {
        equipment: [{ name: "Rifle", count: 5, onHand: 3 }],
        personnel: [{ name: "Officer", count: 2 }],
      },
      diff: {
        supplies: [{ name: "Ammo", count: 100, onHand: 80 }],
      },
    };

    const internal = unitStateToInternal(external, nameToId);

    expect(internal.update?.equipment).toEqual([{ id: "eq-1", count: 5, onHand: 3 }]);
    expect(internal.update?.personnel).toEqual([{ id: "pe-1", count: 2 }]);
    expect(internal.diff?.supplies).toEqual([{ id: "su-1", count: 100, onHand: 80 }]);
  });

  it("round-trips update/diff toe groups back to the original external shape", () => {
    // The codec owns the toe name↔id mapping. (Status name↔id is the caller's job on the
    // way in, so it is exercised in the reverse-only test below, not here.)
    const external: State = {
      id: "s2",
      t: 2000,
      update: {
        equipment: [
          { name: "Rifle", count: 5, onHand: 3 },
          { name: "Radio", count: 1 },
        ],
        supplies: [{ name: "Ammo", count: 50 }],
      },
      diff: {
        personnel: [{ name: "Officer", count: -1 }],
      },
    };

    const roundTripped = unitStateToExternal(
      unitStateToInternal(external, nameToId),
      scnState,
    );

    // toStrictEqual (not toEqual) so an omitted toe kind cannot regress to an explicit
    // `{ supplies: undefined }` key — those compare equal under toEqual but not here.
    expect(roundTripped.update).toStrictEqual(external.update);
    expect(roundTripped.diff).toStrictEqual(external.diff);
    expect(roundTripped.id).toEqual(external.id);
    expect(roundTripped.t).toEqual(external.t);
  });

  it("reverses an internal status id back to its external name", () => {
    const internal = unitStateToInternal({ id: "s5", t: 5000 }, nameToId);
    internal.status = "st-1";
    expect(unitStateToExternal(internal, scnState).status).toEqual("Dug in");
  });

  it("preserves unknown names as a name↔name fallback in both directions", () => {
    // A toe entry whose name has no id mapping keeps the name as its id, and the reverse
    // lookup misses the map and falls back to that same string — so the round-trip is stable.
    const external: State = {
      id: "s3",
      t: 3000,
      update: { equipment: [{ name: "Unmapped widget", count: 7 }] },
    };

    const internal = unitStateToInternal(external, nameToId);
    expect(internal.update?.equipment).toEqual([{ id: "Unmapped widget", count: 7 }]);

    const roundTripped = unitStateToExternal(internal, scnState);
    expect(roundTripped.update).toStrictEqual(external.update);
  });

  it("leaves states without toe groups untouched", () => {
    const external: State = { id: "s4", t: 4000, location: [10, 20] };
    const internal = unitStateToInternal(external, nameToId);
    expect(internal.update).toBeUndefined();
    expect(internal.diff).toBeUndefined();
    expect(unitStateToExternal(internal, scnState)).toMatchObject({
      id: "s4",
      t: 4000,
      location: [10, 20],
    });
  });
});

describe("ScenarioCodec base-unit resources (unitResourcesToInternal)", () => {
  // Resolver that mirrors a simple name→id catalog, falling back to the name itself.
  const resolvers: ResourceResolvers = {
    equipment: (name) => nameToId.equipment[name] ?? name,
    personnel: (name) => nameToId.personnel[name] ?? name,
    supplies: (name) => nameToId.supplies[name] ?? name,
  };

  it("translates base equipment/personnel/supplies names to ids", () => {
    const unit: Pick<Unit, "equipment" | "personnel" | "supplies"> = {
      equipment: [{ name: "Rifle", count: 5 }],
      personnel: [{ name: "Officer", count: 2 }],
      supplies: [{ name: "Ammo", count: 100 }],
    };
    const internal = unitResourcesToInternal(unit, resolvers);
    expect(internal.equipment).toEqual([{ id: "eq-1", count: 5 }]);
    expect(internal.personnel).toEqual([{ id: "pe-1", count: 2 }]);
    expect(internal.supplies).toEqual([{ id: "su-1", count: 100 }]);
  });

  it("preserves onHand on base equipment and personnel (regression: fresh load dropped it)", () => {
    // prepareScenario used to build base equipment/personnel as { id, count }, silently
    // discarding onHand while supplies and the paste path kept it. Routing all three kinds
    // through this helper closes that gap.
    const unit: Pick<Unit, "equipment" | "personnel" | "supplies"> = {
      equipment: [{ name: "Rifle", count: 5, onHand: 3 }],
      personnel: [{ name: "Officer", count: 2, onHand: 1 }],
      supplies: [{ name: "Ammo", count: 100, onHand: 80 }],
    };
    const internal = unitResourcesToInternal(unit, resolvers);
    expect(internal.equipment).toEqual([{ id: "eq-1", count: 5, onHand: 3 }]);
    expect(internal.personnel).toEqual([{ id: "pe-1", count: 2, onHand: 1 }]);
    expect(internal.supplies).toEqual([{ id: "su-1", count: 100, onHand: 80 }]);
  });

  it("returns empty arrays for missing resource kinds and mints via the resolver", () => {
    const minted: string[] = [];
    const mintingResolvers: ResourceResolvers = {
      equipment: (name) => {
        minted.push(name);
        return `eq-${minted.length}`;
      },
      personnel: () => "unused",
      supplies: () => "unused",
    };
    const internal = unitResourcesToInternal(
      { equipment: [{ name: "New gear", count: 1 }] },
      mintingResolvers,
    );
    expect(internal.equipment).toEqual([{ id: "eq-1", count: 1 }]);
    expect(internal.personnel).toEqual([]);
    expect(internal.supplies).toEqual([]);
    expect(minted).toEqual(["New gear"]);
  });
});
