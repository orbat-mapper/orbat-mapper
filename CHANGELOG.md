# Changelog

All notable changes to this project will be documented in this file.

## October 2026

### Added

- Added a Unit changes panel to the scenario timeline. Clicking a timeline bin lists the unit and map item changes behind it, and the Changes button (or `h`) lists the changes around the current time. The list view shows the changes in time order with a divider at the current time and links to the previous and next change. The lanes view shows one lane per unit or map item on a time axis in the scenario's time zone, with optional trips, and changes can be dragged to a new time. Box selecting in the lanes scrolls them when the pointer is held near the top or bottom edge, so changes outside the view can be selected. Changes can be filtered by kind, by name and to the current map view, over a window from ±1 hour to ±7 days. The panel floats over the map or docks below it, and its view, columns and sorting are remembered.
- Added new control measures: Bomb Area, Smoke, Series or Group of Targets, Lane, Ferry, Raft Site, Ford Easy, Ford Difficult, Unexploded Explosive Ordnance (UXO) Area, and the Interdict mission task.
- Added a unique designation (Field T) label to generic lines, polygons, rectangles, circles, sectors, and Classic Arrows.
- Added a Bézier smoothing style to generic lines, polygons, and Classic Arrows, where the control points shape the curve instead of lying on it.
- Added an arrowhead handle to Classic Arrows for adjusting the head length and width while editing. Alt+click the handle to restore the default size.
- MilX imports now bring in tactical graphics as control measures, with each MilX layer becoming a control-measure layer. Identity and planned status are kept, map.army free-format shapes are imported as generic graphics with their colours and text, and graphics without an equivalent are reported. Imported units also keep their direction and all text amplifiers.
- Added a choice of where imported MilX units get their positions: as the initial location, at the current scenario time, or at a scenario event.
- Added a terrain button to the map controls that turns 3D terrain and hillshading on or off together. Turning it on tilts a top-down map so the relief is visible, and turning it off levels the map again. The button turns amber when elevation data is unavailable.
- Added offline 3D terrain and hillshading from an elevation archive: a PMTiles archive of elevation tiles, such as an extract of Mapterhorn. Open it from the Terrain submenu, or by address from "Add map server" with the new "Elevation archive" checkbox. The archive replaces Mapterhorn while it is in use, and Chromium browsers can reopen it in the next session.
- A PMTiles archive of PNG or WebP tiles dropped on the map opens as a basemap and offers "Use for terrain", which moves it to elevation data and puts back the previous basemap. The drop message now lists every kind of file that the map accepts.
- Added range rings to the Layers panel. Range rings as a whole, each range ring group and the ungrouped rings can be shown or hidden there, and each group and the ungrouped rings open into a list of their rings, each with its own visibility toggle. Range ring groups can also be added and renamed there. Hiding all rings, a group or the ungrouped rings is saved with the scenario and does not change each ring's own visibility setting. Range rings draw in their place in the layer order and can be dragged among the feature and reference layers, or above the control measures.
- Added editing of many units at once in the unit details panel. With several units selected, setting the status, changing the symbol, removing from the map, editing text amplifiers and speeds, locking and removing TO&E items apply to every selected unit, skipping locked ones, and each change is a single undo step. Fields that differ between the units show "Mixed", and the header summarises the selection with a list for removing units from it.
- The map context menu marks the clicked spot with a target.
- Added an orbit mode to the map. "Orbit here" in the map context menu, or `o` for the middle of the screen, glides the camera to the spot and slowly circles it. While orbiting, clicking the map picks a new center, and zooming or tilting pauses the orbit until the gesture ends. Press `o` or Escape to stop.
- Added a Unit status category to the Select tab for selecting units by their status at the current scenario time. Each status is marked with its colour.
- Added a Narrow mode to the Select tab. With the Add/Narrow switch on Narrow, clicking a category keeps only the selected units in it, so selecting Land unit and then narrowing to a side gives that side's land units.
- Added a Zoom to button to the Select tab's footer, which fits the map to the selected units that have a location at the current scenario time.
- Changes dragged in the Unit changes lanes now snap to the changes on nearby lanes, scenario events and the current time, with a guide line across the lanes and the changes snapped to highlighted. Hold Alt to snap to the 5-minute grid only. Scenario events are shown as lines across the lanes, with markers on the time axis.

- Added Northern Storm 1985, an AI-generated demo scenario of a fictional NATO–Warsaw Pact war inspired by Red Storm Rising, made to test and showcase features.

### Changed

