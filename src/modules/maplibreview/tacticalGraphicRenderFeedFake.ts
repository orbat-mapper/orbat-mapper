/**
 * A fake of the settle-first render feed. **Test-only** — nothing in the app imports it.
 *
 * The real feed rebuilds a batch from scenario state and hands it to the surface; the
 * only part of it the authoring layer can observe is the settle-first ordering — every
 * `render()` settles the open session *before* the batch is built, and `settle()` does
 * the same without rendering. That ordering is all this reproduces, so a test can reach
 * a session the way a time scrub or a layer-visibility toggle reaches it.
 */
import type {
  SettleHandler,
  SettleReason,
  TacticalGraphicRenderFeed,
} from "@/modules/maplibreview/useTacticalGraphicRenderFeed";

export interface TacticalGraphicRenderFeedFake {
  readonly feed: TacticalGraphicRenderFeed;
  /** Reasons passed to `render()`, in order. */
  readonly renders: SettleReason[];
  /** Reasons the registered session owners were settled with, in order. */
  readonly settles: SettleReason[];
}

export function createTacticalGraphicRenderFeedFake(): TacticalGraphicRenderFeedFake {
  const handlers = new Set<SettleHandler>();
  const renders: SettleReason[] = [];
  const settles: SettleReason[] = [];

  function settle(reason: SettleReason) {
    settles.push(reason);
    for (const handler of [...handlers]) handler(reason);
  }

  const feed: TacticalGraphicRenderFeed = {
    render(reason = "render") {
      renders.push(reason);
      settle(reason);
    },
    settle,
    onSettle(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    lastPlan: null,
  };

  return { feed, renders, settles };
}
