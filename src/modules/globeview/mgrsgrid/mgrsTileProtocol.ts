/**
 * Custom MapLibre protocol that generates MGRS grid MVT tiles on the fly.
 *
 * For each tile, iterates the Grid Zone Designators that intersect the tile,
 * computes each GZD's clipped UTM bounding box, and walks constant-easting /
 * constant-northing grid lines in UTM space at the current accuracy. Each
 * line is densified to lat/lng via UTM→LL and clipped at the GZD boundary
 * with a bisection step, so lines are straight in UTM (slightly curved in
 * lat/lng) and stop exactly at the zone or band edge — matching how real
 * MGRS tools draw the grid. Labels are placed at the true cell centre via
 * UTM→LL on the cell's UTM midpoint.
 *
 * The emitted tile has two layers:
 *   - "mgrs"        — line features (grid boundaries)
 *   - "mgrs_labels" — point features with a "label" string attribute
 */
import { addProtocol, removeProtocol } from "maplibre-gl";
import { forward } from "mgrs";
import Pbf from "pbf";

export const MGRS_PROTOCOL = "mgrstile";
const EXTENT = 4096;

export type MgrsAccuracy = 0 | 1 | 2 | 3 | 4;

let currentAccuracy: MgrsAccuracy = 0;

export function setMgrsAccuracy(a: MgrsAccuracy) {
  currentAccuracy = a;
}

function accuracyCellMeters(a: MgrsAccuracy): number {
  return Math.pow(10, 5 - a);
}

// ---------- WGS84 UTM projection ----------
//
// Constants are taken verbatim from the mgrs library's inline implementation
// so that lines and labels stay perfectly consistent with mgrs.forward output.
// 0.00669438     = e²
// 0.006739496752268451 = e'² (second eccentricity squared)
// 0.99330562     = 1 - e²
// 0.9996         = k0 (UTM scale factor)
// 6367449.145945056 = a · (1 - e²/4 - 3e⁴/64 - 5e⁶/256)

const A_EARTH = 6378137;

function llToUtm(lat: number, lng: number, zoneOverride: number) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const lngOriginRad = ((6 * (zoneOverride - 1) - 180 + 3) * Math.PI) / 180;
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const tanLat = Math.tan(latRad);
  const N = A_EARTH / Math.sqrt(1 - 0.00669438 * sinLat * sinLat);
  const T = tanLat * tanLat;
  const C = 0.006739496752268451 * cosLat * cosLat;
  const Aterm = cosLat * (lngRad - lngOriginRad);
  const M =
    A_EARTH *
    (0.9983242984503243 * latRad -
      0.002514607064228144 * Math.sin(2 * latRad) +
      2.639046602129982e-6 * Math.sin(4 * latRad) -
      3.418046101696858e-9 * Math.sin(6 * latRad));
  const easting =
    0.9996 *
      N *
      (Aterm +
        ((1 - T + C) * Aterm * Aterm * Aterm) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 0.39089081163157013) *
          Aterm *
          Aterm *
          Aterm *
          Aterm *
          Aterm) /
          120) +
    5e5;
  let northing =
    0.9996 *
    (M +
      N *
        tanLat *
        ((Aterm * Aterm) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Aterm * Aterm * Aterm * Aterm) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 2.2240339282485886) *
            Aterm *
            Aterm *
            Aterm *
            Aterm *
            Aterm *
            Aterm) /
            720));
  if (lat < 0) northing += 1e7;
  return { easting, northing };
}

function utmToLl(easting: number, northing: number, zone: number, isSouth: boolean) {
  const e1 = (1 - Math.sqrt(0.99330562)) / (1 + Math.sqrt(0.99330562));
  const x = easting - 5e5;
  const y = isSouth ? northing - 1e7 : northing;
  const lngOriginRad = ((6 * (zone - 1) - 180 + 3) * Math.PI) / 180;
  const u = y / 0.9996 / 6367449.145945056;
  const phi1 =
    u +
    ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * Math.sin(2 * u) +
    ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * Math.sin(4 * u) +
    ((151 * e1 * e1 * e1) / 96) * Math.sin(6 * u);
  const sinPhi = Math.sin(phi1);
  const N1 = A_EARTH / Math.sqrt(1 - 0.00669438 * sinPhi * sinPhi);
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const C1 = 0.006739496752268451 * Math.cos(phi1) * Math.cos(phi1);
  const R1 = (0.99330562 * A_EARTH) / Math.pow(1 - 0.00669438 * sinPhi * sinPhi, 1.5);
  const D = x / (N1 * 0.9996);
  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 0.06065547077041606) * D * D * D * D) /
          24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 1.6983531815716497 - 3 * C1 * C1) *
          D *
          D *
          D *
          D *
          D *
          D) /
          720);
  const lng =
    lngOriginRad +
    (D -
      ((1 + 2 * T1 + C1) * D * D * D) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 0.05391597401814761 + 24 * T1 * T1) *
        D *
        D *
        D *
        D *
        D) /
        120) /
      Math.cos(phi1);
  return { lat: (lat * 180) / Math.PI, lng: (lng * 180) / Math.PI };
}

