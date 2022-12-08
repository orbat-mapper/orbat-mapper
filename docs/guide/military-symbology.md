<script setup>
import MilSymbol from '../components/MilSymbol.vue'
</script>

# Military symbology

ORBAT Mapper uses military map symbols when displaying units, equipment and installations.
The symbols are drawn according to rules defined
in the standards [MIL-STD 2525D](https://www.jcs.mil/Portals/36/Documents/Doctrine/Other_Pubs/ms_2525d.pdf) and [NATO
APP-6D](https://nso.nato.int/nso/nsdd/main/standards/ap-details/1912/EN).

<div class="flex items-center gap-4 justify-center">
    <MilSymbol sidc="10031000131211004600" size="32"/> 
    <MilSymbol sidc="10061000151205010000" size="32"/>
    <MilSymbol sidc="10031500331105030000" size="32"/>
</div>

<div class="flex gap-4 items-center justify-center">
    <MilSymbol sidc="10011000000000000000" size="32"/>
    <MilSymbol sidc="10031000000000000000" size="32"/>
    <MilSymbol sidc="10041000000000000000" size="32"/>
    <MilSymbol sidc="10061000000000000000" size="32"/>
</div>
