// The app store: contract selection (§3.9), the protocol overview, the
// wallet session, theme, toasts, and the one write runner every control
// uses. Pages read chain state through useChainRead keyed on
// [contract, account, epoch] — a write bumps the epoch and every screen
// re-reads from chain; nothing renders a write's return string as state.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  clearContractOverride,
  DEFAULT_CONTRACT,
  getEffectiveContract,
  isContractOverrideActive,
  setContractOverride,
  validateOverview,
} from "./contract.js";
import { friendlyError, readJsonViewRetry, sendWrite, setWalletProvider, walletProvider } from "./genlayer.js";
import { connectInjected, connectWalletConnect, disconnectWalletConnect } from "./wallet.js";
import { clearSession, restoreSession, saveSession } from "./walletSession.js";
import {
  fetchActivity,
  fetchOverview,
  getLastKnownSeq,
  recordHashes,
  setLastKnownSeq,
} from "./activity.js";
import { errorText } from "./copy.js";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

const THEME_KEY = "warrantycourt-theme";
const FUND_DISMISS_KEY = "warrantycourt-fund-dismissed";
const SNAPSHOT_KEY = "warrantycourt-snapshots";

function lsJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function lsSetJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// --- withdrawal snapshots (My Funds, §3.7): stored on this device, keyed
// by contract + wallet, at the moment Withdraw is clicked. ---------------
export function getSnapshot(contract, account) {
  if (!contract || !account) return null;
  const all = lsJson(SNAPSHOT_KEY, {});
  return all[`${contract.toLowerCase()}|${account.toLowerCase()}`] || null;
}
export function setSnapshot(contract, account, snap) {
  const all = lsJson(SNAPSHOT_KEY, {});
  all[`${contract.toLowerCase()}|${account.toLowerCase()}`] = snap;
  lsSetJson(SNAPSHOT_KEY, all);
}
export function clearSnapshot(contract, account) {
  const all = lsJson(SNAPSHOT_KEY, {});
  delete all[`${contract.toLowerCase()}|${account.toLowerCase()}`];
  lsSetJson(SNAPSHOT_KEY, all);
}

let toastSeq = 0;

