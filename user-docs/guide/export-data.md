# Export data

ORBAT Mapper can export units and features to the following data formats:

- [GeoJSON](#geojson)
- [KML/KMZ](#kml)
- [MilX](#milx)
- [XLSX](#xlsx)
- [Spatial Illusions ORBAT Builder](#spatial-illusions-orbat-builder)

## Start the export process

To start the export process
select _Export scenario_ from the _File_
menu.

![Export menu](images/export.png)

## GeoJSON

GeoJSON is a popular open standard format for representing simple geographical features, along with their non-spatial
attributes.

## KML

KML (Keyhole Markup Language) is an XML-based format used to display geographic data in mapping applications such as
Google Earth. Exporting to KML makes it easy to share and visualize your scenario data in widely used geospatial tools.
For more information, see the [KML documentation](https://developers.google.com/kml/documentation).

![Google earh](images/google-earth.png)

## XLSX

Export units to Microsoft Excel format (`.xlsx`). This is useful for sharing unit data with spreadsheet applications or for further analysis.

### Export Options

- **One sheet per side**: When enabled, creates a separate worksheet for each side in the scenario. Otherwise, all units are exported to a single sheet.

### Unit Attributes

Select which unit attributes to include in the export:

| Attribute    | Description                              |
| ------------ | ---------------------------------------- |
| id           | Unique unit identifier                   |
| name         | Unit name                                |
| sidc         | Symbol Identification Code (SIDC)        |
| shortName    | Abbreviated unit name                    |
| description  | Unit description                         |
| url          | External URL                             |
| location     | Unit's current position                  |
| parent ID    | ID of the parent unit                    |
| side ID      | ID of the side the unit belongs to       |
| side name    | Name of the side                         |

### Location Format

Choose how coordinates are formatted in the export:

| Format                   | Example                              |
| ------------------------ | ------------------------------------ |
| JSON array [lon, lat]    | `[10.7522, 59.9139]`                 |
| Lat, Lon                 | `59.9139, 10.7522`                   |
| Lon, Lat                 | `10.7522, 59.9139`                   |
| MGRS                     | `32VNM8546314523`                    |
| Degrees Minutes Seconds  | `59°54'50"N 10°45'8"E`               |
| Decimal Degrees          | `N59.9139° E10.7522°`                |

## MilX

ORBAT Mapper has experimental support for exporting a scenario as MilX layers for use with [map.army](https://map.army).

::: warning
Please note that ORBAT Mapper only supports a small subset of the MilX format. A major compatability issues is that
Map.army uses letter based MILSTD 2525C/APP6-C symbol codes. Conversion from 2525D/APP6-D to 2525C/APP6-C is not always
possible. ORBAT mapper will try to find the closest matching symbol, but this process may fail.

:::

## Spatial Illusions ORBAT Builder
