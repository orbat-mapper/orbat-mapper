/**
 * Browsing state for the Graphics sidebar tab.
 *
 * Module-level rather than per component: the tab unmounts whenever another tab is
 * shown, and coming back should not lose the search, the filter, the folded sections or
 * the scroll position. None of it belongs to a scenario. Cell size and descriptions are
 * display preferences and persist across reloads.
 */
import { computed, reactive, ref, shallowRef } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { CONTROL_MEASURE_METADATA } from "@orbat-mapper/control-measures";
import type {
  ControlMeasureGeometry,
  ControlMeasureId,
} from "@orbat-mapper/control-measures";
import {
  controlMeasureSearchMatcher,
  groupControlMeasureKinds,
  listControlMeasureKindOptions,
  type ControlMeasureKindOption,
} from "@/modules/scenarioeditor/controlMeasurePicker";
import type { MainIconEntity } from "@/symbology/types";
import { buildSidc, MIL_STD_2525E_VERSION, Sidc } from "@/symbology/sidc";
import { CONTROL_MEASURE_SYMBOLSET_VALUE, SID } from "@/symbology/values";

export type ControlMeasureCatalogueFilter =
  "all" | ControlMeasureGeometry | "tasks" | "generic";

/** Filters that pick one registry entity rather than a geometry. */
const ENTITY_FILTERS: Partial<Record<ControlMeasureCatalogueFilter, string>> = {
  tasks: "Mission Tasks",
  generic: "Generic Graphics",
};

export const CONTROL_MEASURE_CATALOGUE_FILTERS: {
  value: ControlMeasureCatalogueFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "point", label: "Points" },
  { value: "line", label: "Lines" },
  { value: "area", label: "Areas" },
  { value: "tasks", label: "Tasks" },
  { value: "generic", label: "Generic" },
];

export const CONTROL_MEASURE_CELL_SIZES = {
  small: { short: "S", label: "Small", width: 80, height: 72, previewHeight: 32 },
  medium: { short: "M", label: "Medium", width: 104, height: 96, previewHeight: 44 },
  large: { short: "L", label: "Large", width: 128, height: 120, previewHeight: 56 },
  xlarge: {
    short: "XL",
    label: "Extra large",
    width: 152,
    height: 144,
    previewHeight: 68,
  },
} as const;

export type ControlMeasureCellSize = keyof typeof CONTROL_MEASURE_CELL_SIZES;

export function readControlMeasureCellSize(value: unknown): ControlMeasureCellSize {
  return typeof value === "string" && value in CONTROL_MEASURE_CELL_SIZES
    ? (value as ControlMeasureCellSize)
    : "medium";
}

interface CatalogueEntryBase {
  /** Unique across both kinds of entry. */
  key: string;
  name: string;
  description: string;
  /** Shown as the tile's tooltip qualifier. */
  qualifier: string;
  entity: string;
  geometry: ControlMeasureGeometry;
  /** Pre-lowercased haystack. */
  searchText: string;
}

/** A kind the control-measures library generates from control points. */
export interface CatalogueMeasureEntry extends CatalogueEntryBase {
  type: "measure";
  id: ControlMeasureId;
}

/** A symbol set 25 point symbol drawn by milsymbol. */
export interface CatalogueSymbolEntry extends CatalogueEntryBase {
  type: "symbol";
  code: string;
  /** Built as Friend; the placement stamps the authoring identity on. */
  sidc: string;
}

export type ControlMeasureCatalogueEntry = CatalogueMeasureEntry | CatalogueSymbolEntry;

export interface ControlMeasureCatalogueGroup {
  entity: string;
  items: ControlMeasureCatalogueEntry[];
}

function toMeasureEntry(option: ControlMeasureKindOption): CatalogueMeasureEntry {
  return {
    type: "measure",
    key: option.id,
    id: option.id,
    name: option.name,
    description: option.description,
    qualifier: option.qualifier,
    entity: option.entity,
    geometry: CONTROL_MEASURE_METADATA[option.id].geometry,
    searchText: option.searchText,
  };
}

const MEASURE_ENTRIES: readonly CatalogueMeasureEntry[] =
  listControlMeasureKindOptions().map(toMeasureEntry);

/** A point-symbol entry's key: `symbol:<main icon>`. */
export function pointSymbolEntryKey(mainIcon: string): string {
  return `symbol:${mainIcon}`;
}

/**
 * The symbol set 25 point symbols, minus every one the control-measures library
 * already draws (matched on the main icon code, as tactrace does): those are offered
 * once, as the library's generated graphic.
 */
