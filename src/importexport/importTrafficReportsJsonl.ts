import { nanoid } from "nanoid";

import type { TrafficReportsPayload } from "@/importexport/importTrafficReports";
import {
  DEFAULT_TRAFFIC_REPORTS_IMPORT_OPTIONS,
  type TrafficReportsImportOptions,
} from "@/importexport/trafficReportsImportOptions";

const MS_PER_MINUTE = 60_000;

export const NEUTRAL_TRAFFIC_REPORT_SIDC = "10041000000000000000";

type TrafficReportRecord = Record<string, unknown> & {
  latitude: number;
  longitude: number;
};

function requireCoordinate(
  report: Record<string, unknown>,
  key: "latitude" | "longitude",
  lineNumber: number,
): number {
  const value = report[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Line ${lineNumber}: ${key} must be a number.`);
  }
  const limit = key === "latitude" ? 90 : 180;
  if (value < -limit || value > limit) {
    throw new Error(`Line ${lineNumber}: ${key} is outside its valid range.`);
  }
  return value;
}

function timestampInYear(value: unknown, lineNumber: number, year: number): number {
  if (typeof value !== "string") {
    throw new Error(`Line ${lineNumber}: timestamp_utc must be an ISO timestamp.`);
  }
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.valueOf())) {
    throw new Error(`Line ${lineNumber}: timestamp_utc is invalid.`);
  }
  timestamp.setUTCFullYear(year);
  return timestamp.valueOf();
}

function parseLine(line: string, lineNumber: number): TrafficReportRecord {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(`Line ${lineNumber}: invalid JSON.`);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Line ${lineNumber}: expected a JSON object.`);
  }
  const report = value as Record<string, unknown>;
  return {
    ...report,
    latitude: requireCoordinate(report, "latitude", lineNumber),
    longitude: requireCoordinate(report, "longitude", lineNumber),
  };
}

export function trafficReportsJsonlToPayload(
  source: string,
  options: Partial<TrafficReportsImportOptions> = {},
): TrafficReportsPayload {
  const { targetYear, visibilityMinutes } = {
    ...DEFAULT_TRAFFIC_REPORTS_IMPORT_OPTIONS,
    ...options,
  };
  const lines = source
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0);

  if (!lines.length) throw new Error("The JSONL file contains no reports.");

  const features: TrafficReportsPayload["features"] = [];
  const units: TrafficReportsPayload["units"] = [];
  const timestamps: string[] = [];
  const longitudes: number[] = [];
  const latitudes: number[] = [];

  for (const { line, lineNumber } of lines) {
    const report = parseLine(line, lineNumber);
    const reportedAt = timestampInYear(report.timestamp_utc, lineNumber, targetYear);
    const visibleFromT = new Date(reportedAt).toISOString();
    const visibleUntilT =
      visibilityMinutes > 0
        ? new Date(reportedAt + visibilityMinutes * MS_PER_MINUTE).toISOString()
        : undefined;
    const reportType =
      typeof report.report_type === "string" ? report.report_type : "Traffic report";
    const dtg = typeof report.dtg === "string" ? report.dtg : "";
    const reportId =
      typeof report.report_id === "string" ? report.report_id : nanoid();
    const name = dtg ? `${reportType} — ${dtg}` : reportType;
    const description =
      typeof report.report_text === "string" ? report.report_text : "";
    const location: [number, number] = [report.longitude, report.latitude];
    const userData = {
      ...report,
      timestamp_utc: visibleFromT,
      sidc: NEUTRAL_TRAFFIC_REPORT_SIDC,
    };

    features.push({
      id: `traffic-report-feature-${reportId}`,
      name,
      description,
      geometry: {
        type: "Point",
        coordinates: location,
      },
      visibleFromT,
      visibleUntilT,
      sidc: NEUTRAL_TRAFFIC_REPORT_SIDC,
      userData,
    });
    units.push({
      id: `traffic-report-unit-${reportId}`,
      name,
      shortName: typeof report.observer === "string" ? report.observer : undefined,
      description,
      sidc: NEUTRAL_TRAFFIC_REPORT_SIDC,
      location,
      visibleFromT,
      visibleUntilT,
      textAmplifiers: {
        ...(typeof report.equipment === "string"
          ? { uniqueDesignation: report.equipment }
          : {}),
        ...(dtg ? { dtg } : {}),
      },
      userData,
    });
    timestamps.push(visibleFromT);
    longitudes.push(report.longitude);
    latitudes.push(report.latitude);
  }

  timestamps.sort();
  return {
    features,
    units,
    unitCount: units.length,
    startTime: timestamps[0],
    // Park the clock on the first report rather than the last, so scrubbing forward
    // walks the traffic in order instead of starting past the end of it.
    currentTime: timestamps[0],
    center: [
      longitudes.reduce((sum, value) => sum + value, 0) / longitudes.length,
      latitudes.reduce((sum, value) => sum + value, 0) / latitudes.length,
    ],
    boundingBox: [
      Math.min(...longitudes),
      Math.min(...latitudes),
      Math.max(...longitudes),
      Math.max(...latitudes),
    ],
  };
}
