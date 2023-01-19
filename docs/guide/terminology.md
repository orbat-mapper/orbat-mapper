<script setup>
import DocMilSymbol from "../components/DocMilSymbol.vue";
</script>

# Terminology

Under the hood ORBAT Mapper uses a data model loosely inspired by
the [Military Scenario Definition Language (MSDL)](https://en.wikipedia.org/wiki/Military_Scenario_Definition_Language).
In this section we will go through some terminology you will encounter when building a scenario.

## Scenario

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

You can also select custom colors. This is useful in cases when you do not want to label a side as hostile or want to
distinguish different nations by symbol color.

Each side consists of one or more groups of units. A group is just a way to organize your units. They can for instance
represent branches (army, navy, air-force, etc.), a task force, a battlefront, etc. The default group name is _Units_.

A group consists of one or more unit hierarchies. The topmost unit in a hierarchy is called a _root unit_.

## Units

A unit is the basic building block of a scenario. It has properties like military symbol, name, description, echelon,
location, etc.

<div class="grid grid-cols-3 gap-0 items-center justify-items-center content-end">
    <DocMilSymbol sidc="10031000161211000000" />
    <DocMilSymbol sidc="10031000141205000000" />
    <DocMilSymbol sidc="10061000151301020000" />
</div>

## Features

## Events

How you organize a scenario is up to you. One example is the Falklands demo scenario. It consists of two sides, Great
Britain and Argentina.

![](images/sides-and-groups.png)
