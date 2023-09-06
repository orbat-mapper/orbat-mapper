# Import data

ORBAT Mapper can import units and features from the following sources and formats:

- [GeoJSON](#geojson)
- [MilX](#milx)
- [Spatial Illusions ORBAT Builder](#spatial-illusions-orbat-builder)
- [Order of Battle Generator](#order-of-battle-generator)

Additionally, you can import KML/KMZ files as temporary map layers.
See [Working with map background layers](map-layers.md)

## Start the import process

To start the import process select _Import_ from the _File_ menu.

![Import menu](images/import-menu.png)

This will open the _Import data_ dialog shown below. You can also simply drag and drop a supported file onto the map to
start the import process. Select the file you want to import and click _Load_. In many cases ORBAT mapper will guess the
correct import format automatically. If not, you can select the correct format from the _Select import format_ dropdown.

![An image](images/import.png)

## GeoJSON

## MilX

[MilX (common military exchange format)](https://www.gs-soft.com/CMS/en/products/mssstick-mss-and-milx/milx) is an
XML-based format for exchanging military map overlays. It is for instance used by the
excellent [map.army](https://www.map.army/) tool for storing map overlays. ORBAT Mapper supports loading of
overlays from map.army. Both compressed (`.milxlyz`) and uncompressed (`.milxly`) files are supported.
.

::: info
Please note that ORBAT Mapper only supports a small subset of the MilX format. A potential compatability issues is that
Map.army uses letter based MILSTD 2525C/APP6-C symbol codes. ORBAT Mapper will try its best to convert them to
2525D/APP6-D, but this process may fail for some symbols.
:::

## Spatial Illusions ORBAT Builder

[Spatial Illusions ORBAT Builder](https://www.spatialillusions.com/unitgenerator/) is a tool for creating military
symbols and ORBATs. The tool supports exporting of ORBATs in a simple JSON format that is supported by ORBAT Mapper.

## Order of Battle Generator

Import from [Order of Battle Generator](https://www.orbatgenerator.com/).