- Zooming or panning to a unit or location now centers it in the part of the map not covered by toolbars or an overlay details panel.
- The draw toolbar now puts control measures first. The pinned control measures are buttons on the toolbar instead of in a dropdown menu, an All… button opens the full control measure search, and the tools are captioned as Control measures, Shapes and Options. Up to five control measures are pinned, and the pins are reset from the control measure search. When the map is narrow, the toolbar shows fewer pins, and scroll buttons appear when the tools do not fit.
- The draw toolbar's Edit, Move, Duplicate and Delete tools now appear in a Selection group only while map items are selected, or while Edit or Move is on. Record feature geometry moved to Options. The palette button among the control measures styles the selected control measures, or the new ones when none are selected, and changes to a selection also apply to new control measures.
- The scale and the pointer location stay in the bottom-left corner of the map until they would run into a toolbar, and then move up just enough to clear it, including an open draw, track or measure toolbar.
- The Falklands example scenario now has range ring groups for its surface combatants, ship tracks that no longer cross land, and the sinking or damage of Ardent, Antelope, Coventry, Sir Galahad, Glamorgan and Santa Fe.
- Classic Arrow heads now keep the same size whatever the arrow's length, instead of growing with the line.
- Classic Arrows are now drawn from the tip: the first click places the arrowhead. Classic Arrows in existing scenarios are converted automatically when the scenario is opened.
- Adding many control measures at once, such as when opening a large scenario, is much faster.
- Right-to-left labels on the map (such as Arabic and Hebrew) are now drawn by MapLibre itself instead of the separate RTL text plugin, so nothing extra is downloaded for them. Labels in complex scripts such as Devanagari and Khmer are now also drawn correctly.
- Playback and timeline scrubbing are much smoother in large scenarios. Only units and features that change are redrawn, moving units are updated separately from stationary ones, and range ring groups only merge the rings that overlap.
- Playback speed is now set as scenario time per real second, so playback runs at the same pace whatever the frame rate. The default is 15 hours per second, and the playback menu shows the current speed.
- Dragging units on the map is smoother, since only the dragged units are redrawn while dragging.
- Range rings now follow the zoom visibility range of their unit, and grouped range rings with different zoom ranges still merge into one shape.
- Units on the map are now clicked and hovered on their symbol only, instead of anywhere within their text amplifiers. When units overlap, the closest one is picked.
- 3D terrain and hillshading are no longer experimental. Their settings have moved from the Labs menu to a Terrain submenu in the map context menu and in the main menu under View, and they are now remembered between visits.
- The standalone file no longer reads elevation data from Mapterhorn by itself. The terrain button offers a choice between Mapterhorn online and an elevation archive, and the choice is remembered.
- Opening the Layers panel no longer reveals every time-hidden layer and item. A "Show time-hidden items" switch does that instead. Control measures are listed with a preview of their symbol, layer actions appear when hovering a row so names get the full width, and items hidden with the eye toggle are dimmed.
- Hovering an item in the Layers panel now shows a zoom button next to the visibility toggle.
- Zooming to items, layers, units and search results now leaves a margin around the target and keeps it clear of the map header, toolbars, the floating details panel and the map controls.
- Reworked the Select tab's categories. Status is now Symbol status, and headquarters, task force and dummy indicators have their own category. The categories are reordered, starting with Side, Main unit icon and Command level. Categories that can't narrow the selection, such as one where every unit shares the same value, are hidden, and rows with no units are dimmed. Map visibility rows have their own icons, and Main unit icon has an "Expand all" / "Collapse all" button.
- Moved the Select tab between Layers and Settings.
- The Select tab's mode switch, Invert and a new Clear button now stay at the top while scrolling, in place of the panel title. Excluded categories show as a line there with their own Clear, and the help text is shorter.
- The unit details header shows the unit's status next to its short name, and units without a short name get an "Add short name" field.
- The hide-on-map button has moved to the unit details toolbar. Locked units show a lock icon in the header that unlocks them, and multi-select gets a lock button in the toolbar.
- The unit details toolbar has tooltips, including why a button is disabled, and the unit symbol shows that it can be clicked to change it.

### Fixed

- Fixed changing a unit's symbol not updating the map, ORBAT, or details panel when the unit had no recorded state changes, which affected units imported or merged from other scenario files.
- Fixed clicking an empty spot on the map in move mode not clearing the selection.
- Fixed a dropped unit, or one that stops moving during playback, briefly disappearing from the map.
- Fixed the map context menu and rotate tool not recognising units that are moving during playback.
- Fixed unit labels blinking or barely showing on moving units during playback.
- Fixed the play button tooltip, which described the undo action.
- Fixed unit labels shown below the symbol covering the status bar or mobility indicator.
- Fixed plain `.milxly` files being detected as TSV instead of MilX, and restored the "keep dialog open" toggle in the import dialog.
- Fixed the Select tab's symbol categories using each unit's starting symbol, so units that later become damaged or destroyed were counted as present. They now use the symbol at the current scenario time.
- Fixed the symbol set rows under Symbol modifiers in the Select tab counting and selecting every unit in the symbol set instead of only those with a modifier.
- Fixed long category names in the Select tab running into the unit count.

