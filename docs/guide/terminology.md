<script setup>
import DocMilSymbol from "../components/DocMilSymbol.vue";
</script>

# Terminology

A scenario in ORBAT Mapper consists of units organized into into _sides_ and groups.

## Sides and groups

A scenario consists of _units_ organized into _groups_ and _sides_. A side typically represents a nation or
coalition. In a WWII scenario the sides would typically be _Allied forces_ and _Axis forces_.

For each side you can specify a standard identity / affiliation. The standard identity determines the color and shape
of the unit icons. The most commonly used ones are friend, neutral and hostile:

<div class="grid grid-cols-3 gap-0 items-center justify-items-center content-end">
    <DocMilSymbol sidc="10031000000000000000" />
    <DocMilSymbol sidc="10041000000000000000" />
    <DocMilSymbol sidc="10061000000000000000" />
    <p>Friend</p>
    <p>Neutral</p>
    <p>Hostile</p>
</div>

You can also select custom colors if you prefer that.

Each side is divided into one or more groups of units. The topmost unit in a hierarchy is called a _root
unit_.

How you organize a scenario is up to you. One example is the Falklands demo scenario. It consists of two sides, Great
Britain and Argentina.

![](images/sides-and-groups.png)
