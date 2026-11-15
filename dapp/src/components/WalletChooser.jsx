// The wallet chooser: EIP-6963 injected wallets by name, WalletConnect
// (QR on desktop, deep links on phone), and the MetaMask deep link on
// mobile. Connect first, then the Bradbury switch happens inside the
// connect call (the OKX order that works, SPEC §2).
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useStore } from "../lib/store.jsx";
import {
  discoverInjectedWallets,
  metamaskDeepLink,
  walletConnectAvailable,
  wcDeepLinks,
} from "../lib/wallet.js";
import { friendlyError } from "../lib/genlayer.js";

export function WalletChooser() {
  const { chooserOpen, setChooserOpen, connectWithInjected, connectWithWalletConnect } = useStore();
  const [wallets, setWallets] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [wcUri, setWcUri] = useState("");
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!chooserOpen) return;
    setError("");
    setWcUri("");
    setQr("");
    setBusy("");
    let live = true;
    discoverInjectedWallets(700).then((list) => {
      if (live) setWallets(list);
    });
    return () => {
      live = false;
    };
  }, [chooserOpen]);

  useEffect(() => {
    if (!wcUri) return;
    QRCode.toDataURL(wcUri, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [wcUri]);

  if (!chooserOpen) return null;

  const pickInjected = async (w) => {
    setBusy(w.id);
    setError("");
    try {
      await connectWithInjected(w);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy("");
    }
  };

  const pickWc = async () => {
    setBusy("walletconnect");
    setError("");
    try {
      await connectWithWalletConnect((uri) => setWcUri(uri));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="modalwrap" role="dialog" aria-label="Connect a wallet">
      <div className="scrim2" onClick={() => setChooserOpen(false)}></div>
      <div className="modal card">
        <div className="claimhead">
          <span className="claimno">Connect a wallet</span>
          <button type="button" className="closex" onClick={() => setChooserOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="hint">Reading is free and needs no wallet. Connect to sign actions on Bradbury (chain 4221).</p>

        {wallets === null && <p className="hint">Looking for wallets in this browser…</p>}
        {wallets !== null && wallets.length === 0 && (
          <p className="hint">No wallet was found in this browser. Use WalletConnect, or open this page inside your wallet app's browser.</p>
        )}
        {wallets &&
          wallets.map((w) => (
            <button
              key={w.id}
              type="button"
              className="btn ghost walletbtn"
              disabled={busy !== ""}
              onClick={() => pickInjected(w)}
            >
              {busy === w.id ? "Connecting…" : w.name}
            </button>
          ))}

        {walletConnectAvailable() ? (
          <button type="button" className="btn ghost walletbtn" disabled={busy !== ""} onClick={pickWc}>
            {busy === "walletconnect" ? "Waiting for your wallet…" : "WalletConnect"}
          </button>
        ) : (
          <button type="button" className="btn disabled walletbtn" disabled>
            WalletConnect — not set up on this site yet
          </button>
        )}

        {wcUri && (
          <div className="wcbox">
            {qr && <img src={qr} alt="WalletConnect QR code" className="wcqr" />}
            <p className="hint">Scan with your wallet app, or open it directly:</p>
            <div className="btnrow" style={{ flexWrap: "wrap" }}>
              {wcDeepLinks(wcUri).map((l) => (
                <a key={l.name} className="btn ghost" style={{ flex: "1 1 40%" }} href={l.href}>
                  {l.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <a className="btn ghost walletbtn" href={metamaskDeepLink()}>
          Open in MetaMask (phone)
        </a>

        {error && <p className="inlineerr">{error}</p>}
      </div>
    </div>
  );
}
