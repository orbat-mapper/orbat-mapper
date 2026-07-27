import { createWebHistory, type RouterHistory } from "vue-router";

/**
 * The history mode the app can navigate with.
 *
 * A served build uses path-based URLs. A standalone file has no server to resolve
 * `/scenario/<id>` against, and the History API cannot push such a path onto a `file://` URL, thus
 * the standalone build replaces this module with one that returns a hash history. That is a
 * property of the build and not of the address it is opened from: a standalone file that somebody
 * puts on a web server still has no server-side route for `/scenario/<id>`.
 * See `vite.singlefile.config.ts`.
 */
export function createAppHistory(): RouterHistory {
  return createWebHistory();
}
