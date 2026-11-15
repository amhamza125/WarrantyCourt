// Chain data layer: view reads, activity-driven hydration (SPEC §3.1/§9
// G1–G2), lifecycle maths that mirrors the contract exactly, and explorer
// tx backfill with honest labels (§8 / §9 G3).
import { parseResult, readJsonViewRetry, readView } from "./genlayer.js";
import { getEffectiveContract } from "./contract.js";

// --- view reads -------------------------------------------------------------
// Records come back as JSON text; missing records read "NOT_FOUND".
export async function fetchOverview(address) {
  const ov = await readJsonViewRetry("get_protocol_overview", [], address);
  return ov && typeof ov === "object" ? ov : null;
}

async function fetchRecord(fn, id, address) {
  const raw = await readView(fn, [Number(id)], address);
  const s = parseResult(raw);
  if (typeof s !== "string" || s === "NOT_FOUND") return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export const fetchPolicy = (id, address) => fetchRecord("get_policy", id, address);
export const fetchPurchase = (id, address) => fetchRecord("get_purchase", id, address);
export const fetchClaim = (id, address) => fetchRecord("get_claim", id, address);

/** Index views return a comma-joined id string ("" when empty). */
export async function fetchIndexIds(fn, arg, address) {
  const raw = await readView(fn, [arg], address);
  const s = parseResult(raw);
  if (typeof s !== "string" || !s.trim()) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function fetchActivity(address) {
  const act = await readJsonViewRetry("get_activity", [], address);
  return Array.isArray(act) ? act : [];
}

/** Index-driven record lists (seller / buyer consoles, purchase claims). */
export async function fetchSellerPolicies(account, address) {
  const ids = await fetchIndexIds("get_policies_for_seller", account, address);
  const rows = await mapBatch(ids, 3, (id) => fetchPolicy(id, address));
  return rows.filter(Boolean);
}

export async function fetchBuyerPurchases(account, address) {
  const ids = await fetchIndexIds("get_purchases_for_buyer", account, address);
  const rows = await mapBatch(ids, 3, (id) => fetchPurchase(id, address));
  return rows.filter(Boolean);
}

export async function fetchClaimsForPurchase(purchaseId, address) {
  const ids = await fetchIndexIds("get_claims_for_purchase", purchaseId, address);
  const rows = await mapBatch(ids, 3, (id) => fetchClaim(id, address));
  return rows.filter(Boolean);
}

/** Purchases named by PURCHASE_REGISTERED events, hydrated, newest first. */
export async function hydratePurchases(activity, address, { policyId = null } = {}) {
  const seen = new Set();
  const ids = [];
  const sorted = [...activity].sort((a, b) => Number(b.seq || 0) - Number(a.seq || 0));
  for (const ev of sorted) {
    if (!ev || ev.event !== "PURCHASE_REGISTERED") continue;
    if (policyId != null && Number(ev.policy_id) !== Number(policyId)) continue;
    const pid = String(ev.purchase_id);
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    ids.push(pid);
  }
  const rows = await mapBatch(ids, 3, (id) => fetchPurchase(id, address));
  return rows.filter(Boolean).sort((a, b) => Number(b.purchase_id) - Number(a.purchase_id));
}

export async function fetchClaimable(address, contractAddr) {
  const raw = await readView("get_claimable", [address], contractAddr);
  const s = parseResult(raw);
  try {
    return BigInt(s ?? "0");
  } catch {
    return 0n;
  }
}

export async function fetchPending(address, contractAddr) {
  const v = await readJsonViewRetry("get_pending", [address], contractAddr);
  if (!v || typeof v !== "object") return { amountWei: 0n, initiatedAt: 0 };
  let amountWei = 0n;
  try {
    amountWei = BigInt(v.amount_wei || "0");
  } catch {}
  return { amountWei, initiatedAt: Number(v.initiated_at || 0) };
}

// --- batched hydration ------------------------------------------------------
// A gen_call takes ~6s: hydrate in small parallel batches with the
// retrying reader, newest first (the GrantFlow loading pattern).
export async function mapBatch(items, size, fn) {
  const out = new Array(items.length);
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    const got = await Promise.all(
      slice.map(async (item, j) => {
        try {
          return await fn(item);
        } catch {
          return null;
        }
      })
    );
    got.forEach((v, j) => {
      out[i + j] = v;
    });
  }
  return out;
}

/** Unique claim ids named by the activity record, newest first. */
export function claimIdsFromActivity(activity) {
  const seen = new Set();
  const ids = [];
  const sorted = [...activity].sort((a, b) => Number(b.seq || 0) - Number(a.seq || 0));
  for (const ev of sorted) {
    if (ev && ev.claim_id && !seen.has(String(ev.claim_id))) {
      seen.add(String(ev.claim_id));
      ids.push(String(ev.claim_id));
    }
  }
  return ids;
}

/** Hydrate claims (+ their policies for product names, + their purchases
 * for verdict/release maths) from the activity record. */
export async function hydrateClaims(activity, address, limit = Infinity) {
  const ids = claimIdsFromActivity(activity).slice(0, limit);
  const claims = (await mapBatch(ids, 3, (id) => fetchClaim(id, address))).filter(Boolean);
  const policyIds = [...new Set(claims.map((c) => String(c.policy_id)))];
  const policies = await mapBatch(policyIds, 3, (id) => fetchPolicy(id, address));
  const policyById = {};
  policyIds.forEach((id, i) => {
    if (policies[i]) policyById[id] = policies[i];
  });
  const purchaseIds = [...new Set(claims.map((c) => String(c.purchase_id)))];
  const purchases = await mapBatch(purchaseIds, 3, (id) => fetchPurchase(id, address));
  const purchaseById = {};
  purchaseIds.forEach((id, i) => {
    if (purchases[i]) purchaseById[id] = purchases[i];
  });
  return { claims, policyById, purchaseById };
}

// --- verdict + lifecycle maths (mirrors the contract — never invented) -----
export function parseVerdict(claim) {
  if (!claim || !claim.verdict) return null;
  try {
    const v = JSON.parse(claim.verdict);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export function parseGrounding(claim) {
  if (!claim || !claim.grounding) return null;
  try {
    const g = JSON.parse(claim.grounding);
    return g && typeof g === "object" ? g : null;
  } catch {
    return null;
  }
}

export function isFullCoverage(verdict) {
  return !!verdict && verdict.verdict === "COVERED" && Number(verdict.payout_pct) === 100;
}

/**
 * The release split exactly as release_claim computes it:
 * paid = floor(amount × pct / 100), clamped by the purchase headroom
 * (receipt_total − cumulative_paid) when the total is known.
 */
export function releaseSplit(claim, purchase) {
  const verdict = parseVerdict(claim);
  const amount = BigInt(claim?.amount_wei || "0");
  if (!verdict) return { paid: 0n, unpaid: amount, pct: 0, full: false };
  const pct = Number(verdict.payout_pct || 0);
  let paid = (amount * BigInt(pct)) / 100n;
  if (purchase) {
    const total = BigInt(purchase.receipt_total_wei || "0");
    const cum = BigInt(purchase.cumulative_paid_wei || "0");
    if (total > 0n) {
      const headroom = total - cum;
      if (paid > headroom) paid = headroom > 0n ? headroom : 0n;
    }
  }
  if (paid < 0n) paid = 0n;
  return { paid, unpaid: amount - paid, pct, full: isFullCoverage(verdict) };
}

/** Why release can or can't run right now — the contract's own checks. */
export function releaseState(claim, nowUnix) {
  if (!claim) return { can: false, reason: "NO_VERDICT" };
  if (claim.status === "APPEALING") return { can: false, reason: "APPEAL_PENDING" };
  if (claim.status === "OPEN") return { can: false, reason: "NO_VERDICT" };
  if (claim.status !== "ADJUDICATED") return { can: false, reason: "BAD_STATUS" };
  const verdict = parseVerdict(claim);
  if (!verdict) return { can: false, reason: "NO_VERDICT" };
  if (claim.appeal_resolved || isFullCoverage(verdict) || nowUnix > Number(claim.appeal_deadline || 0)) {
    return { can: true, reason: "" };
  }
  return { can: false, reason: "APPEAL_WINDOW_OPEN" };
}

/**
 * Lifecycle steps: Filed → Judged → Appeal window → Released → Paid.
 * Returns { marks: ["done"|"now"|"todo"|"skip" ×5], label } rendered from
 * the claim's true chain state.
 */
export function lifecycle(claim, nowUnix) {
  const verdict = parseVerdict(claim);
  const status = claim?.status || "OPEN";
  const appealSkipped = isFullCoverage(verdict) && !claim?.appeal_used;
  if (status === "SETTLED") {
    const paid = BigInt(claim.paid_wei || "0");
    return {
      marks: ["done", "done", appealSkipped ? "skip" : "done", "done", "done"],
      label: paid > 0n ? (paid === BigInt(claim.amount_wei || "0") ? "Paid in full" : "Settled") : "Closed · nothing to pay",
    };
  }
  if (status === "CANCELLED") return { marks: ["done", "todo", "todo", "todo", "todo"], label: "Cancelled" };
  if (status === "EXPIRED") return { marks: ["done", "todo", "todo", "todo", "todo"], label: "Expired" };
  if (status === "OPEN") return { marks: ["done", "now", "todo", "todo", "todo"], label: "With the jury" };
  if (status === "APPEALING") return { marks: ["done", "done", "now", "todo", "todo"], label: "Appeal in progress" };
  // ADJUDICATED
  if (claim.appeal_resolved) {
    return { marks: ["done", "done", "done", "now", "todo"], label: "Ready to release" };
  }
  if (appealSkipped) {
    return { marks: ["done", "done", "skip", "now", "todo"], label: "Ready to release" };
  }
  if (nowUnix > Number(claim.appeal_deadline || 0)) {
    return { marks: ["done", "done", "done", "now", "todo"], label: "Ready to release" };
  }
  return { marks: ["done", "done", "now", "todo", "todo"], label: "Appeal window" };
}

// --- explorer tx backfill (§8 / G3) ------------------------------------------
// The contract stores NO tx hash on any activity entry. Hashes exist in
// exactly two places: recorded at write time by this app (exact), and the
// explorer API (matched by function + verifiable args + order — labelled
// "Likely transaction" unless the match is unique). Never invent a hash.
const TX_API = "/api/explorer";
const TXLIST_TTL_MS = 10 * 60 * 1000;

export function txListKey(address) {
  return `warrantycourt-txlist-${String(address || "").toLowerCase()}`;
}
export function recordedKey(address) {
  return `warrantycourt-txhashes-${String(address || "").toLowerCase()}`;
}

export function getRecordedHashes(address) {
  try {
    const raw = localStorage.getItem(recordedKey(address || getEffectiveContract()));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function recordHashes(address, hash, seqs) {
  if (!hash || !seqs || seqs.length === 0) return;
  try {
    const all = getRecordedHashes(address);
    for (const seq of seqs) all[String(seq)] = hash;
    localStorage.setItem(recordedKey(address || getEffectiveContract()), JSON.stringify(all));
  } catch {}
}

export function lastSeqKey(address) {
  return `warrantycourt-lastseq-${String(address || "").toLowerCase()}`;
}
export function getLastKnownSeq(address) {
  try {
    return Number(localStorage.getItem(lastSeqKey(address || getEffectiveContract())) || 0);
  } catch {
    return 0;
  }
}
export function setLastKnownSeq(address, seq) {
  try {
    localStorage.setItem(lastSeqKey(address || getEffectiveContract()), String(seq));
  } catch {}
}

/** Decode a tx's calldata: base64 JSON {"": "<function>", "args": [...]}. */
export function decodeCalldata(tx) {
  try {
    const content = tx?.data?.params?.encoded_data?.calldata?.content;
    if (!content) return null;
    const binary = atob(content);
    let text;
    try {
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      text = binary;
    }
    const json = JSON.parse(text);
    const fn = json[""];
    const args = Array.isArray(json.args) ? json.args : [];
    if (typeof fn !== "string") return null;
    return { fn, args };
  } catch {
    return null;
  }
}

export function normaliseTx(tx) {
  const decoded = decodeCalldata(tx);
  if (!decoded) return null;
  return {
    hash: tx.hash,
    fn: decoded.fn,
    args: decoded.args,
    from: String(tx.from_address || "").toLowerCase(),
    value: String(tx.value || "0"),
    submitted: Number(tx.submission_timestamp || 0),
    status: tx.status,
    execution: tx.execution_result,
    validators: Array.isArray(tx.validators) ? tx.validators : [],
  };
}

/** Fetch every tx to the contract (paginated), cached 10 minutes. Fails soft. */
export async function fetchContractTxs(address) {
  const addr = address || getEffectiveContract();
  const key = txListKey(addr);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.savedAt && Date.now() - Number(parsed.savedAt) < TXLIST_TTL_MS) {
        return Array.isArray(parsed.txs) ? parsed.txs : [];
      }
    }
  } catch {}
  const all = [];
  let page = 1;
  try {
    for (let guard = 0; guard < 20; guard += 1) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      let res;
      try {
        res = await fetch(`${TX_API}/transactions?address=${addr}&page=${page}&page_size=100`, {
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) break;
      const json = await res.json();
      const items = Array.isArray(json?.transactions)
        ? json.transactions
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
      if (items.length === 0) break;
      for (const tx of items) {
        const n = normaliseTx(tx);
        if (n) all.push(n);
      }
      const total = Number(json?.total || 0);
      if (total > 0 && all.length >= total) break;
      if (items.length < 100) break;
      page += 1;
    }
  } catch {
    // Network/timeout — return what we have; rows just render without links.
  }
  try {
    localStorage.setItem(key, JSON.stringify({ txs: all, savedAt: Date.now() }));
  } catch {}
  return all;
}

/** One tx by hash via the same-origin proxy — the live status a pending row polls. */
export async function fetchTxByHash(hash) {
  if (!hash) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    let res;
    try {
      res = await fetch(`${TX_API}/transactions/${hash}`, { signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object" || !json.hash) return null;
    return json;
  } catch {
    return null;
  }
}

// Group projections: an entry and a tx share a key when the tx's function
// + the args the entry can verify agree. Keys are the VERIFIABLE
// projection only (full args would share hashes wrongly on repeats).
function eventGroup(ev) {
  const cid = ev.claim_id != null ? String(ev.claim_id) : null;
  switch (ev.event) {
    case "POLICY_CREATED":
      return { fn: "create_policy", key: `create_policy|${String(ev.seller || "").toLowerCase()}` };
    case "POLICY_FUNDED":
    case "FUND_CREDITED_BACK":
      return { fn: "fund_policy", key: `fund_policy|${ev.policy_id}|${ev.amount_wei}` };
    case "POOL_WITHDRAWN":
      return { fn: "withdraw_from_pool", key: `withdraw_from_pool|${ev.policy_id}|${ev.amount_wei}` };
    case "POLICY_CLOSED":
      return { fn: "close_policy", key: `close_policy|${ev.policy_id}` };
    case "PURCHASE_REGISTERED":
      return {
        fn: "register_purchase",
        key: `register_purchase|${ev.policy_id}|${String(ev.buyer || "").toLowerCase()}`,
      };
    case "CLAIM_FILED":
      return { fn: "file_claim", key: `file_claim|${ev.purchase_id}|${ev.amount_wei}` };
    case "CLAIM_CANCELLED":
      return { fn: "cancel_claim", key: `cancel_claim|${cid}` };
    case "CLAIM_EXPIRED":
      return { fn: "expire_claim", key: `expire_claim|${cid}` };
    case "VERDICT":
      return { fn: "assess_claim", key: `assess_claim|${cid}` };
    case "JURY_OUTCOME":
      return ev.appeal
        ? { fn: "resolve_appeal", key: `resolve_appeal|${cid}` }
        : { fn: "assess_claim", key: `assess_claim|${cid}` };
    case "APPEAL_VERDICT":
      return { fn: "resolve_appeal", key: `resolve_appeal|${cid}` };
    case "APPEAL_REQUESTED":
      return { fn: "request_appeal", key: `request_appeal|${cid}` };
    case "STALE_APPEAL_RESOLVED":
      return { fn: "resolve_stale_appeal", key: `resolve_stale_appeal|${cid}` };
    case "CLAIM_RELEASED":
      return { fn: "release_claim", key: `release_claim|${cid}` };
    case "WITHDRAWAL_INITIATED":
      return { fn: "withdraw_claim", key: `withdraw_claim|${String(ev.address || "").toLowerCase()}` };
    case "WITHDRAWAL_CONFIRMED":
      return { fn: "confirm_withdrawal", key: `confirm_withdrawal|${String(ev.address || "").toLowerCase()}` };
    case "PENDING_RESTORED":
      return { fn: "restore_pending", key: `restore_pending|${String(ev.address || "").toLowerCase()}` };
    case "PAUSED":
      return { fn: "set_paused", key: "set_paused|true" };
    case "RESUMED":
      return { fn: "set_paused", key: "set_paused|false" };
    case "EXCESS_SWEPT":
      return { fn: "sweep_excess", key: "sweep_excess|" };
    case "OWNERSHIP_TRANSFER_STARTED":
      return {
        fn: "transfer_ownership",
        key: `transfer_ownership|${String(ev.pending_owner || "").toLowerCase()}`,
      };
    case "OWNERSHIP_ACCEPTED":
      return { fn: "accept_ownership", key: "accept_ownership|" };
    default:
      return null;
  }
}

function txGroup(tx) {
  const a = tx.args || [];
  const s = (v) => String(v ?? "");
  switch (tx.fn) {
    case "create_policy":
      return `create_policy|${tx.from}`;
    case "fund_policy":
      return `fund_policy|${s(a[0])}|${tx.value}`;
    case "withdraw_from_pool":
      return `withdraw_from_pool|${s(a[0])}|${s(a[1])}`;
    case "close_policy":
      return `close_policy|${s(a[0])}`;
    case "register_purchase":
      return `register_purchase|${s(a[0])}|${tx.from}`;
    case "file_claim":
      return `file_claim|${s(a[0])}|${s(a[4])}`;
    case "cancel_claim":
      return `cancel_claim|${s(a[0])}`;
    case "expire_claim":
      return `expire_claim|${s(a[0])}`;
    case "assess_claim":
      return `assess_claim|${s(a[0])}`;
    case "resolve_appeal":
      return `resolve_appeal|${s(a[0])}`;
    case "request_appeal":
      return `request_appeal|${s(a[0])}`;
    case "resolve_stale_appeal":
      return `resolve_stale_appeal|${s(a[0])}`;
    case "release_claim":
      return `release_claim|${s(a[0])}`;
    case "withdraw_claim":
      return `withdraw_claim|${tx.from}`;
    case "confirm_withdrawal":
      return `confirm_withdrawal|${tx.from}`;
    case "restore_pending":
      return `restore_pending|${s(a[0]).toLowerCase()}`;
    case "set_paused":
      return `set_paused|${a[0] === true || a[0] === "true" ? "true" : "false"}`;
    case "sweep_excess":
      return "sweep_excess|";
    case "transfer_ownership":
      return `transfer_ownership|${s(a[0]).toLowerCase()}`;
    case "accept_ownership":
      return "accept_ownership|";
    default:
      return null;
  }
}

/**
 * Match activity entries to explorer txs. Recorded hashes win. Otherwise:
 * only state-committing txs are candidates (a FINISHED_WITH_ERROR /
 * NONDET_DISAGREE / TIMEOUT tx never wrote an entry); within a group the
 * oldest excess txs are skipped (the ring buffer pruned the oldest
 * entries); pairing is by order. A pair is "exact" only when its group
 * holds exactly one entry and one tx — everything else is labelled
 * approximate ("Likely transaction"). A tx serves one entry only.
 * Returns Map seq -> { hash, exact, submitted }.
 */
export function matchEntries(entries, txs, recorded) {
  const result = new Map();
  const usedTx = new Set();
  for (const ev of entries) {
    const rec = recorded && recorded[String(ev.seq)];
    if (rec) result.set(ev.seq, { hash: rec, exact: true, submitted: 0 });
  }
  const committing = txs.filter((t) => t.execution === undefined || t.execution === "FINISHED_WITH_RETURN");
  const txGroups = new Map();
  for (const tx of [...committing].sort((x, y) => x.submitted - y.submitted)) {
    const key = txGroup(tx);
    if (!key) continue;
    if (!txGroups.has(key)) txGroups.set(key, []);
    txGroups.get(key).push(tx);
  }
  const entryGroups = new Map();
  for (const ev of [...entries].sort((x, y) => Number(x.seq) - Number(y.seq))) {
    if (result.has(ev.seq)) continue;
    const g = eventGroup(ev);
    if (!g) continue;
    if (!entryGroups.has(g.key)) entryGroups.set(g.key, []);
    entryGroups.get(g.key).push(ev);
  }
  for (const [key, evs] of entryGroups) {
    const group = (txGroups.get(key) || []).filter((t) => !usedTx.has(t.hash));
    if (group.length === 0) continue;
    const excess = Math.max(0, group.length - evs.length);
    const candidates = group.slice(excess);
    const unique = evs.length === 1 && group.length === 1;
    evs.forEach((ev, i) => {
      const tx = candidates[i];
      if (!tx || usedTx.has(tx.hash)) return;
      usedTx.add(tx.hash);
      result.set(ev.seq, { hash: tx.hash, exact: unique, submitted: tx.submitted });
    });
  }
  return result;
}
