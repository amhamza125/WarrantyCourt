// GenLayer client for WarrantyCourt on Bradbury (genlayer-js 2.0.0-rc.2).
// Reads are walletless against the node RPC (the only endpoint that serves
// gen_call). Writes go through the user's wallet after switching it to
// Bradbury. Patterns follow the proven GrantFlow dApp.
//
// PAYOUT FEES — only withdraw_claim emits _pay in WarrantyCourt (recipient
// = the caller), so only it carries the corrected external allocation:
// recipient = the payee, callKey = CALL_KEY_UNNAMED (32 zero bytes),
// budget = 0.0012 GEN = exactly 20x (gasLimit 200000 x maxGasPrice
// 300000000), feeValue = roundFees + 0.0012 GEN. Without the allocation
// the payout message is emitted but never executes — and
// FINISHED_WITH_RETURN does NOT prove a payout; only the recipient
// balance delta does. Every other write only credits balances on chain
// (claimable) and uses baseFees().

import { createClient, encodeExternalMessageFeeParams, MessageType, CALL_KEY_UNNAMED } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { createPublicClient, http, parseAbi } from "viem";
import {
  CHAIN_ID_HEX,
  CHAIN_NAME,
  NODE_RPC_URL,
  EXPLORER_URL,
} from "./config.js";
import { getEffectiveContract } from "./contract.js";
import { ERROR_CODES, RETURN_PREFIXES } from "./copy.js";

// --- fee policy (proven values, from the GrantFlow Bradbury build) -------
const FEE_DISTRIBUTION = {
  leaderTimeunitsAllocation: 100n,
  validatorTimeunitsAllocation: 200n,
  appealRounds: 0n,
  executionBudgetPerRound: 25000000000000000n,
  executionConsumed: 0n,
  totalMessageFees: 0n,
  rotations: [3n],
  maxPriceGenPerTimeUnit: 2n,
  storageFeeMaxGasPrice: 300000000n,
  receiptFeeMaxGasPrice: 300000000n,
};
const BASE_FEE_VALUE = 100000000000010352n; // roundFees with zero message budget

const PAYOUT_GAS_LIMIT = 200000n;
const PAYOUT_MAX_GAS_PRICE = 300000000n;
export const PAYOUT_BUDGET = 1200000000000000n; // 0.0012 GEN

const FEE_MANAGER_ABI = parseAbi([
  "function calculateRoundFees((uint256 leaderTimeunitsAllocation, uint256 validatorTimeunitsAllocation, uint256 appealRounds, uint256 executionBudgetPerRound, uint256 executionConsumed, uint256 totalMessageFees, uint256[] rotations, uint256 maxPriceGenPerTimeUnit, uint256 storageFeeMaxGasPrice, uint256 receiptFeeMaxGasPrice) _feesDistribution, uint256 _numOfValidators, uint256 round) view returns (uint256 totalFeesToPay)",
]);

/** Plain fees for calls that never emit a transfer. */
export function baseFees() {
  return {
    distribution: { ...FEE_DISTRIBUTION, rotations: [...FEE_DISTRIBUTION.rotations] },
    messageAllocations: [],
    feeValue: BASE_FEE_VALUE,
  };
}

/** Live roundFees from the FeeManager; falls back to the measured constant. */
async function liveRoundFees(totalMessageFees) {
  try {
    const pc = createPublicClient({ chain: testnetBradbury, transport: http(NODE_RPC_URL) });
    const distribution = {
      ...FEE_DISTRIBUTION,
      rotations: [...FEE_DISTRIBUTION.rotations],
      totalMessageFees,
    };
    const roundFees = await pc.readContract({
      address: testnetBradbury.feeManagerContract.address,
      abi: FEE_MANAGER_ABI,
      functionName: "calculateRoundFees",
      args: [distribution, 5n, 0n],
    });
    return BigInt(roundFees);
  } catch {
    return BASE_FEE_VALUE;
  }
}

