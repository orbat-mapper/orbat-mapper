<script setup lang="ts">
import PanelHeading from "@/components/PanelHeading.vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watchEffect } from "vue";
import { Sidc } from "@/symbology/sidc";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  echelonValues,
  HQTFDummyValues,
  standardIdentityValues,
  statusValues,
  symbolSetValues,
} from "@/symbology/values";
import type { NUnit } from "@/types/internalModels";
import { app6d as sym } from "@/symbology/standards/app6d";
import FilterTree, {
  type NestedUnitStatItem,
} from "@/modules/scenarioeditor/FilterTree.vue";
import { IconExpandAllOutline } from "@iconify-prerendered/vue-mdi";
import IconButton from "@/components/IconButton.vue";
import { Button } from "@/components/ui/button";
import NewAccordionPanel from "@/components/NewAccordionPanel.vue";

const {
  store: { state },
} = injectStrict(activeScenarioKey);

const sideTree = ref<NestedUnitStatItem[]>([]);
const emtTree = ref<NestedUnitStatItem[]>([]);
const iconTree = ref<NestedUnitStatItem[]>([]);
const modifierTree = ref<NestedUnitStatItem[]>([]);
const statusTree = ref<NestedUnitStatItem[]>([]);
const sidTree = ref<NestedUnitStatItem[]>([]);
const { selectedUnitIds } = useSelectedItems();

const excludedKeys = ref<Set<string>>(new Set());
const expandedKeys = ref<string[]>([]);
const flatStats = ref<Record<string, number>>({});

