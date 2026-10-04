/**
 * Reka menus claim arrow keys and typeahead for their roving focus, so a slider
 * or text field rendered inside a menu never sees its own keys. Keep those keys
 * on the control and let only the listed ones reach the menu.
 *
 * Escape always passes through so the menu can close. Tab is the deliberate
 * difference between hosts: a lone control passes it on so focus can leave the
 * menu, while a panel of several controls keeps it to move between them.
 */
export function menuControlKeys(...passThrough: readonly string[]) {
  const allowed = new Set(["Escape", ...passThrough]);
  return (event: KeyboardEvent) => {
    if (!allowed.has(event.key)) event.stopPropagation();
  };
}