// ---------- GZD geometry ----------

const BANDS = "CDEFGHJKLMNPQRSTUVWX";

function bandLatRange(band: string): [number, number] {
  if (band === "X") return [72, 84];
  const idx = BANDS.indexOf(band);
  return [-80 + idx * 8, -80 + (idx + 1) * 8];
}

function zoneLngRange(zone: number, band: string): [number, number] {
  if (band === "V") {
    if (zone === 31) return [0, 3];
    if (zone === 32) return [3, 12];
  }
  if (band === "X") {
    if (zone === 31) return [0, 9];
    if (zone === 33) return [9, 21];
    if (zone === 35) return [21, 33];
    if (zone === 37) return [33, 42];
  }
  return [-180 + (zone - 1) * 6, -180 + zone * 6];
}

type Gzd = {
  zone: number;
  band: string;
  lngW: number;
  lngE: number;
  latS: number;
  latN: number;
};

function* iterateGzds(
  west: number,
  east: number,
  south: number,
  north: number,
): Iterable<Gzd> {
  for (let bi = 0; bi < BANDS.length; bi++) {
    const band = BANDS[bi];
    const [latS, latN] = bandLatRange(band);
    if (latN <= south || latS >= north) continue;
    for (let zone = 1; zone <= 60; zone++) {
      // Skip GZDs that don't exist
      if (band === "X" && (zone === 32 || zone === 34 || zone === 36)) continue;
      // Skip the "default" 31V/32V — they're replaced by the special ranges
      if (band === "V" && (zone === 31 || zone === 32)) continue;
      const [lngW, lngE] = zoneLngRange(zone, band);
      if (lngE <= west || lngW >= east) continue;
      yield { zone, band, lngW, lngE, latS, latN };
    }
    // Append the V band specials so their non-default lng range is used.
    if (band === "V") {
      for (const z of [31, 32]) {
        const [lngW, lngE] = zoneLngRange(z, band);
        if (lngE <= west || lngW >= east) continue;
        yield { zone: z, band, lngW, lngE, latS, latN };
      }
    }
  }
}

// ---------- MVT encoding ----------

