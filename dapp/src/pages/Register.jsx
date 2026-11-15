// Register (#/register) — the public record (SPEC §3.1): recent claims
// hydrated from the contract's activity record (latest 200 events, and
// labelled exactly that), the segmented id lookup, the conservation
// line (§5), and the activity feed as plain sentences with honest tx
// links (§8: recorded = exact, backfilled = "Likely transaction").
import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead, useNow } from "../lib/hooks.js";
import {
  fetchActivity,
  fetchContractTxs,
  getRecordedHashes,
  hydrateClaims,
  matchEntries,
  setLastKnownSeq,
} from "../lib/activity.js";
import { activitySentence } from "../lib/copy.js";
import { formatGen } from "../lib/money.js";
import { fmtDateTimePKT } from "../lib/time.js";
import { LiveWrap, PageHead, SectionState, Skeleton, TxLink } from "../components/bits.jsx";
import { ClaimCard } from "../components/ClaimCard.jsx";

export function Register() {
  const { contractAddr, epoch, overview } = useStore();
  const now = useNow(30);
  const [lookupKind, setLookupKind] = useState("claim");
  const [lookupId, setLookupId] = useState("");
  const [matches, setMatches] = useState(new Map());

  const data = useChainRead(async () => {
    const activity = await fetchActivity(contractAddr);
    if (activity.length > 0) {
      setLastKnownSeq(contractAddr, Math.max(...activity.map((e) => Number(e.seq || 0))));
    }
    const hydrated = await hydrateClaims(activity, contractAddr);
    return { activity, ...hydrated };
  }, [contractAddr, epoch]);

  // Tx backfill for the activity sentences (best-effort, fails soft).
  useEffect(() => {
    let live = true;
    if (!data.data) return undefined;
    fetchContractTxs(contractAddr).then((txs) => {
      if (!live) return;
      setMatches(matchEntries(data.data.activity, txs, getRecordedHashes(contractAddr)));
    });
    return () => {
      live = false;
    };
  }, [data.data, contractAddr]);

  const sentences = useMemo(() => {
    if (!data.data) return [];
    return [...data.data.activity]
      .sort((a, b) => Number(b.seq || 0) - Number(a.seq || 0))
      .map((ev) => ({ ev, sentence: activitySentence(ev), match: matches.get(ev.seq) }));
  }, [data.data, matches]);

  const ov = overview.data;
  const tracked = ov
    ? BigInt(ov.total_pool_unreserved_wei) +
      BigInt(ov.total_pool_reserved_wei) +
      BigInt(ov.total_claimable_wei) +
      BigInt(ov.total_pending_wei)
    : 0n;
  const balance = ov ? BigInt(ov.contract_balance) : 0n;
  const excess = balance - tracked;

  const openLookup = () => {
    const n = lookupId.trim();
    if (!/^[0-9]+$/.test(n)) return;
    window.location.hash = `#/${lookupKind}-${n}`;
  };

  return (
    <div>
      <PageHead
        title="Register"
        line="The public record of claims. Anyone can read all of it — no wallet needed — and every claim opens by number."
      />

      <h2 style={{ marginTop: 2 }}>
        Recent claims{" "}
        <span style={{ marginLeft: "auto" }}>
          <LiveWrap />
        </span>
      </h2>
      <p className="hint">From the contract's activity record (latest 200 events). Open a record by number:</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span className="seg-toggle" role="group" aria-label="Look up by">
          {[
            ["claim", "Claim #"],
            ["policy", "Policy #"],
            ["purchase", "Purchase #"],
          ].map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              className={lookupKind === kind ? "on" : ""}
              onClick={() => setLookupKind(kind)}
            >
              {label}
            </button>
          ))}
        </span>
      </div>
      <div className="search">
        <input
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && openLookup()}
          placeholder="Number, e.g. 2"
          inputMode="numeric"
        />
        <button type="button" onClick={openLookup}>
          Open
        </button>
      </div>

      <div className="reggrid">
        <div>
          <SectionState
            loading={data.loading}
            slow={data.slow}
            error={data.error}
            onRetry={data.retry}
            empty={data.data && data.data.claims.length === 0}
            emptyNode={
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  No claims in the recent activity record yet.
                </p>
              </div>
            }
            skeleton={<Skeleton lines={4} block />}
          >
            {data.data &&
              data.data.claims.map((claim) => (
                <ClaimCard
                  key={claim.claim_id}
                  claim={claim}
                  policy={data.data.policyById[String(claim.policy_id)]}
                  purchase={data.data.purchaseById[String(claim.purchase_id)]}
                  now={now}
                />
              ))}
          </SectionState>

          {ov && (
            <div className="card">
              <div className="row">
                <span className="k" style={{ fontWeight: 700, color: "var(--ink)" }}>
                  Where the money is
                </span>
                <span className="amt">
                  {formatGen(balance)} <small>GEN in the contract</small>
                </span>
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <span className="k">In pools, available</span>
                <span className="v">{formatGen(ov.total_pool_unreserved_wei)} GEN</span>
              </div>
              <div className="row">
                <span className="k">Reserved for claims</span>
                <span className="v">{formatGen(ov.total_pool_reserved_wei)} GEN</span>
              </div>
              <div className="row">
                <span className="k">Ready to pay out</span>
                <span className="v">{formatGen(ov.total_claimable_wei)} GEN</span>
              </div>
              <div className="row">
                <span className="k">Withdrawals on their way</span>
                <span className="v">{formatGen(ov.total_pending_wei)} GEN</span>
              </div>
              {excess > 0n ? (
                <p className="note">
                  The contract holds {formatGen(excess)} GEN more than its records account for — untracked
                  excess (the owner can sweep it).
                </p>
              ) : excess < 0n ? (
                <p className="note">
                  The contract's records account for {formatGen(-excess)} GEN more than it currently holds —
                  a transfer is in flight or was restored against a top-up; the parts above are the contract's
                  own counters.
                </p>
              ) : (
                <p className="note">The four parts add up exactly to the contract's balance.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ marginTop: 2 }}>
            Activity{" "}
            <span style={{ marginLeft: "auto" }}>
              <LiveWrap />
            </span>
          </h2>
          <SectionState
            loading={data.loading}
            slow={data.slow}
            error={data.error}
            onRetry={data.retry}
            empty={data.data && data.data.activity.length === 0}
            emptyNode={
              <div className="card">
                <p className="hint" style={{ margin: 0 }}>
                  No activity yet on this contract.
                </p>
              </div>
            }
            skeleton={<Skeleton lines={5} />}
          >
            <div className="card activity">
              {sentences.map(({ ev, sentence, match }) => (
                <p key={ev.seq}>
                  {sentence.claimId ? (
                    <a href={`#/claim-${sentence.claimId}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {sentence.text}
                    </a>
                  ) : sentence.policyId ? (
                    <a href={`#/policy-${sentence.policyId}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {sentence.text}
                    </a>
                  ) : sentence.purchaseId ? (
                    <a href={`#/purchase-${sentence.purchaseId}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {sentence.text}
                    </a>
                  ) : (
                    sentence.text
                  )}
                  {match && match.submitted > 0 && <time> · {fmtDateTimePKT(match.submitted)}</time>}
                  <TxLink match={match} />
                </p>
              ))}
            </div>
          </SectionState>
        </div>
      </div>
    </div>
  );
}
