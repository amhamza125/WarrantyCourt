// Claim file (#/claim-<id>) — SPEC §3.5, the page stewards land on.
// The Assess lead card comes FIRST for OPEN claims (before the evidence),
// then facts, evidence with working Verify, the jury panel (pre-verdict
// attempts / verdict card with the static seal / grounding / countdown),
// and the action bar computed from the claim's true state. Every action
// follows DETAIL_CHECKLIST.md's matrix exactly.
import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import {
  fetchActivity,
  fetchClaim,
  fetchContractTxs,
  fetchPolicy,
  fetchPurchase,
  getRecordedHashes,
  isFullCoverage,
  lifecycle,
  matchEntries,
  parseGrounding,
  parseVerdict,
  releaseSplit,
  releaseState,
} from "../lib/activity.js";
import { baseFees } from "../lib/genlayer.js";
import {
  APPEAL_RISK_TEXT,
  ASSESS_LEAD_TEXT,
  activitySentence,
  errorText,
  OUTCOME_TEXT,
  REASON_TEXT,
} from "../lib/copy.js";
import { formatGen } from "../lib/money.js";
import { APPEAL_STALE_SECONDS, CLAIM_EXPIRY_SECONDS } from "../lib/config.js";
import { fmtDate, fmtDateTimeBoth, fmtDateTimePKT, fmtISODate } from "../lib/time.js";
import {
  Addr,
  Amt,
  Chip,
  Countdown,
  HashChip,
  PageHead,
  SectionState,
  Skeleton,
  Stepper,
  TxLink,
  VerifyHash,
} from "../components/bits.jsx";
import { WriteButton } from "../components/WriteButton.jsx";

/** The outcome kind of an assess/resolve return text ("VERDICT: …" → VERDICT). */
function outcomeKind(returnText) {
  if (!returnText) return "";
  const head = returnText.split(":")[0].trim();
  return head;
}