## September 2026

### Removed

- Removed the legacy OpenLayers map mode. MapLibre is now the only map view, and old links to the legacy map open the MapLibre view instead.

### Added

- Added the option to replace existing feature and control-measure overlay layers during scenario import, matched by layer ID, or import them as separate copies. Replacement preserves layer order and previews added, changed, removed, and unchanged items. The whole import can be reverted with Undo.
- Added configurable MGRS and latitude/longitude reference grids to MapLibre mode, with adaptive line density and collision-managed labels.
- Added device-level grid preferences for interval, colour, opacity, and line width. Grid visibility remains session-only and starts hidden when a map is opened.
- Added experimental 3D terrain and hillshading to MapLibre mode, available from the Labs menu. Elevation data comes from Mapterhorn and requires a network connection. Terrain exaggeration, hillshade strength, light direction, anchoring, and colours are adjustable, and the pointer location readout shows the ground elevation under the cursor. Terrain and hillshading survive a basemap change, and georeferenced image exports are rendered without terrain.
- Added width grips for editing the arrow width at each vertex of supported control measures. Toggle them from the details panel while editing; the setting is kept between edits. Alt+click a grip to reset it, or use "Reset arrow widths" to clear all width adjustments.
- Added a choice of smoothing style (Rounded or Curve) for control measures that support more than one, such as main attack arrows. The chosen style is remembered as a drawing default.
- Added per-unit hiding on the map. Hide or show units from the unit details header, the ORBAT tree menu, or the Select tab, including "with subordinates" variants. Hiding a unit does not hide its subordinates. The flag is saved with the scenario, and hidden units are left out of map layers, range rings, unit tracks, and GeoJSON/KML exports. Hidden units are dimmed in the ORBAT tree.
- Added "Invert selection" and "Show all hidden" actions and "Visible on map" / "Hidden on map" categories to the Select tab.

### Changed

- Renamed the Filters tab to Select. Clicking a category adds its units to the selection and clicking it again removes them. Each row shows a selected/total count and a tooltip saying what the click will do.
- Moved the Select tab's Hide, Show, and Clear actions to a footer that appears while units are selected and shows how many selected units are hidden.

- Replaced the previous experimental MGRS overlay with the reusable reference-grid implementation and moved its controls into the main map toolbar.
- Reference-grid rendering is now loaded on demand the first time a grid is shown, reducing the initial MapLibre editor download.

### Fixed

- Fixed side duplication omitting units attached directly to a side, including sides without groups. Both duplicate actions now copy these units and their descendants, retaining unit state when requested.
- Fixed "Expand all icons" in the Select tab collapsing expanded sides and not toggling reliably. It now toggles only the icon nodes.

## August 2026

### Added

- Added control-measure authoring and editing in MapLibre mode. Choose from a searchable catalogue, draw measures with snapping, organize them in scenario layers, and edit their geometry from the map or details panel.
- Added control-measure styling and labels, including identity colours, line width, echelon, text amplifiers, and free-form text where supported. Defaults can be configured before drawing, with live previews.
- Added a smooth-resolution setting for supported control measures, available from a slider beside the smoothing toggle.
- Added GeoJSON import, export, clipboard, undo/redo, and scenario persistence support for control measures.
- Added styled KML/KMZ export for rendered control measures, including generated labels and text amplifiers. KMZ exports can keep labels native or embed them as images to preserve orientation, scaling, anchors, and typography.
- Added layer selection to partial scenario import and export, including control-measure layers and safe ID remapping when importing into an existing scenario.
- Added feature and control-measure duplication actions to the details panel and draw toolbar. Control-measure details now also show the doctrinal description for the selected measure.
- Added a reset-size action to the control-measure Style tab and draw palette, letting graphics restore their intended visual size for the current map zoom.

### Changed

- Newly drawn control measures now enter edit mode automatically. A selected control measure can also be edited by clicking it again.
- Duplicated graphics are offset by 24 screen pixels, receive an incrementing name, and become selected. A duplicated control measure enters edit mode immediately.
- Combined the scenario feature drawing tools and control-measure tools into compact split buttons that retain the most recently used tool.
- OpenLayers mode now shows a once-per-session notice that the legacy map is deprecated.

### Fixed

- Fixed selecting a scenario event in MapLibre mode not zooming the map to the event area.
- Fixed zooming to a circle feature so the view frames the full circle instead of only its centre point.
- Fixed MapLibre control measures being drawn beneath image layers instead of above them according to the scenario layer stack.
- Fixed duplicating a control measure after dragging a previous copy, which could create the next copy at an invalid position.

## July 2026

### Added

