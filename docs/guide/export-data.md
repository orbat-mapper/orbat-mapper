# Export data

ORBAT Mapper can export units and features to the following data formats:

- [GeoJSON](#geojson)
- [KML/KMZ](#kml)
- [MilX](#milx)

## Start the export process

To start the export process
select _Export scenario_ from the _File_
menu.

![Import menu](images/export.png)

## GeoJSON

## KML

ORBAT Mapper does not support a 3D view, but you kan export you scenario as KMZ and view your scenario in Google Earth.

![Google earh](images/google-earth.png)

## MilX

ORBAT Mapper has experimental support for exporting a scenario as MilX layers for use with [map.army](https://map.army).

::: warning
Please note that ORBAT Mapper only supports a small subset of the MilX format. A major compatability issues is that
Map.army uses letter based MILSTD 2525C/APP6-C symbol codes. Conversion from 2525D/APP6-D to 2525C/APP6-C is not always
possible. ORBAT mapper will try to find the closest matching symbol, but this process may fail.

:::
