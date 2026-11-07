# Text to ORBAT as a standalone module

The text-to-ORBAT parser, its icon and echelon mappings and its editor support live in `src/lib/textToOrbat/`, a folder that imports nothing from the rest of ORBAT Mapper, so tactrace and other apps can use the same engine. It is not a package yet: the folder can be copied as is, or moved into an `@orbat-mapper/*` package when a second app depends on it.

- **One entry point, one engine per app.** Callers import from `index.ts` only and create an engine with `createTextToOrbat({ mappings })`. The engine owns its mappings; there is no shared module-level registry, so two engines never see each other's custom aliases. ORBAT Mapper keeps its engine in the text-to-ORBAT Pinia store, and the spreadsheet importer uses the same one.
- **The app owns persistence.** The engine reports changes through `engine.mappings.subscribe()` and says whether the mappings differ from the built-ins (`isCustomized`). ORBAT Mapper saves them to local storage, or clears the saved copy when they match the built-ins again.
- **Plain units out.** The engine returns a parsed tree and `toUnits()` turns it into `{ id, name, shortName?, description?, sidc, subUnits }`, the shape both ORBAT Mapper's and tactrace's `Unit` accept. Exports to an ORBAT Mapper scenario and to Spatial Illusions stay in the app (`src/views/texttoorbat/orbatExports.ts`).
- **CodeMirror support is optional.** `src/lib/textToOrbat/codemirror` adds indentation keys, metadata and comment highlighting and completions with symbol previews. The app passes the symbol renderer and the theme, so the folder does not depend on milsymbol or on the app's styles. Highlighting and parsing read lines through the same code, so they cannot disagree.
- **Kept standalone by a test.** `standalone.test.ts` fails if a file in the folder imports anything other than its own files, `nanoid` and `@codemirror/*`.

Considered and not taken: publishing a package now (release work before a second app uses it), keeping the shared `defaultRegistry` (apps would share custom mappings through a module global), and moving the Vue components too (they depend on the app's UI kit and drag-and-drop setup).
