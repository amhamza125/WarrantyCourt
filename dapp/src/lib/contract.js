// Contract address switching — DAPP_SPEC §3.9, exactly.
// The effective address is `override ?? CONTRACT_ADDRESS`, where the
// override is a user replacement stored in localStorage on this device
// only (BUILD_BRIEF + SPEC §3.9). An override is accepted ONLY after the
// candidate answers get_protocol_overview() with the WarrantyCourt
// overview shape (probe-first — the probe itself lives in store.jsx,
// which owns the chain client; this module owns storage + validation).
//
// Overview shape (verified against build/WarrantyCourt.py
// get_protocol_overview and the live B+ contract): owner (address),
// pending_owner (string), paused (boolean), policy_count / purchase_count
// / claim_count (numbers), total_pool_unreserved_wei /
// total_pool_reserved_wei / total_claimable_wei / total_pending_wei /
// contract_balance (wei strings). A probe asking for any other field is
// wrong and must not be used.
import { CONTRACT_ADDRESS as DEFAULT_CONTRACT } from "./config.js";

export { DEFAULT_CONTRACT };

const OVERRIDE_KEY = "warrantycourt.contractOverride";

export function isValidAddress(addr) {
  return typeof addr === "string" && /^0x[0-9a-fA-F]{40}$/.test(addr.trim());
}

function norm(addr) {
  return String(addr || "").trim();
}

function lsGet(key) {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function lsSet(key, value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch {
    // Storage blocked — the override simply does not persist.
  }
}

function lsRemove(key) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

/** The stored user replacement, or null when the shipped default is in use. */
export function getContractOverride() {
  const stored = lsGet(OVERRIDE_KEY);
  return isValidAddress(stored) ? norm(stored) : null;
}

/** The address every read, write and explorer link must use right now. */
export function getEffectiveContract() {
  return getContractOverride() || DEFAULT_CONTRACT;
}

export function setContractOverride(addr) {
  if (isValidAddress(addr)) lsSet(OVERRIDE_KEY, norm(addr));
}

export function clearContractOverride() {
  lsRemove(OVERRIDE_KEY);
}

export function isContractOverrideActive(addr) {
  const a = norm(addr || getEffectiveContract()).toLowerCase();
  return a !== DEFAULT_CONTRACT.toLowerCase();
}

// Validate a get_protocol_overview result against the WarrantyCourt shape.
// Returns { ok, reason } — the switcher refuses anything that doesn't
// answer with this shape (SPEC §3.9 step 2).
export function validateOverview(ov) {
  if (!ov || typeof ov !== "object") {
    return { ok: false, reason: "That address didn't answer on Bradbury." };
  }
  if (!isValidAddress(ov.owner)) {
    return { ok: false, reason: "That address didn't answer as a WarrantyCourt contract — it has no readable owner." };
  }
  if (typeof ov.paused !== "boolean") {
    return { ok: false, reason: "That address didn't answer as a WarrantyCourt contract — its paused flag isn't readable." };
  }
  for (const k of ["policy_count", "purchase_count", "claim_count"]) {
    if (typeof ov[k] !== "number" || !Number.isFinite(ov[k])) {
      return { ok: false, reason: "That address didn't answer as a WarrantyCourt contract — its counts aren't readable." };
    }
  }
  for (const k of [
    "total_pool_unreserved_wei",
    "total_pool_reserved_wei",
    "total_claimable_wei",
    "total_pending_wei",
    "contract_balance",
  ]) {
    if (typeof ov[k] !== "string" || !/^[0-9]+$/.test(ov[k])) {
      return { ok: false, reason: "That address didn't answer as a WarrantyCourt contract — its pool totals aren't readable." };
    }
  }
  return { ok: true, reason: "" };
}

// Readiness facts taken straight from a validated overview — never guessed.
export function readinessFromOverview(ov) {
  if (!ov) return null;
  return {
    owner: ov.owner || null,
    pendingOwner: ov.pending_owner || "",
    paused: ov.paused === true,
    policyCount: Number(ov.policy_count ?? 0),
  };
}
