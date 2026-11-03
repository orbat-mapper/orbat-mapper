import { NavigationControl, type Map as MlMap } from "maplibre-gl";

/** Ignore pitch and roll this small, so a view that has eased back to flat counts as level. */
const LEVEL_EPSILON = 0.01;

const COMPASS_TITLE = "Reset bearing to north (double-click to also level the view)";
const LEVEL_TITLE = "Level the view";

export type CompassMap = Pick<
  MlMap,
  "on" | "off" | "getPitch" | "getRoll" | "resetNorth" | "resetNorthPitch" | "easeTo"
>;

/** Eases pitch and roll back to flat, keeping the bearing. */
export function levelView(map: Pick<MlMap, "easeTo">, eventData?: object) {
  map.easeTo({ pitch: 0, roll: 0, duration: 1000 }, eventData);
}

/**
 * Splits the compass reset of a MapLibre navigation control in two. A click on the compass
 * resets only the bearing and a double-click also levels the view, while a separate level
 * button, shown only while the view is tilted or rolled, resets pitch and roll but keeps the
 * bearing. Every reset passes the DOM event on, so the orbit sees it as the user's own gesture.
 *
 * Takes the control's container, with the compass button in it. Returns a cleanup function.
 */
export function splitCompassReset(container: HTMLElement, map: CompassMap): () => void {
  const compass = container.querySelector<HTMLButtonElement>(".maplibregl-ctrl-compass");
  if (!compass) return () => {};

  compass.title = COMPASS_TITLE;
  compass.setAttribute("aria-label", COMPASS_TITLE);

  const levelButton = document.createElement("button");
  levelButton.type = "button";
  levelButton.className = "maplibregl-ctrl-level-view";
  levelButton.title = LEVEL_TITLE;
  levelButton.setAttribute("aria-label", LEVEL_TITLE);
  levelButton.textContent = "2D";
  compass.after(levelButton);

  const controller = new AbortController();
  const { signal } = controller;

  // MapLibre's own compass click resets bearing and pitch together. Listening on the
  // container in the capture phase runs first and keeps that handler from seeing the click.
  // Relies on that handler being a plain click listener on the button (MapLibre 6.15).
  container.addEventListener(
    "click",
    (event) => {
      if (!compass.contains(event.target as Node)) return;
      event.stopPropagation();
      map.resetNorth({}, { originalEvent: event });
    },
    { capture: true, signal },
  );
  compass.addEventListener(
    "dblclick",
    (event) => map.resetNorthPitch({}, { originalEvent: event }),
    { signal },
  );
  levelButton.addEventListener(
    "click",
    (event) => levelView(map, { originalEvent: event }),
    { signal },
  );

  // Pitch and roll fire every frame of a tilt, so only touch the DOM when the state flips.
  let wasLevel: boolean | undefined;
  function syncLevelButton() {
    const level =
      Math.abs(map.getPitch()) < LEVEL_EPSILON && Math.abs(map.getRoll()) < LEVEL_EPSILON;
    if (level === wasLevel) return;
    wasLevel = level;
    levelButton.hidden = level;
  }

  map.on("pitch", syncLevelButton);
  map.on("roll", syncLevelButton);
  syncLevelButton();

  return () => {
    controller.abort();
    map.off("pitch", syncLevelButton);
    map.off("roll", syncLevelButton);
    levelButton.remove();
  };
}

/** MapLibre's navigation control with the compass reset split by {@link splitCompassReset}. */
export class SplitResetNavigationControl extends NavigationControl {
  private cleanupSplitReset: (() => void) | null = null;

  onAdd(map: MlMap): HTMLElement {
    const container = super.onAdd(map);
    this.cleanupSplitReset = splitCompassReset(container, map);
    return container;
  }

  onRemove(): void {
    this.cleanupSplitReset?.();
    this.cleanupSplitReset = null;
    super.onRemove();
  }
}
