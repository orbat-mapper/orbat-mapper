import type { EntityId } from "@/types/base";
import type { Coordinate } from "ol/coordinate";
import type { UnitClusteringMode, UnitClusteringSettings } from "@/types/mapSettings";

export interface ClusterableUnit {
  id: EntityId;
  coordinate: Coordinate;
  sideId: EntityId;
  domain: string;
  standardIdentity: string;
  parentId?: EntityId;
  depth: number;
}

export interface UnitClusterCompositionEntry {
  key: string;
  sideId: EntityId;
  domain: string;
  standardIdentity: string;
  count: number;
  representativeUnitId: EntityId;
}

export interface UnitCluster {
  id: string;
  mode: Exclude<UnitClusteringMode, "off">;
  ancestorId: EntityId;
  memberIds: EntityId[];
  coordinate: Coordinate;
  sideId: EntityId;
  parentId?: EntityId;
  depth: number;
  composition: UnitClusterCompositionEntry[];
  representativeUnitId: EntityId;
}

export interface UnitClusterResult {
  clusters: UnitCluster[];
  clusteredUnitIds: Set<EntityId>;
}

interface ClusterOptions {
  resolution?: number;
  zoom?: number;
  expandedAncestorIds?: ReadonlySet<EntityId>;
}

interface HierarchyNode {
  id: EntityId;
  unit?: ClusterableUnit;
  sideId: EntityId;
  domain: string;
  parentId?: EntityId;
  children: HierarchyNode[];
}

function distanceSquared(a: Coordinate, b: Coordinate) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function centroid(units: ClusterableUnit[]): Coordinate {
  if (!units.length) return [0, 0];
  const [x, y] = units.reduce(
    (sum, unit) => [sum[0] + unit.coordinate[0], sum[1] + unit.coordinate[1]],
    [0, 0],
  );
  return [x / units.length, y / units.length];
}

function isCompact(units: ClusterableUnit[], maxDistance: number) {
  if (units.length < 2) return false;
  const maxDistanceSquared = maxDistance * maxDistance;
  for (let i = 0; i < units.length; i += 1) {
    for (let j = i + 1; j < units.length; j += 1) {
      if (distanceSquared(units[i]!.coordinate, units[j]!.coordinate) > maxDistanceSquared) {
        return false;
      }
    }
  }
  return true;
}

function buildProximityGroups(units: ClusterableUnit[], maxDistance: number) {
  const groups: ClusterableUnit[][] = [];
  const visited = new Set<EntityId>();
  const maxDistanceSquared = maxDistance * maxDistance;

  for (const unit of units) {
    if (visited.has(unit.id)) continue;

    const queue = [unit];
    const group: ClusterableUnit[] = [];
    visited.add(unit.id);

    while (queue.length) {
      const current = queue.shift()!;
      group.push(current);

      for (const candidate of units) {
        if (visited.has(candidate.id)) continue;
        if (
          distanceSquared(current.coordinate, candidate.coordinate) <= maxDistanceSquared
        ) {
          visited.add(candidate.id);
          queue.push(candidate);
        }
      }
    }

    groups.push(group);
  }

  return groups;
}

function createNaiveCluster(units: ClusterableUnit[]): UnitCluster {
  const memberIds = units.map((unit) => unit.id).sort();
  const leader = units[0]!;
  const composition = summarizeComposition(units);
  return {
    id: `cluster:naive:${memberIds.join(",")}`,
    mode: "naive",
    ancestorId: leader.parentId ?? leader.sideId,
    memberIds,
    coordinate: centroid(units),
    sideId: leader.sideId,
    parentId: leader.parentId,
    depth: Math.min(...units.map((unit) => unit.depth)),
    composition,
    representativeUnitId: composition[0]?.representativeUnitId ?? leader.id,
  };
}

