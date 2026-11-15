// Copy is data (DAPP_SPEC §6): every human-language map lives in this one
// file — jury outcomes, verdict reasons, the 50 error codes (§7), and the
// activity-event sentences (§6). Components never hardcode these strings.
import { formatGen } from "./money.js";

// --- §7: the 50 raised error codes → human text (verbatim from the spec) --
export const ERROR_TEXT = {
  PROTOCOL_PAUSED: "The protocol is paused — this action isn't available right now.",
  POLICY_LIMIT: "The contract has reached its policy limit (500).",
  POLICY_NOT_FOUND: "That policy doesn't exist.",
  POLICY_CLOSED: "This policy is closed.",
  PURCHASE_NOT_FOUND: "That purchase doesn't exist.",
  CLAIM_NOT_FOUND: "That claim doesn't exist.",
  ONLY_SELLER: "Only the policy's seller can do this.",
  ONLY_BUYER: "Only the buyer can do this.",
  ONLY_PARTY: "Only the buyer or the seller of this claim can do this.",
  ONLY_OWNER: "Only the contract owner can do this.",
  ONLY_PENDING_OWNER: "Only the wallet named as next owner can accept ownership.",
  SELLER_CANNOT_REGISTER: "The seller can't register a purchase on their own policy.",
  EMPTY_PRODUCT: "Enter the product name.",
  EMPTY_DEFECT: "Describe the defect.",
  TEXT_TOO_LONG: "That text is too long.",
  BAD_HASH: "Enter the file's SHA-256 (64 hex characters). The app can compute it from the file.",
  BAD_URL: "Enter a valid http(s) link.",
  LINK_TOO_LONG: "That link is too long (max 512 characters).",
  PRIVATE_URL_NOT_ALLOWED: "Private or local links aren't allowed — the jury must be able to fetch the file publicly.",
  BAD_DATE: "Enter a purchase date between 1 Jan 2020 and today.",
  BAD_DURATION: "Coverage length must be between 1 and 3650 days.",
  BAD_CAP: "Enter a per-claim cap above zero.",
  BAD_AMOUNT: "Enter an amount above zero.",
  BAD_ADDRESS: "Enter a valid wallet address.",
  BAD_STATUS: "This claim isn't in the state that action needs.",
  CLAIM_NOT_OPEN: "This claim is no longer open.",
  CLAIM_ALREADY_OPEN: "This purchase already has an open claim — finish or cancel it first.",
  CLAIM_LIMIT: "This purchase has reached its claim limit (20).",
  PURCHASE_LIMIT: "This policy has reached its purchase limit (500).",
  RECEIPT_ALREADY_CLAIMED: "That receipt is already registered — a receipt can only be used once.",
  PHOTO_ALREADY_USED: "That photo is already used by another claim — each claim needs its own photo.",
  COVERAGE_EXPIRED: "Coverage for this purchase has ended.",
  COVERAGE_STILL_ACTIVE: "Coverage is still running for at least one purchase — the policy can't close yet.",
  OPEN_CLAIMS_REMAIN: "Claims are still open on this policy — it can't close yet.",
  OVER_CAP: "That amount is above this policy's per-claim cap.",
  AGGREGATE_CAP_EXCEEDED: "This purchase has already been paid up to its purchase price.",
  POOL_INSUFFICIENT: "The policy pool doesn't have enough unreserved GEN for that amount.",
  EXCEEDS_UNRESERVED_POOL: "That is more than the pool's unreserved balance.",
  APPEAL_NOT_AVAILABLE: "This verdict can't be appealed (full coverage, or the appeal was already used).",
  APPEAL_WINDOW_CLOSED: "The 24-hour appeal window has closed.",
  APPEAL_WINDOW_OPEN: "The appeal window is still open — release comes after it closes or an appeal resolves.",
  APPEAL_PENDING: "An appeal is in progress on this claim.",
  NO_VERDICT: "The jury hasn't given a verdict on this claim yet.",
  NOT_EXPIRED: "This hasn't expired yet.",
  NO_CLAIM: "There is nothing to withdraw.",
  PENDING_WITHDRAWAL: "A withdrawal is already in progress — confirm it first.",
  NO_PENDING: "There is no pending withdrawal.",
  TOO_EARLY: "A pending withdrawal can be restored 10 minutes after it started.",
  NO_EXCESS: "There is no untracked excess to sweep.",
  TIME_UNAVAILABLE: "The chain clock wasn't available for that attempt — nothing was recorded, try again.",
};