export function pointSymbolEntries(
  icons: readonly MainIconEntity[],
): CatalogueSymbolEntry[] {
  const libraryCodes = new Set(
    Object.values(CONTROL_MEASURE_METADATA).map((metadata) => metadata.value),
  );
  return icons
    .filter((icon) => icon.geometry === "Point" && !libraryCodes.has(icon.code))
    .map((icon) => {
      const name =
        [icon.entityType, icon.entitySubtype].filter(Boolean).join(" – ") || icon.entity;
      const qualifier = icon.entitySubtype ? (icon.entityType ?? "") : "";
      return {
        type: "symbol",
        key: pointSymbolEntryKey(icon.code),
        code: icon.code,
        sidc: buildSidc(MIL_STD_2525E_VERSION, {
          symbolSet: CONTROL_MEASURE_SYMBOLSET_VALUE,
          standardIdentity: SID.Friend,
          mainIcon: icon.code,
        }),
        name,
        description: icon.remarks ?? "",
        qualifier,
        entity: icon.entity,
        geometry: "point",
        searchText: [icon.code, name, icon.entity, icon.remarks ?? ""]
          .join(" ")
          .toLowerCase(),
      } satisfies CatalogueSymbolEntry;
    });
}

/**
 * Search, then narrow to one geometry or entity, grouped by entity. Library kinds come
 * first in registry order; symbol groups follow in standard order, and a symbol group
 * whose entity the library already uses joins that group.
 */
export function filterControlMeasureCatalogue(
  query: string,
  filter: ControlMeasureCatalogueFilter,
  symbols: readonly CatalogueSymbolEntry[] = [],
): ControlMeasureCatalogueGroup[] {
  const search = controlMeasureSearchMatcher(query);
  const entity = ENTITY_FILTERS[filter];
  const matches = (entry: ControlMeasureCatalogueEntry) => {
    if (filter !== "all") {
      if (entity ? entry.entity !== entity : entry.geometry !== filter) return false;
    }
    return !search || search(entry.searchText);
  };
  const groups = groupControlMeasureKinds(
    [...MEASURE_ENTRIES, ...symbols].filter(matches),
  );
  return [...groups].map(([entity, items]) => ({ entity, items }));
}

const symbols = shallowRef<CatalogueSymbolEntry[]>([]);
let symbolsLoading: Promise<void> | undefined;

/** The 2525E tables are large, so they load on first use and only once. */
function loadPointSymbols() {
  symbolsLoading ??= import("@/symbology/standards/milstd2525e")
    .then(({ ms2525e }) => {
      symbols.value = pointSymbolEntries(
        ms2525e[CONTROL_MEASURE_SYMBOLSET_VALUE]?.mainIcon ?? [],
      );
    })
    .catch((error: unknown) => {
      symbolsLoading = undefined;
      console.error("[controlMeasureCatalogue] could not load point symbols", error);
    });
  return symbolsLoading;
}

/**
 * The catalogue entry for a placed point symbol, by its SIDC's main icon — its
 * doctrinal name and description for the details panel. Loads the tables on first use;
 * reactive, so it fills in once they arrive.
 */
export function usePointSymbolEntry(sidc: () => string | undefined) {
  void loadPointSymbols();
  return computed(() => {
    const value = sidc();
    const code = value && new Sidc(value).mainIcon;
    return code ? symbols.value.find((entry) => entry.code === code) : undefined;
  });
}

const query = ref("");
const filter = ref<ControlMeasureCatalogueFilter>("all");
const collapsed = reactive(new Set<string>());
const scrollTop = ref(0);
const groups = computed(() =>
  filterControlMeasureCatalogue(query.value, filter.value, symbols.value),
);
/** Every entry, unfiltered, so per-entry state can outlive a search. */
const entries = computed<ControlMeasureCatalogueEntry[]>(() => [
  ...MEASURE_ENTRIES,
  ...symbols.value,
]);

export function useControlMeasureCatalogue() {
  void loadPointSymbols();
  const storedCellSize = useLocalStorage<string>(
    "controlMeasureCatalogueCellSize",
    "medium",
  );
  const cellSize = computed<ControlMeasureCellSize>({
    get: () => readControlMeasureCellSize(storedCellSize.value),
    set: (value) => (storedCellSize.value = value),
  });
  const descriptionsVisible = useLocalStorage(
    "controlMeasureCatalogueDescriptions",
    false,
  );
  return {
    query,
    filter,
    collapsed,
    scrollTop,
    groups,
    entries,
    cellSize,
    descriptionsVisible,
  };
}
