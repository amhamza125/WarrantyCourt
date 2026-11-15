// A claim card — identical on the Dashboard, the Register and both
// consoles. The whole card is the tap target to the claim file, and every
// line on it is computed from the claim/purchase records read this
// session (SPEC §3.1: every claim card, everywhere, no exceptions).
import React from "react";
import { Amt, Chip, MiniSteps } from "./bits.jsx";
import { lifecycle, parseVerdict, releaseSplit } from "../lib/activity.js";
import { OUTCOME_TEXT } from "../lib/copy.js";
import { formatGen } from "../lib/money.js";
import { fmtDate, remainingText } from "../lib/time.js";

export function claimProgressLine(claim, purchase, now) {
  const verdict = parseVerdict(claim);
  const attempts = Number(claim.assess_attempts || 0) + Number(claim.appeal_attempts || 0);
  switch (claim.status) {
    case "OPEN": {
      if (attempts > 0) {
        const outcome =
          claim.last_outcome && claim.last_outcome !== "VERDICT" ? OUTCOME_TEXT[claim.last_outcome] : null;
        return (
          <>
            Waiting for the jury. <b>{attempts} attempt{attempts === 1 ? "" : "s"}</b>
            {outcome ? <> — {outcome}</> : <>.</>} Anyone can assess again.
          </>
        );
      }
      return <>The jury hasn't run yet — anyone can assess this claim.</>;
    }
    case "ADJUDICATED": {
      if (claim.appeal_resolved) return <>The appeal is decided — release is open.</>;
      if (verdict && verdict.verdict === "COVERED" && Number(verdict.payout_pct) === 100) {
        return <>Full coverage — no appeal applies. Release is open now.</>;
      }
      const rem = remainingText(Number(claim.appeal_deadline || 0), now);
      if (!rem.past) {
        const split = purchase ? releaseSplit(claim, purchase) : null;
        return (
          <>
            Appeal window open — <b>ends in {rem.text}</b>.
            {split ? <> Then {formatGen(split.paid)} GEN releases to the buyer.</> : <> Then the release opens.</>}
          </>
        );
      }
      return <>The appeal window has closed — release is open.</>;
    }
    case "APPEALING": {
      const staleDate = fmtDate(Number(claim.appeal_filed_at || 0) + 3 * 86400);
      return (
        <>
          Buyer appealed. If the appeal isn't resolved by <b>{staleDate}</b>, anyone can close it with the first
          verdict standing.
        </>
      );
    }
    case "SETTLED": {
      const paid = BigInt(claim.paid_wei || "0");
      return paid > 0n ? (
        <>
          Released — <b>{formatGen(paid)} GEN</b> credited to the buyer.
        </>
      ) : (
        <>Released — nothing to pay.</>
      );
    }
    case "CANCELLED":
      return <>Cancelled by the buyer — the reservation returned to the pool.</>;
    case "EXPIRED":
      return <>Expired — the reservation returned to the pool.</>;
    default:
      return null;
  }
}

export function ClaimCard({ claim, policy, purchase, now }) {
  const verdict = parseVerdict(claim);
  const life = lifecycle(claim, now);
  const live = claim.status === "OPEN" || claim.status === "ADJUDICATED" || claim.status === "APPEALING";
  return (
    <a className="card claimcard" href={`#/claim-${claim.claim_id}`}>
      <div className="claimhead">
        <div>
          <span className="claimno">Claim #{claim.claim_id}</span>
          <div className="prod">{policy ? policy.product : `Policy #${claim.policy_id}`}</div>
        </div>
        <Chip status={claim.status} />
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <span className="k">Claimed</span>
        <Amt wei={claim.amount_wei} />
      </div>
      {live && (
        <div className="row">
          <span className="k">Reserved from pool</span>
          <Amt wei={claim.amount_wei} />
        </div>
      )}
      {verdict && (
        <div className="row">
          <span className="k">Jury verdict</span>
          <span className="v">
            {verdict.verdict === "COVERED" ? "Covered" : "Not covered"} · {verdict.payout_pct}%
          </span>
        </div>
      )}
      {claim.status === "SETTLED" && (
        <div className="row">
          <span className="k">Paid to buyer</span>
          <Amt wei={claim.paid_wei} />
        </div>
      )}
      <MiniSteps marks={life.marks} label={life.label} />
      <div className="progresstext">{claimProgressLine(claim, purchase, now)}</div>
      <span className="pagelink">Open claim file →</span>
    </a>
  );
}
