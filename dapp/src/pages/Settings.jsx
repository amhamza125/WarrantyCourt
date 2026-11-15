// Settings (#/settings) — SPEC §3.9: the ONLY home of the contract
// identity (address, network, explorer link, copy) and the contract
// switcher (format check → probe get_protocol_overview → accept only on
// a WarrantyCourt-shaped answer → persist in localStorage → amber
// banner everywhere while non-default → one-tap reset), plus the ONLY
// home of the Light/Dark appearance toggle, and the wallet section.
import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { useChainRead } from "../lib/hooks.js";
import { fetchBuyerPurchases, fetchSellerPolicies } from "../lib/activity.js";
import { isValidAddress } from "../lib/contract.js";
import { explorerAddressUrl } from "../lib/config.js";
import { Addr, PageHead } from "../components/bits.jsx";

export function Settings() {
  const store = useStore();
  const {
    contractAddr,
    isOverride,
    shippedDefault,
    switchContract,
    resetContract,
    theme,
    setTheme,
    account,
    setChooserOpen,
    disconnect,
    overview,
  } = store;
  const [candidate, setCandidate] = useState("");
  const [state, setState] = useState({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const roles = useChainRead(async () => {
    if (!account) return null;
    const [policies, purchases] = await Promise.all([
      fetchSellerPolicies(account, contractAddr).catch(() => []),
      fetchBuyerPurchases(account, contractAddr).catch(() => []),
    ]);
    return {
      seller: policies.length > 0,
      buyer: purchases.length > 0,
      owner: overview.data
        ? account.toLowerCase() === String(overview.data.owner).toLowerCase()
        : false,
    };
  }, [contractAddr, account, overview.data]);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(contractAddr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const replace = async () => {
    const value = candidate.trim();
    // Format first: a malformed address is refused without any chain call.
    if (!isValidAddress(value)) {
      setState({
        kind: "error",
        text: "That doesn't look like a contract address — addresses are 0x followed by 40 characters. Nothing was checked on chain.",
      });
      return;
    }
    if (value.toLowerCase() === contractAddr.toLowerCase()) {
      setState({ kind: "error", text: "That is the contract this app is already using." });
      return;
    }
    setState({ kind: "checking" });
    const result = await store.probeContract(value);
    if (!result.ok) {
      setState({
        kind: "error",
        text: `${result.reason || "That address didn't answer as a WarrantyCourt contract."} It wasn't accepted — the app is still using the contract above.`,
      });
      return;
    }
    switchContract(value);
    setCandidate("");
    setState({
      kind: "done",
      text: "Switched. Every page now reads from the new contract, and a yellow note at the top of every page says so until you reset. The built-in default comes back with one tap.",
    });
  };

  return (
    <div>
      <PageHead
        title="Settings"
        line="The contract this app talks to, how the app looks, and your wallet. The contract lives here and nowhere else in the app."
      />

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Contract</h2>
        <div className="row">
          <span className="k">Network</span>
          <span className="v">GenLayer Bradbury testnet</span>
        </div>
        <div className="row">
          <span className="k">Source</span>
          <span className="v">{isOverride ? "Your replacement" : "Built-in default"}</span>
        </div>
        <div className="row">
          <span className="k">Contract address</span>
          <span className="v mono" style={{ wordBreak: "break-all", maxWidth: "62%" }}>
            {contractAddr}
          </span>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 14, alignItems: "center" }}>
          <button type="button" className="textbtn" onClick={copyAddr}>
            Copy address
          </button>
          {copied && <span className="copied">Copied</span>}
          <a href={explorerAddressUrl(contractAddr)} target="_blank" rel="noreferrer">
            View on the explorer ↗
          </a>
        </div>
        {isOverride && (
          <p className="note">
            Built-in default: <span className="mono">{shippedDefault}</span> — the app is NOT using it
            right now.
          </p>
        )}

        <h2>Use a different contract</h2>
        <p className="hint">
          Paste another WarrantyCourt contract address to point the whole app at it. The app checks the
          address by asking the contract who it is — a wrong or unrelated address is refused, and nothing
          changes until the check passes.
        </p>
        <div className="field">
          <label className="flabel" htmlFor="cand">
            Contract address
          </label>
          <input
            id="cand"
            className="textinput mono"
            placeholder="0x…"
            value={candidate}
            onChange={(e) => {
              setCandidate(e.target.value);
              setState({ kind: "idle" });
            }}
          />
        </div>
        <button
          type="button"
          className="btn"
          disabled={!candidate.trim() || state.kind === "checking"}
          onClick={replace}
        >
          {state.kind === "checking" ? "Checking the contract…" : "Check and switch"}
        </button>
        {state.kind === "error" && (
          <div className="msg err" role="alert">
            <b>Not switched</b>
            {state.text}
          </div>
        )}
        {state.kind === "done" && (
          <div className="msg warn" role="status">
            <b>Switched</b>
            {state.text}
          </div>
        )}
        <button
          type="button"
          className="btn ghost"
          style={{ marginTop: 10 }}
          disabled={!isOverride}
          onClick={() => {
            resetContract();
            setState({ kind: "idle" });
          }}
        >
          Reset to the built-in contract
        </button>
        {!isOverride && <p className="btnnote">Already on the built-in default.</p>}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Appearance</h2>
        <div className="row">
          <span className="k">Theme</span>
          <span className="seg-toggle" role="group" aria-label="Theme">
            <button type="button" className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>
              Light
            </button>
            <button type="button" className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>
              Dark
            </button>
          </span>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Your choice is kept on this device. Both themes carry the same information — status is always
          written in words, never colour alone.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Wallet</h2>
        {account ? (
          <>
            <div className="row">
              <span className="k">Connected</span>
              <Addr address={account} />
            </div>
            <div className="row">
              <span className="k">Network</span>
              <span className="v">GenLayer Bradbury testnet</span>
            </div>
            <div className="row">
              <span className="k">You act here as</span>
              <span className="v">
                {roles.data
                  ? [roles.data.owner && "Owner", roles.data.seller && "Seller", roles.data.buyer && "Buyer"]
                      .filter(Boolean)
                      .join(" · ") || "A reader — no policies or purchases under this address yet"
                  : "Reading…"}
              </span>
            </div>
            <button type="button" className="btn ghost" style={{ marginTop: 12 }} onClick={disconnect}>
              Disconnect
            </button>
          </>
        ) : (
          <>
            <p className="hint">
              No wallet connected. Reading works without one; writing (creating, funding, claiming,
              withdrawing) needs a wallet on the Bradbury network.
            </p>
            <button type="button" className="btn" onClick={() => setChooserOpen(true)}>
              Connect wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