export function ClaimDetail({ id }) {
  const { account, contractAddr, epoch, runWrite, pushToast } = useStore();
  const now = useNow(30);
  const [matches, setMatches] = useState(new Map());

  const data = useChainRead(async () => {
    const claim = await fetchClaim(id, contractAddr);
    if (!claim) return { claim: null, policy: null, purchase: null, activity: [] };
    const [policy, purchase, activity] = await Promise.all([
      fetchPolicy(claim.policy_id, contractAddr).catch(() => null),
      fetchPurchase(claim.purchase_id, contractAddr).catch(() => null),
      fetchActivity(contractAddr).catch(() => []),
    ]);
    return { claim, policy, purchase, activity };
  }, [contractAddr, epoch, id]);

  const claim = data.data ? data.data.claim : null;
  const policy = data.data ? data.data.policy : null;
  const purchase = data.data ? data.data.purchase : null;
  const notFound = data.data && data.data.claim === null;

  useEffect(() => {
    let live = true;
    if (!data.data || !data.data.claim) return undefined;
    fetchContractTxs(contractAddr).then((txs) => {
      if (!live) return;
      setMatches(matchEntries(data.data.activity, txs, getRecordedHashes(contractAddr)));
    });
    return () => {
      live = false;
    };
  }, [data.data, contractAddr]);

  const claimEvents = useMemo(() => {
    if (!data.data) return [];
    return data.data.activity
      .filter((e) => Number(e.claim_id) === Number(id))
      .sort((a, b) => Number(a.seq) - Number(b.seq));
  }, [data.data, id]);

  const appealVerdictSeen = useMemo(
    () => claimEvents.some((e) => e.event === "APPEAL_VERDICT"),
    [claimEvents]
  );
  const appealVerdictMatch = useMemo(() => {
    const ev = claimEvents.find((e) => e.event === "APPEAL_VERDICT");
    return ev ? matches.get(ev.seq) : null;
  }, [claimEvents, matches]);

  const isBuyer = claim && account && account.toLowerCase() === String(claim.buyer).toLowerCase();
  const isSeller = policy && account && account.toLowerCase() === String(policy.seller).toLowerCase();
  const verdict = claim ? parseVerdict(claim) : null;
  const grounding = claim ? parseGrounding(claim) : null;
  const full = verdict ? isFullCoverage(verdict) : false;
  const life = claim ? lifecycle(claim, now) : null;
  const rel = claim ? releaseState(claim, now) : null;
  const split = claim ? releaseSplit(claim, purchase) : null;
  const liveStatuses = ["OPEN", "ADJUDICATED", "APPEALING"];
  const paidWei = claim ? BigInt(claim.paid_wei || 0) : 0n;
  const claimAmt = claim ? BigInt(claim.amount_wei || 0) : 0n;
  const staleAppealReady =
    claim && claim.status === "APPEALING" && now > Number(claim.appeal_filed_at) + APPEAL_STALE_SECONDS;
  const expireReady =
    claim && claim.status === "OPEN" && now > Number(claim.filed_at) + CLAIM_EXPIRY_SECONDS;

  const assessRun = (onHash) =>
    runWrite({ fn: "assess_claim", args: [Number(id)], fees: baseFees(), onHash });
  const assessDone = (result) => {
    const kind = outcomeKind(result.outcome && result.outcome.returnText);
    if (kind === "VERDICT") {
      pushToast("ok", "The jury reached a verdict", "The verdict card on this claim file shows what was decided.", result.hash);
    } else if (OUTCOME_TEXT[kind]) {
      pushToast("warn", "The jury hasn't settled this yet", OUTCOME_TEXT[kind], result.hash);
    } else {
      pushToast("ok", "Assessment finished", "The claim file below shows the contract's answer.", result.hash);
    }
  };

  return (
    <div>
      <PageHead title={`Claim #${id}`} line={policy ? policy.product : ""} />
      {claim && (
        <div style={{ margin: "-6px 0 12px" }}>
          <Chip status={claim.status} />
        </div>
      )}

      <SectionState
        loading={data.loading}
        slow={data.slow}
        error={data.error}
        onRetry={data.retry}
        empty={notFound}
        emptyNode={
          <div className="card">
            <p className="hint" style={{ margin: 0 }}>
              Nothing is stored under claim #{id} yet — when a buyer files it, this page will show it read
              straight from the contract.
            </p>
          </div>
        }
        skeleton={<Skeleton lines={6} block />}
      >
        {claim && (
          <>
            {claim.status === "SETTLED" && paidWei > 0n && isBuyer && (
              <div className="msg warn" role="status" style={{ marginTop: 0, marginBottom: 14 }}>
                <b>Paid to you</b>
                {formatGen(paidWei)} GEN was credited to you when this claim settled.{" "}
                <a href="#/funds">Withdraw it in My Funds →</a>
              </div>
            )}

            <div className="card">
              <div className="row">
                <span className="k">Buyer</span>
                <Addr address={claim.buyer} role="Buyer" you={!!isBuyer} />
              </div>
              {policy && (
                <div className="row">
                  <span className="k">Seller</span>
                  <Addr address={policy.seller} role="Seller" you={!!isSeller} />
                </div>
              )}
              <div className="row">
                <span className="k">Claimed</span>
                <Amt wei={claim.amount_wei} />
              </div>
              {liveStatuses.includes(claim.status) && (
                <div className="row">
                  <span className="k">Set aside for this claim</span>
                  <Amt wei={claim.amount_wei} />
                </div>
              )}
              <div className="row">
                <span className="k">Filed</span>
                <span className="v">{fmtDateTimeBoth(claim.filed_at)}</span>
              </div>
              <div className="row">
                <span className="k">Policy</span>
                <span className="v">
                  <a href={`#/policy-${claim.policy_id}`}>Policy #{claim.policy_id} →</a>
                </span>
              </div>
              <div className="row">
                <span className="k">Purchase</span>
                <span className="v">
                  <a href={`#/purchase-${claim.purchase_id}`}>Purchase #{claim.purchase_id} →</a>
                </span>
              </div>
              {life && <Stepper marks={life.marks} currentLabel={life.label} />}
              {life && life.marks[2] === "skip" && (
                <p className="stepnote">
                  Full coverage — no appeal was needed, so that step was skipped. The money can be released
                  right away.
                </p>
              )}
            </div>

            {claim.status === "OPEN" && (
              <div className="card">
                <h2 style={{ marginTop: 0 }}>Ask the jury</h2>
                <p className="hint">{ASSESS_LEAD_TEXT}</p>
                <WriteButton
                  label="Assess this claim with the jury"
                  verb="assess this claim"
                  jury
                  run={assessRun}
                  onSuccess={assessDone}
                />
                <p className="btnnote">
                  Verdicts come from several validators agreeing. If they can't agree this time, anyone can
                  assess again.
                </p>
              </div>
            )}

            <h2>The evidence</h2>
            <div className="card">
              <div className="flabel">What broke</div>
              <p style={{ margin: "0 0 6px" }}>{claim.defect}</p>
              <div className="flabel" style={{ marginTop: 12 }}>
                The photo
              </div>
              <a href={claim.photo_url} target="_blank" rel="noreferrer">
                <img
                  className="photoimg"
                  src={claim.photo_url}
                  alt="The defect photo filed with this claim"
                  loading="lazy"
                />
              </a>
              <div className="row">
                <span className="k">Fingerprint of the photo</span>
                <HashChip hash={claim.photo_sha256} />
              </div>
              <VerifyHash url={claim.photo_url} sha={claim.photo_sha256} />
              {purchase && (
                <>
                  <div className="row" style={{ marginTop: 10 }}>
                    <span className="k">Receipt</span>
                    <span className="v">
                      <a href={purchase.receipt_url} target="_blank" rel="noreferrer">
                        Read the receipt ↗
                      </a>
                    </span>
                  </div>
                  <div className="row">
                    <span className="k">Fingerprint of the receipt</span>
                    <HashChip hash={purchase.receipt_sha256} />
                  </div>
                  <VerifyHash url={purchase.receipt_url} sha={purchase.receipt_sha256} />
                </>
              )}
              {policy && (
                <>
                  <div className="row" style={{ marginTop: 10 }}>
                    <span className="k">Terms</span>
                    <span className="v">
                      <a href={policy.terms_url} target="_blank" rel="noreferrer">
                        Read the terms ↗
                      </a>
                    </span>
                  </div>
                  <div className="row">
                    <span className="k">Fingerprint of the terms</span>
                    <HashChip hash={policy.terms_sha256} />
                  </div>
                  <VerifyHash url={policy.terms_url} sha={policy.terms_sha256} />
                </>
              )}
            </div>

            <h2>The jury</h2>
            {claim.status === "OPEN" && (
              <div className="card">
                <p style={{ margin: "0 0 6px" }}>
                  <b>Attempts so far:</b> {claim.assess_attempts}
                </p>
                <p className="hint" style={{ margin: 0 }}>
                  The jury has not reached a verdict yet. Assessment can be retried by anyone — each try
                  asks the jury again with the same evidence.
                </p>
                {claim.last_outcome && OUTCOME_TEXT[claim.last_outcome] && (
                  <p className="hint" style={{ marginTop: 8 }}>
                    Last try: {OUTCOME_TEXT[claim.last_outcome]}
                  </p>
                )}
              </div>
            )}

            {claim.status === "APPEALING" && (
              <div className="card">
                <p style={{ margin: "0 0 6px" }}>
                  <b>Appeal attempts so far:</b> {claim.appeal_attempts}
                </p>
                <p className="hint" style={{ margin: 0 }}>
                  The appeal jury hasn't reached a verdict yet — anyone can ask it again with “Resolve
                  appeal” below. Nothing about the first verdict changes until the appeal jury agrees.
                </p>
                {claim.last_outcome && OUTCOME_TEXT[claim.last_outcome] && (
                  <p className="hint" style={{ marginTop: 8 }}>
                    Last try: {OUTCOME_TEXT[claim.last_outcome]}
                  </p>
                )}
                {verdict && (
                  <p className="hint" style={{ marginTop: 8 }}>
                    First verdict (still standing): {verdict.verdict === "COVERED" ? "Covered" : "Not covered"} ·{" "}
                    {verdict.payout_pct}%{REASON_TEXT[verdict.reasons] ? ` — ${REASON_TEXT[verdict.reasons]}` : ""}
                  </p>
                )}
              </div>
            )}

            {(claim.status === "ADJUDICATED" || claim.status === "SETTLED") && verdict && (
              <>
                <div className="verdict">
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div>
                      <div className="pct">
                        {verdict.payout_pct}
                        <small>%</small>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>
                        {verdict.verdict === "COVERED" ? "Covered" : "Not covered"}
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "center" }}>
                      <div className="seal" aria-hidden="true">
                        §
                      </div>
                      <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 5, fontWeight: 700 }}>
                        Jury verdict
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: "12px 0 0", fontWeight: 600 }}>
                    {appealVerdictSeen ? "Appeal verdict — replaces the first verdict. " : ""}
                    {REASON_TEXT[verdict.reasons] || verdict.reasons}
                  </p>
                  <p style={{ margin: "6px 0 0", color: "var(--dim)", fontSize: 13 }}>
                    Evidence checked: Terms ✓ · Receipt ✓ · Photo ✓ — the fingerprints matched inside the
                    jury before it decided.
                  </p>
                  {grounding && (BigInt(grounding.receipt_total_wei || 0) > 0n || grounding.receipt_date) && (
                    <p style={{ margin: "6px 0 0", color: "var(--dim)", fontSize: 13 }}>
                      The jury read the receipt:{" "}
                      {BigInt(grounding.receipt_total_wei || 0) > 0n && (
                        <>total {formatGen(BigInt(grounding.receipt_total_wei))} GEN</>
                      )}
                      {grounding.receipt_date && <> · dated {fmtISODate(grounding.receipt_date)}</>}
                    </p>
                  )}
                  {grounding && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className="k">
                        Terms fingerprint <HashChip hash={grounding.terms_sha256} />
                      </span>
                      <span className="k">
                        Receipt fingerprint <HashChip hash={grounding.receipt_sha256} />
                      </span>
                      <span className="k">
                        Photo fingerprint <HashChip hash={grounding.photo_sha256} />
                      </span>
                    </div>
                  )}
                  <p style={{ margin: "10px 0 0", color: "var(--dim)", fontSize: 13 }}>
                    Judged {fmtDateTimeBoth(claim.adjudicated_at)}
                    {appealVerdictSeen && appealVerdictMatch && appealVerdictMatch.submitted > 0
                      ? ` · appeal judged ${fmtDateTimePKT(appealVerdictMatch.submitted)}`
                      : ""}
                  </p>
                  {claim.status === "SETTLED" && (
                    <p style={{ margin: "6px 0 0", fontWeight: 600 }}>
                      {paidWei > 0n
                        ? `Released ${formatGen(paidWei)} GEN of the ${formatGen(claimAmt)} GEN claimed — the rest of the reservation went back to the pool.`
                        : "Settled — no payment. The reserved money went back to the pool."}
                    </p>
                  )}
                </div>

                {claim.status === "ADJUDICATED" && !claim.appeal_resolved && !full && (
                  <Countdown
                    startUnix={claim.adjudicated_at}
                    endUnix={claim.appeal_deadline}
                    nowUnix={now}
                  />
                )}
              </>
            )}

            {(claim.status === "CANCELLED" || claim.status === "EXPIRED") && (
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  {claim.status === "CANCELLED"
                    ? "This claim was cancelled by the buyer. The reserved money went back to the pool."
                    : "This claim expired after 30 days without a verdict. The reserved money went back to the pool."}
                </p>
              </div>
            )}

            <div className="actionbar">
              {claim.status === "OPEN" && (
                <>
                  <WriteButton
                    label="Assess this claim with the jury"
                    verb="assess this claim"
                    jury
                    run={assessRun}
                    onSuccess={assessDone}
                  />
                  <WriteButton
                    label="Cancel this claim"
                    verb="cancel this claim"
                    ghost
                    disabled={!isBuyer}
                    disabledReason="Only the buyer can cancel this claim"
                    run={(onHash) =>
                      runWrite({ fn: "cancel_claim", args: [Number(id)], fees: baseFees(), onHash })
                    }
                    onSuccess={(result) =>
                      pushToast("ok", "Claim cancelled", "The reserved money went back to the pool.", result.hash)
                    }
                  />
                  {expireReady && (
                    <WriteButton
                      label={`Expire this claim (open since ${fmtDate(claim.filed_at)})`}
                      verb="expire this claim"
                      ghost
                      run={(onHash) =>
                        runWrite({ fn: "expire_claim", args: [Number(id)], fees: baseFees(), onHash })
                      }
                      onSuccess={(result) =>
                        pushToast("ok", "Claim expired", "The reserved money went back to the pool.", result.hash)
                      }
                    />
                  )}
                </>
              )}

              {claim.status === "ADJUDICATED" && !full && (
                <WriteButton
                  label="Appeal this verdict"
                  verb="appeal this verdict"
                  ghost
                  disabled={
                    !isBuyer || claim.appeal_used || now > Number(claim.appeal_deadline)
                  }
                  disabledReason={
                    !isBuyer
                      ? "Only the buyer can appeal this claim"
                      : claim.appeal_used
                        ? errorText("APPEAL_NOT_AVAILABLE")
                        : errorText("APPEAL_WINDOW_CLOSED")
                  }
                  confirmText={APPEAL_RISK_TEXT}
                  run={(onHash) =>
                    runWrite({ fn: "request_appeal", args: [Number(id)], fees: baseFees(), onHash })
                  }
                  onSuccess={(result) =>
                    pushToast(
                      "ok",
                      "Appeal opened",
                      "A fresh jury will re-read the same evidence. Use “Resolve appeal” on this claim to ask it for a verdict.",
                      result.hash
                    )
                  }
                />
              )}
              {claim.status === "ADJUDICATED" && full && (
                <p className="hint" style={{ textAlign: "center", margin: "0 0 4px" }}>
                  Full coverage — no appeal applies; release is open now.
                </p>
              )}
              {claim.status === "ADJUDICATED" && rel && split && (
                <WriteButton
                  label={rel.can ? `Release ${formatGen(split.paid)} GEN to the buyer` : "Release the money"}
                  verb="release the money"
                  disabled={!!account && !isBuyer && !isSeller ? true : !rel.can}
                  disabledReason={
                    account && !isBuyer && !isSeller
                      ? errorText("ONLY_PARTY")
                      : errorText(rel.reason) || ""
                  }
                  run={(onHash) =>
                    runWrite({ fn: "release_claim", args: [Number(id)], fees: baseFees(), onHash })
                  }
                  onSuccess={(result) =>
                    pushToast(
                      "ok",
                      "Released",
                      `${formatGen(split.paid)} GEN credited to the buyer${split.unpaid > 0n ? `, and ${formatGen(split.unpaid)} GEN returned to the pool` : ""}.`,
                      result.hash
                    )
                  }
                />
              )}
              {claim.status === "ADJUDICATED" && rel && split && split.unpaid > 0n && rel.can && (
                <p className="btnnote">…and return {formatGen(split.unpaid)} GEN to the pool</p>
              )}

              {claim.status === "APPEALING" && (
                <>
                  <WriteButton
                    label="Resolve appeal"
                    verb="resolve the appeal"
                    jury
                    run={(onHash) =>
                      runWrite({ fn: "resolve_appeal", args: [Number(id)], fees: baseFees(), onHash })
                    }
                    onSuccess={(result) => {
                      const kind = outcomeKind(result.outcome && result.outcome.returnText);
                      if (kind === "VERDICT") {
                        pushToast("ok", "The appeal jury reached a verdict", "The verdict card on this claim file shows the new, final verdict.", result.hash);
                      } else if (OUTCOME_TEXT[kind]) {
                        pushToast("warn", "The appeal jury hasn't settled this yet", OUTCOME_TEXT[kind], result.hash);
                      } else {
                        pushToast("ok", "Appeal check finished", "The claim file below shows the contract's answer.", result.hash);
                      }
                    }}
                  />
                  {staleAppealReady && (
                    <WriteButton
                      label="Close appeal (first verdict stands)"
                      verb="close the appeal"
                      ghost
                      run={(onHash) =>
                        runWrite({ fn: "resolve_stale_appeal", args: [Number(id)], fees: baseFees(), onHash })
                      }
                      onSuccess={(result) =>
                        pushToast("ok", "Appeal closed", "The first verdict stands and can now be released.", result.hash)
                      }
                    />
                  )}
                </>
              )}

              {(claim.status === "SETTLED" || claim.status === "CANCELLED" || claim.status === "EXPIRED") && (
                <p className="hint" style={{ textAlign: "center", margin: 0 }}>
                  This claim is finished — nothing left to do on it. Its record stays public in the Register.
                </p>
              )}
            </div>

            {claimEvents.length > 0 && (
              <>
                <h2>This claim's history</h2>
                <div className="card activity">
                  {claimEvents.map((ev) => {
                    const m = matches.get(ev.seq);
                    const s = activitySentence(ev);
                    return (
                      <p key={ev.seq}>
                        {s.text}
                        {m && m.submitted > 0 && <time> · {fmtDateTimePKT(m.submitted)}</time>}
                        <TxLink match={m} />
                      </p>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </SectionState>

      <a className="pagelink" href="#/register">
        ← All claims in the Register
      </a>
    </div>
  );
}
