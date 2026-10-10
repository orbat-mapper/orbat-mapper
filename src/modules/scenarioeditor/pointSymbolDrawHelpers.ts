/**
 * The commit half of placing a point symbol: the `pointSymbol` counterpart to
 * `addScenarioControlMeasure`, and bound by the same rule — one store write, one undo
 * step, including the control-measure layer a first placement creates.
 */
import type { Position } from "geojson";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { PointSymbolLayerItem, PointSymbolSize } from "@/types/scenarioLayerItems";
import { setSid } from "@/symbology/helpers";
import type { SidValue } from "@/symbology/values";
import { nanoid } from "@/utils";
import { isEqual } from "es-toolkit";
import { DEFAULT_POINT_SYMBOL_SIZE } from "@/geo/pointSymbols";
import {
  getOrCreateControlMeasureLayerId,
  nextLayerItemName,
} from "@/modules/scenarioeditor/controlMeasureDrawHelpers";

/** What a placement needs: the symbol, its catalogue name, where it goes and its size. */
export interface NewPointSymbol {
  sidc: string;
  /** The catalogue name, used as the base of the item's numbered name. */
  name: string;
  position: Position;
  /** Omitted, or the default, leaves the item without a stored size. */
  size?: PointSymbolSize;
}

/** Stamp the authoring default identity onto a catalogue SIDC. */
export function pointSymbolSidcWithIdentity(sidc: string, identity?: SidValue): string {
  return identity ? setSid(sidc, identity) : sidc;
}

export function addScenarioPointSymbol(
  scenario: TScenario,
  symbol: NewPointSymbol,
  destinationLayerId?: FeatureId,
  id: string = nanoid(),
): PointSymbolLayerItem | undefined {
  const item: PointSymbolLayerItem = {
    kind: "pointSymbol",
    id,
    sidc: symbol.sidc,
    position: [symbol.position[0], symbol.position[1]],
    ...(symbol.size && !isEqual(symbol.size, DEFAULT_POINT_SYMBOL_SIZE)
      ? { size: { ...symbol.size } }
      : {}),
  };
  let added = false;
  scenario.store.groupUpdate(
    () => {
      const layerId = destinationLayerId ?? getOrCreateControlMeasureLayerId(scenario);
      if (!layerId) return;
      item.name = nextLayerItemName(scenario, layerId, symbol.name);
      added = Boolean(scenario.geo.addFeature(item, layerId));
    },
    { label: "addFeature", value: item.id },
  );
  return added ? item : undefined;
}
