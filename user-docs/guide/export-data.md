# Export data

ORBAT Mapper can export units and features to these data formats:

- [GeoJSON](#geojson)
- [KML/KMZ](#kml)
- [MilX](#milx)
- [XLSX](#xlsx)
- [Spatial Illusions ORBAT Builder](#spatial-illusions-orbat-builder)

## Start the export

To start the export, select _Export scenario_ from the _File_ menu.

![Export menu](images/export.png)

## GeoJSON

GeoJSON is an open standard format that many applications use. It gives simple geographical features with their
non-spatial attributes.

## KML

KML (Keyhole Markup Language) is a format that uses XML. Mapping applications such as Google Earth use it to show
geographic data. When you export to KML, you can easily send your scenario data to usual geospatial tools and show it
there. For more data, see the [KML documentation](https://developers.google.com/kml/documentation).

![Google earh](images/google-earth.png)

## XLSX

Export units to the Microsoft Excel format (`.xlsx`). Use this format to send unit data to spreadsheet applications, or
to do more analysis.

### Export options

- **One sheet per side**: If you enable this option, the export makes one worksheet for each side in the scenario. If
  you disable it, the export puts all the units in one sheet.

### Unit attributes

Select the unit attributes for the export:

| Attribute   | Description                       |
| ----------- | --------------------------------- |
| id          | Unique unit identifier            |
| name        | Unit name                         |
| sidc        | Symbol Identification Code (SIDC) |
| shortName   | Abbreviated unit name             |
| description | Unit description                  |
| url         | External URL                      |
| location    | Current position of the unit      |
| parent ID   | ID of the parent unit             |
| side ID     | ID of the side of the unit        |
| side name   | Name of the side                  |

### Location format

Select the format of the coordinates in the export:

| Format                  | Example                |
| ----------------------- | ---------------------- |
| JSON array [lon, lat]   | `[10.7522, 59.9139]`   |
| Lat, Lon                | `59.9139, 10.7522`     |
| Lon, Lat                | `10.7522, 59.9139`     |
| MGRS                    | `32VNM8546314523`      |
| Degrees Minutes Seconds | `59°54'50"N 10°45'8"E` |
| Decimal Degrees         | `N59.9139° E10.7522°`  |

## MilX

ORBAT Mapper has experimental support for the export of a scenario as MilX layers. You can use these layers
with [map.army](https://map.army).

::: warning
ORBAT Mapper supports only a small part of the MilX format. There is also an important compatibility problem.
Map.army uses MILSTD 2525C/APP6-C symbol codes with letters. It is not always possible to change 2525D/APP6-D codes
into 2525C/APP6-C codes. ORBAT Mapper tries to find the symbol that agrees most closely, but this operation can fail.

:::

## Spatial Illusions ORBAT Builder
