// Policy detail (#/policy-<id>) — SPEC §3.2: facts, pool health, terms
// link + fingerprint + Verify, the claims currently reserving, the
// purchases under it (activity-derived, G2), and for the seller: Fund
// (with the FUND_REJECTED_CREDITED persistent banner + toast), Withdraw
// (with the consequence line), and Close with its honest guards.
import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import {
  fetchActivity,
  fetchPolicy,
  hydrateClaims,
  hydratePurchases,
} from "../lib/activity.js";
import { baseFees } from "../lib/genlayer.js";
import { errorText } from "../lib/copy.js";
import { formatGen, parseGenToWei } from "../lib/money.js";
import { fmtDate } from "../lib/time.js";
import {
  Addr,
  Amt,
  Chip,
  HashChip,
  PageHead,
  PoolBar,
  SectionState,
  Skeleton,
  VerifyHash,
} from "../components/bits.jsx";
import { WriteButton } from "../components/WriteButton.jsx";

export function PolicyDetail({ id }) {
  const store = useStore();
  const { account, contractAddr, epoch, runWrite, pushToast, fundBannerDismissed, dismissFundBanner } = store;
  const now = useNow(30);
  const [fundText, setFundText] = useState("");
  const [withdrawText, setWithdrawText] = useState("");
  const [copied, setCopied] = useState(false);

  const data = useChainRead(async () => {
    const policy = await fetchPolicy(id, contractAddr);
    if (!policy) return { policy: null, activity: [], hydrated: { claims: [] }, purchases: [] };
    const activity = await fetchActivity(contractAddr);
    const hydrated = await hydrateClaims(activity, contractAddr);
    const purchases = await hydratePurchases(activity, contractAddr, { policyId: id });
    return { policy, activity, hydrated, purchases };
  }, [contractAddr, epoch, id]);

  const policy = data.data ? data.data.policy : null;
  const notFound = data.data && data.data.policy === null;
  const isSeller = policy && account && account.toLowerCase() === String(policy.seller).toLowerCase();
  const closed = policy && policy.status === "CLOSED";

  const reserving = useMemo(() => {
    if (!data.data) return [];
    return data.data.hydrated.claims.filter(
      (c) =>
        Number(c.policy_id) === Number(id) &&
        (c.status === "OPEN" || c.status === "ADJUDICATED" || c.status === "APPEALING")
    );
  }, [data.data, id]);

  const fundBanner = useMemo(() => {
    if (!data.data || !account) return null;
    const ev = [...data.data.activity]
      .filter(
        (e) =>
          e.event === "FUND_CREDITED_BACK" &&
          Number(e.policy_id) === Number(id) &&
          String(e.sender || "").toLowerCase() === account.toLowerCase()
      )
      .sort((a, b) => Number(b.seq) - Number(a.seq))[0];
    if (!ev) return null;
    return fundBannerDismissed(ev.seq) ? null : ev;
  }, [data.data, account, id, fundBannerDismissed]);

  const fundAmt = parseGenToWei(fundText);
  const wdAmt = parseGenToWei(withdrawText);
  const unreserved = policy ? BigInt(policy.pool_unreserved_wei || 0) : 0n;

  const closeReasons = [];
  if (policy) {
    if (now <= Number(policy.max_coverage_end_unix || 0)) {
      closeReasons.push(
        `${errorText("COVERAGE_STILL_ACTIVE")} Coverage still runs until ${fmtDate(policy.max_coverage_end_unix)}.`
      );
    }
    if (BigInt(policy.pool_reserved_wei || 0) > 0n) {
      closeReasons.push(errorText("OPEN_CLAIMS_REMAIN"));
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/policy-${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the address bar holds the same link */
    }
  };

  return (
    <div>
      <PageHead title={`Policy #${id}`} line={policy ? policy.product : ""} />
      {policy && (
        <div style={{ margin: "-6px 0 12px" }}>
          <Chip status={policy.status} />
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
              Nothing is stored under policy #{id} yet — when a seller creates it, this page will show it
              read straight from the contract.
            </p>
          </div>
        }
        skeleton={<Skeleton lines={5} block />}
      >
        {policy && (
          <>
            {fundBanner && (
              <div className="msg warn" role="status">
                <button
                  type="button"
                  className="dismissx"
                  onClick={() => dismissFundBanner(fundBanner.seq)}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
                <b>Heads up — your fund was credited back, not added to the pool</b>
                The pool was already at its reserve, so the contract credited{" "}
                {formatGen(BigInt(fundBanner.amount_wei || 0))} GEN to your claimable balance instead. You
                can withdraw it from My Funds.
              </div>
            )}

            <div className="card">
              <PoolBar
                unreservedWei={policy.pool_unreserved_wei}
                reservedWei={policy.pool_reserved_wei}
                totalLabel="Policy pool"
              />
              <div className="row" style={{ marginTop: 12 }}>
                <span className="k">Seller</span>
                <Addr address={policy.seller} role="Seller" you={!!isSeller} />
              </div>
              <div className="row">
                <span className="k">Per-claim cap</span>
                <Amt wei={policy.per_claim_cap_wei} />
              </div>
              <div className="row">
                <span className="k">Coverage length</span>
                <span className="v">{policy.duration_days} days</span>
              </div>
              <div className="row">
                <span className="k">Purchases registered</span>
                <span className="v">{policy.purchase_count}</span>
              </div>
              <div className="row">
                <span className="k">Created</span>
                <span className="v">{fmtDate(policy.created_at)}</span>
              </div>
              <div className="row">
                <span className="k">Terms (plain text)</span>
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
              <div style={{ marginTop: 10 }}>
                <button type="button" className="textbtn" onClick={copyLink}>
                  Copy policy link
                </button>
                {copied && <span className="copied"> Copied</span>}
              </div>
            </div>

            <h2>Claims using this pool</h2>
            <p className="hint">Claims currently reserving from this pool, from the contract's activity record.</p>
            {reserving.length === 0 ? (
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  No claim is reserving from this pool right now.
                </p>
              </div>
            ) : (
              reserving.map((c) => (
                <div key={c.claim_id} className="row" style={{ padding: "6px 2px" }}>
                  <a href={`#/claim-${c.claim_id}`}>Claim #{c.claim_id}</a>
                  <Amt wei={c.amount_wei} />
                </div>
              ))
            )}

            {data.data.purchases.length > 0 && (
              <>
                <h2>Purchases under this policy</h2>
                <p className="hint">From the contract's activity record (latest 200 events).</p>
                {data.data.purchases.map((p) => (
                  <a key={p.purchase_id} className="card" href={`#/purchase-${p.purchase_id}`}>
                    <div className="claimhead">
                      <div>
                        <span className="claimno" style={{ fontSize: 15 }}>
                          Purchase #{p.purchase_id}
                        </span>
                        <div className="prod">Buyer {String(p.buyer).slice(0, 10)}…</div>
                      </div>
                      <span className="v">
                        {p.claim_count} claim{p.claim_count === 1 ? "" : "s"} filed
                      </span>
                    </div>
                  </a>
                ))}
              </>
            )}

            {isSeller && !closed && (
              <>
                <h2>Fund the pool</h2>
                <p className="hint">
                  Funding tops the pool up to its reserve — the per-claim cap times the maximum number of
                  claims it can hold. Anything over that comes straight back to you as claimable.
                </p>
                <div className="card">
                  <div className="field">
                    <label className="flabel" htmlFor="fundAmt">
                      Amount (GEN)
                    </label>
                    <input
                      id="fundAmt"
                      className="textinput"
                      inputMode="decimal"
                      placeholder="0.000"
                      value={fundText}
                      onChange={(e) => setFundText(e.target.value)}
                    />
                    {fundAmt.ok && <div className="weiunder">= {fundAmt.wei.toString()} wei</div>}
                    {fundText && !fundAmt.ok && <div className="inlineerr">{fundAmt.error}</div>}
                  </div>
                  <WriteButton
                    label={fundAmt.ok && fundAmt.wei > 0n ? `Fund ${formatGen(fundAmt.wei)} GEN` : "Fund the pool"}
                    verb="fund the pool"
                    disabled={!fundAmt.ok || fundAmt.wei <= 0n}
                    disabledReason="Enter an amount first"
                    run={(onHash) =>
                      runWrite({ fn: "fund_policy", args: [Number(id)], value: fundAmt.wei, fees: baseFees(), onHash })
                    }
                    onSuccess={(result) => {
                      const text = (result.outcome && result.outcome.returnText) || "";
                      if (text.startsWith("FUND_REJECTED_CREDITED")) {
                        pushToast(
                          "warn",
                          "Fund credited back",
                          `The pool was already at its reserve, so the contract credited ${formatGen(fundAmt.wei)} GEN to your claimable balance instead. You can withdraw it from My Funds.`,
                          result.hash
                        );
                      } else {
                        pushToast("ok", "Policy funded", `${formatGen(fundAmt.wei)} GEN added to the pool.`, result.hash);
                      }
                      setFundText("");
                    }}
                  />
                </div>

                <h2>Withdraw from the pool</h2>
                <div className="card">
                  <p className="hint">
                    Withdraw takes from the unreserved part only — up to {formatGen(unreserved)} GEN. The{" "}
                    {formatGen(BigInt(policy.pool_reserved_wei || 0))} GEN reserved for open claims stays in
                    the pool until those claims finish.
                  </p>
                  <div className="field">
                    <label className="flabel" htmlFor="wdAmt">
                      Amount (GEN)
                    </label>
                    <input
                      id="wdAmt"
                      className="textinput"
                      inputMode="decimal"
                      placeholder="0.000"
                      value={withdrawText}
                      onChange={(e) => setWithdrawText(e.target.value)}
                    />
                    {wdAmt.ok && <div className="weiunder">= {wdAmt.wei.toString()} wei</div>}
                    {withdrawText && !wdAmt.ok && <div className="inlineerr">{wdAmt.error}</div>}
                    {wdAmt.ok && wdAmt.wei > unreserved && (
                      <div className="inlineerr">{errorText("EXCEEDS_UNRESERVED_POOL")}</div>
                    )}
                  </div>
                  <WriteButton
                    label={wdAmt.ok && wdAmt.wei > 0n ? `Withdraw ${formatGen(wdAmt.wei)} GEN` : "Withdraw"}
                    verb="withdraw from the pool"
                    disabled={!wdAmt.ok || wdAmt.wei <= 0n || wdAmt.wei > unreserved}
                    disabledReason={
                      !wdAmt.ok || wdAmt.wei <= 0n
                        ? "Enter an amount first"
                        : errorText("EXCEEDS_UNRESERVED_POOL")
                    }
                    run={(onHash) =>
                      runWrite({ fn: "withdraw_from_pool", args: [Number(id), wdAmt.wei], fees: baseFees(), onHash })
                    }
                    onSuccess={(result) => {
                      pushToast(
                        "ok",
                        "Credited to your balance",
                        `${formatGen(wdAmt.wei)} GEN is now claimable — withdraw it from My Funds.`,
                        result.hash
                      );
                      setWithdrawText("");
                    }}
                  />
                </div>

                <h2>Close the policy</h2>
                <div className="card">
                  <p className="hint">
                    Closing returns whatever is left unreserved to your claimable balance. It opens only
                    after every purchase's coverage has ended and no claim is reserving.
                  </p>
                  <WriteButton
                    label="Close policy"
                    verb="close the policy"
                    disabled={closeReasons.length > 0}
                    disabledReason={closeReasons.join(" ")}
                    run={(onHash) => runWrite({ fn: "close_policy", args: [Number(id)], fees: baseFees(), onHash })}
                    onSuccess={(result) => {
                      pushToast(
                        "ok",
                        "Policy closed",
                        "The remaining unreserved pool was credited to your claimable balance.",
                        result.hash
                      );
                    }}
                  />
                </div>
              </>
            )}

            {isSeller && closed && (
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  This policy is closed. Its facts above stay public in the Register.
                </p>
              </div>
            )}
            {account && !isSeller && (
              <p className="note">
                You are not this policy's seller, so its fund, withdraw and close controls are not shown —
                they belong to the seller's wallet.
              </p>
            )}
          </>
        )}
      </SectionState>

      <a className="pagelink" href="#/register">
        ← Back to the Register
      </a>
    </div>
  );
}