/** Fees for the one _pay-emitting call: withdraw_claim (payee = caller). */
export async function payoutFees(payee) {
  const roundFees = await liveRoundFees(PAYOUT_BUDGET);
  const feeParams = encodeExternalMessageFeeParams({
    gasLimit: PAYOUT_GAS_LIMIT,
    maxGasPrice: PAYOUT_MAX_GAS_PRICE,
  });
  return {
    distribution: {
      ...FEE_DISTRIBUTION,
      rotations: [...FEE_DISTRIBUTION.rotations],
      totalMessageFees: PAYOUT_BUDGET,
    },
    messageAllocations: [
      {
        messageType: MessageType.External,
        onAcceptance: false,
        parentIndex: (1n << 256n) - 1n, // root
        recipient: payee,
        callKey: CALL_KEY_UNNAMED, // bare transfer: empty calldata -> zero key
        budget: PAYOUT_BUDGET,
        feeParams,
      },
    ],
    feeValue: roundFees + PAYOUT_BUDGET,
  };
}

// --- wallet ---------------------------------------------------------------
let activeProvider = null;
export function setWalletProvider(p) {
  activeProvider = p || null;
}
export function walletProvider() {
  return activeProvider || (typeof window !== "undefined" ? window.ethereum : null);
}

export async function connectWallet(provider) {
  const eth = provider || walletProvider();
  if (!eth) {
    throw new Error("No EVM wallet detected. Install MetaMask or Rabby first.");
  }
  // ORDER MATTERS — accounts FIRST, chain switch second. OKX (and other
  // in-app wallet browsers) require the site to be CONNECTED before any
  // other request: a chain-switch call from an unauthorised site is
  // silently dropped — no prompt, no error, the promise never settles.
  const accounts = await requestWithTimeout(eth, "eth_requestAccounts", null, "accounts");
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts authorized in wallet.");
  }
  try {
    await requestWithTimeout(eth, "wallet_switchEthereumChain", [{ chainId: CHAIN_ID_HEX }], "chain switch");
  } catch (err) {
    // OKX Mobile wraps an unrecognised custom chain in nested errors
    // instead of the standard 4902; all of these mean "not added yet".
    const code = err && err.code;
    const nestedCode = err && err.data && err.data.originalError && err.data.originalError.code;
    const msg = (err && err.message) || "";
    const chainNotAdded =
      code === 4902 ||
      code === -32603 ||
      nestedCode === 4902 ||
      /unrecognized chain|chain.*not added|4902/i.test(msg);
    if (chainNotAdded) {
      await requestWithTimeout(
        eth,
        "wallet_addEthereumChain",
        [
          {
            chainId: CHAIN_ID_HEX,
            chainName: CHAIN_NAME,
            rpcUrls: [NODE_RPC_URL],
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            blockExplorerUrls: [EXPLORER_URL],
          },
        ],
        "add chain"
      );
    } else {
      throw err;
    }
  }
  return accounts[0];
}

// A hung provider request must surface, never hang the tap.
function requestWithTimeout(provider, method, params, stepLabel, timeoutMs = 12000) {
  return Promise.race([
    provider.request(params ? { method, params } : { method }),
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `The wallet did not answer the ${stepLabel} request. No approval appeared — the wallet may be locked, or the request was blocked. Try again.`
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

// --- clients --------------------------------------------------------------
export function readClient() {
  return createClient({ chain: testnetBradbury, endpoint: NODE_RPC_URL });
}

export function writeClient(account) {
  return createClient({ chain: testnetBradbury, account, provider: walletProvider() });
}

// --- reads ----------------------------------------------------------------
// Contract views return JSON text, sometimes double-encoded (a quoted JSON
// string). parseResult unwraps one level; parseJson then parses it.
export function parseResult(raw) {
  if (typeof raw !== "string") return raw;
  const s = raw.trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    try {
      return JSON.parse(s);
    } catch {
      return s.slice(1, -1);
    }
  }
  return s;
}

export function parseJson(raw) {
  const s = parseResult(raw);
  if (typeof s !== "string") return s;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export async function readView(functionName, args = [], address) {
  const client = readClient();
  return client.readContract({ address: address || getEffectiveContract(), functionName, args });
}

export async function readJsonView(functionName, args = [], address) {
  return parseJson(await readView(functionName, args, address));
}

/** One automatic retry — a gen_call takes ~6s and Bradbury reads blip. */
export async function readJsonViewRetry(functionName, args = [], address) {
  try {
    return await readJsonView(functionName, args, address);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 2500));
    return readJsonView(functionName, args, address);
  }
}

export async function ethBalance(address) {
  const r = await fetch(NODE_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [address, "latest"] }),
  });
  const j = await r.json();
  if (typeof j.result !== "string") throw new Error("eth_getBalance failed");
  return BigInt(j.result);
}

