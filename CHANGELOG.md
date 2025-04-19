# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

April 2025

- Added transform panel for units.
- Added zoom level controls for scenario feature labels.

March 2025

- Use file system access API for file export in supported browsers (Chrome and Edge).

February 2025

- Added a button to the unit panel for locating the unit in the ORBAT panel.
- Added a keyboard shortcut `l` for locating the active unit in the ORBAT panel.
- Added a new filter panel for selecting units based on their unit icon.

January 2025

- Added range circle to length measurement tool. Can be switched on/off in the measurement toolbar.
- Added zoom level visibility controls for units and scenario features.
- Added custom fill and stroke color for range rings and scenario features.
- Improved display and editing of unit TO&E.
- Added support for unit supplies (including partial scenario import).

December 2024

- Added an "Add unit" entry to the map context menu.
- Added support for changing the available / on hand attribute of equipment and personnel through unit events.
- Added an available / on hand attribute to equipment and personnel.
- Added equipment, personnel and units statuses to the scenario data import options.
- Added a "hide timeline" option to the timeline context menu.

November 2024

- Added more feature label styling options.
- Added edit submenu to the main menu.
- Added basic scenario event support.
- Added support for hiding sides and groups from the map.
- Added multi edit support to the map overlay unit details panel.
- Added support for importing sides and groups from another scenario.

October 2024

- Added a "smooth" option to the scenario feature transformation panel.
- Added import from browser option to the import dialog.
- Added clone/duplicate side and side group actions.
- Added indicator when dragging using copy mode (ctrl+drag or ctrl+alt+drag).

September 2024

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

August 2024

- Added more paper sizes.
- Added unit breadcrumb navigation toolbar.
- Enabled opening the symbol browser from the command palette or main menu.
- Enabled copying unit hierarchy using Ctrl/Meta+drag-and-drop.
- Enabled moving a feature by dragging it from the layers panel to the desired location.
- Enabled reordering and moving sides and groups in the ORBAT panel using drag and drop.
- Added basic scenario feature transformations (buffer, convex hull, and bounding box).

July 2024

- Reorder and move scenario features between layers using drag and drop.
- Modify unit coordinates manually in the unit state panel. Activate the edit mode by double-clicking on the
  coordinates.
- Select multiple features in the layers panel with shift+click.
- Add a duplicate scenario feature action.

June 2024

- Show list of scenario features under the pointer in the map context menu.
- Add GeoJSON feature import.
- Add a playback dropdown menu to the main navbar.
- Add an "Open in" item to the map context menu to open the current location in a selection of online map providers.

May 2024

- Add a clear unit state action.
- Add search/filter to symbol picker browser tab.
- Show unit icons in map context menu.
- Add export map as image feature.
- Add translate feature mode to the drawing toolbar.

April 2024

- Show list of units under the pointer in the map context menu.
- Add custom date and time formatting.
- Select multiple units in the ORBAT panel with shift+click.
- Add basic support for unit text amplifiers.

March 2024

- Add support for importing data from a URL.
- Add day/night terminator to the map.
- Add unit path timestamp toggle.
- Add a unit path panel to the main toolbar.

February 2024

- Add [Decisive Action Training Environment (DATE)](https://odin.tradoc.army.mil/DATEWORLD) force structures import .
- Add support for copying and pasting unit hierarchies to and from the clipboard.

January 2024

- Replace the file menu with a nested main application dropdown menu.
- Show the total number of units in the scenario information panel.
- Add new base map: OpenStreetMap DE. Includes translations of place names.

December 2023

- Add automatic scenario save.
- Add support for storing multiple scenarios in the browser's local storage.
- Add `loadScenarioURL` URL query parameter for loading a scenario from a URL.

November 2023

- Add average speed and maximum speed unit properties.
- Add unit status property.

October 2023

- Delete selected waypoints with the delete key.
- Select multiple waypoints on map with shift+click.
- Show great circle lines between waypoints in a unit path.

September 2023

- Add symbol modifier search in symbol picker.
- Add navigation sidebar to symbol set browser.
- Make unit name and short name inline editable in the unit panel.
- Add support for adding an image to a feature.
- Add markdown support to scenario feature descriptions.
- Add support for adding an image to a unit.

August 2023

- Add drag and drop support for temporary KML and KMZ files.
- Add timeline control to scenario editor.
- Add range ring groups. Range rings in the same group will be merged if they overlap.
- Add toggle option for toolbar visibility.
- Add basic support for adding equipment and personnel to units.

July 2023

- Add basic range ring styling.
- Add unit range rings.
- Add support for image layers.
- Add support for TileJSON layers.
- Add support for XYZ layers.

June 2023

- Make ORBAT and details panel resizable.
- Add scale bar to map.

May 2023

- Add place name search.
- New map editing mode layout.

April 2023

- Add 'DEL' keyboard shortcut for deleting selected units.
- Snap to every feature in drawing mode.
- Add snapping to measurement tool.
- Add a copy current location entry to map context menu.
- Add Order of Battle Generator import (https://www.orbatgenerator.com/) .
- Add Spatial Illusions ORBAT builder import.
- Add Spatial Illusions ORBAT builder export.
- Add imperial and nautical measurement units.
- You can now select a root unit in the chart edit view by searching.

March 2023

- Add download menu to chart edit mode view.
- Add name field to units when exporting to MilX format.
- Add support for custom symbol fill colors for MilX import and export.
- Add custom symbol fill color support for groups.
- Add custom symbol fill color support for sides.
- Add setting for selecting simple status modifier.
- Create one folder per side when exporting KML.

February 2023

- Add tool panel for adding units to the map.
- Add 'm' keyboard shortcut for toggling move unit interaction.
- Add context menu to map.
- Make chart mode sidebar resizable.
- Allow adding an arbitrary number of sides and root units in the 'create new scenario form'.

January 2023

- Add basic root unit icon and echelon selection to 'Create new scenario' form.
- Add basic XLSX export.
- Drop files directly on scenario editor to start import process. No need to select File->Import first.
- Add setting for displaying short unit names in ORBAT panel.

December 2022

- Add basic chart edit view (work in process).
- Make keyboard shortcuts dialog context aware.
- Add action for cloning a unit with subordinates.
- Simplified standard identity selection.
- Add zooming and panning to ORBAT charts.
- Add vitepress-powered documentation https://docs.orbat-mapper.app (work in progress).

November 2022

- Improved new scenario form. Contains initial sides and root units.
- Select multiple units on the map with Ctrl+Drag (Command+Drag on Mac)
- Basic MilX (.milxlyz) import from map.army.

October 2022

- Add letter based SIDC to number SIDC converter to symbol picker
- Grid cell copy/paste
- Grid edit mode keyboard navigation

September 2022

- Change unit symbol at specific timestamps.
- Add 'remove unit from map/clear location' state action.
- Make sidebars resizable.
- Add filtering to grid edit mode.

August 2022

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

July 2022

- Add scenario events panel with a basic timeline to the scenario editor.
- Add button for clearing selected features.
- Edit visibility of multiple features at once.
- Add button for clearing feature visibility timestamp.
- On zoom to a unit with no location zoom to show subordinates instead.
- Add button to the unit panel for setting unit location by clicking on the map.
- Zoom to multiple features using z keyboard shortcut or the zoom button on the feature details panel.
- Select multiple scenario features with shift+click on the features list, or by shift+click on the map.