watchEffect(() => {
  const stats: Record<string, number> = {};
  const sidStatItems: NestedUnitStatItem[] = [];
  const sideStatItems: NestedUnitStatItem[] = [];
  const emtStatItems: NestedUnitStatItem[] = [];
  const iconStatItems: NestedUnitStatItem[] = [];
  const modifierStatItems: NestedUnitStatItem[] = [];
  const statusStatItems: NestedUnitStatItem[] = [];
  Object.values(state.unitMap).forEach((unit) => {
    const {
      sideKey,
      sideGroupKey,
      emtKey,
      symbolSetKey,
      entityKey,
      entityTypeKey,
      mod1Key,
      mod2Key,
      modSymbolSetKey,
      statusKey,
      hqtfdKey,
      sidKey,
    } = updateUnitStats(unit, stats);

    const iconSidc = new Sidc(unit.sidc);
    const originalEmt = iconSidc.emt;
    const originalMod1 = iconSidc.modifierOne;
    const originalMod2 = iconSidc.modifierTwo;
    iconSidc.emt = "00";
    iconSidc.hqtfd = "0";
    iconSidc.standardIdentity = "3";
    iconSidc.entitySubType = "00";
    iconSidc.modifierOne = "00";
    iconSidc.modifierTwo = "00";
    const sidc = iconSidc.toString();
    iconSidc.mainIcon = "000000";
    const sidcSymbolSet = iconSidc.toString();
    iconSidc.modifierOne = originalMod1;
    iconSidc.modifierTwo = originalMod2;
    iconSidc.modifierOne = "00";
    iconSidc.modifierTwo = "00";
    iconSidc.emt = originalEmt;
    const sidcEmt = iconSidc.toString();
    if (stats[sideKey] === 1) {
      sideStatItems.push({
        key: sideKey,
        label: getSideLabel(unit._sid),
        sidc: sidc,
      });
    }
    if (stats[sideGroupKey] === 1) {
      const sideItem = sideStatItems.find((item) => item.key === sideKey);
      if (sideItem) {
        const children = sideItem.children || [];
        children.push({
          key: sideGroupKey,
          label: getSideGroupLabel(unit._gid),
          sidc: "10031000100000000000",
        });

        sideItem.children = children;
        sideItem.sidc = "10031000100000000000";
      }
    }
    if (stats[emtKey] === 1) {
      emtStatItems.push({ key: emtKey, label: getEchelonLabel(emtKey), sidc: sidcEmt });
    }
    if (stats[symbolSetKey] === 1) {
      iconStatItems.push({
        key: symbolSetKey,
        label: getIconLabel({ symbolSet: symbolSetKey }),
        sidc: sidcSymbolSet,
      });
      modifierStatItems.push({
        key: modSymbolSetKey,
        label: getIconLabel({ symbolSet: symbolSetKey }),
        sidc: sidcSymbolSet,
      });
    }
    if (stats[entityKey] === 1) {
      const iconItem = iconStatItems.find((item) => item.key === symbolSetKey);
      if (iconItem) {
        const children = iconItem.children || [];
        children.push({
          key: entityKey,
          label: getIconLabel({
            symbolSet: symbolSetKey,
            entity: entityKey.split("-")[1],
          }),
          sidc: sidc,
        });
        iconItem.children = sortBy(children, "label");
      }
    }
    if (stats[entityTypeKey] === 1) {
      const entityItem = iconStatItems
        .find((item) => item.key === symbolSetKey)
        ?.children?.find((item) => item.key === entityKey);
      if (entityItem) {
        const children = entityItem.children || [];
        children.push({
          key: entityTypeKey,
          label: getIconLabel({
            symbolSet: symbolSetKey,
            entity: entityKey.split("-")[1],
            entityType: entityTypeKey.split("-")[2],
          }),
          sidc: sidc,
        });
        entityItem.children = sortBy(children, "label");
      }
    }
    if (stats[mod1Key] === 1) {
      const modifierItem = modifierStatItems.find((item) => item.key === modSymbolSetKey);
      if (modifierItem) {
        const children = modifierItem.children || [];
        const sidc = new Sidc(sidcSymbolSet);
        sidc.modifierOne = mod1Key.split("-")[2];

        children.push({
          key: mod1Key,
          label: getModifierLabel({
            symbolSet: symbolSetKey,
            mod1: mod1Key.split("-")[2],
          }),
          sidc: sidc.toString(),
        });
        modifierItem.children = sortBy(children, "label");
      }
    }
    if (stats[mod2Key] === 1) {
      const modifierItem = modifierStatItems.find((item) => item.key === modSymbolSetKey);
      if (modifierItem) {
        const children = modifierItem.children || [];
        const sidc = new Sidc(sidcSymbolSet);
        sidc.modifierTwo = mod2Key.split("-")[2];
        children.push({
          key: mod2Key,
          label: getModifierLabel({
            symbolSet: symbolSetKey,
            mod2: mod2Key.split("-")[2],
          }),
          sidc: sidc.toString(),
        });
        modifierItem.children = sortBy(children, "label");
      }
    }
    if (stats[statusKey] === 1) {
      const tmpSidc = new Sidc("10031000100000000000");
      const statusCode = statusKey.split("-")[1];
      tmpSidc.status = statusCode;
      statusStatItems.push({
        key: statusKey,
        label: getStatusLabel(statusCode),
        sidc: tmpSidc.toString(),
      });
    }
    if (stats[hqtfdKey] === 1) {
      const tmpSidc = new Sidc("10031000100000000000");
      const hqtfdCode = hqtfdKey.split("-")[1];
      tmpSidc.hqtfd = hqtfdCode;
      statusStatItems.push({
        key: hqtfdKey,
        label: getHqtfdLabel(hqtfdCode),
        sidc: tmpSidc.toString(),
      });
    }

    if (stats[sidKey] === 1) {
      const tmpSidc = new Sidc("10031000000000000000");
      const sidCode = sidKey.split("-")[1];
      tmpSidc.standardIdentity = sidCode;
      sidStatItems.push({
        key: sidKey,
        label: getSidLabel(sidCode),
        sidc: tmpSidc.toString(),
      });
    }
  });

  flatStats.value = stats;
  sideTree.value = sortBy(sideStatItems, "label");
  emtTree.value = sortBy(emtStatItems, "label");
  iconTree.value = sortBy(iconStatItems, "label");
  modifierTree.value = sortBy(
    modifierStatItems.filter((i) => i.children?.length),
    "label",
  );
  statusTree.value = sortBy(statusStatItems, "label");
  sidTree.value = sortBy(sidStatItems, "label");
});

const selectedStats = computed(() => {
  const stats: Record<string, number> = {};
  selectedUnitIds.value.forEach((unitId) => {
    updateUnitStats(unitId, stats);
  });
  return stats;
});

function updateUnitStats(unitOrUnitId: string | NUnit, stats: Record<string, number>) {
  const unit =
    typeof unitOrUnitId === "string" ? state.unitMap[unitOrUnitId] : unitOrUnitId;
  const keys = createKeys(unit);
  const {
    symbolSetKey,
    entityKey,
    entityTypeKey,
    emtKey,
    sideKey,
    sideGroupKey,
    mod1Key,
    mod2Key,
    modSymbolSetKey,
    statusKey,
    hqtfdKey,
    sidKey,
  } = keys;
  stats[symbolSetKey] = (stats[symbolSetKey] || 0) + 1;
  stats[entityKey] = (stats[entityKey] || 0) + 1;
  stats[entityTypeKey] = (stats[entityTypeKey] || 0) + 1;
  stats[emtKey] = (stats[emtKey] || 0) + 1;
  stats[sideKey] = (stats[sideKey] || 0) + 1;
  stats[sideGroupKey] = (stats[sideGroupKey] || 0) + 1;
  stats[modSymbolSetKey] = (stats[modSymbolSetKey] || 0) + 1;
  stats[statusKey] = (stats[statusKey] || 0) + 1;
  stats[sidKey] = (stats[sidKey] || 0) + 1;
  if (!hqtfdKey.endsWith("0")) stats[hqtfdKey] = (stats[hqtfdKey] || 0) + 1;
  if (!mod1Key.endsWith("00")) stats[mod1Key] = (stats[mod1Key] || 0) + 1;
  if (!mod2Key.endsWith("00")) stats[mod2Key] = (stats[mod2Key] || 0) + 1;
  return keys;
}