- Added unit track editing to MapLibre mode: drag waypoints and via points to move them, drag a midpoint handle on a leg to insert a via point, and alt-click a point to delete it. The track redraws while dragging.
- Added the unit track editing gestures to the keyboard shortcuts dialog.
- Added map context menu options for converting a waypoint into a via point and a via point into a waypoint. The new waypoint is timed from the average speed of the leg it sits on.
- Added offline basemap support: open a PMTiles basemap archive from your disk through the Layers panel, the map context menu, or drag and drop. MapLibre reads the file directly, so no tile server is needed. A style is generated for vector archives that carry no style, with five colour flavours.
- Added a standalone single-file build (`orbat-mapper-standalone-<version>.html`) that runs from `file://` with no web server. Both the standalone HTML and the `dist` zip are now attached to each GitHub release.
- Added basemaps by address, including `.pmtiles` URLs. The archive header is read before the layer is activated, so an unreachable address fails while the dialog is still open.
- Chromium browsers can reopen the basemap archive that was active in your last session. Other archives offer a row to restore or reselect.
- Added an offline use guide to the user documentation that describes the three deployment levels.

### Fixed

- Fixed freehand line and polygon drawing on touch devices in MapLibre mode.
- Fixed the ORBAT panel opening again when you select a unit on the map in desktop mode. A closed panel now stays closed. Search, the locate shortcut, and "Locate in ORBAT" still open the panel and show the unit in the tree.
- Fixed right-clicking a unit track in MapLibre edit mode, which inserted a via point and started dragging it instead of opening the context menu.
- Fixed symbol changes from unit events not showing in MapLibre mode, the ORBAT chart, unit search results, or the map context menus, which all drew the base unit symbol instead of the symbol at the current time.
- Fixed the long-press hit tolerance for track points in the map context menu, which used a 12px box on touch devices where every other touch gesture uses 26px.
- Fixed unit travel times for a zero average speed, which left the arrival time unchanged instead of applying the default speed.
- Fixed unit track editing in MapLibre mode, where dragging a waypoint or via point never committed the new position.
- Fixed the unit jumping to the edited waypoint in OpenLayers mode, and via points losing their leg times.

## June 2026

### Added

- Added a copy-to-clipboard button to the MapLibre image export panel for copying the rendered map straight to the clipboard as a PNG.

## May 2026

### Added

- Added a rectangle tool to the draw toolbar for drawing box-shaped polygons.
- Added an add-multiple toggle to the draw toolbar for repeated feature drawing and unit placement.
- Added a toolbar toggle to disable great-circle (geodesic) measurement paths in MapLibre Mercator mode.
- Added experimental KML support for MapLibre mode.
- Added an unsaved changes indicator and quick save button to the navbar.
- Added twilight zones to the day/night terminator overlay (MapLibre mode only).
- Added raster tile layer rendering and management to MapLibre mode.
- Added image layer rendering and transform support to MapLibre mode.
- Added line-placement label rendering in MapLibre mode so labels with `text-placement: line` follow the line geometry.
- Added high-quality map image export to MapLibre mode via the Tools sidebar, with an adjustable viewfinder for framing the output (aspect-ratio presets and a safe-zone guide), an output-resolution scale for crisp symbols and labels, and optional scale bar, north arrow, and attribution overlays.

### Changed

- MapLibre is now the default map mode.

### Fixed

- Fixed the Delete key not removing selected scenario features in MapLibre mode.
- Improved MapLibre feature selection with a click hit tolerance and better shift+click handling.
- Improved MapLibre draw and modify snapping.
- Improved MapLibre geometry editing on touch devices.
- Fixed MapLibre unit redraw after undo/redo.
- Temporary KML/KMZ reference layers are no longer saved into serialized scenarios.
- MapLibre scenario feature labels now honor the configured `text-offset-x`/`text-offset-y` (previously a fixed offset was used). Pixel values are converted to ems to match OpenLayers sizing.
- Circle drawing now works in MapLibre mode.
- Fixed scenario timeline alignment across daylight saving time transitions by recomputing the timezone offset from the current scenario time.
- Map symbol sizes can now be adjusted in MapLibre mode.
- Added a day/night terminator overlay to MapLibre mode.
- Added box zoom support to MapLibre mode.
- Added feature hover tooltips to MapLibre mode.
- Fixed MapLibre scenario feature marker sizes so point features match OpenLayers sizing.
- Fixed MapLibre scenario feature rendering for null polygon fills and zero-opacity fills.
- Added MapLibre support for custom unit symbols, including clearer selected-state highlighting.
- Fixed MapLibre unit labels so they shift correctly for scaled ordinary and custom icons, including hostile diamond frames.
- Fixed MapLibre scenario layer ordering so feature, raster, image, and KML reference layers stay below unit and range ring layers and respect the scenario stack order.
- MapLibre measurement lines and polygon edges now follow great-circle paths, so paths bend correctly across the globe and across the antimeridian instead of being drawn as straight lng/lat chords.
- Fixed MapLibre measurement on mobile so panning the map (especially in globe mode) no longer drops a measurement vertex when the touch gesture moves only slightly.

