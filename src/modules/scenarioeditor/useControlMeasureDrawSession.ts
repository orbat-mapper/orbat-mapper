/**
 * The control-measure draw session — the transient half of ADR-0006's commit-on-settle.
 *
 * A session lives entirely outside the scenario store. Nothing here writes while a
 * gesture is in flight; the settled `ControlMeasure` is folded in exactly once, by
 * `addScenarioControlMeasure`, and the feed is re-rendered immediately after because the
 * library hands its override back and expects the host's next render to be
 * authoritative.
 *
 * Aborts are a **normal outcome**, never an error: Escape, arming another tool, a
 * basemap swap and a destroyed surface all reject the `draw()` promise with
 * `TacticalDrawAbortError`, and all of them simply end the session with nothing written.
 * The one thing that must not happen is a stale rejection disarming a tool the user has
 * since armed, which is what the generation token guards.
 */
import { nextTick, onScopeDispose, shallowRef } from "vue";
import type { Ref } from "vue";
import { isTacticalDrawAbortError } from "@orbat-mapper/tactical-draw";
import type { DrawMeasureDraft, DrawSession } from "@orbat-mapper/tactical-draw";
import type { ControlMeasureKind } from "@orbat-mapper/control-measures";
import type { TScenario } from "@/scenariostore";
import type { TacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import type { TacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import {
  addScenarioControlMeasure,
  draftStyleForNewControlMeasure,
  type NewControlMeasureDefaults,
} from "@/modules/scenarioeditor/controlMeasureDrawHelpers";

/**
 * What the transient hint strip shows.
 *
 * `minControlPoints` / `maxControlPoints` come off the live `DrawSession`, so there is
 * no host-side per-kind table to keep in step with the registry's 78 kinds.
 */
export interface ControlMeasureDrawProgress {
  graphicKind: ControlMeasureKind;
  pointCount: number;
  minControlPoints: number;
  maxControlPoints?: number;
  /** `true` when the current point count is in `[min, max]`. */
  canCommit: boolean;
}

export interface UseControlMeasureDrawSessionOptions {
  scenario: TScenario;
  /** Re-read on every use: the façade is rebuilt on every basemap swap. */
  surface: () => TacticalDrawSurface | undefined | null;
  /** The settle-first feed. Absent on OpenLayers, which has no tactical-draw. */
  renderFeed?: TacticalGraphicRenderFeed | null;
  /**
   * The session-sticky authoring defaults a new graphic of `graphicKind` is born
   * with. Taken per kind because the styling gate is per kind — see
   * `newControlMeasureDefaults`.
   */
  defaults?: (graphicKind: ControlMeasureKind) => NewControlMeasureDefaults;
  /**
   * A session ended on its own. The armed-tool owner decides what happens next —
   * re-arm on commit when `addMultiple`, disarm otherwise.
   */
  onSettled: (result: { committed: boolean; graphicKind: ControlMeasureKind }) => void;
}

export interface ControlMeasureDrawSession {
  /** Non-null exactly while a draw session is open. */
  readonly progress: Ref<ControlMeasureDrawProgress | null>;
  /** Open a draw session for `graphicKind`. Supersedes whatever this owner had open. */
  start(graphicKind: ControlMeasureKind): void;
  /** Give up ownership of any open session without committing. */
  stop(): void;
  /** Finish the open session if it has enough points. `false` when it does not. */
  commit(): boolean;
}

export function useControlMeasureDrawSession(
  options: UseControlMeasureDrawSessionOptions,
): ControlMeasureDrawSession {
  const progress = shallowRef<ControlMeasureDrawProgress | null>(null);

  // Bumped by every `start`/`stop`, and captured by each session's callbacks. A
  // `draw()` promise settles a microtask after the abort that caused it, so without
  // this a preempted session's rejection would arrive *after* the replacement tool was
  // armed and disarm it.
  let generation = 0;
  // Never made reactive: the engine holds this object for the life of the session.
  let session: DrawSession | null = null;

  function readProgress(
    live: DrawSession,
    graphicKind: ControlMeasureKind,
  ): ControlMeasureDrawProgress {
    return {
      graphicKind,
      pointCount: live.controlPoints.length,
      minControlPoints: live.minControlPoints,
      maxControlPoints: live.maxControlPoints,
      canCommit: live.canCommit,
    };
  }

  function stop() {
    generation += 1;
    session = null;
    progress.value = null;
  }

  async function finish(
    token: number,
    graphicKind: ControlMeasureKind,
    measure: Parameters<typeof addScenarioControlMeasure>[1] | null,
  ) {
    if (token !== generation) return;
    // Cleared before the write, so the settle this write's re-render triggers does not
    // try to cancel a session that has already settled.
    session = null;
    progress.value = null;
    if (!measure) {
      options.onSettled({ committed: false, graphicKind });
      return;
    }
    addScenarioControlMeasure(
      options.scenario,
      measure,
      options.defaults?.(graphicKind) ?? {},
    );
    // Required by the library's contract, not an optimisation: it hands the override
    // back and expects the host's next render to be authoritative.
    options.renderFeed?.render("commit");
    // That write bumped `featureStateCounter`, so the feed already has a second render
    // queued. Let it flush before anything re-arms, or its settle would abort the
    // session `onSettled` is about to open.
    await nextTick();
    if (token !== generation) return;
    options.onSettled({ committed: true, graphicKind });
  }

  function start(graphicKind: ControlMeasureKind) {
    stop();
    const token = generation;
    const surface = options.surface();
    if (!surface) return;
    const draft = {
      kind: graphicKind,
      style: draftStyleForNewControlMeasure(
        graphicKind,
        options.defaults?.(graphicKind) ?? {},
      ),
    } as DrawMeasureDraft;
    surface
      .draw(draft, {
        onSession(live) {
          if (token !== generation) return;
          session = live;
          progress.value = readProgress(live, graphicKind);
          live.onChange((changed) => {
            if (token !== generation) return;
            progress.value = readProgress(changed, graphicKind);
          });
        },
      })
      .then((snapshot) => finish(token, graphicKind, snapshot.graphic))
      .catch((error) => {
        // Abort is the normal way a draw ends — Escape, another tool armed, a basemap
        // swap mid-gesture. Nothing is written and nothing is reported.
        if (!isTacticalDrawAbortError(error)) {
          console.error("[controlMeasureDraw] draw session failed", error);
        }
        return finish(token, graphicKind, null);
      });
  }

  // The settle-first guard's draw disposition: a `DrawSession` has no way to keep
  // partial work, so it aborts. Registered on the feed rather than called from `arm()`
  // so a time scrub or a layer-visibility toggle settles through the same path.
  const unregisterSettle = options.renderFeed?.onSettle(() => {
    if (!session) return;
    options.surface()?.cancel("preempted");
  });

  onScopeDispose(() => {
    unregisterSettle?.();
    stop();
  });

  return {
    progress,
    start,
    stop,
    commit: () => session?.commit() ?? false,
  };
}
