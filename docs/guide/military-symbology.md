<script setup>
import DocMilSymbol from "../components/DocMilSymbol.vue";
</script>

# Military symbology

ORBAT Mapper uses military map symbols defined
in [MIL-STD 2525D](https://www.jcs.mil/Portals/36/Documents/Doctrine/Other_Pubs/ms_2525d.pdf) and [NATO
APP-6D](https://nso.nato.int/nso/nsdd/main/standards/ap-details/1912/EN).
when displaying units, equipment and installations. All symbols are rendered using
the excellent [Milsymbol](https://spatialillusions.com/milsymbol/index.html) library.

<div class="flex items-center gap-4 justify-center">
    <DocMilSymbol sidc="10031000131211004600" /> 
    <DocMilSymbol sidc="10061000151205010000" />
    <DocMilSymbol sidc="10031500331105030000" />
    <DocMilSymbol sidc="10032000001213010000" />
</div>

<div class="flex gap-4 items-center justify-center">
    <DocMilSymbol sidc="10011000000000000000" />
    <DocMilSymbol sidc="10031000000000000000" />
    <DocMilSymbol sidc="10041000000000000000" />
    <DocMilSymbol sidc="10061000000000000000" />
</div>

Military symbols may look strange and unfamiliar at first, but they are constructed in a logical way once you understand
the basics. Here are a few starting points if you want to learn more:

- [Military Symbols Study Guide](https://mgrs-mapper.com/blog/military_symbols_fundamentals/)
- [NATO Joint Military Symbology wikipedia page](https://en.wikipedia.org/wiki/NATO_Joint_Military_Symbology)
- The standard documents [MIL-STD 2525D](https://www.jcs.mil/Portals/36/Documents/Doctrine/Other_Pubs/ms_2525d.pdf) and [NATO
  APP-6D](https://nso.nato.int/nso/nsdd/main/standards/ap-details/1912/EN)

## Symbol identification codes

MILSTD 2525D/APP-6D uses a 20 digit numeric symbol identification code (SIDC) to uniquely represent a symbol. You
usually don't need to work with these codes directly, but understanding how they are constructed can be very useful. For
exploring symbol codes you can try the [Joint military symbology explorer](https://explorer.milsymb.net/#/explore/) or
browse the standards.

### Legacy symbol codes

Earlier versions of the symbology standards use a shorter, letter based, symbol identification code. There are plenty of
systems that still use letter based codes, so ORBAT Mapper supports converting from letter based codes to numeric codes
using the [convert-symbology](https://github.com/orbat-mapper/convert-symbology) library. Most symbols from 2525C/APP-6C
are available in 2525D/APP-6D, but they may look different.
