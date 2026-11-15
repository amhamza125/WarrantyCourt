// Wallet discovery + WalletConnect for WarrantyCourt.
// The connect flow offers a CHOICE, never a single path:
//   1. Injected wallets discovered via EIP-6963 (MetaMask, Rabby, Brave,
//      OKX, …) plus the legacy window.ethereum fallback, listed by name.
//   2. WalletConnect (QR on desktop, deep links on phone). Needs a Reown
//      Cloud project ID via VITE_WC_PROJECT_ID; without one the option is
//      shown disabled with a plain explanation — never a dead end and
//      never a hardcoded ID.
//   3. The "Open in MetaMask" deep link is ONE option on mobile, never
//      the only path.
import { CHAIN_ID, CHAIN_ID_HEX, NODE_RPC_URL, EXPLORER_URL, WC_PROJECT_ID } from "./config.js";
import { connectWallet, setWalletProvider } from "./genlayer.js";

export function metamaskDeepLink() {
  if (typeof window === "undefined") return "https://metamask.app.link";
  return `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
}

export function walletConnectAvailable() {
  return WC_PROJECT_ID.length > 0;
}

/**
 * Discover injected wallets via EIP-6963. Returns [{ id, name, provider }].
 * Never throws: an empty list means "no injected wallet found".
 */
export function discoverInjectedWallets(timeoutMs = 700) {
  return new Promise((resolve) => {
    const found = new Map();
    const guessName = (eth) => {
      if (!eth) return "Injected wallet";
      if (eth.isOkxWallet || eth.isOKExWallet) return "OKX Wallet";
      if (eth.isMetaMask) return "MetaMask";
      if (eth.isRabby) return "Rabby";
      if (eth.isBraveWallet) return "Brave Wallet";
      if (eth.isCoinbaseWallet) return "Coinbase Wallet";
      if (eth.isTrust) return "Trust Wallet";
      return "Browser wallet";
    };
    const add = (provider, name, id) => {
      if (!provider || typeof provider.request !== "function") return;
      if (found.has(provider)) return;
      found.set(provider, { id: id || `injected-${found.size}`, name, provider });
    };
    const onAnnounce = (event) => {
      const detail = event?.detail || {};
      if (detail.provider) add(detail.provider, detail.info?.name || "Injected wallet", detail.info?.rdns || detail.info?.uuid);
    };
    try {
      window.addEventListener("eip6963:announceProvider", onAnnounce);
      window.dispatchEvent(new window.Event("eip6963:requestProvider"));
    } catch {
      // EIP-6963 unsupported — the legacy fallback below still runs.
    }
    setTimeout(() => {
      try {
        window.removeEventListener("eip6963:announceProvider", onAnnounce);
      } catch {}
      if (typeof window !== "undefined" && window.ethereum) {
        add(window.ethereum, guessName(window.ethereum), "legacy-ethereum");
      }
      resolve([...found.values()]);
    }, timeoutMs);
  });
}

/** Connect an injected provider (accounts first, then Bradbury switch). */
export async function connectInjected(provider) {
  setWalletProvider(provider);
  return connectWallet(provider);
}

// --- WalletConnect (lazy: the SDK only loads when the user picks it) -----
let wcProvider = null;
export function getWcProvider() {
  return wcProvider;
}

function wcMetadata() {
  return {
    name: "WarrantyCourt",
    description: "Warranty claims judged on chain — GenLayer Bradbury",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: [],
  };
}

export async function connectWalletConnect(onUri) {
  if (!walletConnectAvailable()) {
    throw new Error(
      "WalletConnect is not set up yet — the site needs a free Reown Cloud project ID (VITE_WC_PROJECT_ID)."
    );
  }
  const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");
  const provider = await EthereumProvider.init({
    projectId: WC_PROJECT_ID,
    chains: [CHAIN_ID],
    optionalChains: [CHAIN_ID],
    rpcMap: { [CHAIN_ID]: NODE_RPC_URL },
    metadata: wcMetadata(),
    showQrModal: false, // the chooser renders its own QR / deep links
  });
  wcProvider = provider;
  provider.on("display_uri", (uri) => {
    if (typeof uri === "string" && onUri) onUri(uri);
  });
  await provider.connect();
  setWalletProvider(provider);
  const accounts =
    provider.accounts && provider.accounts.length > 0
      ? provider.accounts
      : await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts authorized in wallet.");
  }
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID_HEX,
            chainName: "GenLayer Bradbury Testnet",
            rpcUrls: [NODE_RPC_URL],
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            blockExplorerUrls: [EXPLORER_URL],
          },
        ],
      });
    } else {
      throw err;
    }
  }
  return accounts[0];
}

/** Deep links that open a WalletConnect URI in a mobile wallet app. */
export function wcDeepLinks(uri) {
  const encoded = encodeURIComponent(uri);
  return [
    { name: "MetaMask", href: `https://metamask.app.link/wc?uri=${encoded}` },
    { name: "Rainbow", href: `https://rnbwapp.com/wc?uri=${encoded}` },
    { name: "Trust Wallet", href: `https://link.trustwallet.com/wc?uri=${encoded}` },
    { name: "Coinbase Wallet", href: `https://go.cb-w.com/wc?uri=${encoded}` },
  ];
}

export function disconnectWalletConnect() {
  if (wcProvider) {
    try {
      wcProvider.disconnect();
    } catch {}
    wcProvider = null;
  }
}
