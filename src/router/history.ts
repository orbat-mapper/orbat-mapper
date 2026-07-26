import { createWebHashHistory, createWebHistory, type RouterHistory } from "vue-router";
import { isFileProtocol } from "@/utils/runtimeEnvironment";

/**
 * The history mode the app can actually navigate with.
 *
 * A standalone file has no server to resolve `/scenario/<id>` against, and the History API cannot
 * push such a path onto a `file://` URL, so navigation there has to live in the hash.
 */
export function createAppHistory(): RouterHistory {
  return isFileProtocol() ? createWebHashHistory() : createWebHistory();
}
