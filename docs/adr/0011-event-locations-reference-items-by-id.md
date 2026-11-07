# Event locations reference units and map items by ID

A scenario event's location (`where`) can point at existing units, features and control measures by ID, through a new `{ type: "items", units?, features? }` variant beside the existing `"units"` and `"geometry"` ones. The camera then frames those items as they are at the event's time, so the location stays right when a unit's track or a control measure's shape is edited later. Authors usually describe an event by what is already on the map ("2 Mech Bn crosses PL BLUE"), so one mixed variant frames units and items together in a single camera move.

- **Older builds keep working.** A selection of units only is still saved as `"units"`, which every build understands; `"items"` is written only when features are involved. Builds without `"items"` support ignore the variant and leave the camera where it is.
- **Missing IDs are skipped, not pruned.** Deleting a unit or a map item does not edit events that reference it. The camera frames whatever still resolves, and the editor shows the rest as missing so the author can remove them. This keeps deletes local to their own store, and it covers recipient exports, which keep events but can leave the referenced units and layers out.
- **Items hidden at the event's time are still framed.** The author picked them on purpose. Units with no position at that time are skipped, because they have nothing to frame.

Considered and not taken: copying the item's shape into a `"geometry"` location (no format change, but the location goes stale when the item moves; kept as an explicit "copy shape" action instead), and a separate `"features"` variant (would need two camera moves, or a second list on `"units"`, to frame a unit together with the line it crosses).