export const ERROR_CODES = Object.keys(ERROR_TEXT);

export function errorText(code) {
  return ERROR_TEXT[code] || null;
}

// B+ restore context (BUILD_BRIEF wording rule): the same NO_EXCESS code
// from restore_pending means the emitted transfer has physically left the
// contract — a different sentence than the sweep one above.
export const RESTORE_NO_EXCESS_TEXT =
  "That withdrawal's GEN has left the contract — it is on its way to the holder's wallet or already delivered, so there is nothing physically here to restore. A restore is only possible when the funds are physically back in the contract (for example a transfer that bounced back). The normal completion is the holder pressing Confirm in My Funds once the GEN has arrived.";

export const RESTORE_EXPLAINER =
  "Restore is an owner tool for a stuck withdrawal, and it can only work when the funds are physically back in the contract — a transfer that bounced back, or GEN the owner has put in to cover it. If the transfer is still on its way or already arrived, there is nothing to restore: the holder completes the withdrawal with Confirm in My Funds. A restore is never guaranteed.";

// --- §6: jury outcomes (last_outcome / assess results) ---------------------
export const OUTCOME_TEXT = {
  VERDICT: "", // the verdict card itself speaks
  EVIDENCE_FETCH_FAILED:
    "The jury could not fetch one of the evidence files. The claim stays open — check the links and assess again.",
  EVIDENCE_MISMATCH:
    "An evidence file no longer matches the hash recorded on chain. The claim stays open; a changed file cannot be judged.",
  MALFORMED_VERDICT: "The jury's answer couldn't be read. The claim stays open — assess again.",
  JURY_FAILURE:
    "The validators didn't reach consensus on this attempt. Nothing was recorded — assess again.",
  TIME_UNAVAILABLE: ERROR_TEXT.TIME_UNAVAILABLE,
};

// --- §6: verdict reasons ----------------------------------------------------
export const REASON_TEXT = {
  DEFECT_COVERED: "Covered — the terms cover this defect in full.",
  PARTIAL_COVERAGE: "Partly covered — the terms pay a percentage of this defect's cost.",
  TERMS_EXCLUDE_DEFECT: "Not covered — the terms exclude this defect.",
  INSUFFICIENT_EVIDENCE: "Not covered — the photo doesn't show the defect clearly enough to judge.",
  RECEIPT_MISMATCH:
    "Not covered — the receipt doesn't match this purchase (different product, date, or the claim is more than the purchase price).",
};

// --- return-string prefixes the receipt extractor looks for ----------------
export const RETURN_PREFIXES = [
  "FUND_REJECTED_CREDITED",
  "POLICY_CREATED:",
  "POLICY_FUNDED:",
  "PURCHASE_REGISTERED:",
  "CLAIM_FILED:",
  "VERDICT:",
  "JURY_FAILURE",
  "EVIDENCE_FETCH_FAILED",
  "EVIDENCE_MISMATCH",
  "MALFORMED_VERDICT",
  "CLAIM_RELEASED:",
  "WITHDRAWAL_PENDING:",
  "WITHDRAWAL_CONFIRMED:",
  "PENDING_RESTORED:",
  "APPEAL_REQUESTED:",
  "STALE_APPEAL_RESOLVED:",
  "CLAIM_CANCELLED:",
  "CLAIM_EXPIRED:",
  "POOL_WITHDRAWN:",
  "POLICY_CLOSED:",
  "EXCESS_SWEPT:",
  "OWNERSHIP_PENDING:",
  "OWNER_ACCEPTED:",
  "PROTOCOL_PAUSED",
  "PROTOCOL_RESUMED",
];

