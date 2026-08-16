import type { Map as MlMap, MissingStyleImageResolver } from "maplibre-gl";

type ResolverRegistry = {
  resolvers: Set<MissingStyleImageResolver>;
  dispatch: MissingStyleImageResolver;
};

const registries = new WeakMap<MlMap, ResolverRegistry>();

/**
 * MapLibre exposes one missing-image resolver per map. This registry lets the
 * unit and scenario-feature renderers contribute images without overwriting
 * each other's resolver.
 */
export function registerMissingStyleImageResolver(
  map: MlMap,
  resolver: MissingStyleImageResolver,
): () => void {
  let registry = registries.get(map);
  if (!registry) {
    const resolvers = new Set<MissingStyleImageResolver>();
    registry = {
      resolvers,
      dispatch: async (id) => {
        for (const candidate of resolvers) {
          await candidate(id);
          if (map.hasImage(id)) return;
        }
      },
    };
    registries.set(map, registry);
    map.setMissingStyleImageResolver(registry.dispatch);
  }

  registry.resolvers.add(resolver);
  let registered = true;
  return () => {
    if (!registered) return;
    registered = false;
    registry.resolvers.delete(resolver);
    if (registry.resolvers.size === 0) {
      map.setMissingStyleImageResolver(null);
      registries.delete(map);
    }
  };
}
