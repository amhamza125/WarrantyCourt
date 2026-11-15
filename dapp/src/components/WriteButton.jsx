// The one write control: double-submit protection (it disables itself
// from click until the tx resolves or fails), the pending row with the
// tx hash as soon as the wallet returns it, error text inline beside the
// control AND as a toast (SPEC §7), and an optional confirm sheet shown
// before signing (the appeal risk sheet is the model).
import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { PendingRow } from "./bits.jsx";

export function WriteButton({
  label,
  verb,
  ghost = false,
  jury = false,
  disabled = false,
  disabledReason = "",
  confirmText = null,
  confirmLabel = "Yes, continue",
  run,
  onSuccess,
  successToast,
  errorTextFor,
}) {
  const { account, setChooserOpen, pushToast } = useStore();
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState(null);
  const [inlineError, setInlineError] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!account) {
    return (
      <button type="button" className={`btn ${ghost ? "ghost" : ""}`} onClick={() => setChooserOpen(true)}>
        Connect wallet to {verb || label.toLowerCase()}
      </button>
    );
  }

  if (disabled) {
    return (
      <div>
        <button type="button" className="btn disabled" disabled>
          {label}
        </button>
        {disabledReason && <p className="reason">{disabledReason}</p>}
      </div>
    );
  }

  const doRun = async () => {
    setBusy(true);
    setInlineError("");
    setHash(null);
    try {
      const result = await run((h) => setHash(h));
      if (successToast) {
        const t = typeof successToast === "function" ? successToast(result) : successToast;
        if (t) pushToast("ok", t.title, t.body, result?.hash);
      }
      if (onSuccess) onSuccess(result);
    } catch (e) {
      const msg = (errorTextFor && e && e.code && errorTextFor(e.code)) || e?.message || "That didn't go through.";
      setInlineError(msg);
      pushToast("err", "That didn't go through", msg, e?.hash);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div>
      {confirming && confirmText ? (
        <div className="confirmsheet">
          <p>{confirmText}</p>
          <div className="btnrow">
            <button type="button" className="btn" disabled={busy} onClick={doRun}>
              {confirmLabel}
            </button>
            <button type="button" className="btn ghost" disabled={busy} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`btn ${ghost ? "ghost" : ""}`}
          disabled={busy}
          onClick={() => (confirmText ? setConfirming(true) : doRun())}
        >
          {busy ? (jury ? "Waiting for the validators…" : "Submitting…") : label}
        </button>
      )}
      {busy && hash && <PendingRow hash={hash} jury={jury} />}
      {inlineError && <p className="inlineerr">{inlineError}</p>}
    </div>
  );
}
