// Time — chain times are unix seconds (UTC). Display: PKT first (UTC+5),
// UTC beside it on detail screens (DAPP_SPEC §8).

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

function parts(ms) {
  const d = new Date(ms);
  return {
    day: d.getUTCDate(),
    mon: MONTHS[d.getUTCMonth()],
    year: d.getUTCFullYear(),
    hh: String(d.getUTCHours()).padStart(2, "0"),
    mm: String(d.getUTCMinutes()).padStart(2, "0"),
  };
}

/** "14 Nov 2026, 09:41 PKT" for a unix-seconds timestamp. */
export function fmtDateTimePKT(unixSec) {
  if (!unixSec) return "—";
  const p = parts(Number(unixSec) * 1000 + PKT_OFFSET_MS);
  return `${p.day} ${p.mon} ${p.year}, ${p.hh}:${p.mm} PKT`;
}

/** "14 Nov 2026, 09:41 PKT (04:41 UTC)" — the detail-screen form. */
export function fmtDateTimeBoth(unixSec) {
  if (!unixSec) return "—";
  const pkt = parts(Number(unixSec) * 1000 + PKT_OFFSET_MS);
  const utc = parts(Number(unixSec) * 1000);
  return `${pkt.day} ${pkt.mon} ${pkt.year}, ${pkt.hh}:${pkt.mm} PKT (${utc.hh}:${utc.mm} UTC)`;
}

/** "2 Nov 2026" — bare date form. */
export function fmtDate(unixSec) {
  if (!unixSec) return "—";
  const p = parts(Number(unixSec) * 1000 + PKT_OFFSET_MS);
  return `${p.day} ${p.mon} ${p.year}`;
}

/** Parse an ISO date (yyyy-mm-dd, as stored by the contract) to a bare date. */
export function fmtISODate(iso) {
  if (!iso || typeof iso !== "string") return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/**
 * "ends in 13 h 20 m" style remaining text from a chain deadline and a
 * `now` unix-seconds value read/rendered this session. Returns
 * { text, past } — past=true when the deadline has passed.
 */
export function remainingText(deadlineUnix, nowUnix) {
  const diff = Number(deadlineUnix) - Number(nowUnix);
  if (!Number.isFinite(diff)) return { text: "", past: false };
  if (diff <= 0) return { text: "ended", past: true };
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  if (days > 0) return { text: `${days} d ${hours} h`, past: false };
  if (hours > 0) return { text: `${hours} h ${mins} m`, past: false };
  if (mins > 0) return { text: `${mins} m`, past: false };
  return { text: "under a minute", past: false };
}

/** The contract's earliest allowed purchase date (_DATE_FLOOR_UNIX). */
export const DATE_FLOOR = "2020-01-01";

/** Unix seconds of UTC midnight for an ISO date (yyyy-mm-dd) — the same
 * day-start the contract derives coverage from. */
export function purchaseDateUnix(iso) {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

/** Fraction of a window remaining, clamped 0..1 (appeal countdown bar). */
export function windowFraction(startUnix, endUnix, nowUnix) {
  const total = Number(endUnix) - Number(startUnix);
  if (total <= 0) return 0;
  const left = Number(endUnix) - Number(nowUnix);
  return Math.max(0, Math.min(1, left / total));
}
