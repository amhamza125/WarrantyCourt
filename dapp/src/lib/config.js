// WarrantyCourt — Bradbury configuration.
// Contract: WarrantyCourt (B+ production) on GenLayer Bradbury (chain 4221).

// THE contract address constant (DAPP_SPEC §3.9): the shipped default lives
// here and nowhere else. A build-time env var may override it; a user's
// Settings-page replacement is a localStorage override on top of this
// (see contract.js) — never a second pasted copy.
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x389b1524a976A8fF90087d15338A8f7937c7236E";

// WalletConnect project ID (Reown Cloud, free project). Empty when unset —
// the wallet chooser then shows WalletConnect as unavailable instead of
// failing. Never hardcode a shared or demo project ID here.
export const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID || "";

export const CHAIN_ID = 4221;
export const CHAIN_ID_HEX = "0x107d"; // 4221
export const CHAIN_NAME = "GenLayer Bradbury Testnet";
export const NODE_RPC_URL = "https://rpc-bradbury.genlayer.com"; // gen_call lives here
export const EXPLORER_URL = "https://scan.bradbury.genlayer.com";

export const explorerAddressUrl = (addr) => `${EXPLORER_URL}/address/${addr}`;
export const explorerTxUrl = (hash) => `${EXPLORER_URL}/tx/${hash}`;

// Contract timing constants (seconds) — mirror build/WarrantyCourt.py:
// _APPEAL_WINDOW, _APPEAL_EXPIRY, _CLAIM_EXPIRY, _PENDING_MIN_AGE.
export const APPEAL_WINDOW_SECONDS = 86400;
export const APPEAL_STALE_SECONDS = 3 * 86400;
export const CLAIM_EXPIRY_SECONDS = 30 * 86400;
export const PENDING_MIN_AGE_SECONDS = 600;
