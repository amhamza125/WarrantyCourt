// Buyer console (#/buyer) — SPEC §3.4: my purchases (index-driven) with
// each purchase's claims and per-claim actions inline (Assess + Cancel
// on OPEN claims, the claim form when eligible), and the register-a-
// purchase card: policy picker hydrated from get_policy 1..min(count,
// 20) with a manual-id escape, receipt evidence, date input, and the
// plain-words coverage-end preview.
import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import {
  fetchBuyerPurchases,
  fetchClaimsForPurchase,
  fetchPolicy,
  lifecycle,
} from "../lib/activity.js";
import { baseFees } from "../lib/genlayer.js";
import { errorText, OUTCOME_TEXT } from "../lib/copy.js";
import { formatGen } from "../lib/money.js";
import { DATE_FLOOR, fmtDate, fmtISODate, purchaseDateUnix } from "../lib/time.js";
import { Amt, MiniSteps, PageHead, SectionState, Skeleton } from "../components/bits.jsx";
import { WriteButton } from "../components/WriteButton.jsx";
import { EvidenceField } from "../components/EvidenceField.jsx";
import { ClaimForm } from "../components/ClaimForm.jsx";

function outcomeKind(returnText) {
  if (!returnText) return "";
  return returnText.split(":")[0].trim();
}

function PurchaseCard({ purchase, claims, policy, now, runWrite, pushToast }) {
  const [formOpen, setFormOpen] = useState(false);
  const coverageActive = now <= Number(purchase.coverage_end_unix);
  const activeClaim = claims.find((c) => ["OPEN", "ADJUDICATED", "APPEALING"].includes(c.status));
  return (
    <div className="card">
      <div className="claimhead">
        <div>
          <span className="claimno" style={{ fontSize: 15 }}>
            Purchase #{purchase.purchase_id}
          </span>
          <div className="prod">{policy ? policy.product : `Policy #${purchase.policy_id}`}</div>
        </div>
        <span className="chip settled" style={coverageActive ? {} : { color: "var(--red)" }}>
          <i style={{ background: coverageActive ? "var(--green)" : "var(--red)" }}></i>
          {coverageActive ? "Covered" : "Coverage ended"}
        </span>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <span className="k">Bought</span>
        <span className="v">{fmtISODate(purchase.purchase_date)}</span>
      </div>
      <div className="row">
        <span className="k">Coverage ends</span>
        <span className="v">{fmtDate(purchase.coverage_end_unix)}</span>
      </div>
      <div className="row">
        <span className="k">Price</span>
        {BigInt(purchase.receipt_total_wei || 0) > 0n ? (
          <Amt wei={purchase.receipt_total_wei} />
        ) : (
          <span className="v">Price not read by the jury yet</span>
        )}
      </div>
      <div className="row">
        <span className="k">Paid to you so far</span>
        <Amt wei={purchase.cumulative_paid_wei} />
      </div>

      {claims.map((c) => {
        const life = lifecycle(c, now);
        return (
          <div key={c.claim_id} style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
            <div className="row">
              <a href={`#/claim-${c.claim_id}`}>
                <b>Claim #{c.claim_id}</b>
              </a>
              <Amt wei={c.amount_wei} />
            </div>
            <MiniSteps marks={life.marks} label={life.label} />
            {c.status === "OPEN" && (
              <div style={{ marginTop: 10 }}>
                <WriteButton
                  label="Assess this claim with the jury"
                  verb="assess this claim"
                  jury
                  run={(onHash) =>
                    runWrite({ fn: "assess_claim", args: [Number(c.claim_id)], fees: baseFees(), onHash })
                  }
                  onSuccess={(result) => {
                    const kind = outcomeKind(result.outcome && result.outcome.returnText);
                    if (kind === "VERDICT") {
                      pushToast("ok", "The jury reached a verdict", "Open the claim file to see it.", result.hash);
                    } else if (OUTCOME_TEXT[kind]) {
                      pushToast("warn", "The jury hasn't settled this yet", OUTCOME_TEXT[kind], result.hash);
                    }
                  }}
                />
                <WriteButton
                  label="Cancel this claim"
                  verb="cancel this claim"
                  ghost
                  run={(onHash) =>
                    runWrite({ fn: "cancel_claim", args: [Number(c.claim_id)], fees: baseFees(), onHash })
                  }
                  onSuccess={(result) =>
                    pushToast("ok", "Claim cancelled", "The reserved money went back to the pool.", result.hash)
                  }
                />
              </div>
            )}
            {c.status === "ADJUDICATED" && (
              <p className="progresstext">
                The jury decided — <a href={`#/claim-${c.claim_id}`}>open the claim file</a> to appeal within
                the window or release the money.
              </p>
            )}
            {c.status === "APPEALING" && (
              <p className="progresstext">
                An appeal is running — <a href={`#/claim-${c.claim_id}`}>open the claim file</a> to resolve it.
              </p>
            )}
            {c.status === "SETTLED" && (
              <p className="progresstext">
                {BigInt(c.paid_wei || 0) > 0n ? (
                  <>
                    Paid {formatGen(BigInt(c.paid_wei))} GEN — <a href="#/funds">withdraw it in My Funds</a>.
                  </>
                ) : (
                  "Settled with no payment."
                )}
              </p>
            )}
            {(c.status === "CANCELLED" || c.status === "EXPIRED") && (
              <p className="progresstext">This claim is finished; its reservation went back to the pool.</p>
            )}
          </div>
        );
      })}

      {!activeClaim && coverageActive && policy && (
        <>
          {!formOpen ? (
            <button type="button" className="btn" style={{ marginTop: 12 }} onClick={() => setFormOpen(true)}>
              File a claim on this purchase
            </button>
          ) : (
            <ClaimForm
              purchase={purchase}
              policy={policy}
              onFiled={(newId) => {
                setFormOpen(false);
                if (newId) window.location.hash = `#/claim-${newId}`;
              }}
            />
          )}
        </>
      )}
      {!activeClaim && !coverageActive && (
        <div className="inlineerr">
          {errorText("COVERAGE_EXPIRED")} Coverage ended {fmtDate(purchase.coverage_end_unix)}.
        </div>
      )}
      {activeClaim && (
        <p className="progresstext">
          Claim #{activeClaim.claim_id} is open on this purchase — one claim at a time.
        </p>
      )}
      <a className="pagelink" href={`#/purchase-${purchase.purchase_id}`}>
        Open purchase →
      </a>
    </div>
  );
}

