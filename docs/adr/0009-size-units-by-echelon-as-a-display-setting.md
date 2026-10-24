# Size units by echelon as a display setting

Units can be drawn at a size that follows their echelon, so a brigade reads larger than its battalions and a company smaller, as staff once did with stencils on a paper trace. The idea and the ratios come from tactrace's ADR-0063. Here it is a device-wide display preference, switched on from the Labs popover while it is experimental, not scenario data, because the scenario format is frozen for now and the map symbol size it scales is already a device preference.

- **One ratio per echelon, the map symbol size as a Battalion.** A unit draws at its echelon's ratio of the map symbol size, never below 12 px. The seed ratios are tactrace's, so a scenario looks alike in both apps: Team at 0.6, Brigade at 1.27, Command at 2. Equipment, installations and other symbol sets without an echelon take the "No echelon" row.
- **A unit's own size wins.** A unit with a map symbol size of its own keeps it. Only units without one follow their echelon, so the existing override is the Custom size source and no per-unit flag is needed.
- **Resolved when the map is drawn.** The size is worked out from the SIDC the unit has at the current scenario time, so a unit whose echelon changes over time changes size on playback, and there is no stored size to keep in step with the table.
- **Off by default,** so existing scenarios look unchanged until a user switches it on.

Considered and not taken: storing the table in the scenario (it would travel with a shared scenario, but changes the format; the same table type and resolver can move there later), a per-unit size source flag as in tactrace (repeats what the override already means), and sizing by depth in the ORBAT tree (disagrees with the symbol's own echelon marking when levels are mixed).

KML export does not follow map symbol sizes today, neither the per-unit override nor this setting.