function summarizeComposition(units: ClusterableUnit[]): UnitClusterCompositionEntry[] {
  const buckets = new Map<string, UnitClusterCompositionEntry>();

  units.forEach((unit) => {
    const key = `${unit.sideId}:${unit.domain}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
      return;
    }
    buckets.set(key, {
      key,
      sideId: unit.sideId,
      domain: unit.domain,
      standardIdentity: unit.standardIdentity,
      count: 1,
      representativeUnitId: unit.id,
    });
  });

  return [...buckets.values()].sort((a, b) =>
    a.count !== b.count ? b.count - a.count : a.key.localeCompare(b.key),
  );
}

function buildHierarchyForest(
  units: ClusterableUnit[],
  { separateRootsByDomain }: { separateRootsByDomain: boolean },
) {
  const nodeMap = new Map<EntityId, HierarchyNode>();
  const roots = new Map<string, HierarchyNode>();

  units.forEach((unit) => {
    nodeMap.set(unit.id, {
      id: unit.id,
      unit,
      sideId: unit.sideId,
      domain: unit.domain,
      parentId: unit.parentId,
      children: [],
    });
  });

  nodeMap.forEach((node) => {
    const parentNode = node.unit?.parentId ? nodeMap.get(node.unit.parentId) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
      return;
    }

    const rootKey = separateRootsByDomain
      ? `${node.sideId}:${node.domain}:${node.parentId ?? "__root__"}`
      : `${node.sideId}:${node.parentId ?? "__root__"}`;
    const existingRoot = roots.get(rootKey);
    if (existingRoot) {
      existingRoot.children.push(node);
      return;
    }

    roots.set(rootKey, {
      id: (node.parentId ?? `side:${node.sideId}`) as EntityId,
      sideId: node.sideId,
      domain: node.domain,
      parentId: node.parentId,
      children: [node],
    });
  });

  return [...roots.values()];
}

function buildHierarchyClusters(
  units: ClusterableUnit[],
  settings: UnitClusteringSettings,
  maxDistance: number,
  expandedAncestorIds: ReadonlySet<EntityId>,
): UnitClusterResult {
  const clusters: UnitCluster[] = [];
  const clusteredUnitIds = new Set<EntityId>();
  const descendantCache = new Map<EntityId, ClusterableUnit[]>();
  const forest = buildHierarchyForest(units, {
    separateRootsByDomain: settings.unitClusterGroupingMode !== "summary",
  });

  function collectSubtreeUnits(node: HierarchyNode): ClusterableUnit[] {
    const cached = descendantCache.get(node.id);
    if (cached) return cached;

    const subtree = [
      ...(node.unit ? [node.unit] : []),
      ...node.children.flatMap((child) => collectSubtreeUnits(child)),
    ];
    descendantCache.set(node.id, subtree);
    return subtree;
  }

  function collectDescendantUnits(node: HierarchyNode) {
    return node.children.flatMap((child) => collectSubtreeUnits(child));
  }

  function maybeCreateHierarchyCluster(node: HierarchyNode) {
    if (expandedAncestorIds.has(node.id)) return false;
    const members = collectDescendantUnits(node);
    if (members.length < settings.unitClusteringMinSize) return false;

    const minDepth = Math.min(...members.map((unit) => unit.depth));
    if (minDepth < settings.unitClusteringHierarchyMinDepth) return false;
    if (!isCompact(members, maxDistance)) return false;

    const coordinate = node.unit ? [...node.unit.coordinate] : centroid(members);
    const memberIds = members.map((unit) => unit.id).sort();
    const composition = summarizeComposition(members);
    clusters.push({
      id: `cluster:hierarchy:${node.id}:${memberIds.join(",")}`,
      mode: "hierarchy",
      ancestorId: node.id,
      memberIds,
      coordinate,
      sideId: members[0]!.sideId,
      parentId: node.unit?.parentId ?? node.parentId,
      depth: minDepth,
      composition,
      representativeUnitId:
        node.unit?.id ?? composition[0]?.representativeUnitId ?? members[0]!.id,
    });
    memberIds.forEach((memberId) => clusteredUnitIds.add(memberId));
    return true;
  }

  function visit(node: HierarchyNode) {
    if (node.children.length === 0) return;
    if (maybeCreateHierarchyCluster(node)) return;
    node.children.forEach((child) => visit(child));
  }

  forest.forEach((root) => visit(root));

  return { clusters, clusteredUnitIds };
}

export function clusterUnits(
  units: ClusterableUnit[],
  settings: UnitClusteringSettings,
  options: ClusterOptions = {},
): UnitClusterResult {
  const { resolution, zoom, expandedAncestorIds = new Set<EntityId>() } = options;

  if (
    settings.unitClusteringMode === "off" ||
    !units.length ||
    !resolution ||
    resolution <= 0 ||
    (typeof zoom === "number" && zoom > settings.unitClusteringMaxZoom)
  ) {
    return { clusters: [], clusteredUnitIds: new Set() };
  }

  const threshold = settings.unitClusteringDistancePx * resolution;
  const scopedUnits =
    settings.unitClusterGroupingMode === "summary"
      ? [units]
      : (() => {
          const domainBuckets = new Map<string, ClusterableUnit[]>();
          units.forEach((unit) => {
            const key = `${unit.sideId}:${unit.domain}`;
            const bucket = domainBuckets.get(key) ?? [];
            bucket.push(unit);
            domainBuckets.set(key, bucket);
          });
          return [...domainBuckets.values()];
        })();

  if (settings.unitClusteringMode === "naive") {
    const clusters: UnitCluster[] = [];
    const clusteredUnitIds = new Set<EntityId>();

    scopedUnits.forEach((bucketUnits) => {
      buildProximityGroups(bucketUnits, threshold).forEach((group) => {
        if (group.length < settings.unitClusteringMinSize) return;
        const cluster = createNaiveCluster(group);
        clusters.push(cluster);
        cluster.memberIds.forEach((memberId) => clusteredUnitIds.add(memberId));
      });
    });

    return { clusters, clusteredUnitIds };
  }

  const allClusters: UnitCluster[] = [];
  const allClusteredUnitIds = new Set<EntityId>();
  scopedUnits.forEach((bucketUnits) => {
    const result = buildHierarchyClusters(
      bucketUnits,
      settings,
      threshold,
      expandedAncestorIds,
    );
    allClusters.push(...result.clusters);
    result.clusteredUnitIds.forEach((unitId) => allClusteredUnitIds.add(unitId));
  });

  return { clusters: allClusters, clusteredUnitIds: allClusteredUnitIds };
}