## April 2026

### Added

- Added snapping support to MapLibre draw and modify tools.
- Added support for route planning with obstacles.
- Added support for pasting GeoJSON from the clipboard directly into the scenario editor as scenario features, including `Ctrl/Cmd+V` import into the active feature layer.
- Added GPX import support, including track conversion and unit track assignment.
- Added draw and modify support for scenario features in MapLibre mode.
- Added measurement tools to MapLibre mode.
- Added symbol text amplifier rendering in MapLibre mode.
- Added geometry statistics to scenario feature details.
- Clicking KML/KMZ features now opens a read-only details view with attached properties, including richer HTML description rendering.
- Added view constraints support (max extent, min/max zoom) to map settings. Constraints are saved as part of the scenario.
- Added experimental MapLibre mode with globe support. Functionality from the main map view will be gradually ported over.
- Added a standalone symbol browser page at `/symbol-browser`.
- Added symbol export with copy and download as PNG and SVG, with configurable size and display options.
- Added "Copy as GeoJSON" to the feature layer menu, individual feature menu, and feature details panel. Circles are exported as polygons.
- Added a missing short name input to the unit details form, including automatic short-name mode support.
- Added multi-select batch delete for stored scenarios in the landing page and import scenario browsers, including filtered select-all and confirmation dialog support.
- Added a sort direction control to the stored scenario browser dropdown, with an icon indicating ascending or descending order.
- Added a recording control dropdown to the navbar.
- Added recovery drafts for scenario editing, along with "Revert to opened state" and "Revert to saved version" actions.
- Added Ctrl/Cmd + drag box select for units in MapLibre mode.

### Changed

- Added a "Paste from clipboard" entry to the Edit menu for scenario and GeoJSON clipboard imports.
- KML/KMZ features with labels are now decluttered by default.
- Moved the dark mode toggle into the main menu on mobile devices.
- Reworked the ORBAT panel footer recording controls into compact direct toggles for hierarchy and position recording.
- Simplified recording button and indicator styling so active states no longer rely on dynamic red styling.
- The stored scenario browser now keeps its header controls visible while long scenario lists scroll within a capped results area.
- The stored scenario browser sort dropdown now shows the active sort field with radio-item selection.
- Scenario editing now uses a hybrid save model: "Save scenario" updates the stored scenario, autosave writes recovery drafts, and leaving or reloading warns only about changes not explicitly saved.
- Switching between OpenLayers and MapLibre now preserves the in-memory map view.
- Feature style slider drags now collapse into a single undo entry.
- The Transform tab now defaults its update target to the selected feature.

### Fixed

- Fixed dragging an unselected unit also moving previously selected units.
- Fixed map selection so clicking a unit or scenario feature switches selection in one click instead of requiring an intermediate deselect.
- Fixed overlapping unit/feature selection on the map so the topmost item takes priority.
- Fixed blank map clicks so they clear selected scenario features.
- Fixed shift-click selection on the map so it only extends the current selection type instead of switching between units and scenario features.
- Fixed KMZ/KML feature clicks in the OpenLayers editor so imported reference features no longer crash the map renderer.
- Fixed transform tool updates so existing features update their geometry kind when a transformation changes the geometry type.
- Fixed the MapLibre scale control so it responds to dynamic measurement unit changes.

## March 2026

### Added

- Added support for time varying ORBATs.
- Show feature name on map hover.
- Added a "Load from file" button to the landing page header for faster local scenario imports.
- Added scenario browser search and filtering.
- Added map symbol size override support per unit.
- Added a button to the unit filters panel to quickly collapse or expand all filter sections.
- Added clipboard and drag and drop functionality to the "Text to ORBAT" tool.
- Added a scratch pad panel to the "Text to ORBAT" tool with undo/redo support.
- Added syntax highlighting and metadata parsing for unit definitions in "Text to ORBAT".
- Added support for comma-separated fields (short name, name, description) in "Text to ORBAT".
- Added a standard identity dropdown to both panels in "Text to ORBAT".
- Added support for dropping ORBAT units as indented text into the "Text to ORBAT" editor.
- Added a clear input button to the "Text to ORBAT" view.
- Added "Text to ORBAT" documentation page.
- Added user-defined pattern mappings to "Text to ORBAT" — add custom icon/echelon aliases or entirely new icon mappings.
- Added inline editing and deletion for pattern mapping entries in "Text to ORBAT".
- Added localStorage persistence for custom pattern mappings with undo/redo support.
- Added a visual symbol picker for selecting icons when adding or editing pattern mappings in "Text to ORBAT".
- Added priority numbers and drag-handle reordering for pattern mappings in "Text to ORBAT".
- Added a configurable default starting echelon setting to "Text to ORBAT".
- Added a "Generate short names" action to the "Text to ORBAT" input toolbar.
- Added short-name settings to the "Text to ORBAT" settings menu, including max length, uppercase, whitespace, force-length, and clear-all actions.
- Added a copy to clipboard button to the export modal.
- Added `//` as an alternative metadata syntax in "Text to ORBAT" and a link to the documentation.
- Added overlay and sidebar display modes for the unit details panel, each with independent pin toggles.
- Added `initiallyOpen` field to sides and side groups, allowing scenario files to specify whether they start collapsed. Toggleable via context menu.

