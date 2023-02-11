# Import data

ORBAT Mapper can import units and features from the following sources and formats:

- [GeoJSON](#geojson)
- [MilX](#milx)

## Start the import process

To start the import process
select _Import_ from the _File_
menu.

![Import menu](images/import-menu.png)

This will open the _Import data_ dialog.

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
