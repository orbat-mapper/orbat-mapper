import formatcoords from "formatcoords";
import dayjs from "dayjs";

export function formatDateString(value?: number, timeZone?: string) {
  if (value === undefined) return "";
  if (timeZone) return dayjs(value).tz(timeZone).format();

  return dayjs.utc(value).format();
}

export function formatPosition(value?: number[]) {
  if (value) {
    return formatcoords(value, true).format({ decimalPlaces: 2 });
  }
}
