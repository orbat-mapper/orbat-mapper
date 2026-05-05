# Text to ORBAT

The Text to ORBAT tool lets you quickly build an order of battle by typing unit names as indented text. The tool automatically detects unit types and echelons from keywords in the text and generates military symbols.

You can access the tool from the start page or directly at [orbat-mapper.app/text-to-orbat](https://orbat-mapper.app/text-to-orbat).

## Basic syntax

Each line represents a unit. Use indentation (2 spaces or a tab) to define parent-child relationships. Blank lines are ignored.

```
1st Infantry Division
  1st Brigade
    1st Battalion
    2nd Battalion
  2nd Brigade
    3rd Battalion
  Artillery Regiment
```

Lines starting with `#` are treated as comments and ignored:

```
# This is a comment
1st Infantry Division
  # Brigade-level units
  1st Brigade
```

## Automatic detection

The tool recognizes common military keywords and abbreviations:

- **Echelon keywords**: Division, Brigade, Battalion, Company, Platoon, Squad, Team, Corps, Army (and abbreviations like div, bde, bn, co, plt, sqd)
- **Unit type keywords**: Infantry, Armor, Artillery, Engineer, Reconnaissance, Medical, Airborne, and many more

Echelon abbreviations can be written without a space after a designator number, e.g. `2bn` is interpreted as `2 bn` (2nd Battalion).

When a unit's name doesn't contain a recognized keyword, the tool infers the echelon from its parent and inherits the parent's unit type icon.

## Custom pattern mappings

You can view and edit pattern mappings by clicking **Patterns** in the toolbar. This opens a modal where you can add, remove, or modify the keywords that the parser uses to detect unit types and echelons.

::: info
Entries are matched top-to-bottom using first-match-wins logic. More specific patterns should appear before general ones (e.g. "airborne infantry" before "infantry"). In edit mode, you can drag entries by their handle to reorder them.
:::

Mappings can also be exported to and imported from an Excel spreadsheet for bulk editing.

### Alias syntax

Aliases are plain-text keywords. The parser compiles them into flexible patterns that handle common variations automatically:

| Syntax | Example | Matches | Rule |
|---|---|---|---|
| `(text)` | `marine(s)` | marine, Marines, MARINES | Parentheses mark optional segments |
| multiple `()` | `armo(u)r(ed)` | armor, Armour, ARMORED, armoured | Optional segments can be combined |
| `.` | `R.A.` | RA, R.A., r.a., R.A | Each dot is individually optional |
| space | `anti tank` | anti tank, Anti-Tank, ANTITANK, anti.tank | Spaces match any separator (whitespace, hyphen, dot) or nothing |

Aliases are matched with word boundaries, so `inf` matches "2nd inf" but not "information".

Matching is always case-insensitive and accent-insensitive (e.g. "blindé" matches an alias written as "blinde").

### Raw regex patterns

For cases that can't be expressed with plain-text aliases — such as case-sensitive abbreviations (`AT`, `RM`) or digit patterns (`BM-21`) — use the **Patterns** field. Patterns are raw regular expressions matched as written.

## Metadata syntax

You can provide additional hints for symbol detection without affecting the displayed unit name.

### Pipe syntax

Use a single `|` to separate the display name from metadata:

```
1st | tank bn
```

This displays the unit as "1st" but uses "tank bn" for symbol detection (resulting in a tank/armor battalion icon).

### Double-slash syntax

Use `//` as an alternative to the single pipe:

```
1st // tank bn
```

This behaves identically to `1st | tank bn` — everything after `//` is treated as metadata.

### Bracket syntax

Use square brackets to embed metadata inline:

```
2nd Art [bty]
```

This displays the unit as "2nd Art" and uses "bty" (battery) for echelon detection. You can use multiple bracket pairs.

::: info
Metadata is checked first for echelon and icon matching, then the display name is checked as a fallback.
:::

## Settings

Click **Settings** in the toolbar to open the settings menu. The following options are available:

- **Autocomplete** — enable/disable autocomplete suggestions as you type
- **Match input case** — when enabled, autocomplete suggestions match the casing of your input
- **Split fields** — use commas as field separators (see below)
- **Starting echelon** — set the default echelon for the top-level unit when no echelon keyword is detected (default: Brigade). Child units are assigned progressively smaller echelons based on this starting point.

## Split fields

Enable **Split fields** in the Settings menu to use commas as field separators. This lets you populate the unit's short name and description in addition to the name.

The field order can be selected in the Settings menu:

| Order | Format |
|---|---|
| name, short name, description | `Alpha Company, A, Main assault element` |
| short name, name, description | `A, Alpha Company, Main assault element` |

- If only one value is provided (no commas), it is used as the name
- If two values are provided, the first two fields from the selected order are used
- Extra commas beyond the third field are included as part of the description

::: info
When split fields is enabled, the full line (all comma parts combined) is still used for automatic symbol detection, so keywords in any field contribute to echelon and icon matching.
:::

Split fields can be combined with metadata syntax:

```
A, Alpha Company | infantry bn
A, Alpha Company [armor]
```

## Editor features

### Autocomplete

When **Autocomplete** is enabled in the Settings menu, the editor suggests icon and echelon keywords as you type, with symbol previews.

### Pattern and icon browsers

- **Patterns** — opens a modal showing all pattern-to-icon and pattern-to-echelon mappings with priority numbers and drag-handle reordering
- **Icons** — opens a modal browsing all available icon codes and their aliases

### Debug info

Enable **Debug info** in the output panel to display the detected echelon and icon codes next to each unit in the tree.

## Output options

The right panel shows a live preview of the generated ORBAT as a hierarchical tree with military symbols.

### Copy to clipboard

Click **Copy** to copy the ORBAT as JSON to the clipboard. You can then paste it into the scenario editor.

### Drag and drop

Each unit icon in the tree is a drag handle. Drag individual units directly into the scenario editor's ORBAT tree.

### Open in editor

Click **Open** to load the entire parsed ORBAT as a new scenario in the scenario editor.

### Export

Click **Export** to download the ORBAT in one of two formats:

- **Battle Staff Tools JSON** — Spatial Illusions format
- **ORBAT Mapper Scenario** — full scenario file that can be loaded in ORBAT Mapper