function createKeys(unit: NUnit) {
  const sidc = new Sidc(unit.sidc);
  const sidKey = `sid-${sidc.standardIdentity}`;
  const symbolSetKey = `${sidc.symbolSet}`;
  const entityKey = `${sidc.symbolSet}-${sidc.entity}`;
  const entityTypeKey = `${sidc.symbolSet}-${sidc.entity}-${sidc.entityType}`;
  const emtKey = `emt-${sidc.emt}`;
  const sideKey = `side-${unit._sid}`;
  const sideGroupKey = `side-${unit._sid}-${unit._gid}`;
  const modSymbolSetKey = `mod-${sidc.symbolSet}`;
  const mod1Key = `mod1-${symbolSetKey}-${sidc.modifierOne}`;
  const mod2Key = `mod2-${symbolSetKey}-${sidc.modifierTwo}`;
  const statusKey = `status-${sidc.status}`;
  const hqtfdKey = `hqtfd-${sidc.hqtfd}`;
  return {
    sidKey,
    symbolSetKey,
    entityKey,
    entityTypeKey,
    emtKey,
    sideKey,
    sideGroupKey,
    modSymbolSetKey,
    mod1Key,
    mod2Key,
    statusKey,
    hqtfdKey,
  };
}

function selectByKey(key: string) {
  Object.values(state.unitMap).forEach((unit) => {
    const {
      symbolSetKey,
      entityKey,
      entityTypeKey,
      emtKey,
      sideKey,
      sideGroupKey,
      modSymbolSetKey,
      mod1Key,
      mod2Key,
      statusKey,
      hqtfdKey,
      sidKey,
    } = createKeys(unit);

    if (
      excludedKeys.value.has(symbolSetKey) ||
      excludedKeys.value.has(entityKey) ||
      excludedKeys.value.has(entityTypeKey) ||
      excludedKeys.value.has(emtKey) ||
      excludedKeys.value.has(sideKey) ||
      excludedKeys.value.has(sideGroupKey) ||
      excludedKeys.value.has(modSymbolSetKey) ||
      excludedKeys.value.has(mod1Key) ||
      excludedKeys.value.has(mod2Key) ||
      excludedKeys.value.has(statusKey) ||
      excludedKeys.value.has(hqtfdKey) ||
      excludedKeys.value.has(sidKey)
    ) {
      return;
    }
    if (key === symbolSetKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === entityKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === entityTypeKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === emtKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === sideKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === sideGroupKey && !excludedKeys.value.has(sideGroupKey)) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === modSymbolSetKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === mod1Key) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === mod2Key) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === statusKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === hqtfdKey) {
      selectedUnitIds.value.add(unit.id);
    } else if (key === sidKey) {
      selectedUnitIds.value.add(unit.id);
    }
  });
}

function clearByKey(key: string) {
  selectedUnitIds.value.forEach((unitId) => {
    const unit = state.unitMap[unitId];
    const {
      symbolSetKey,
      entityKey,
      entityTypeKey,
      emtKey,
      sideKey,
      sideGroupKey,
      mod2Key,
      mod1Key,
      modSymbolSetKey,
      statusKey,
      hqtfdKey,
      sidKey,
    } = createKeys(unit);
    if (key === symbolSetKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === entityKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === entityTypeKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === emtKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === sideKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === sideGroupKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === mod1Key) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === mod2Key) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === modSymbolSetKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === statusKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === hqtfdKey) {
      selectedUnitIds.value.delete(unit.id);
    } else if (key === sidKey) {
      selectedUnitIds.value.delete(unit.id);
    }
  });
}

function getEchelonLabel(echelon: string) {
  if (echelon.startsWith("emt-")) {
    const [, nechelon] = echelon.split("-");
    return echelonValues.find((v) => v.code === nechelon)?.text || echelon;
  }
  return echelonValues.find((v) => v.code === echelon)?.text || echelon;
}

function getStatusLabel(code: string) {
  return statusValues.find((v) => v.code === code)?.text || code;
}

function getHqtfdLabel(code: string) {
  return HQTFDummyValues.find((v) => v.code === code)?.text || code;
}

function getSymbolSetLabel(symbolSet: string) {
  return symbolSetValues.find((v) => v.code === symbolSet)?.text || symbolSet;
}

function getSidLabel(code: string) {
  return standardIdentityValues.find((v) => v.code === code)?.text || code;
}

type IconData = {
  symbolSet?: string;
  entity?: string;
  entityType?: string;
};

