// The file-a-claim form (§3.4), shared by the Buyer console card and the
// purchase detail: defect text, ONE defect photo (EvidenceField, photo
// guidance included), and the requested amount with live client-side
// checks mirroring the contract's gates (per-claim cap OVER_CAP, pool
// unreserved POOL_INSUFFICIENT, the aggregate headroom when the price
// is known AGGREGATE_CAP_EXCEEDED). The contract remains the only gate —
// these checks are previews; its code shows inline on rejection.
import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { baseFees } from "../lib/genlayer.js";
import { errorText } from "../lib/copy.js";
import { formatGen, parseGenToWei } from "../lib/money.js";
import { WriteButton } from "./WriteButton.jsx";
import { EvidenceField } from "./EvidenceField.jsx";

export function ClaimForm({ purchase, policy, onFiled }) {
  const { runWrite, pushToast } = useStore();
  const [defect, setDefect] = useState("");
  const [photo, setPhoto] = useState(null);
  const [amountText, setAmountText] = useState("");

  const amt = parseGenToWei(amountText);
  const poolFree = policy ? BigInt(policy.pool_unreserved_wei || 0) : 0n;
  const cap = policy ? BigInt(policy.per_claim_cap_wei || 0) : 0n;
  const paid = BigInt(purchase.cumulative_paid_wei || 0);
  const receiptTotal = BigInt(purchase.receipt_total_wei || 0);
  const withinCap = amt.ok ? amt.wei <= cap : null;
  const withinPool = amt.ok ? amt.wei <= poolFree : null;
  const withinTotal = amt.ok && receiptTotal > 0n ? amt.wei + paid <= receiptTotal : null;

  const valid =
    defect.trim().length > 0 &&
    defect.length <= 1000 &&
    photo &&
    photo.ready &&
    amt.ok &&
    amt.wei > 0n &&
    withinCap &&
    withinPool &&
    withinTotal !== false;

  const disabledReason = !valid
    ? !photo || !photo.ready
      ? "Attach the photo's address and check it first"
      : !defect.trim()
        ? "Describe what broke first"
        : amt.ok && withinCap === false
          ? errorText("OVER_CAP")
          : amt.ok && withinPool === false
            ? errorText("POOL_INSUFFICIENT")
            : amt.ok && withinTotal === false
              ? errorText("AGGREGATE_CAP_EXCEEDED")
              : "Fill in every field with a valid amount"
    : "";

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
      <div className="field">
        <label className="flabel" htmlFor={`defect-${purchase.purchase_id}`}>
          What broke? Say what failed, when you noticed it, and anything you already tried.
        </label>
        <textarea
          id={`defect-${purchase.purchase_id}`}
          className="textinput"
          maxLength={1000}
          value={defect}
          onChange={(e) => setDefect(e.target.value)}
          placeholder="e.g. The pump stopped mid-cycle on 3 Nov. No error shown. Water stays in the tub."
        />
        <div className="weiunder">{defect.length}/1000 characters</div>
      </div>

      <EvidenceField kind="photo" label="Photo of the problem" onChange={setPhoto} />

      <div className="field">
        <label className="flabel" htmlFor={`amt-${purchase.purchase_id}`}>
          How much are you claiming (GEN)?
        </label>
        <input
          id={`amt-${purchase.purchase_id}`}
          className="textinput"
          inputMode="decimal"
          placeholder="0.000"
          value={amountText}
          onChange={(e) => setAmountText(e.target.value)}
        />
        {amt.ok && <div className="weiunder">= {amt.wei.toString()} wei</div>}
        {amountText && !amt.ok && <div className="inlineerr">{amt.error}</div>}
        <div className="checkline">
          Per-claim cap {formatGen(cap)} GEN —{" "}
          {withinCap === null ? (
            <span className="mid">enter an amount</span>
          ) : withinCap ? (
            <span className="ok">✓ within the cap</span>
          ) : (
            <span className="bad">✗ over the cap — the contract answers “{errorText("OVER_CAP")}”</span>
          )}
        </div>
        <div className="checkline">
          Pool has {formatGen(poolFree)} GEN free —{" "}
          {withinPool === null ? (
            <span className="mid">enter an amount</span>
          ) : withinPool ? (
            <span className="ok">✓ coverable now</span>
          ) : (
            <span className="bad">✗ more than the pool holds free — the contract answers “{errorText("POOL_INSUFFICIENT")}”</span>
          )}
        </div>
        <div className="checkline">
          Paid so far {formatGen(paid)} GEN —{" "}
          {receiptTotal > 0n ? (
            withinTotal === null ? (
              <span className="mid">enter an amount</span>
            ) : withinTotal ? (
              <span className="ok">✓ stays within the purchase price {formatGen(receiptTotal)} GEN</span>
            ) : (
              <span className="bad">✗ would pass the purchase price — the contract answers “{errorText("AGGREGATE_CAP_EXCEEDED")}”</span>
            )
          ) : (
            <span className="mid">price not read yet, so the contract checks the total again after the jury reads the receipt</span>
          )}
        </div>
      </div>

      <WriteButton
        label="File this claim"
        verb="file the claim"
        disabled={!valid}
        disabledReason={disabledReason}
        run={(onHash) =>
          runWrite({
            fn: "file_claim",
            args: [Number(purchase.purchase_id), defect, photo.url, photo.sha256, amt.wei],
            fees: baseFees(),
            onHash,
          })
        }
        onSuccess={(result) => {
          const m = /#(\d+)/.exec((result.outcome && result.outcome.returnText) || "");
          const newId = m ? Number(m[1]) : null;
          pushToast(
            "ok",
            "Claim filed",
            "Your money is set aside until the claim finishes. You can ask the jury to assess it now, on the claim file.",
            result.hash
          );
          if (onFiled) onFiled(newId);
          else if (newId) window.location.hash = `#/claim-${newId}`;
        }}
      />
    </div>
  );
}
