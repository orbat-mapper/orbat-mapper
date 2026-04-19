import turfLength from "@turf/length";
import {
  RoutingError,
  type RoutingErrorCode,
  type RoutingWorkerRequest,
  type RoutingWorkerResponse,
} from "@/geo/routing/types";
import { computeVisibilityGraphRoute } from "@/geo/routing/visibilityGraph";

function toWorkerErrorCode(error: unknown): Exclude<RoutingErrorCode, "cancelled"> {
  if (error instanceof RoutingError) {
    return error.code === "cancelled" ? "worker-error" : error.code;
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("obstacle")) return "invalid-obstacles";
  if (message.includes("start point") || message.includes("destination"))
    return "blocked-endpoint";
  if (message.includes("path") || message.includes("route")) return "no-route";
  return "worker-error";
}

onmessage = function (event: MessageEvent<RoutingWorkerRequest>) {
  const { requestId, start, end, obstacles, obstacleCacheKey } = event.data;

  try {
    const path = computeVisibilityGraphRoute(start, end, obstacles, obstacleCacheKey);
    const totalLengthMeters = turfLength(path, { units: "kilometers" }) * 1000;

    const response: RoutingWorkerResponse = {
      requestId,
      ok: true,
      path,
      totalLengthMeters,
    };
    postMessage(response);
  } catch (error) {
    const response: RoutingWorkerResponse = {
      requestId,
      ok: false,
      code: toWorkerErrorCode(error),
      message:
        error instanceof Error
          ? error.message
          : "Routing failed due to an unexpected worker error.",
    };
    postMessage(response);
  }
};

export default class RoutingWorker {}
