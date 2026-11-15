// Seller console (#/seller) — SPEC §3.3: my policies (index-driven,
// every write lives on the policy page), the create form with months →
// days helper and live validation, the explicit "Step 2 of 2" fund step
// after creation, purchases & claims on my policies (activity-derived,
// G2), and the fund-returned banner.
import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import {
  fetchActivity,
  fetchSellerPolicies,
  hydrateClaims,
  hydratePurchases,
} from "../lib/activity.js";
import { baseFees } from "../lib/genlayer.js";
import { formatGen, parseGenToWei } from "../lib/money.js";
import { Amt, Chip, PageHead, PoolBar, SectionState, Skeleton } from "../components/bits.jsx";
import { WriteButton } from "../components/WriteButton.jsx";
import { EvidenceField } from "../components/EvidenceField.jsx";
import { ClaimCard } from "../components/ClaimCard.jsx";

const CREATE_HINT =
  "This creates the policy with an empty pool. In Step 2 you fund it — that's when buyers can start buying under it.";

export function Seller() {
  const store = useStore();
  const { account, contractAddr, epoch, runWrite, pushToast, setChooserOpen, fundBannerDismissed, dismissFundBanner } = store;
  const now = useNow(30);
  const [product, setProduct] = useState("");
  const [terms, setTerms] = useState(null);
  const [days, setDays] = useState("365");
  const [months, setMonths] = useState("");
  const [capText, setCapText] = useState("");
  const [newPolicyId, setNewPolicyId] = useState(null);
  const [step2Text, setStep2Text] = useState("");

  const data = useChainRead(async () => {
    if (!account) return null;
    const policies = await fetchSellerPolicies(account, contractAddr);
    const activity = await fetchActivity(contractAddr);
    const myIds = new Set(policies.map((p) => Number(p.policy_id)));
    const allPurchases = await hydratePurchases(activity, contractAddr, {});
    const hydrated = await hydrateClaims(activity, contractAddr);
    return {
      policies,
      activity,
      purchases: allPurchases.filter((p) => myIds.has(Number(p.policy_id))),
      claims: hydrated.claims.filter((c) => myIds.has(Number(c.policy_id))),
      policyById: hydrated.policyById,
      purchaseById: hydrated.purchaseById,
    };
  }, [contractAddr, account, epoch]);

  const fundBanner = useMemo(() => {
    if (!data.data || !account) return null;
    const ev = [...data.data.activity]
      .filter(
        (e) =>
          e.event === "FUND_CREDITED_BACK" &&
          String(e.sender || "").toLowerCase() === account.toLowerCase()
      )
      .sort((a, b) => Number(b.seq) - Number(a.seq))[0];
    if (!ev) return null;
    return fundBannerDismissed(ev.seq) ? null : ev;
  }, [data.data, account, fundBannerDismissed]);

  if (!account) {
    return (
      <div>
        <PageHead
          title="Seller console"
          line="Your policies live here: what you sell cover for, how much each pool holds, and what buyers are claiming. Connect your wallet to see the policies registered to your address."
        />
        <div className="card">
          <p className="hint">Connect the wallet you sell from — your policies are read from the contract by that address.</p>
          <button type="button" className="btn" onClick={() => setChooserOpen(true)}>
            Connect wallet
          </button>
        </div>
      </div>
    );
  }

  const capAmt = parseGenToWei(capText);
  const daysNum = Number(days);
  const createValid =
    product.trim().length > 0 &&
    product.length <= 128 &&
    terms &&
    terms.ready &&
    Number.isInteger(daysNum) &&
    daysNum >= 1 &&
    daysNum <= 3650 &&
    capAmt.ok &&
    capAmt.wei > 0n;
  const step2Amt = parseGenToWei(step2Text);

  return (
    <div>
      <PageHead
        title="Seller console"
        line="Your policies live here: what you sell cover for, how much each pool holds, and what buyers are claiming."
      />

      {fundBanner && (
        <div className="msg warn" role="status">
          <button type="button" className="dismissx" onClick={() => dismissFundBanner(fundBanner.seq)} aria-label="Dismiss">
            ✕
          </button>
          <b>Heads up — your fund was credited back, not added to the pool</b>
          The pool was already at its reserve, so the contract credited{" "}
          {formatGen(BigInt(fundBanner.amount_wei || 0))} GEN to your claimable balance instead. You can
          withdraw it from My Funds.
        </div>
      )}

      <h2 style={{ marginTop: 18 }}>My policies</h2>
      <SectionState
        loading={data.loading}
        slow={data.slow}
        error={data.error}
        onRetry={data.retry}
        empty={data.data && data.data.policies.length === 0}
        emptyNode={
          <div className="card">
            <p className="hint" style={{ margin: 0 }}>
              No policies registered to this wallet yet — create your first one below.
            </p>
          </div>
        }
        skeleton={<Skeleton lines={4} block />}
      >
        {data.data &&
          data.data.policies.map((p) => (
            <a key={p.policy_id} className="card" href={`#/policy-${p.policy_id}`}>
              <div className="claimhead">
                <div>
                  <span className="claimno" style={{ fontSize: 15 }}>
                    Policy #{p.policy_id}
                  </span>
                  <div className="prod">{p.product}</div>
                </div>
                <Chip status={p.status} />
              </div>
              <PoolBar unreservedWei={p.pool_unreserved_wei} reservedWei={p.pool_reserved_wei} totalLabel="Policy pool" />
              <div className="row" style={{ marginTop: 8 }}>
                <span className="k">Per-claim cap</span>
                <Amt wei={p.per_claim_cap_wei} />
              </div>
              <div className="row">
                <span className="k">Purchases</span>
                <span className="v">{p.purchase_count}</span>
              </div>
              <span className="pagelink">Open policy →</span>
            </a>
          ))}
      </SectionState>

      <div className="card dashed" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Create a policy</h2>
        <p className="hint">{CREATE_HINT}</p>
        <div className="field">
          <label className="flabel" htmlFor="sp-product">
            Product
          </label>
          <input
            id="sp-product"
            className="textinput"
            maxLength={128}
            placeholder="e.g. Aurora X200 washing machine"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <div className="weiunder">{product.length}/128 characters</div>
        </div>
        <EvidenceField kind="terms" label="Terms (the warranty text, as a link)" onChange={setTerms} />
        <div className="field">
          <label className="flabel" htmlFor="sp-days">
            Coverage length (days)
          </label>
          <input
            id="sp-days"
            className="textinput"
            inputMode="numeric"
            value={days}
            onChange={(e) => {
              setDays(e.target.value);
              setMonths("");
            }}
          />
          <div className="checkline">
            …or in months:{" "}
            <input
              aria-label="Coverage length in months"
              style={{ width: 90, display: "inline-block", padding: "6px 8px" }}
              className="textinput"
              inputMode="numeric"
              placeholder="24"
              value={months}
              onChange={(e) => {
                const m = e.target.value;
                setMonths(m);
                const n = Number(m);
                if (Number.isFinite(n) && n > 0) setDays(String(Math.round((n * 365) / 12)));
              }}
            />{" "}
            months → {days} days (a 24-month cover reads as 730 days on chain)
          </div>
          {days !== "" && (!Number.isInteger(daysNum) || daysNum < 1 || daysNum > 3650) && (
            <div className="inlineerr">Coverage must be a whole number of days, 1 to 3,650.</div>
          )}
        </div>
        <div className="field">
          <label className="flabel" htmlFor="sp-cap">
            Per-claim cap (GEN)
          </label>
          <input
            id="sp-cap"
            className="textinput"
            inputMode="decimal"
            placeholder="0.000"
            value={capText}
            onChange={(e) => setCapText(e.target.value)}
          />
          {capAmt.ok && <div className="weiunder">= {capAmt.wei.toString()} wei</div>}
          {capText && !capAmt.ok && <div className="inlineerr">{capAmt.error}</div>}
        </div>
        <WriteButton
          label="Create policy — Step 1 of 2"
          verb="create a policy"
          disabled={!createValid}
          disabledReason={
            !terms || !terms.ready
              ? "Attach the terms link and check it first"
              : !product.trim()
                ? "Name the product first"
                : "Check the days and the cap amount"
          }
          run={(onHash) =>
            runWrite({
              fn: "create_policy",
              args: [product, terms.url, terms.sha256, daysNum, capAmt.wei],
              fees: baseFees(),
              onHash,
            })
          }
          onSuccess={(result) => {
            const m = /#(\d+)/.exec((result.outcome && result.outcome.returnText) || "");
            const pid = m ? Number(m[1]) : null;
            setNewPolicyId(pid);
            pushToast(
              "ok",
              "Policy created",
              pid
                ? `Policy #${pid} exists with an empty pool. Fund it in Step 2 below.`
                : "Your policy exists with an empty pool. Fund it from the policy page.",
              result.hash
            );
          }}
        />

        {newPolicyId != null && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <div className="flabel">Step 2 of 2 — fund policy #{newPolicyId}</div>
            <p className="hint">
              The pool fills up to its reserve — the per-claim cap times the maximum number of claims it can
              hold. Anything over that comes straight back to you as claimable.
            </p>
            <div className="field">
              <label className="flabel" htmlFor="sp-fund">
                Amount (GEN)
              </label>
              <input
                id="sp-fund"
                className="textinput"
                inputMode="decimal"
                placeholder="0.000"
                value={step2Text}
                onChange={(e) => setStep2Text(e.target.value)}
              />
              {step2Amt.ok && <div className="weiunder">= {step2Amt.wei.toString()} wei</div>}
              {step2Text && !step2Amt.ok && <div className="inlineerr">{step2Amt.error}</div>}
            </div>
            <WriteButton
              label={
                step2Amt.ok && step2Amt.wei > 0n
                  ? `Fund ${formatGen(step2Amt.wei)} GEN — Step 2 of 2`
                  : "Fund the pool — Step 2 of 2"
              }
              verb="fund the pool"
              disabled={!step2Amt.ok || step2Amt.wei <= 0n}
              disabledReason="Enter an amount first"
              run={(onHash) =>
                runWrite({ fn: "fund_policy", args: [newPolicyId], value: step2Amt.wei, fees: baseFees(), onHash })
              }
              onSuccess={(result) => {
                const text = (result.outcome && result.outcome.returnText) || "";
                if (text.startsWith("FUND_REJECTED_CREDITED")) {
                  pushToast(
                    "warn",
                    "Fund credited back",
                    `The pool was already at its reserve, so the contract credited ${formatGen(step2Amt.wei)} GEN to your claimable balance instead.`,
                    result.hash
                  );
                } else {
                  pushToast("ok", "Policy funded", `${formatGen(step2Amt.wei)} GEN added to policy #${newPolicyId}'s pool.`, result.hash);
                }
                setStep2Text("");
              }}
            />
            <a className="pagelink" href={`#/policy-${newPolicyId}`}>
              Open policy #{newPolicyId} →
            </a>
          </div>
        )}
      </div>

      {data.data && (data.data.purchases.length > 0 || data.data.claims.length > 0) && (
        <>
          <h2>Purchases &amp; claims on your policies</h2>
          <p className="hint">From the contract's activity record (latest 200 events) — older ones may not show here.</p>
          {data.data.purchases.map((p) => (
            <a key={p.purchase_id} className="card" href={`#/purchase-${p.purchase_id}`}>
              <div className="claimhead">
                <div>
                  <span className="claimno" style={{ fontSize: 15 }}>
                    Purchase #{p.purchase_id}
                  </span>
                  <div className="prod">
                    Under policy #{p.policy_id}
                    {data.data.policyById[String(p.policy_id)]
                      ? ` — ${data.data.policyById[String(p.policy_id)].product}`
                      : ""}
                  </div>
                </div>
                <span className="v">
                  {p.claim_count} claim{p.claim_count === 1 ? "" : "s"} filed
                </span>
              </div>
            </a>
          ))}
          {data.data.claims.map((c) => (
            <ClaimCard
              key={c.claim_id}
              claim={c}
              policy={data.data.policyById[String(c.policy_id)]}
              purchase={data.data.purchaseById[String(c.purchase_id)]}
              now={now}
            />
          ))}
        </>
      )}
    </div>
  );
}
