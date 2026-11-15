// Owner tools (#/admin) — SPEC §3.8. Rendered only for the contract
// owner (or the named next owner, for the accept action); everyone else
// gets the honestly-gated empty state. Holds: pause/resume, contract
// balance vs the four tracked buckets with the excess sweep, the
// Restore box (with the B+ NO_EXCESS wording from BUILD_BRIEF — a
// restore can never be presented as guaranteed), and two-step ownership.
import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useNow } from "../lib/hooks.js";
import { fetchPending } from "../lib/activity.js";
import { baseFees } from "../lib/genlayer.js";
import { errorText, RESTORE_EXPLAINER, RESTORE_NO_EXCESS_TEXT } from "../lib/copy.js";
import { isValidAddress } from "../lib/contract.js";
import { PENDING_MIN_AGE_SECONDS } from "../lib/config.js";
import { formatGen } from "../lib/money.js";
import { fmtDateTimeBoth, remainingText } from "../lib/time.js";
import { Addr, Amt, PageHead, Skeleton } from "../components/bits.jsx";
import { WriteButton } from "../components/WriteButton.jsx";

export function Admin() {
  const { account, contractAddr, overview, runWrite, pushToast } = useStore();
  const now = useNow(5);
  const [restoreAddr, setRestoreAddr] = useState("");
  const [restoreInfo, setRestoreInfo] = useState(null);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [newOwner, setNewOwner] = useState("");

  const ov = overview.data;
  const isOwner = ov && account && account.toLowerCase() === String(ov.owner).toLowerCase();
  const isPendingOwner =
    ov && account && ov.pending_owner && account.toLowerCase() === String(ov.pending_owner).toLowerCase();

  if (!account) {
    return (
      <div>
        <PageHead title="Owner tools" line="These controls belong to the contract owner's wallet." />
        <div className="card">
          <p className="hint" style={{ margin: 0 }}>
            Connect a wallet first — if it is the owner's, the tools appear here.
          </p>
        </div>
      </div>
    );
  }
  if (overview.loading || !ov) {
    return (
      <div>
        <PageHead title="Owner tools" line="" />
        <Skeleton lines={4} block />
      </div>
    );
  }
  if (!isOwner && !isPendingOwner) {
    return (
      <div>
        <PageHead title="Owner tools" line="" />
        <div className="card">
          <p className="hint" style={{ margin: 0 }}>
            Owner tools are shown only to the contract owner. This wallet isn't the owner, so there's
            nothing here for it — the rest of the app works as normal.
          </p>
        </div>
      </div>
    );
  }

  const tracked =
    BigInt(ov.total_pool_unreserved_wei) +
    BigInt(ov.total_pool_reserved_wei) +
    BigInt(ov.total_claimable_wei) +
    BigInt(ov.total_pending_wei);
  const balance = BigInt(ov.contract_balance);
  const excess = balance - tracked;
  const restoreAgeOk =
    restoreInfo && restoreInfo.amountWei > 0n && now >= restoreInfo.initiatedAt + PENDING_MIN_AGE_SECONDS;

  const lookupRestore = async () => {
    setRestoreInfo(null);
    if (!isValidAddress(restoreAddr.trim())) return;
    setRestoreBusy(true);
    try {
      const p = await fetchPending(restoreAddr.trim(), contractAddr);
      setRestoreInfo(p);
    } catch {
      setRestoreInfo(null);
    } finally {
      setRestoreBusy(false);
    }
  };

  return (
    <div>
      <PageHead
        title="Owner tools"
        line="Pause, the balance check, restoring stuck withdrawals, and handing over ownership. Everything here is owner-only on chain too."
      />

      {isPendingOwner && !isOwner && (
        <div className="card">
          <p className="hint">
            Ownership of this contract is being transferred to this wallet. Accepting makes this wallet the
            owner — pause, sweep, restore and future transfers move with it.
          </p>
          <WriteButton
            label="Accept ownership"
            verb="accept ownership"
            run={(onHash) => runWrite({ fn: "accept_ownership", args: [], fees: baseFees(), onHash })}
            onSuccess={(result) =>
              pushToast("ok", "Ownership accepted", "This wallet is now the contract owner.", result.hash)
            }
          />
        </div>
      )}

      {isOwner && (
        <>
          <div className="card">
            <div className="row">
              <span className="k">Protocol state</span>
              <span className="v">{ov.paused ? "Paused" : "Running"}</span>
            </div>
            <p className="hint" style={{ marginTop: 8 }}>
              {ov.paused
                ? "Paused: new policies, purchases, claims and assessments are blocked. Releases, withdrawals and exits still work."
                : "Pausing blocks new policies, purchases, claims and assessments. Releases, withdrawals and exits keep working."}
            </p>
            <WriteButton
              label={ov.paused ? "Resume the protocol" : "Pause the protocol"}
              verb={ov.paused ? "resume the protocol" : "pause the protocol"}
              run={(onHash) => runWrite({ fn: "set_paused", args: [!ov.paused], fees: baseFees(), onHash })}
              onSuccess={(result) =>
                pushToast(
                  "ok",
                  ov.paused ? "Protocol resumed" : "Protocol paused",
                  ov.paused
                    ? "New policies, purchases, claims and assessments are open again."
                    : "New policies, purchases, claims and assessments are now blocked.",
                  result.hash
                )
              }
            />
          </div>

          <div className="card">
            <div className="row">
              <span className="k" style={{ fontWeight: 700, color: "var(--ink)" }}>
                Contract balance
              </span>
              <Amt wei={balance} />
            </div>
            <div className="row">
              <span className="k">In pools, available</span>
              <Amt wei={BigInt(ov.total_pool_unreserved_wei)} />
            </div>
            <div className="row">
              <span className="k">Reserved for claims</span>
              <Amt wei={BigInt(ov.total_pool_reserved_wei)} />
            </div>
            <div className="row">
              <span className="k">Ready to pay out</span>
              <Amt wei={BigInt(ov.total_claimable_wei)} />
            </div>
            <div className="row">
              <span className="k">Withdrawals on their way</span>
              <Amt wei={BigInt(ov.total_pending_wei)} />
            </div>
            <div className="row">
              <span className="k">Untracked excess</span>
              <span className="v">{excess > 0n ? `${formatGen(excess)} GEN` : "none"}</span>
            </div>
            <WriteButton
              label={excess > 0n ? `Sweep ${formatGen(excess)} GEN excess` : "Sweep excess"}
              verb="sweep the excess"
              ghost
              disabled={excess <= 0n}
              disabledReason={errorText("NO_EXCESS")}
              run={(onHash) => runWrite({ fn: "sweep_excess", args: [], fees: baseFees(), onHash })}
              onSuccess={(result) =>
                pushToast(
                  "ok",
                  "Excess swept",
                  `${formatGen(excess)} GEN moved to your claimable balance — withdraw it from My Funds.`,
                  result.hash
                )
              }
            />
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Restore a stuck withdrawal</h2>
            <p className="hint">{RESTORE_EXPLAINER}</p>
            <div className="field">
              <label className="flabel" htmlFor="restoreAddr">
                Recipient's wallet address
              </label>
              <input
                id="restoreAddr"
                className="textinput mono"
                placeholder="0x…"
                value={restoreAddr}
                onChange={(e) => {
                  setRestoreAddr(e.target.value);
                  setRestoreInfo(null);
                }}
              />
              {restoreAddr && !isValidAddress(restoreAddr.trim()) && (
                <div className="inlineerr">{errorText("BAD_ADDRESS")}</div>
              )}
            </div>
            <button
              type="button"
              className="textbtn"
              disabled={!isValidAddress(restoreAddr.trim()) || restoreBusy}
              onClick={lookupRestore}
            >
              {restoreBusy ? "Looking up…" : "Look up the pending withdrawal"}
            </button>
            {restoreInfo && (
              <div style={{ marginTop: 8 }}>
                {restoreInfo.amountWei > 0n ? (
                  <>
                    <div className="row">
                      <span className="k">Pending for this wallet</span>
                      <Amt wei={restoreInfo.amountWei} />
                    </div>
                    <div className="row">
                      <span className="k">Sent</span>
                      <span className="v">{fmtDateTimeBoth(restoreInfo.initiatedAt)}</span>
                    </div>
                    {!restoreAgeOk && (
                      <div className="reason">
                        {errorText("TOO_EARLY")} Restorable in{" "}
                        {remainingText(restoreInfo.initiatedAt + PENDING_MIN_AGE_SECONDS, now).text}.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="hint">This wallet has no pending withdrawal to restore.</p>
                )}
              </div>
            )}
            <WriteButton
              label="Restore this withdrawal"
              verb="restore this withdrawal"
              disabled={!restoreInfo || restoreInfo.amountWei <= 0n || !restoreAgeOk}
              disabledReason={
                !restoreInfo || restoreInfo.amountWei <= 0n
                  ? "Look up a wallet with a pending withdrawal first"
                  : errorText("TOO_EARLY")
              }
              errorTextFor={(code) => (code === "NO_EXCESS" ? RESTORE_NO_EXCESS_TEXT : errorText(code))}
              run={(onHash) =>
                runWrite({ fn: "restore_pending", args: [restoreAddr.trim()], fees: baseFees(), onHash })
              }
              onSuccess={(result) => {
                pushToast(
                  "ok",
                  "Withdrawal restored",
                  `The pending ${formatGen(restoreInfo.amountWei)} GEN is claimable again for that wallet — they can withdraw it from My Funds.`,
                  result.hash
                );
                setRestoreInfo(null);
              }}
            />
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Ownership</h2>
            <div className="row">
              <span className="k">Current owner</span>
              <Addr address={ov.owner} />
            </div>
            {ov.pending_owner ? (
              <div className="row">
                <span className="k">Transfer waiting for</span>
                <Addr address={ov.pending_owner} />
              </div>
            ) : (
              <p className="hint" style={{ marginTop: 8 }}>
                No transfer is waiting. Starting one names the next owner; they accept from their own
                wallet, and only then does ownership move.
              </p>
            )}
            <div className="field" style={{ marginTop: 10 }}>
              <label className="flabel" htmlFor="newOwner">
                New owner's wallet address
              </label>
              <input
                id="newOwner"
                className="textinput mono"
                placeholder="0x…"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
              />
              {newOwner && !isValidAddress(newOwner.trim()) && (
                <div className="inlineerr">{errorText("BAD_ADDRESS")}</div>
              )}
            </div>
            <WriteButton
              label="Start ownership transfer"
              verb="start the ownership transfer"
              disabled={!isValidAddress(newOwner.trim())}
              disabledReason="Enter a valid wallet address first"
              run={(onHash) =>
                runWrite({ fn: "transfer_ownership", args: [newOwner.trim()], fees: baseFees(), onHash })
              }
              onSuccess={(result) => {
                pushToast(
                  "ok",
                  "Transfer started",
                  "The new owner accepts from their wallet (Owner tools) before anything changes.",
                  result.hash
                );
                setNewOwner("");
              }}
            />
            {isPendingOwner && (
              <div style={{ marginTop: 12 }}>
                <WriteButton
                  label="Accept ownership (this wallet is the named next owner)"
                  verb="accept ownership"
                  run={(onHash) => runWrite({ fn: "accept_ownership", args: [], fees: baseFees(), onHash })}
                  onSuccess={(result) =>
                    pushToast("ok", "Ownership accepted", "This wallet is now the contract owner.", result.hash)
                  }
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