type ModifierData = {
  symbolSet?: string;
  mod1?: string;
  mod2?: string;
};

function getSideLabel(sideId: string) {
  return state.sideMap[sideId]?.name || sideId;
}

function getSideGroupLabel(sideGroupId: string) {
  return state.sideGroupMap[sideGroupId]?.name || sideGroupId;
}

function getIconLabel({ symbolSet, entity, entityType }: IconData) {
  let label = symbolSet ?? entity ?? entityType ?? "Unknown";
  if (symbolSet === undefined) {
    return label;
  }
  if (entity == undefined && entityType == undefined) {
    return getSymbolSetLabel(symbolSet);
  }
  if (entity !== undefined && entityType == undefined) {
    const mainIcon = sym[symbolSet]?.mainIcon;
    const i = mainIcon?.find((icon) => icon.code.startsWith(entity));
    return i?.entity || label;
  }
  if (entity !== undefined && entityType !== undefined) {
    const mainIcon = sym[symbolSet]?.mainIcon;
    const prefix = entity + entityType;
    const i = mainIcon?.find((icon) => icon.code.startsWith(prefix));
    return i?.entityType || i?.entity || label;
  }
  return label;
}

function getModifierLabel({ symbolSet, mod1, mod2 }: ModifierData) {
  let label = symbolSet ?? mod1 ?? mod2 ?? "Unknown";
  if (symbolSet === undefined) {
    return label;
  }
  if (mod1) {
    const modifiers = sym[symbolSet]?.modifierOne;
    const i = modifiers?.find((mod) => mod.code === mod1);
    return i?.modifier || label;
  }

  if (mod2) {
    const modifiers = sym[symbolSet]?.modifierTwo;
    const i = modifiers?.find((mod) => mod.code === mod2);
    return i?.modifier || label;
  }
  return label;
}

function onSelect(event: any) {
  const key = event.detail.value.key as string;

  if (selectedStats.value[key]) {
    clearByKey(key);
  } else {
    selectByKey(key);
  }
}

function expandAllIcons() {
  const keys = Object.keys(flatStats.value).filter((key) => !key.startsWith("side-"));
  const expandedSideKeys = keys.filter((key) => key.startsWith("side-"));
  if (expandedKeys.value.length - expandedSideKeys.length === keys.length) {
    expandedKeys.value = [];
  } else {
    expandedKeys.value = keys;
  }
}
</script>
<template>
  <div class="px-4">
    <header
      class="sticky top-0 z-10 -mx-4 flex h-12 items-center justify-between bg-white px-4 py-2 dark:bg-gray-800"
    >
      <PanelHeading>Select units</PanelHeading>
      <div class="flex items-center space-x-1">
        <Button
          v-if="excludedKeys.size"
          variant="outline"
          size="sm"
          @click="excludedKeys.clear()"
          >Clear excluded <span class="muted-badge">{{ excludedKeys.size }}</span></Button
        >
        <Button
          v-if="selectedUnitIds.size"
          variant="outline"
          size="sm"
          @click="selectedUnitIds.clear()"
          >Clear selected
          <span class="muted-badge ml-1">{{ selectedUnitIds.size }}</span></Button
        >
      </div>
    </header>
    <NewAccordionPanel label="Command level">
      <FilterTree
        :tree="emtTree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :excludedKeys="excludedKeys"
        @select="onSelect"
        @clear="clearByKey"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
    <NewAccordionPanel label="Main unit icon" default-open>
      <template #header
        ><IconButton title="Expand all" @click.stop="expandAllIcons()"
          ><IconExpandAllOutline /></IconButton
      ></template>
      <FilterTree
        :tree="iconTree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :excludedKeys="excludedKeys"
        @select="onSelect"
        @clear="clearByKey"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
    <NewAccordionPanel label="Side">
      <FilterTree
        :tree="sideTree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :excludedKeys="excludedKeys"
        @select="onSelect"
        @clear="clearByKey"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
    <NewAccordionPanel label="Standard identity">
      <FilterTree
        :tree="sidTree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :excludedKeys="excludedKeys"
        @select="onSelect"
        @clear="clearByKey"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
    <NewAccordionPanel label="Status">
      <FilterTree
        :tree="statusTree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :excludedKeys="excludedKeys"
        @select="onSelect"
        @clear="clearByKey"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
    <NewAccordionPanel label="Symbol modifiers">
      <FilterTree
        :tree="modifierTree"
        v-model:expandedKeys="expandedKeys"
        :stats="flatStats"
        :selectedStats="selectedStats"
        :excludedKeys="excludedKeys"
        @select="onSelect"
        @clear="clearByKey"
        @exclude="excludedKeys.add($event)"
        @clearExclude="excludedKeys.delete($event)"
      />
    </NewAccordionPanel>
  </div>
</template>
