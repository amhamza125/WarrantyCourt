// Purchase detail (#/purchase-<id>) — SPEC §3.4: facts, receipt link +
// fingerprint + Verify, the jury-read price line (G4), the claims list,
// and — for the buyer — the file-a-claim form, with the honest branches
// when a claim is already open or coverage has ended.
import React from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import { fetchClaimsForPurchase, fetchPolicy, fetchPurchase } from "../lib/activity.js";
import { errorText } from "../lib/copy.js";
import { fmtDate, fmtISODate } from "../lib/time.js";
import { Addr, Amt, HashChip, PageHead, SectionState, Skeleton, VerifyHash } from "../components/bits.jsx";
import { ClaimCard } from "../components/ClaimCard.jsx";
import { ClaimForm } from "../components/ClaimForm.jsx";

export function PurchaseDetail({ id }) {
  const { account, contractAddr, epoch } = useStore();
  const now = useNow(30);

  const data = useChainRead(async () => {
    const purchase = await fetchPurchase(id, contractAddr);
    if (!purchase) return { purchase: null, policy: null, claims: [] };
    const [policy, claims] = await Promise.all([
      fetchPolicy(purchase.policy_id, contractAddr).catch(() => null),
      fetchClaimsForPurchase(id, contractAddr),
    ]);
    return { purchase, policy, claims };
  }, [contractAddr, epoch, id]);

  const purchase = data.data ? data.data.purchase : null;
  const policy = data.data ? data.data.policy : null;
  const claims = data.data ? data.data.claims : [];
  const notFound = data.data && data.data.purchase === null;
  const isBuyer = purchase && account && account.toLowerCase() === String(purchase.buyer).toLowerCase();
  const activeClaim = claims.find((c) => ["OPEN", "ADJUDICATED", "APPEALING"].includes(c.status));
  const coverageEnded = purchase && now > Number(purchase.coverage_end_unix);

  return (
    <div>
      <PageHead title={`Purchase #${id}`} line={policy ? policy.product : ""} />

      <SectionState
        loading={data.loading}
        slow={data.slow}
        error={data.error}
        onRetry={data.retry}
        empty={notFound}
        emptyNode={
          <div className="card">
            <p className="hint" style={{ margin: 0 }}>
              Nothing is stored under purchase #{id} yet — when a buyer registers it, this page will show
              it read straight from the contract.
            </p>
          </div>
        }
        skeleton={<Skeleton lines={5} block />}
      >
        {purchase && (
          <>
            <div className="card">
              <div className="row">
                <span className="k">Policy</span>
                <span className="v">
                  <a href={`#/policy-${purchase.policy_id}`}>Policy #{purchase.policy_id} →</a>
                </span>
              </div>
              <div className="row">
                <span className="k">Buyer</span>
                <Addr address={purchase.buyer} role="Buyer" you={!!isBuyer} />
              </div>
              <div className="row">
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
              <div className="row" style={{ marginTop: 8 }}>
                <span className="k">Purchase date</span>
                <span className="v">{fmtISODate(purchase.purchase_date)}</span>
              </div>
              <div className="row">
                <span className="k">Coverage ends</span>
                <span className="v">{fmtDate(purchase.coverage_end_unix)}</span>
              </div>
              <div className="row">
                <span className="k">Claims filed</span>
                <span className="v">{purchase.claim_count}</span>
              </div>
              <div className="row">
                <span className="k">Paid so far</span>
                <Amt wei={purchase.cumulative_paid_wei} />
              </div>
              <div className="row">
                <span className="k">Purchase price</span>
                {BigInt(purchase.receipt_total_wei || 0) > 0n ? (
                  <Amt wei={purchase.receipt_total_wei} />
                ) : (
                  <span className="v">Price not read by the jury yet</span>
                )}
              </div>
            </div>

            <h2>Claims on this purchase</h2>
            {claims.length === 0 ? (
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  No claims filed on this purchase yet.
                </p>
              </div>
            ) : (
              claims.map((c) => (
                <ClaimCard key={c.claim_id} claim={c} policy={policy} purchase={purchase} now={now} />
              ))
            )}

            {isBuyer && (
              <>
                <h2>File a claim</h2>
                {activeClaim ? (
                  <div className="card">
                    <p className="hint" style={{ margin: 0 }}>
                      A claim is already open on this purchase —{" "}
                      <a href={`#/claim-${activeClaim.claim_id}`}>claim #{activeClaim.claim_id}</a>. One
                      claim at a time: it has to finish before the next can be filed.
                    </p>
                  </div>
                ) : coverageEnded ? (
                  <div className="card">
                    <div className="inlineerr" style={{ marginTop: 0 }}>
                      {errorText("COVERAGE_EXPIRED")} Coverage ended {fmtDate(purchase.coverage_end_unix)}.
                    </div>
                  </div>
                ) : policy ? (
                  <div className="card">
                    <ClaimForm purchase={purchase} policy={policy} />
                  </div>
                ) : (
                  <Skeleton lines={3} />
                )}
              </>
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