function latToMercatorY(lat: number): number {
  const latRad = (Math.max(Math.min(lat, 89.999), -89.999) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

function tileBounds(z: number, x: number, y: number) {
  const mercN = Math.PI - (2 * Math.PI * y) / (1 << z);
  const mercS = Math.PI - (2 * Math.PI * (y + 1)) / (1 << z);
  return {
    west: (x / (1 << z)) * 360 - 180,
    east: ((x + 1) / (1 << z)) * 360 - 180,
    north: (Math.atan(Math.sinh(mercN)) * 180) / Math.PI,
    south: (Math.atan(Math.sinh(mercS)) * 180) / Math.PI,
    mercNorth: mercN,
    mercSouth: mercS,
  };
}

function project(
  lng: number,
  lat: number,
  west: number,
  east: number,
  mercSouth: number,
  mercNorth: number,
): [number, number] {
  const x = ((lng - west) / (east - west)) * EXTENT;
  const mercY = latToMercatorY(lat);
  const y = ((mercNorth - mercY) / (mercNorth - mercSouth)) * EXTENT;
  return [Math.round(x), Math.round(y)];
}

function zigzag(n: number): number {
  return (n << 1) ^ (n >> 31);
}
function command(id: number, count: number): number {
  return (id & 0x7) | (count << 3);
}

function encodeLineGeometry(pts: Array<[number, number]>): number[] {
  const geom: number[] = [];
  let cx = 0;
  let cy = 0;
  geom.push(command(1, 1));
  geom.push(zigzag(pts[0][0] - cx), zigzag(pts[0][1] - cy));
  cx = pts[0][0];
  cy = pts[0][1];
  if (pts.length > 1) {
    geom.push(command(2, pts.length - 1));
    for (let i = 1; i < pts.length; i++) {
      geom.push(zigzag(pts[i][0] - cx), zigzag(pts[i][1] - cy));
      cx = pts[i][0];
      cy = pts[i][1];
    }
  }
  return geom;
}

function encodePointGeometry(pt: [number, number]): number[] {
  return [command(1, 1), zigzag(pt[0]), zigzag(pt[1])];
}

type MvtFeature = {
  id: number;
  tags: number[];
  type: 1 | 2 | 3;
  geom: number[];
};

type MvtLayer = {
  name: string;
  features: MvtFeature[];
  keys: string[];
  values: string[];
};

function writeTile(layers: MvtLayer[], pbf: Pbf) {
  for (const l of layers) pbf.writeMessage(3, writeLayer, l);
}

function writeLayer(layer: MvtLayer, pbf: Pbf) {
  pbf.writeStringField(1, layer.name);
  for (const f of layer.features) pbf.writeMessage(2, writeFeature, f);
  for (const k of layer.keys) pbf.writeStringField(3, k);
  for (const v of layer.values) pbf.writeMessage(4, writeValue, v);
  pbf.writeVarintField(5, EXTENT);
  pbf.writeVarintField(15, 2);
}

function writeFeature(f: MvtFeature, pbf: Pbf) {
  pbf.writeVarintField(1, f.id);
  if (f.tags.length) pbf.writePackedVarint(2, f.tags);
  pbf.writeVarintField(3, f.type);
  pbf.writePackedVarint(4, f.geom);
}

function writeValue(v: string, pbf: Pbf) {
  pbf.writeStringField(1, v);
}

function formatLabel(id: string, accuracy: MgrsAccuracy): string {
  if (accuracy === 0) return id;
  let i = 0;
  while (i < id.length && id[i] >= "0" && id[i] <= "9") i++;
  const prefix = id.slice(0, i + 3); // zone digits + band + 2 square letters
  const rest = id.slice(i + 3);
  const half = rest.length / 2;
  return `${prefix}\n${rest.slice(0, half)} ${rest.slice(half)}`;
}

function emptyTile(): ArrayBuffer {
  const pbf = new Pbf();
  writeTile(
    [
      { name: "mgrs", features: [], keys: [], values: [] },
      { name: "mgrs_labels", features: [], keys: ["label"], values: [] },
    ],
    pbf,
  );
  return pbf.finish().buffer as ArrayBuffer;
}

// ---------- Tile generation ----------

function generateTile(z: number, x: number, y: number): ArrayBuffer {
  const bounds = tileBounds(z, x, y);
  const south = Math.max(bounds.south, -80);
  const north = Math.min(bounds.north, 84);
  if (north <= south) return emptyTile();
  const west = Math.max(bounds.west, -180);
  const east = Math.min(bounds.east, 180);
  if (east <= west) return emptyTile();

  const accuracy = currentAccuracy;
  const cellM = accuracyCellMeters(accuracy);

  const lineFeatures: MvtFeature[] = [];
  const labelFeatures: MvtFeature[] = [];
  const labelKeys = ["label"];
  const labelValues: string[] = [];
  const valueIndex = new Map<string, number>();

  const projectPt = (lng: number, lat: number): [number, number] =>
    project(lng, lat, bounds.west, bounds.east, bounds.mercSouth, bounds.mercNorth);

  for (const gzd of iterateGzds(west, east, south, north)) {
    const gzdW = Math.max(gzd.lngW, west);
    const gzdE = Math.min(gzd.lngE, east);
    const gzdS = Math.max(gzd.latS, south);
    const gzdN = Math.min(gzd.latN, north);
    if (gzdW >= gzdE || gzdS >= gzdN) continue;

    const isSouth = gzd.band < "N";

    // Compute UTM bounding box of the clipped GZD region by sampling its
    // boundary. Since UTM and lat/lng aren't axis-aligned, we sample many
    // points along each edge so the bbox is tight.
    let eMin = Infinity;
    let eMax = -Infinity;
    let nMin = Infinity;
    let nMax = -Infinity;
    const sampleEdge = (lng: number, lat: number) => {
      const u = llToUtm(lat, lng, gzd.zone);
      if (u.easting < eMin) eMin = u.easting;
      if (u.easting > eMax) eMax = u.easting;
      if (u.northing < nMin) nMin = u.northing;
      if (u.northing > nMax) nMax = u.northing;
    };
    const NS = 8;
    for (let i = 0; i <= NS; i++) {
      const t = i / NS;
      sampleEdge(gzdW + (gzdE - gzdW) * t, gzdS);
      sampleEdge(gzdW + (gzdE - gzdW) * t, gzdN);
      sampleEdge(gzdW, gzdS + (gzdN - gzdS) * t);
      sampleEdge(gzdE, gzdS + (gzdN - gzdS) * t);
    }
    if (!isFinite(eMin)) continue;

    const eStart = Math.floor(eMin / cellM) * cellM;
    const eEnd = Math.ceil(eMax / cellM) * cellM;
    const nStart = Math.floor(nMin / cellM) * cellM;
    const nEnd = Math.ceil(nMax / cellM) * cellM;

    // Hard cap on lines per direction to keep work bounded.
    const linesE = Math.round((eEnd - eStart) / cellM);
    const linesN = Math.round((nEnd - nStart) / cellM);
    if (linesE > 200 || linesN > 200) continue;

    const NSEG = 24;

    const inGzd = (lng: number, lat: number): boolean =>
      lng >= gzd.lngW - 1e-9 &&
      lng <= gzd.lngE + 1e-9 &&
      lat >= gzd.latS - 1e-9 &&
      lat <= gzd.latN + 1e-9;

    /**
     * Bisect in UTM space to find the lat/lng point where the segment from an
     * inside UTM coord to an outside UTM coord crosses the GZD boundary.
     */
    const bisectCrossing = (eIn: number, nIn: number, eOut: number, nOut: number) => {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        const me = eIn + (eOut - eIn) * mid;
        const mn = nIn + (nOut - nIn) * mid;
        const ll = utmToLl(me, mn, gzd.zone, isSouth);
        if (inGzd(ll.lng, ll.lat)) lo = mid;
        else hi = mid;
      }
      const me = eIn + (eOut - eIn) * lo;
      const mn = nIn + (nOut - nIn) * lo;
      return utmToLl(me, mn, gzd.zone, isSouth);
    };

    const emitLine = (pts: Array<[number, number]>) => {
      if (pts.length < 2) return;
      lineFeatures.push({
        id: lineFeatures.length,
        tags: [],
        type: 2,
        geom: encodeLineGeometry(pts),
      });
    };

    /** Walk a polyline along (eFn(t), nFn(t)) for t in 0..NSEG, clipping to GZD. */
    const walkLine = (eFn: (t: number) => number, nFn: (t: number) => number) => {
      let buf: Array<[number, number]> = [];
      let prev: {
        e: number;
        n: number;
        lat: number;
        lng: number;
        inside: boolean;
      } | null = null;
      for (let s = 0; s <= NSEG; s++) {
        const e = eFn(s);
        const n = nFn(s);
        const ll = utmToLl(e, n, gzd.zone, isSouth);
        const inside = inGzd(ll.lng, ll.lat);
        if (inside) {
          if (prev && !prev.inside) {
            const cross = bisectCrossing(e, n, prev.e, prev.n);
            buf.push(projectPt(cross.lng, cross.lat));
          }
          buf.push(projectPt(ll.lng, ll.lat));
        } else if (prev && prev.inside) {
          const cross = bisectCrossing(prev.e, prev.n, e, n);
          buf.push(projectPt(cross.lng, cross.lat));
          emitLine(buf);
          buf = [];
        }
        prev = { e, n, lat: ll.lat, lng: ll.lng, inside };
      }
      emitLine(buf);
    };

    // Constant-easting (vertical-ish) lines
    for (let e = eStart; e <= eEnd + 0.5; e += cellM) {
      walkLine(
        () => e,
        (s) => nMin + ((nMax - nMin) * s) / NSEG,
      );
    }
    // Constant-northing (horizontal-ish) lines
    for (let n = nStart; n <= nEnd + 0.5; n += cellM) {
      walkLine(
        (s) => eMin + ((eMax - eMin) * s) / NSEG,
        () => n,
      );
    }

    // Labels at true cell centers (UTM midpoint).
    for (let e = eStart; e < eEnd; e += cellM) {
      for (let n = nStart; n < nEnd; n += cellM) {
        const ll = utmToLl(e + cellM / 2, n + cellM / 2, gzd.zone, isSouth);
        if (!inGzd(ll.lng, ll.lat)) continue;
        if (
          ll.lng < bounds.west ||
          ll.lng >= bounds.east ||
          ll.lat < bounds.south ||
          ll.lat >= bounds.north
        )
          continue;
        let id: string;
        try {
          id = forward([ll.lng, ll.lat], accuracy);
        } catch {
          continue;
        }
        const label = formatLabel(id, accuracy);
        let vi = valueIndex.get(label);
        if (vi === undefined) {
          vi = labelValues.length;
          valueIndex.set(label, vi);
          labelValues.push(label);
        }
        labelFeatures.push({
          id: labelFeatures.length,
          tags: [0, vi],
          type: 1,
          geom: encodePointGeometry(projectPt(ll.lng, ll.lat)),
        });
      }
    }
  }

  const pbf = new Pbf();
  writeTile(
    [
      { name: "mgrs", features: lineFeatures, keys: [], values: [] },
      {
        name: "mgrs_labels",
        features: labelFeatures,
        keys: labelKeys,
        values: labelValues,
      },
    ],
    pbf,
  );
  return pbf.finish().buffer as ArrayBuffer;
}

export function registerMgrsProtocol() {
  addProtocol(MGRS_PROTOCOL, async (params) => {
    const url = params.url.replace(`${MGRS_PROTOCOL}://`, "");
    const [zStr, xStr, yStr] = url.split("/");
    const z = parseInt(zStr, 10);
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);
    const data = generateTile(z, x, y);
    return { data };
  });
}

export function unregisterMgrsProtocol() {
  removeProtocol(MGRS_PROTOCOL);
}
