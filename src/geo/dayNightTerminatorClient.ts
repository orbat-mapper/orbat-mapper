import type { FeatureCollection, MultiPolygon } from "geojson";
import WorkerConstructor from "@/geo/dayNightTerminator.worker?worker";
import { getDayNightTerminatorGeoJson } from "@/geo/dayNightTerminator";
import type {
  DayNightTerminatorWorkerRequest,
  DayNightTerminatorWorkerResponse,
} from "@/geo/dayNightTerminatorTypes";

let worker: Worker | null = null;
let workerUnavailable = false;
let nextRequestId = 1;
const pending = new Map<
  number,
  (featureCollection: FeatureCollection<MultiPolygon>) => void
>();

function ensureWorker(): Worker | null {
  if (workerUnavailable) return null;
  if (worker) return worker;
  try {
    worker = new WorkerConstructor();
    worker.onmessage = (event: MessageEvent<DayNightTerminatorWorkerResponse>) => {
      const resolve = pending.get(event.data.requestId);
      if (!resolve) return;
      pending.delete(event.data.requestId);
      resolve(event.data.featureCollection);
    };
    worker.onerror = () => {
      workerUnavailable = true;
      worker?.terminate();
      worker = null;
      for (const [requestId, resolve] of pending) {
        pending.delete(requestId);
        resolve(getDayNightTerminatorGeoJson(Date.now()));
      }
    };
    return worker;
  } catch {
    workerUnavailable = true;
    return null;
  }
}

export function requestDayNightTerminator(
  time: number | string | Date,
): Promise<FeatureCollection<MultiPolygon>> {
  const epoch = time instanceof Date ? time.getTime() : new Date(time).getTime();
  const w = ensureWorker();
  if (!w) {
    return Promise.resolve(getDayNightTerminatorGeoJson(epoch));
  }
  const requestId = nextRequestId++;
  return new Promise((resolve) => {
    pending.set(requestId, resolve);
    const request: DayNightTerminatorWorkerRequest = { requestId, time: epoch };
    w.postMessage(request);
  });
}
