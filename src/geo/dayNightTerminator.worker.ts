import { getDayNightTerminatorGeoJson } from "@/geo/dayNightTerminator";
import type {
  DayNightTerminatorWorkerRequest,
  DayNightTerminatorWorkerResponse,
} from "@/geo/dayNightTerminatorTypes";

onmessage = function (event: MessageEvent<DayNightTerminatorWorkerRequest>) {
  const { requestId, time } = event.data;
  const featureCollection = getDayNightTerminatorGeoJson(time);
  const response: DayNightTerminatorWorkerResponse = {
    requestId,
    featureCollection,
  };
  postMessage(response);
};

export default class DayNightTerminatorWorker {}
