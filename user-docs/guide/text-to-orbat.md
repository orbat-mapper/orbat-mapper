# Text to ORBAT

With the Text to ORBAT tool you can build an order of battle quickly. Type the unit names as indented text. The tool
finds the unit types and the echelons from keywords in the text automatically, and it makes military symbols.

You can open the tool from the start page. As an alternative, go directly to
[orbat-mapper.app/text-to-orbat](https://orbat-mapper.app/text-to-orbat).

## Basic syntax

Each line is one unit. Use indentation (2 spaces or a tab) to make the parent-child relations. The tool ignores empty
lines.

```
1st Infantry Division
  1st Brigade
    1st Battalion
    2nd Battalion
  2nd Brigade
    3rd Battalion
  Artillery Regiment
```

Lines that start with `#` are comments. The tool ignores them:

```
# This is a comment
1st Infantry Division
  # Brigade-level units
  1st Brigade
```

## Automatic detection

The tool knows the usual military keywords and abbreviations:

- **Echelon keywords**: Division, Brigade, Battalion, Company, Platoon, Squad, Team, Corps, Army (and abbreviations
  such as div, bde, bn, co, plt, sqd)
- **Unit type keywords**: Infantry, Armor, Artillery, Engineer, Reconnaissance, Medical, Airborne, and many more

You can write an echelon abbreviation without a space after the designator number. For example, the tool reads `2bn` as
`2 bn` (2nd Battalion).

If the name of a unit has no known keyword, the tool takes the echelon from the parent unit. The unit also gets the
unit type icon of the parent.

## Custom pattern mappings

To see and change the pattern mappings, click **Patterns** in the toolbar. A modal opens. In this modal you can add,
remove or change the keywords that the parser uses to find the unit types and the echelons.

::: info
The parser examines the entries from the top to the bottom, and uses the first entry that agrees. Thus, put the more
specific patterns before the general patterns (for example, "airborne infantry" before "infantry"). In edit mode, drag
the entries by their handle to change their sequence.
:::

You can also export the mappings to an Excel spreadsheet and import them again. Thus, you can change many mappings at
the same time.

### Alias syntax

Aliases are keywords in plain text. The parser makes flexible patterns from them. These patterns then find the usual
variations automatically:

| Syntax             | Example        | Agrees with                               | Rule                                                                         |
| ------------------ | -------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `(text)`           | `marine(s)`    | marine, Marines, MARINES                  | Parentheses show the optional segments                                       |
| more than one `()` | `armo(u)r(ed)` | armor, Armour, ARMORED, armoured          | You can use more than one optional segment together                          |
| `.`                | `R.A.`         | RA, R.A., r.a., R.A                       | Each dot is optional                                                         |
| space              | `anti tank`    | anti tank, Anti-Tank, ANTITANK, anti.tank | A space agrees with any separator (space, hyphen, dot), or with no separator |

The parser uses word boundaries for the aliases. Thus, `inf` agrees with "2nd inf", but not with "information".

The parser always ignores the case of the letters and the accents. For example, "blindé" agrees with the alias
"blinde".

### Raw regex patterns

Some cases are not possible with aliases in plain text. Examples are abbreviations with a specified case (`AT`, `RM`)
and patterns with digits (`BM-21`). For these cases, use the **Patterns** field. A pattern is a raw regular expression,
and the parser uses it as you write it.

## Metadata syntax

You can give more data for the detection of the symbol. This data does not change the name of the unit on the screen.

### Pipe syntax

Use one `|` to divide the display name from the metadata:

```
1st | tank bn
```

The tool shows the unit as "1st". But it uses "tank bn" to find the symbol. The result is a tank/armor battalion icon.

### Double-slash syntax

Use `//` as an alternative to the single pipe:

```
1st // tank bn
```

The result is the same as `1st | tank bn`. All text after `//` is metadata.

### Bracket syntax

Use square brackets to put metadata in the line:

```
2nd Art [bty]
```

The tool shows the unit as "2nd Art". It uses "bty" (battery) to find the echelon. You can use more than one pair of
brackets.

::: info
The tool examines the metadata first to find the echelon and the icon. If it does not find them, it then examines the
display name.
:::

## Settings

Click **Settings** in the toolbar to open the settings menu. These options are available:

- **Autocomplete** — set the autocomplete suggestions to on or off while you type
- **Match input case** — if this option is on, the autocomplete suggestions use the case of the letters of your input
- **Split fields** — use commas as field separators (see below)
- **Starting echelon** — set the default echelon of the unit at the top level when the tool finds no echelon keyword
  (default: Brigade). The child units then get progressively smaller echelons.

## Split fields

To use commas as field separators, set **Split fields** to on in the Settings menu. Thus, you can give the short name
and the description of the unit with the name.

You can select the sequence of the fields in the Settings menu:

| Sequence                      | Format                                   |
| ----------------------------- | ---------------------------------------- |
| name, short name, description | `Alpha Company, A, Main assault element` |
| short name, name, description | `A, Alpha Company, Main assault element` |

- If you give only one value (no commas), the tool uses it as the name.
- If you give two values, the tool uses the first two fields of the selected sequence.
- The tool puts the text after the third comma in the description.

::: info
When split fields is on, the tool uses the full line (all the parts between the commas) to find the symbol
automatically. Thus, keywords in all the fields help to find the echelon and the icon.
:::

You can use split fields with the metadata syntax:

```
A, Alpha Company | infantry bn
A, Alpha Company [armor]
```

## Editor functions

### Autocomplete

When **Autocomplete** is on in the Settings menu, the editor gives suggestions for the icon and echelon keywords while
you type. It also shows the symbols.

### Pattern and icon browsers

- **Patterns** — opens a modal that shows all the pattern-to-icon and pattern-to-echelon mappings with their priority
  numbers. Drag the handles to change the sequence.
- **Icons** — opens a modal in which you can browse all the available icon codes and their aliases

### Debug info

Set **Debug info** to on in the output panel. The panel then shows the echelon and the icon code of each unit in the
tree.

## Output options

The right panel shows a live preview of the ORBAT. The preview is a hierarchical tree with military symbols.

### Copy to clipboard

Click **Copy** to copy the ORBAT to the clipboard as JSON. You can then put it in the scenario editor.

### Drag and drop

Each unit icon in the tree is a drag handle. Drag the units directly into the ORBAT tree of the scenario editor.

### Open in editor

Click **Open** to load the full ORBAT as a new scenario in the scenario editor.

### Export

Click **Export** to download the ORBAT in one of two formats:

- **Battle Staff Tools JSON** — the Spatial Illusions format
- **ORBAT Mapper Scenario** — a full scenario file that you can load in ORBAT Mapper
