import formatcoords from "formatcoords";
import dayjs from "dayjs";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { toStringHDMS } from "ol/coordinate";
import { formatDecimalDegrees, formatMGRS } from "@/utils/geoConvert";

const s = useMapSettingsStore();

export function formatDateString(value?: number, timeZone?: string) {
  if (value === undefined || value === null) return "";
  if (timeZone) return dayjs(value).tz(timeZone).format();

  return dayjs.utc(value).format();
}

export function formatPosition(value?: number[]) {
  if (value) {
    const format = s.coordinateFormat;
    if (format === "DegreeMinuteSeconds") return toStringHDMS(value, 0);
    if (format === "MGRS") return formatMGRS(value, 4);
    return formatDecimalDegrees(value, 3);
  }
  return "";
}