// --- writes ---------------------------------------------------------------
function hexToUtf8(s) {
  try {
    const hex = s.startsWith("0x") ? s.slice(2) : s;
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) return null;
    const bytes = Uint8Array.from(hex.match(/.{2}/g).map((b) => parseInt(b, 16)));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Pull the honest outcome out of a finalized receipt: the execution name,
 * the contract's return text when it is recoverable, and a raised error
 * code when one appears in the leader receipt. Nothing is invented — a
 * field that can't be read comes back null and callers fall back to
 * re-reading chain state (which is the source of truth anyway).
 */
export function extractOutcome(receipt) {
  const out = { execName: null, returnText: null, errorCode: null };
  if (!receipt) return out;
  out.execName = receipt.txExecutionResultName || receipt.execName || null;
  const leaders =
    (receipt.consensus_data && receipt.consensus_data.leader_receipt) ||
    receipt.leader_receipt ||
    [];
  const texts = [];
  for (const lr of Array.isArray(leaders) ? leaders : []) {
    for (const field of [lr && lr.error, lr && lr.result]) {
      if (typeof field === "string" && field) {
        texts.push(field);
        const decoded = hexToUtf8(field);
        if (decoded) texts.push(decoded);
      }
    }
  }
  const blob = texts.join("\n");
  if (blob) {
    for (const code of ERROR_CODES) {
      if (blob.includes(code)) {
        out.errorCode = code;
        break;
      }
    }
    for (const prefix of RETURN_PREFIXES) {
      const i = blob.indexOf(prefix);
      if (i >= 0) {
        out.returnText = blob.slice(i, i + 220).split("\n")[0];
        break;
      }
    }
  }
  return out;
}

/**
 * Send a write and wait for FINALIZED consensus.
 * `fees` must be payoutFees(payee) for withdraw_claim, baseFees() otherwise.
 * Resolves with { hash, receipt, outcome }. Throws with a readable
 * message when the wallet/SDK rejects before a hash exists.
 */
export async function sendWrite(account, functionName, args = [], value = 0n, fees = null, opts = {}) {
  const client = writeClient(account);
  const hash = await client.writeContract({
    address: opts.address || getEffectiveContract(),
    functionName,
    args,
    value,
    fees: fees || baseFees(),
  });
  if (typeof opts.onHash === "function") {
    try {
      opts.onHash(hash);
    } catch {
      // A progress hook must never break the write.
    }
  }
  let receipt = null;
  try {
    receipt = await client.waitForTransactionReceipt({
      hash,
      waitUntil: "finalized",
      retries: 360,
      interval: 5000,
    });
  } catch {
    // Receipt polling can time out on slow consensus; the tx hash is still
    // usable in the explorer, so don't fail the whole flow here.
  }
  return { hash, receipt, outcome: extractOutcome(receipt) };
}

export function friendlyError(err) {
  const msg = (err && (err.shortMessage || err.message)) || "Transaction failed.";
  return msg.length > 220 ? msg.slice(0, 220) + "…" : msg;
}

export { TransactionStatus };