### Changed

- Moved the ORBAT panel from a map overlay to a flex sidebar layout — the map now physically resizes instead of being overlaid.
- Restyled the ORBAT panel open button as a tab on the left edge of the map.
- The ORBAT panel now opens automatically when using the locate-in-orbat action.
- Moved zoom controls to the top-left of the map on mobile.
- Map controls now reposition above the toolbar on narrow screens using container queries.
- Expanded scenario timeline zoom-out range.
- Moved "Copy scenario to clipboard" action from the File menu to the Edit menu.
- Improved dark mode support in the Chart Edit view.
- Added support for symbol outlines in ORBAT charts to improve visibility.
- Moved unit symbol rotation settings from the "Map display" tab to the "Map symbol" tab.
- Improved map editor UX on mobile.
- Improved the text editor in the "Text to ORBAT" tool with better keyboard support and editing features.
- Consolidated "Text to ORBAT" settings (autocomplete, match case, split fields, field order) into a dropdown menu.
- Made right panel toolbars horizontally scrollable on mobile.

### Fixed

- Fixed ORBAT drag-and-drop so that selected units can be used as drop targets.
- Fixed dropping a unit above a side group to make it a side root unit.
- Fixed issue where layer edit form "Change" and clear timestamp buttons submitted the form and closed it immediately.
- Fixed issue where changing a unit symbol in the details panel did not immediately refresh the symbol in the panel or on the map.
- Fixed an issue where TO&E would not update if a unit had no state entries.
- Fixed an issue where "Go to next on save" in TO&E edit mode would not work for sorted tables.
- Fixed timed reinforced/reduced symbol updates so that they be edited in unit events and animated correctly over time.

## February 2026

### Added

- Added resizable columns to the Grid Edit view.
- Added support for dragging and dropping ORBAT units between different browser tabs and windows.
- Added custom icon support for KMZ export.
- Added virtualization to the Grid Edit view to improve performance with large unit lists.
- Added a **"Collapse"** option to the unit context menu to quickly collapse child units.
- Added **"Expand units"** and **"Collapse units"** actions to side and side-group dropdown menus in the ORBAT panel.
- Added scenario details to the conflict alert in the Import view.
- Added virtualization to the ORBAT panel to improve performance with large ORBATs.
- Added a resizable mobile panel.
- Added a new **"Map Visibility"** section to the unit filters panel.
- Added timeline-aware unit symbol rotation with panel controls and a dedicated map rotation mode.
- Added a freehand drawing mode for scenario features.
- Added a UI for setting the scenario bounding box.
- Added support for generic unit spreadsheet imports (CSV/TSV), including custom field mapping and update mode functionality.
- Added a **"Recently Shared"** submenu to the File menu, providing quick access to the history of shared scenario links.
- Added a "Share Scenario" button to the main toolbar.
- Added a CSV/TSV export option with a configurable separator.
- Added support in Text to ORBAT for concatenated echelon abbreviations (for example `2bn`, `1bde`, `Aco`) during echelon detection.
- Added a **"Move up in hierarchy"** action to the unit context menu.

### Changed

- Removed the **"beta"** label from the application name.
- Switched to a dropdown menu for selecting the scenario edit mode on mobile devices.
- Added a dark mode toggle to the main toolbar on mobile devices.
- Optimized unit map rendering by incrementally updating positions instead of recreating features.

### Fixed

- Fixed issue where changing the symbol fill color for a side would immediately update before saving.
- Fixed issue where saving side or side-group symbol fill color did not immediately refresh map symbols.

## January 2026

- Added "Paste scenario from clipboard" feature to the landing page and map editor (includes button and keyboard shortcut detection).
- Added options to include start and end arrowheads on lines.
- Added support for password-protected and encrypted scenarios (export, import, and online sharing).
- Added ability to hide individual scenario features.
- Added `radioFolder` list style option for KML/KMZ export in "multiple events" time mode.
- Added "Share scenario online" feature.
- Added "Share scenario as URL" feature.
- Added a map base layer switcher to the map context menu.
- Improved tab navigation with scrollable tabs.
- Added military time zone support.

## December 2025

- Added support for selecting which KML/KMZ folders to load.
- Added support for loading multiple KML/KMZ files simultaneously.
- Added a dark mode toggle.

