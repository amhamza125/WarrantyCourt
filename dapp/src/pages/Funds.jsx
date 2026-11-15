// My Funds (#/funds) — SPEC §3.6: claimable, pending, the wallet GEN
// balance (always reread), the Withdraw action (with the §3.6 wallet
// snapshot taken at click time, keyed by contract + wallet), and
// Confirm — the app never auto-confirms; the snapshot card shows
// before/now/change so the user confirms only when the money has
// actually arrived. The FUND_REJECTED_CREDITED banner shows here too.
import React, { useMemo } from "react";
import { useStore, getSnapshot, setSnapshot, clearSnapshot } from "../lib/store.jsx";
import { useChainRead } from "../lib/hooks.js";
import { fetchActivity, fetchClaimable, fetchPending } from "../lib/activity.js";
import { baseFees, ethBalance, payoutFees } from "../lib/genlayer.js";
import { errorText } from "../lib/copy.js";
import { formatGen } from "../lib/money.js";
import { fmtDateTimeBoth } from "../lib/time.js";
import { Amt, PageHead, SectionState, Skeleton } from "../components/bits.jsx";
import { WriteButton } from "../components/WriteButton.jsx";

export function Funds() {
  const store = useStore();
  const { account, contractAddr, epoch, setChooserOpen, runWrite, pushToast, fundBannerDismissed, dismissFundBanner } = store;

  const data = useChainRead(async () => {
    if (!account) return null;
    const [claimable, pending, balance, activity] = await Promise.all([
      fetchClaimable(account, contractAddr),
      fetchPending(account, contractAddr),
      ethBalance(account).catch(() => null),
      fetchActivity(contractAddr).catch(() => []),
    ]);
    return { claimable, pending, balance, activity };
  }, [contractAddr, account, epoch]);

  const snapshot = account ? getSnapshot(contractAddr, account) : null;

  const fundEvent = useMemo(() => {
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
          title="My Funds"
          line="Money the contract owes you, and money on its way to your wallet. Connect your wallet to see the amounts held under your address."
        />
        <div className="card">
          <p className="hint">Your claimable and pending amounts are read from the contract by your wallet address.</p>
          <button type="button" className="btn" onClick={() => setChooserOpen(true)}>
            Connect wallet
          </button>
        </div>
      </div>
    );
  }

  const d = data.data;
  const claimable = d ? d.claimable : 0n;
  const pending = d ? d.pending : { amountWei: 0n, initiatedAt: 0 };
  const balance = d ? d.balance : null;
  const snapBalance = snapshot ? BigInt(snapshot.balance) : null;
  const delta = balance != null && snapBalance != null ? balance - snapBalance : null;

  return (
    <div>
      <PageHead
        title="My Funds"
        line="Money the contract owes you, and money on its way to your wallet. Nothing here moves without your tap."
      />

      {fundEvent && (
        <div className="msg warn" role="status">
          <button type="button" className="dismissx" onClick={() => dismissFundBanner(fundEvent.seq)} aria-label="Dismiss">
            ✕
          </button>
          <b>Heads up — your fund was credited back, not added to the pool</b>
          The pool was already at its reserve, so the contract credited{" "}
          {formatGen(BigInt(fundEvent.amount_wei || 0))} GEN to your claimable balance instead — it is part
          of the “Ready to withdraw” amount below.
        </div>
      )}

      <SectionState
        loading={data.loading}
        slow={data.slow}
        error={data.error}
        onRetry={data.retry}
        skeleton={<Skeleton lines={5} block />}
      >
        {d && (
          <div className="card funds">
            <div className="row">
              <span className="k">Ready to withdraw</span>
              <b className="big">{formatGen(claimable)} GEN</b>
            </div>
            <div className="row">
              <span className="k">On its way to your wallet</span>
              <Amt wei={pending.amountWei} />
            </div>
            <div className="row">
              <span className="k">Your wallet balance (live)</span>
              {balance != null ? <Amt wei={balance} /> : <span className="v">couldn't be read</span>}
            </div>

            {pending.amountWei > 0n && (
              <>
                <div className="row" style={{ marginTop: 10 }}>
                  <span className="k">Sent</span>
                  <span className="v">{fmtDateTimeBoth(pending.initiatedAt)}</span>
                </div>
                {snapshot && delta != null ? (
                  <>
                    <div className="row">
                      <span className="k">Your balance when you withdrew</span>
                      <Amt wei={snapBalance} />
                    </div>
                    <div className="row">
                      <span className="k">Your wallet balance now</span>
                      <Amt wei={balance} />
                    </div>
                    <div className="row">
                      <span className="k">Change since you withdrew</span>
                      <span className="v">
                        {delta >= 0n ? "+" : "−"}
                        {formatGen(delta >= 0n ? delta : -delta)} GEN
                        {delta >= pending.amountWei
                          ? " ✓ — it arrived"
                          : delta > 0n
                            ? " — less than the full amount so far; wallet fees on the withdrawal can explain part of the gap"
                            : " — it hasn't arrived yet"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="note">
                    No balance snapshot was saved on this device for this withdrawal (the snapshot is taken
                    when you tap Withdraw here). Compare your wallet balance with the amount above, and
                    confirm below only when the money has arrived.
                  </p>
                )}
              </>
            )}

            <WriteButton
              label={claimable > 0n ? `Withdraw ${formatGen(claimable)} GEN` : "Withdraw"}
              verb="withdraw"
              disabled={pending.amountWei > 0n || claimable <= 0n}
              disabledReason={
                pending.amountWei > 0n ? errorText("PENDING_WITHDRAWAL") : errorText("NO_CLAIM")
              }
              run={async (onHash) => {
                // §3.6: snapshot the wallet balance at the moment of the
                // click, before the transaction is built.
                try {
                  const bal = await ethBalance(account);
                  setSnapshot(contractAddr, account, {
                    balance: bal.toString(),
                    at: Math.floor(Date.now() / 1000),
                  });
                } catch {
                  /* snapshot is best-effort; the withdraw itself matters */
                }
                const fees = await payoutFees(account);
                return runWrite({ fn: "withdraw_claim", args: [], fees, onHash });
              }}
              onSuccess={(result) =>
                pushToast(
                  "ok",
                  "Withdrawal sent",
                  `${formatGen(claimable)} GEN is on its way. Confirm below once it lands in your wallet — the app never confirms for you.`,
                  result.hash
                )
              }
            />

            <WriteButton
              label={pending.amountWei > 0n ? `Confirm ${formatGen(pending.amountWei)} GEN received` : "Confirm received"}
              verb="confirm the withdrawal"
              ghost
              disabled={pending.amountWei <= 0n}
              disabledReason="Nothing is on its way right now."
              run={(onHash) => runWrite({ fn: "confirm_withdrawal", args: [], fees: baseFees(), onHash })}
              onSuccess={(result) => {
                clearSnapshot(contractAddr, account);
                pushToast(
                  "ok",
                  "Confirmed",
                  "The withdrawal is marked received. Thank you — that closes the loop on chain.",
                  result.hash
                );
              }}
            />
          </div>
        )}
      </SectionState>
    </div>
  );
}