export function Buyer() {
  const store = useStore();
  const { account, contractAddr, epoch, overview, setChooserOpen, runWrite, pushToast } = store;
  const now = useNow(30);
  const [pickerPolicies, setPickerPolicies] = useState(null);
  const [policyIdText, setPolicyIdText] = useState("");
  const [pickedPolicy, setPickedPolicy] = useState(null);
  const [pickError, setPickError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [dateText, setDateText] = useState("");

  const data = useChainRead(async () => {
    if (!account) return null;
    const purchases = await fetchBuyerPurchases(account, contractAddr);
    const out = [];
    for (const p of purchases) {
      const [claims, policy] = await Promise.all([
        fetchClaimsForPurchase(p.purchase_id, contractAddr).catch(() => []),
        fetchPolicy(p.policy_id, contractAddr).catch(() => null),
      ]);
      out.push({ purchase: p, claims, policy });
    }
    return out;
  }, [contractAddr, account, epoch]);

  // Hydrate the policy picker once the overview count is known.
  useEffect(() => {
    let live = true;
    if (!overview.data) return undefined;
    const count = Math.min(Number(overview.data.policy_count || 0), 20);
    if (count === 0) {
      setPickerPolicies([]);
      return undefined;
    }
    Promise.all(
      Array.from({ length: count }, (_, i) => fetchPolicy(i + 1, contractAddr).catch(() => null))
    ).then((list) => {
      if (live) setPickerPolicies(list.filter(Boolean));
    });
    return () => {
      live = false;
    };
  }, [overview.data, contractAddr, epoch]);

  const verifyPolicyId = async (idNum) => {
    setPickError(null);
    setPickedPolicy(null);
    if (!Number.isInteger(idNum) || idNum < 1) {
      setPickError("Enter the policy number.");
      return;
    }
    try {
      const p = await fetchPolicy(idNum, contractAddr);
      if (!p) {
        setPickError(`Nothing is stored under policy #${idNum} yet.`);
        return;
      }
      if (p.status === "CLOSED") {
        setPickError(errorText("POLICY_CLOSED"));
        return;
      }
      setPickedPolicy(p);
      setPolicyIdText(String(idNum));
    } catch {
      setPickError(`Policy #${idNum} couldn't be read just now — try again.`);
    }
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const dateOk = dateText !== "" && dateText >= DATE_FLOOR && dateText <= todayIso;
  const coveragePreview =
    pickedPolicy && dateOk
      ? fmtDate(purchaseDateUnix(dateText) + Number(pickedPolicy.duration_days) * 86400 + 86399)
      : null;
  const registerValid = pickedPolicy && receipt && receipt.ready && dateOk;

  if (!account) {
    return (
      <div>
        <PageHead
          title="Buyer console"
          line="Your purchases and claims live here — register what you bought, and claim here when it breaks. Connect your wallet to see the purchases registered to your address."
        />
        <div className="card">
          <p className="hint">Connect the wallet you buy with — your purchases are read from the contract by that address.</p>
          <button type="button" className="btn" onClick={() => setChooserOpen(true)}>
            Connect wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        title="Buyer console"
        line="Your purchases and claims live here — register what you bought, and claim here when it breaks."
      />

      <h2 style={{ marginTop: 18 }}>My purchases</h2>
      <SectionState
        loading={data.loading}
        slow={data.slow}
        error={data.error}
        onRetry={data.retry}
        empty={data.data && data.data.length === 0}
        emptyNode={
          <div className="card">
            <p className="hint" style={{ margin: 0 }}>
              No purchases registered to this wallet yet — register your first one below.
            </p>
          </div>
        }
        skeleton={<Skeleton lines={4} block />}
      >
        {data.data &&
          data.data.map(({ purchase, claims, policy }) => (
            <PurchaseCard
              key={purchase.purchase_id}
              purchase={purchase}
              claims={claims}
              policy={policy}
              now={now}
              runWrite={runWrite}
              pushToast={pushToast}
            />
          ))}
      </SectionState>

      <div className="card dashed" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Register a purchase</h2>
        <p className="hint">
          Pick the policy you bought under, attach the receipt, and give the purchase date. Coverage runs
          from that date for the policy's length.
        </p>
        <div className="field">
          <label className="flabel" htmlFor="bp-policy">
            Policy
          </label>
          {pickerPolicies === null ? (
            <Skeleton lines={1} />
          ) : (
            <select
              id="bp-policy"
              className="textinput"
              value={pickedPolicy ? String(pickedPolicy.policy_id) : ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setPickedPolicy(null);
                  setPolicyIdText("");
                  setPickError(null);
                  return;
                }
                verifyPolicyId(Number(v));
              }}
            >
              <option value="">Choose a policy…</option>
              {pickerPolicies
                .filter((p) => p.status === "ACTIVE")
                .map((p) => (
                  <option key={p.policy_id} value={p.policy_id}>
                    Policy #{p.policy_id} — {p.product}
                  </option>
                ))}
            </select>
          )}
          <div className="checkline">
            …or type the number:{" "}
            <input
              aria-label="Policy number"
              className="textinput"
              style={{ width: 100, display: "inline-block", padding: "6px 8px" }}
              inputMode="numeric"
              value={policyIdText}
              onChange={(e) => setPolicyIdText(e.target.value)}
            />{" "}
            <button type="button" className="textbtn" onClick={() => verifyPolicyId(Number(policyIdText))}>
              Check
            </button>
          </div>
          {pickedPolicy && (
            <div className="checkline">
              <span className="ok">✓ Policy #{pickedPolicy.policy_id} — {pickedPolicy.product}</span> (
              {pickedPolicy.duration_days} days of cover, cap {formatGen(BigInt(pickedPolicy.per_claim_cap_wei || 0))}{" "}
              GEN)
            </div>
          )}
          {pickError && <div className="inlineerr">{pickError}</div>}
        </div>

        <EvidenceField kind="receipt" label="Receipt (the proof of purchase, as a link)" onChange={setReceipt} />

        <div className="field">
          <label className="flabel" htmlFor="bp-date">
            Purchase date
          </label>
          <input
            id="bp-date"
            className="textinput"
            type="date"
            min={DATE_FLOOR}
            max={todayIso}
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
          />
          {dateText && !dateOk && <div className="inlineerr">{errorText("BAD_DATE")}</div>}
          {coveragePreview && (
            <div className="checkline">
              Coverage would run to <b>{coveragePreview}</b> (end of day).
            </div>
          )}
        </div>

        <WriteButton
          label="Register this purchase"
          verb="register a purchase"
          disabled={!registerValid}
          disabledReason={
            !pickedPolicy
              ? "Pick a policy first"
              : !receipt || !receipt.ready
                ? "Attach the receipt link and check it first"
                : "Give the purchase date"
          }
          run={(onHash) =>
            runWrite({
              fn: "register_purchase",
              args: [Number(pickedPolicy.policy_id), receipt.url, receipt.sha256, dateText],
              fees: baseFees(),
              onHash,
            })
          }
          onSuccess={(result) => {
            const m = /#(\d+)/.exec((result.outcome && result.outcome.returnText) || "");
            pushToast(
              "ok",
              "Purchase registered",
              m
                ? `Purchase #${m[1]} is on chain under policy #${pickedPolicy.policy_id}.`
                : "Your purchase is on chain.",
              result.hash
            );
            setReceipt(null);
            setDateText("");
          }}
        />
      </div>
    </div>
  );
}