## November 2025

- Added support for dragging and dropping multiple units.

## October 2025

- Added support for custom unit symbols.
- Added support for adding custom symbol fill colors.
- New options for customizing map unit labels:
  - show below unit icon
  - adjust font size
  - wrap long names

## September 2025

- New KML/KMZ export options:
  - export scenario events as KML folders
  - draw symbol outline
  - adjust icon and label scale
  - render symbol amplifiers
  - nested folders for sides and groups
  - export only selected units
- Units can now be added directly to a side. A side group is no longer required.

## May 2025

- Add 'add point/marker' action to the map context menu.

## April 2025

- Added support for chaining multiple transformations.
- Added union transformation.
- Added dashed and dotted stroke/line styles.
- Added concave hull transformation.
- Added explode, centroid, center(absolute) and center of mass transformations.
- Added transform panel for units.
- Added zoom level controls for scenario feature labels.

## March 2025

- Use file system access API for file export in supported browsers (Chrome and Edge).

## February 2025

- Added a button to the unit panel for locating the unit in the ORBAT panel.
- Added a keyboard shortcut `l` for locating the active unit in the ORBAT panel.
- Added a new filter panel for selecting units based on their unit icon.

## January 2025

- Added range circle to length measurement tool. Can be switched on/off in the measurement toolbar.
- Added zoom level visibility controls for units and scenario features.
- Added custom fill and stroke color for range rings and scenario features.
- Improved display and editing of unit TO&E.
- Added support for unit supplies (including partial scenario import).

## December 2024

- Added an "Add unit" entry to the map context menu.
- Added support for changing the available / on hand attribute of equipment and personnel through unit events.
- Added an available / on hand attribute to equipment and personnel.
- Added equipment, personnel and units statuses to the scenario data import options.
- Added a "hide timeline" option to the timeline context menu.

## November 2024

- Added more feature label styling options.
- Added edit submenu to the main menu.
- Added basic scenario event support.
- Added support for hiding sides and groups from the map.
- Added multi edit support to the map overlay unit details panel.
- Added support for importing sides and groups from another scenario.

## October 2024

- Added a "smooth" option to the scenario feature transformation panel.
- Added import from browser option to the import dialog.
- Added clone/duplicate side and side group actions.
- Added indicator when dragging using copy mode (ctrl+drag or ctrl+alt+drag).

## September 2024

- Added side, group and unit locking to prevent accidental changes.
- Added preview and more options to the Spatial Illusions unit generator ORBAT import.
- Added support for transforming multiple features simultaneously.
- Enabled drag and drop for unit breadcrumbs onto the map.
- Introduced experimental support for time-varying scenario feature geometries.
- Enabled copying unit hierarchy with state using Ctrl/Meta+Alt+Drag-and-Drop.
- Added an option to duplicate a unit (and its hierarchy) along with its state.
- Added playback keyboard shortcuts: Alt+P or K to play/pause, < and > to adjust playback speed.
- Improved MilX/map.army import functionality.
- Added reinforced/reduced symbol modifier.

## August 2024

- Added more paper sizes.
- Added unit breadcrumb navigation toolbar.
- Enabled opening the symbol browser from the command palette or main menu.
- Enabled copying unit hierarchy using Ctrl/Meta+drag-and-drop.
- Enabled moving a feature by dragging it from the layers panel to the desired location.
- Enabled reordering and moving sides and groups in the ORBAT panel using drag and drop.
- Added basic scenario feature transformations (buffer, convex hull, and bounding box).

## July 2024

- Reorder and move scenario features between layers using drag and drop.
- Modify unit coordinates manually in the unit state panel. Activate the edit mode by double-clicking on the
  coordinates.
- Select multiple features in the layers panel with shift+click.
- Add a duplicate scenario feature action.

## June 2024

- Show list of scenario features under the pointer in the map context menu.
- Add GeoJSON feature import.
- Add a playback dropdown menu to the main navbar.
- Add an "Open in" item to the map context menu to open the current location in a selection of online map providers.

## May 2024

- Add a clear unit state action.
- Add search/filter to symbol picker browser tab.
- Show unit icons in map context menu.
- Add export map as image feature.
- Add translate feature mode to the drawing toolbar.

## April 2024

- Show list of units under the pointer in the map context menu.
- Add custom date and time formatting.
- Select multiple units in the ORBAT panel with shift+click.
- Add basic support for unit text amplifiers.

## March 2024

- Add support for importing data from a URL.
- Add day/night terminator to the map.
- Add unit path timestamp toggle.
- Add a unit path panel to the main toolbar.

## February 2024

