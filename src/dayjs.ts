/* eslint-disable func-names */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
// import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
// dayjs.extend(duration);
dayjs.extend(timezone);