// --- §6: activity events → plain sentences ----------------------------------
// Fields come straight from the contract's _log payloads; nothing is
// invented. A sentence carries { text, claimId, policyId, purchaseId } so
// the Register can link the record it names.
export function activitySentence(ev) {
  const g = (wei) => `${formatGen(wei)} GEN`;
  const base = { claimId: null, policyId: null, purchaseId: null };
  const out = (text, extra = {}) => ({ ...base, text, ...extra });
  if (!ev || typeof ev !== "object") return out("Activity recorded on chain.");
  switch (ev.event) {
    case "POLICY_CREATED":
      return out(`Policy #${ev.policy_id} created`, { policyId: ev.policy_id });
    case "POLICY_FUNDED":
      return out(`Policy #${ev.policy_id} funded with ${g(ev.amount_wei)}`, { policyId: ev.policy_id });
    case "FUND_CREDITED_BACK":
      return out(`A funding of ${g(ev.amount_wei)} for Policy #${ev.policy_id} was returned to claimable`, {
        policyId: ev.policy_id,
      });
    case "POOL_WITHDRAWN":
      return out(`Policy #${ev.policy_id} — ${g(ev.amount_wei)} withdrawn from the pool to the seller`, {
        policyId: ev.policy_id,
      });
    case "POLICY_CLOSED":
      return out(`Policy #${ev.policy_id} closed — ${g(ev.amount_wei)} credited to the seller`, {
        policyId: ev.policy_id,
      });
    case "PURCHASE_REGISTERED":
      return out(`Purchase #${ev.purchase_id} registered under Policy #${ev.policy_id}`, {
        purchaseId: ev.purchase_id,
        policyId: ev.policy_id,
      });
    case "CLAIM_FILED":
      return out(`Claim #${ev.claim_id} filed — ${g(ev.amount_wei)} reserved`, {
        claimId: ev.claim_id,
        purchaseId: ev.purchase_id,
      });
    case "CLAIM_CANCELLED":
      return out(`Claim #${ev.claim_id} cancelled — the reservation returned to the pool`, { claimId: ev.claim_id });
    case "CLAIM_EXPIRED":
      return out(`Claim #${ev.claim_id} expired — the reservation returned to the pool`, { claimId: ev.claim_id });
    case "VERDICT":
      return out(
        `Claim #${ev.claim_id} judged ${ev.verdict === "COVERED" ? "Covered" : "Not covered"} · ${ev.payout_pct}%`,
        { claimId: ev.claim_id }
      );
    case "APPEAL_REQUESTED":
      return out(`Claim #${ev.claim_id} — appeal requested by the buyer`, { claimId: ev.claim_id });
    case "APPEAL_VERDICT":
      return out(
        `Claim #${ev.claim_id} — appeal judged ${ev.verdict === "COVERED" ? "Covered" : "Not covered"} · ${ev.payout_pct}%`,
        { claimId: ev.claim_id }
      );
    case "JURY_OUTCOME": {
      const words =
        {
          EVIDENCE_FETCH_FAILED: "the jury could not fetch an evidence file",
          EVIDENCE_MISMATCH: "an evidence file no longer matches its fingerprint",
          MALFORMED_VERDICT: "the jury's answer couldn't be read",
        }[ev.outcome] || "the jury attempt was recorded";
      return out(`Claim #${ev.claim_id} — jury attempt recorded: ${words}`, { claimId: ev.claim_id });
    }
    case "STALE_APPEAL_RESOLVED":
      return out(`Claim #${ev.claim_id} — appeal closed; the first verdict stands`, { claimId: ev.claim_id });
    case "CLAIM_RELEASED":
      return out(`Claim #${ev.claim_id} released — ${g(ev.paid_wei)} to the buyer`, { claimId: ev.claim_id });
    case "WITHDRAWAL_INITIATED":
      return out(`A withdrawal of ${g(ev.amount_wei)} was started`);
    case "WITHDRAWAL_CONFIRMED":
      return out(`A withdrawal of ${g(ev.amount_wei)} was confirmed received`);
    case "PENDING_RESTORED":
      return out(`A stuck withdrawal of ${g(ev.amount_wei)} was restored to claimable`);
    case "PAUSED":
      return out("The protocol was paused by the owner");
    case "RESUMED":
      return out("The protocol was resumed by the owner");
    case "EXCESS_SWEPT":
      return out(`Untracked excess of ${g(ev.amount_wei)} was swept to the owner`);
    case "OWNERSHIP_TRANSFER_STARTED":
      return out("Ownership transfer started — the new owner must accept it");
    case "OWNERSHIP_ACCEPTED":
      return out("Ownership was accepted by the new owner");
    default:
      return out("Activity recorded on chain.");
  }
}

// --- banners & fixed copy ----------------------------------------------------
export const PAUSED_BANNER_TEXT =
  "New policies, purchases, claims and assessments are paused by the contract owner. Releases, withdrawals and exits still work.";

export const OVERRIDE_BANNER_TEXT =
  "You are viewing a different contract than the one this app shipped with.";

export const APPEAL_RISK_TEXT =
  "A fresh jury decides again. Its verdict replaces this one — the payout can go up, down, or to zero. You can appeal only once.";

export const ASSESS_LEAD_TEXT =
  "The jury hasn't run yet. Anyone can start it — including you. An attempt can take a few minutes, and sometimes the validators don't agree and nothing is recorded; the claim simply stays open and can be assessed again.";