export function StoreProvider({ children }) {
  const [contractAddr, setContractAddr] = useState(() => getEffectiveContract());
  const [epoch, setEpoch] = useState(0);
  const [overview, setOverview] = useState({ data: null, loading: true, error: null });
  const [account, setAccount] = useState(null);
  const [providerName, setProviderName] = useState(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [fundDismissed, setFundDismissed] = useState(() => new Set(lsJson(FUND_DISMISS_KEY, [])));
  const providerRef = useRef(null);
  const accountRef = useRef(null);
  accountRef.current = account;

  const isOverride = isContractOverrideActive(contractAddr);

  const refreshAll = useCallback(() => setEpoch((e) => e + 1), []);

  // --- theme ---------------------------------------------------------------
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);
  const setTheme = useCallback((t) => setThemeState(t === "dark" ? "dark" : "light"), []);

  // --- toasts ----------------------------------------------------------------
  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);
  const pushToast = useCallback(
    (kind, title, body, hash) => {
      const id = ++toastSeq;
      setToasts((t) => [...t, { id, kind, title, body, hash }]);
      const ttl = kind === "err" || kind === "warn" ? 14000 : 8000;
      setTimeout(() => dismissToast(id), ttl);
      return id;
    },
    [dismissToast]
  );

  // --- overview ----------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    setOverview({ data: null, loading: true, error: null });
    fetchOverview(contractAddr)
      .then((data) => {
        if (!cancelled) setOverview({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled) setOverview({ data: null, loading: false, error: e?.message || "The overview read failed." });
      });
    return () => {
      cancelled = true;
    };
  }, [contractAddr, epoch]);

  // --- contract switching (§3.9) ----------------------------------------------
  const probeContract = useCallback(async (candidate) => {
    const ov = await readJsonViewRetry("get_protocol_overview", [], candidate).catch(() => null);
    const verdict = validateOverview(ov);
    return { ...verdict, overview: ov };
  }, []);

  const switchContract = useCallback(
    (addr) => {
      setContractOverride(addr);
      setContractAddr(getEffectiveContract());
      setEpoch((e) => e + 1);
    },
    []
  );

  const resetContract = useCallback(() => {
    clearContractOverride();
    setContractAddr(getEffectiveContract());
    setEpoch((e) => e + 1);
  }, []);

  // --- wallet -------------------------------------------------------------------
  const attachProviderListeners = useCallback((provider) => {
    if (!provider || typeof provider.on !== "function") return;
    if (provider.__wcListenersAttached) return;
    try {
      provider.__wcListenersAttached = true;
    } catch {}
    provider.on("accountsChanged", async () => {
      try {
        const accounts = await provider.request({ method: "eth_accounts" });
        if (Array.isArray(accounts) && accounts.length > 0) {
          setAccount(accounts[0]);
          saveSession({
            account: accounts[0],
            providerId: provider.__wcProviderId || "legacy-ethereum",
            providerName: provider.__wcProviderName || "Wallet",
          });
        } else {
          // Confirmed empty only — a bare emission is re-checked above.
          clearSession();
          setAccount(null);
        }
      } catch {}
      setEpoch((e) => e + 1);
    });
    provider.on("chainChanged", () => setEpoch((e) => e + 1));
  }, []);

  const finishConnect = useCallback(
    (acct, provider, name, providerId) => {
      providerRef.current = provider;
      if (provider) {
        try {
          provider.__wcProviderId = providerId;
          provider.__wcProviderName = name;
        } catch {}
      }
      setAccount(acct);
      setProviderName(name);
      saveSession({ account: acct, providerId, providerName: name });
      attachProviderListeners(provider);
      setChooserOpen(false);
      setEpoch((e) => e + 1);
    },
    [attachProviderListeners]
  );

  const connectWithInjected = useCallback(
    async (wallet) => {
      const acct = await connectInjected(wallet.provider);
      finishConnect(acct, wallet.provider, wallet.name, wallet.id);
      return acct;
    },
    [finishConnect]
  );

  const connectWithWalletConnect = useCallback(
    async (onUri) => {
      const acct = await connectWalletConnect(onUri);
      finishConnect(acct, walletProvider(), "WalletConnect", "walletconnect");
      return acct;
    },
    [finishConnect]
  );

  const disconnect = useCallback(() => {
    clearSession();
    disconnectWalletConnect();
    setWalletProvider(null);
    providerRef.current = null;
    setAccount(null);
    setProviderName(null);
    setEpoch((e) => e + 1);
  }, []);

  // Silent session restore on mount.
  useEffect(() => {
    let cancelled = false;
    restoreSession().then((restored) => {
      if (cancelled || !restored) return;
      providerRef.current = restored.provider;
      setAccount(restored.account);
      setProviderName(restored.providerName);
      attachProviderListeners(restored.provider);
    });
    return () => {
      cancelled = true;
    };
  }, [attachProviderListeners]);

  // --- the write runner ---------------------------------------------------------
  // Every write in the app goes through here: it requires a wallet, sends
  // with the right fees, records the tx hash against the activity seqs the
  // write created, bumps the epoch so screens re-read, and resolves with
  // the receipt outcome. A raised contract code rejects with { code } so
  // the caller can render the §7 sentence next to its own control.
  const runWrite = useCallback(
    async ({ fn, args = [], value = 0n, fees = null, onHash }) => {
      const acct = accountRef.current;
      if (!acct) {
        setChooserOpen(true);
        throw new Error("Connect a wallet first.");
      }
      const addr = contractAddr;
      const preSeq = getLastKnownSeq(addr);
      const { hash, receipt, outcome } = await sendWrite(acct, fn, args, value, fees, {
        address: addr,
        onHash,
      });
      // Record the hash against any activity entries this write created.
      try {
        const act = await fetchActivity(addr);
        if (Array.isArray(act) && act.length > 0) {
          const maxSeq = Math.max(...act.map((e) => Number(e.seq || 0)));
          setLastKnownSeq(addr, maxSeq);
          const newSeqs = act.filter((e) => Number(e.seq || 0) > preSeq).map((e) => e.seq);
          if (preSeq > 0 && newSeqs.length > 0) recordHashes(addr, hash, newSeqs);
        }
      } catch {}
      setEpoch((e) => e + 1);
      if (outcome && outcome.errorCode) {
        const err = new Error(errorText(outcome.errorCode) || outcome.errorCode);
        err.code = outcome.errorCode;
        err.hash = hash;
        throw err;
      }
      if (outcome && outcome.execName === "FINISHED_WITH_ERROR") {
        const err = new Error("The contract refused this action. Nothing was changed on chain.");
        err.hash = hash;
        throw err;
      }
      return { hash, receipt, outcome };
    },
    [contractAddr]
  );

  // --- fund-returned banners (G5): derived from FUND_CREDITED_BACK events
  // naming the connected wallet; dismissal persists per contract + seq. ----
  const dismissFundBanner = useCallback(
    (seq) => {
      setFundDismissed((prev) => {
        const next = new Set(prev);
        next.add(`${contractAddr.toLowerCase()}|${seq}`);
        lsSetJson(FUND_DISMISS_KEY, [...next]);
        return next;
      });
    },
    [contractAddr]
  );
  const fundBannerDismissed = useCallback(
    (seq) => fundDismissed.has(`${contractAddr.toLowerCase()}|${seq}`),
    [fundDismissed, contractAddr]
  );

  const value = {
    contractAddr,
    isOverride,
    shippedDefault: DEFAULT_CONTRACT,
    overview,
    account,
    providerName,
    chooserOpen,
    setChooserOpen,
    toasts,
    pushToast,
    dismissToast,
    theme,
    setTheme,
    epoch,
    refreshAll,
    probeContract,
    switchContract,
    resetContract,
    connectWithInjected,
    connectWithWalletConnect,
    disconnect,
    runWrite,
    dismissFundBanner,
    fundBannerDismissed,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
