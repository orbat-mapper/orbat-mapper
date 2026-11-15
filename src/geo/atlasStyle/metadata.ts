/** What a layer's style metadata holds under `key`, if anything. */
export function metadataValue(metadata: unknown, key: string): unknown {
  return (metadata as Record<string, unknown> | undefined)?.[key];
}
