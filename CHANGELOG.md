# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

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