- Add [Decisive Action Training Environment (DATE)](https://odin.tradoc.army.mil/DATEWORLD) force structures import .
- Add support for copying and pasting unit hierarchies to and from the clipboard.

## January 2024

- Replace the file menu with a nested main application dropdown menu.
- Show the total number of units in the scenario information panel.
- Add new base map: OpenStreetMap DE. Includes translations of place names.

## December 2023

- Add automatic scenario save.
- Add support for storing multiple scenarios in the browser's local storage.
- Add `loadScenarioURL` URL query parameter for loading a scenario from a URL.

## November 2023

- Add average speed and maximum speed unit properties.
- Add unit status property.

## October 2023

- Delete selected waypoints with the delete key.
- Select multiple waypoints on map with shift+click.
- Show great circle lines between waypoints in a unit path.

## September 2023

- Add symbol modifier search in symbol picker.
- Add navigation sidebar to symbol set browser.
- Make unit name and short name inline editable in the unit panel.
- Add support for adding an image to a feature.
- Add markdown support to scenario feature descriptions.
- Add support for adding an image to a unit.

## August 2023

- Add drag and drop support for temporary KML and KMZ files.
- Add timeline control to scenario editor.
- Add range ring groups. Range rings in the same group will be merged if they overlap.
- Add toggle option for toolbar visibility.
- Add basic support for adding equipment and personnel to units.

## July 2023

- Add basic range ring styling.
- Add unit range rings.
- Add support for image layers.
- Add support for TileJSON layers.
- Add support for XYZ layers.

## June 2023

- Make ORBAT and details panel resizable.
- Add scale bar to map.

## May 2023

- Add place name search.
- New map editing mode layout.

## April 2023

- Add 'DEL' keyboard shortcut for deleting selected units.
- Snap to every feature in drawing mode.
- Add snapping to measurement tool.
- Add a copy current location entry to map context menu.
- Add Order of Battle Generator import (https://www.orbatgenerator.com/) .
- Add Spatial Illusions ORBAT builder import.
- Add Spatial Illusions ORBAT builder export.
- Add imperial and nautical measurement units.
- You can now select a root unit in the chart edit view by searching.

## March 2023

- Add download menu to chart edit mode view.
- Add name field to units when exporting to MilX format.
- Add support for custom symbol fill colors for MilX import and export.
- Add custom symbol fill color support for groups.
- Add custom symbol fill color support for sides.
- Add setting for selecting simple status modifier.
- Create one folder per side when exporting KML.

## February 2023

- Add tool panel for adding units to the map.
- Add 'm' keyboard shortcut for toggling move unit interaction.
- Add context menu to map.
- Make chart mode sidebar resizable.
- Allow adding an arbitrary number of sides and root units in the 'create new scenario form'.

## January 2023

- Add basic root unit icon and echelon selection to 'Create new scenario' form.
- Add basic XLSX export.
- Drop files directly on scenario editor to start import process. No need to select File->Import first.
- Add setting for displaying short unit names in ORBAT panel.

## December 2022

- Add basic chart edit view (work in process).
- Make keyboard shortcuts dialog context aware.
- Add action for cloning a unit with subordinates.
- Simplified standard identity selection.
- Add zooming and panning to ORBAT charts.
- Add vitepress-powered documentation https://docs.orbat-mapper.app (work in progress).

## November 2022

- Improved new scenario form. Contains initial sides and root units.
- Select multiple units on the map with Ctrl+Drag (Command+Drag on Mac)
- Basic MilX (.milxlyz) import from map.army.

## October 2022

- Add letter based SIDC to number SIDC converter to symbol picker
- Grid cell copy/paste
- Grid edit mode keyboard navigation

## September 2022

- Change unit symbol at specific timestamps.
- Add 'remove unit from map/clear location' state action.
- Make sidebars resizable.
- Add filtering to grid edit mode.

## August 2022

- Add grid edit mode (work in progress).
- Embed unit icons in KMZ export.
- Basic KML/KMZ export.
- Basic GeoJSON export.
- Add a configurable widget/control for showing mouse position coordinates on map.
- Zoom to multiple units (z keyboard shortcut).
- Apply actions on multiple units at once (change symbol, duplicate etc.).
- Add button for changing unit symbol directly.
- Add undo and redo buttons to navigation bar.
- Add toggles to unit panel for controlling unit track visibility and unit track editing.
- Select multiple units in the ORBAT panel with shift+click.
- Select multiple units on the map with shift+click.
- Deselect units/features by pressing the escape key.
- Unit state change entries can now have a title.

## July 2022

- Add scenario events panel with a basic timeline to the scenario editor.
- Add button for clearing selected features.
- Edit visibility of multiple features at once.
- Add button for clearing feature visibility timestamp.
- On zoom to a unit with no location zoom to show subordinates instead.
- Add button to the unit panel for setting unit location by clicking on the map.
- Zoom to multiple features using z keyboard shortcut or the zoom button on the feature details panel.
- Select multiple scenario features with shift+click on the features list, or by shift+click on the map.
