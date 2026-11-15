// Shared building blocks — every one renders chain data only.
import React, { useEffect, useState } from "react";
import { explorerAddressUrl, explorerTxUrl } from "../lib/config.js";
import { formatGen, weiString } from "../lib/money.js";
import { fmtDateTimeBoth, remainingText, windowFraction } from "../lib/time.js";
import { verifyEvidence } from "../lib/evidence.js";
import { fetchTxByHash } from "../lib/activity.js";

export const shortAddress = (addr) =>
  !addr || addr.length < 12 ? addr || "" : `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export function copyText(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch {}
}

/** Address: truncated, tap copies the full address, explorer link beside. */
export function Addr({ address, you = false, role = null }) {
  const [copied, setCopied] = useState(false);
  if (!address) return <span className="v">—</span>;
  return (
    <span className="addrwrap">
      <span
        className="mono addrcopy"
        title="Tap to copy the full address"
        onClick={() => {
          copyText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        {shortAddress(address)}
      </span>
      {copied && <span className="copied">Copied</span>}
      {you && <span className="tag">You</span>}
      {role && <span className="tag">{role}</span>}
      <a
        className="extlink"
        href={explorerAddressUrl(address)}
        target="_blank"
        rel="noreferrer"
        aria-label="View address on the explorer"
      >
        ↗
      </a>
    </span>
  );
}

/** SHA-256: first 8 + last 4, tap copies the full fingerprint. */
export function HashChip({ hash }) {
  const [copied, setCopied] = useState(false);
  if (!hash) return <span className="v">—</span>;
  const short = hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
  return (
    <span className="addrwrap">
      <span
        className="mono addrcopy"
        title="Tap to copy the full fingerprint"
        onClick={() => {
          copyText(hash);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        {short}
      </span>
      {copied && <span className="copied">Copied</span>}
    </span>
  );
}

/** "Verify" affordance: re-fetch the file and compare its fingerprint. */
export function VerifyHash({ url, sha }) {
  const [state, setState] = useState(null); // { state, actual } | "working"
  if (!url || !sha) return null;
  return (
    <span className="verifywrap">
      <button
        type="button"
        className="textbtn"
        disabled={state === "working"}
        onClick={async () => {
          setState("working");
          setState(await verifyEvidence(url, sha));
        }}
      >
        {state === "working" ? "Checking…" : "Verify fingerprint"}
      </button>
      {state && state !== "working" && (
        <span className="verifystate">
          {state.state === "match" && "✓ The file at the link matches the fingerprint on chain."}
          {state.state === "mismatch" && "✗ The file at the link does NOT match the fingerprint on chain."}
          {state.state === "failed" && "Couldn't fetch the file to check it."}
        </span>
      )}
    </span>
  );
}

/** A GEN amount. Tap reveals the exact wei string (SPEC §5). */
export function Amt({ wei, className = "amt" }) {
  const [exact, setExact] = useState(false);
  let w = 0n;
  try {
    w = BigInt(wei ?? 0);
  } catch {}
  return (
    <span
      className={`${className} amttap`}
      title="Tap for the exact wei value"
      onClick={() => setExact((e) => !e)}
    >
      {formatGen(w)} <small>GEN</small>
      {exact && <span className="weiexact">{weiString(w)}</span>}
    </span>
  );
}

const CHIP_CLASS = {
  OPEN: "open",
  ADJUDICATED: "adj",
  APPEALING: "appeal",
  SETTLED: "settled",
  CANCELLED: "denied",
  EXPIRED: "denied",
  ACTIVE: "settled",
  CLOSED: "denied",
};
const CHIP_WORD = {
  OPEN: "Open",
  ADJUDICATED: "Adjudicated",
  APPEALING: "Appealing",
  SETTLED: "Settled",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

/** Status chip: a word + a dot, never colour alone. */
export function Chip({ status }) {
  return (
    <span className={`chip ${CHIP_CLASS[status] || "open"}`}>
      <i></i>
      {CHIP_WORD[status] || status}
    </span>
  );
}

/** Pool health bar: available vs reserved, legend amounts sum to total. */
export function PoolBar({ unreservedWei, reservedWei, totalLabel }) {
  const un = BigInt(unreservedWei || "0");
  const res = BigInt(reservedWei || "0");
  const total = un + res;
  const pct = (part) => (total === 0n ? 0 : Number((part * 10000n) / total) / 100);
  return (
    <div>
      <div className="row">
        <span className="k" style={{ fontWeight: 700, color: "var(--ink)" }}>
          Pool health
        </span>
        <Amt wei={total} />
      </div>
      {totalLabel && <div className="hint" style={{ margin: "2px 0 0" }}>{totalLabel}</div>}
      <div className="bar">
        <div className="seg avail" style={{ "--p": `${pct(un)}%` }}></div>
        <div className="seg resv" style={{ "--p": `${pct(res)}%` }}></div>
      </div>
      <div className="legend">
        <span>
          <i className="a"></i>Available · {formatGen(un)} GEN
        </span>
        <span>
          <i className="r"></i>Reserved for claims · {formatGen(res)} GEN
        </span>
      </div>
    </div>
  );
}

const STEP_LABELS = ["Filed", "Judged", "Appeal window", "Released", "Paid"];
const POS = ["p0", "p25", "p50", "p75", "p100"];

/** The lifecycle stepper — fill stops at the claim's true step. */
export function Stepper({ marks, currentLabel }) {
  const lastDone = marks.reduce((acc, m, i) => (m === "done" || m === "skip" ? i : acc), -1);
  const nowIdx = marks.indexOf("now");
  const fillTo = nowIdx >= 0 ? nowIdx : lastDone;
  const fillPct = fillTo <= 0 ? 2 : [2, 26, 50, 74, 98][fillTo];
  return (
    <div>
      <div className="stepper">
        <div className="track">
          <div className="fill" style={{ "--p": `${fillPct}%` }}></div>
        </div>
        {marks.map((m, i) => (
          <div
            key={i}
            className={`sdot ${m === "done" ? "done" : ""} ${m === "now" ? "now" : ""} ${m === "skip" ? "skip" : ""} ${POS[i]}`}
          ></div>
        ))}
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`slab ${marks[i] === "done" ? "done" : ""} ${marks[i] === "now" ? "cur" : ""} ${POS[i]}`}
          >
            {label}
          </div>
        ))}
      </div>
      {currentLabel && <div className="stepnote">{currentLabel}</div>}
    </div>
  );
}

/** The same five steps as mini dots for register/console rows. */
export function MiniSteps({ marks, label, labelColor }) {
  return (
    <div className="ministeps">
      {marks.map((m, i) => (
        <i key={i} className={m === "done" ? "on" : m === "now" ? "now" : m === "skip" ? "skip" : ""}></i>
      ))}
      {label && <span style={labelColor ? { color: labelColor } : undefined}>{label}</span>}
    </div>
  );
}

/** Appeal countdown: shrinking bar + "ends in …" + the exact end time. */
export function Countdown({ startUnix, endUnix, nowUnix, title = "Appeal window" }) {
  const frac = windowFraction(startUnix, endUnix, nowUnix);
  const rem = remainingText(endUnix, nowUnix);
  return (
    <div className="countbox">
      <b>{title}</b> —{" "}
      {rem.past ? (
        <>the window has ended · {fmtDateTimeBoth(endUnix)}</>
      ) : (
        <>
          ends in <b>{rem.text}</b> · {fmtDateTimeBoth(endUnix)}
        </>
      )}
      <div className="bar" style={{ marginTop: 10 }}>
        <div className="cdfill" style={{ "--p": `${Math.round(frac * 100)}%` }}></div>
      </div>
      <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 6 }}>
        {Math.round(frac * 100)}% of the window is left.
      </div>
    </div>
  );
}

/** The live dot — "this list comes from the contract's activity record". */
export function LiveWrap() {
  return (
    <span className="livewrap">
      <span className="livedot"></span>Live
    </span>
  );
}

export function PageHead({ title, line }) {
  return (
    <div className="pagehead">
      <h2>{title}</h2>
      <p className="hint" style={{ margin: 0 }}>
        {line}
      </p>
    </div>
  );
}

/** Skeleton in the section's own shape, shown only while really reading. */
export function Skeleton({ lines = 3, block = false }) {
  return (
    <div className="card" aria-label="Reading from the chain">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`sk skline ${i % 3 === 0 ? "w55" : i % 3 === 1 ? "w80" : "w35"}`}></div>
      ))}
      {block && <div className="sk skblock"></div>}
    </div>
  );
}

/**
 * Section wrapper: skeleton while reading (with the honest slow note
 * after ~8s), a section-local error + Retry, a specific empty state, or
 * the content. A NOT_FOUND/empty read is an empty state, never an error.
 */
export function SectionState({ loading, slow, error, onRetry, empty, emptyNode, skeleton, children }) {
  if (loading) {
    return (
      <div>
        {skeleton || <Skeleton />}
        {slow && <p className="hint" style={{ marginTop: 8 }}>Still reading from Bradbury — this can take a moment.</p>}
      </div>
    );
  }
  if (error) {
    return (
      <div className="card">
        <p className="hint" style={{ margin: 0 }}>
          This section couldn't be read from Bradbury.
        </p>
        <button type="button" className="btn ghost" style={{ marginTop: 12 }} onClick={onRetry}>
          Retry this section
        </button>
      </div>
    );
  }
  if (empty) return emptyNode || null;
  return children;
}

const STAGE_WORDS = {
  pending: "Submitted — with the network",
  proposing: "Proposing — the leader is running it",
  committing: "Committing — validators are voting",
  revealing: "Revealing — votes are being revealed",
  accepted: "Accepted — waiting for finalization",
  finalized: "Finalized",
  appeal_committing: "Appeal committing — validators are voting",
  appeal_revealing: "Appeal revealing — votes are being revealed",
  leader_revealing: "Revealing — votes are being revealed",
};

/**
 * A submitted tx's pending row: "Submitted — waiting for finalization ↗"
 * plus the live stage word polled from the explorer (real tx status,
 * never a scripted progression).
 */
export function PendingRow({ hash, jury = false }) {
  const [stage, setStage] = useState(null);
  useEffect(() => {
    if (!hash) return undefined;
    let stop = false;
    const poll = async () => {
      const tx = await fetchTxByHash(hash);
      if (!stop && tx && tx.status) setStage(STAGE_WORDS[String(tx.status).toLowerCase()] || null);
    };
    poll();
    const t = setInterval(poll, 12000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [hash]);
  return (
    <div className="pendingrow">
      <span className="livedot"></span>
      <span>
        {jury ? "Waiting for the validators… " : "Submitted — waiting for finalization "}
        {stage && <span className="stagename">· {stage}</span>}{" "}
        {hash && (
          <a href={explorerTxUrl(hash)} target="_blank" rel="noreferrer">
            View transaction ↗
          </a>
        )}
      </span>
    </div>
  );
}

/** A tx link for an activity row; approximate matches are labelled. */
export function TxLink({ match }) {
  if (!match || !match.hash) return null;
  return (
    <a className="txlink" href={explorerTxUrl(match.hash)} target="_blank" rel="noreferrer">
      {match.exact ? "Transaction ↗" : "Likely transaction ↗"}
    </a>
  );
}
