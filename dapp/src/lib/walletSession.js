// Persisted wallet session — the session survives a refresh with no
// location.reload() anywhere in the app.
//   * save on every successful connect (account + provider identity);
//   * restore on mount via eth_accounts — silent, no prompt; if the wallet
//     no longer authorises the account, the session is dropped;
//   * chainChanged updates state — it NEVER reloads the page;
//   * accountsChanged never wipes on a bare empty array: an empty emission
//     is re-checked with eth_accounts first (OKX emits one transiently
//     around the chain switch). Only a confirmed-empty list clears it.
import { discoverInjectedWallets, getWcProvider } from "./wallet.js";
import { setWalletProvider } from "./genlayer.js";

const SESSION_KEY = "warrantycourt-wallet-session";

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.account) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — the in-memory session still works for this visit.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

async function resolveProvider(session) {
  if (session.providerId === "walletconnect") return getWcProvider();
  try {
    const wallets = await discoverInjectedWallets(700);
    const match = wallets.find((w) => w.id === session.providerId);
    if (match) return match.provider;
  } catch {}
  if (session.providerId === "legacy-ethereum" && typeof window !== "undefined") {
    return window.ethereum || null;
  }
  return null;
}

/**
 * Restore a saved session silently. Returns { account, provider,
 * providerName } when the wallet still authorises the saved account, else
 * null (session dropped). Never prompts and never throws.
 */
export async function restoreSession() {
  const session = loadSession();
  if (!session) return null;
  try {
    const provider = await resolveProvider(session);
    if (!provider || typeof provider.request !== "function") {
      clearSession();
      return null;
    }
    setWalletProvider(provider);
    const accounts = await provider.request({ method: "eth_accounts" });
    const stillThere =
      Array.isArray(accounts) &&
      accounts.some((a) => String(a).toLowerCase() === String(session.account).toLowerCase());
    if (!stillThere) {
      clearSession();
      return null;
    }
    return { account: session.account, provider, providerName: session.providerName || "Wallet" };
  } catch {
    return null;
  }
}
