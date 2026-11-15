// Dashboard (#/) — the mandatory set only (SPEC §3.0): the protocol
// strip, the protocol pool health bar, the latest 3–4 claims, the My
// Funds summary (connected wallet only), and the two equal entry doors.
// Nothing else renders on this route.
import React from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import { fetchActivity, fetchClaimable, fetchPending, hydrateClaims } from "../lib/activity.js";
import { formatGen } from "../lib/money.js";
import { Amt, LiveWrap, PageHead, PoolBar, SectionState, Skeleton } from "../components/bits.jsx";
import { ClaimCard } from "../components/ClaimCard.jsx";

export function Dashboard() {
  const { overview, account, contractAddr, epoch, refreshAll } = useStore();
  const now = useNow(30);

  const latest = useChainRead(async () => {
    const activity = await fetchActivity(contractAddr);
    return hydrateClaims(activity, contractAddr, 4);
  }, [contractAddr, epoch]);

  const funds = useChainRead(async () => {
    if (!account) return null;
    const [claimable, pending] = await Promise.all([
      fetchClaimable(account, contractAddr),
      fetchPending(account, contractAddr),
    ]);
    return { claimable, pending };
  }, [contractAddr, account, epoch]);

  const ov = overview.data;
  const poolTotal = ov ? BigInt(ov.total_pool_unreserved_wei) + BigInt(ov.total_pool_reserved_wei) : 0n;

  return (
    <div>
      <PageHead
        title="Dashboard"
        line="WarrantyCourt settles product warranty claims on chain. Sellers fund a pool, buyers claim when a product breaks, and a jury of validators decides — every claim is public, and this page shows the essentials only."
      />

      <SectionState
        loading={overview.loading}
        error={overview.error}
        onRetry={refreshAll}
        skeleton={
          <div className="strip">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="stat">
                <div className="sk skline w55"></div>
                <div className="sk skline w80"></div>
              </div>
            ))}
          </div>
        }
      >
        {ov && (
          <div className="strip">
            <div className="stat">
              <b>{ov.policy_count}</b>
              <span>Policies</span>
            </div>
            <div className="stat">
              <b>{formatGen(poolTotal)} GEN</b>
              <span>In pools</span>
            </div>
            <div className="stat">
              <b>{formatGen(ov.total_pool_reserved_wei)} GEN</b>
              <span>Reserved for claims</span>
            </div>
            <div className="stat">
              <b>{formatGen(ov.total_claimable_wei)} GEN</b>
              <span>Ready to pay out</span>
            </div>
          </div>
        )}
      </SectionState>

      <div className="dashgrid">
        <div className="dz-claims">
          <h2 style={{ marginTop: 2 }}>
            Latest claims{" "}
            <span style={{ marginLeft: "auto" }}>
              <LiveWrap />
            </span>
          </h2>
          <p className="hint">The newest claims, from the contract's activity record. The full public list is in the Register.</p>
          <SectionState
            loading={latest.loading}
            slow={latest.slow}
            error={latest.error}
            onRetry={latest.retry}
            empty={latest.data && latest.data.claims.length === 0}
            emptyNode={
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  No claims yet — when a buyer files the first one, it will appear here and in the Register.
                </p>
              </div>
            }
            skeleton={<Skeleton lines={4} block />}
          >
            {latest.data &&
              latest.data.claims.map((claim) => (
                <ClaimCard
                  key={claim.claim_id}
                  claim={claim}
                  policy={latest.data.policyById[String(claim.policy_id)]}
                  purchase={latest.data.purchaseById[String(claim.purchase_id)]}
                  now={now}
                />
              ))}
          </SectionState>
          <a className="pagelink" href="#/register">
            See all claims in the Register →
          </a>
        </div>

        <div className="dz-pool">
          <div className="card" style={{ marginBottom: 0 }}>
            {ov ? (
              <PoolBar
                unreservedWei={ov.total_pool_unreserved_wei}
                reservedWei={ov.total_pool_reserved_wei}
                totalLabel="All policies"
              />
            ) : (
              <Skeleton lines={2} />
            )}
          </div>
        </div>

        {account && (
          <div className="dz-funds">
            <div className="card funds" style={{ marginBottom: 0 }}>
              <div className="claimhead">
                <div>
                  <span className="claimno" style={{ fontSize: 15 }}>
                    Your money
                  </span>
                  <div className="prod">Your claimable and pending GEN</div>
                </div>
              </div>
              {funds.loading ? (
                <Skeleton lines={2} />
              ) : funds.data ? (
                <>
                  <div className="row" style={{ marginTop: 8 }}>
                    <span className="k">Ready to withdraw</span>
                    <b className="big" style={{ fontSize: 21 }}>
                      {formatGen(funds.data.claimable)} GEN
                    </b>
                  </div>
                  <div className="row">
                    <span className="k">On its way to your wallet</span>
                    <Amt wei={funds.data.pending.amountWei} />
                  </div>
                  {funds.data.pending.amountWei > 0n && (
                    <div className="progresstext">A withdrawal is waiting for your confirmation in My Funds.</div>
                  )}
                </>
              ) : (
                <p className="hint" style={{ margin: "8px 0 0" }}>
                  Your funds couldn't be read just now.
                </p>
              )}
              <a className="pagelink" href="#/funds">
                Open My Funds →
              </a>
            </div>
          </div>
        )}

        <div className="dz-act">
          <div className="btnrow" style={{ marginTop: 0 }}>
            <a className="btn" href="#/buyer">
              File a claim
            </a>
            <a className="btn" href="#/seller">
              Offer warranties
            </a>
          </div>
          <p className="btnnote">
            Two doors, equal weight: buyers file when something breaks; sellers create a policy and fund its pool.
          </p>
        </div>
      </div>
    </div>
  );
}
