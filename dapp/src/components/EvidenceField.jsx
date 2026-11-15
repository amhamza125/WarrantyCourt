// The evidence step (SPEC §3.3), shared by all three forms: paste the
// public URL — the app fetches the bytes itself, previews them, and
// computes the SHA-256. The file picker appears only when the fetch is
// blocked (CORS), with the exact-bytes warning. A fingerprint can also be
// pasted directly (normalised: case + whitespace; a 0x prefix is NOT
// stripped — the contract wants the bare 64 hex characters, and the form
// says so).
import React, { useEffect, useRef, useState } from "react";
import { fetchEvidence, hashLocalFile, urlProblem } from "../lib/evidence.js";

const KIND_LABEL = {
  terms: "warranty terms",
  receipt: "receipt",
  photo: "defect photo",
};

export function EvidenceField({ kind, label, onChange }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle|fetching|fetched|blocked|file|paste
  const [got, setGot] = useState(null); // { sha256, size, kind, previewText, objectUrl }
  const [fetchError, setFetchError] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteHash, setPasteHash] = useState("");
  const [pasteError, setPasteError] = useState("");
  const fileRef = useRef(null);
  const lastFetchedUrl = useRef("");

  useEffect(() => {
    if (got && url.trim()) onChange({ url: url.trim(), sha256: got.sha256, ready: true });
    else onChange({ url: url.trim(), sha256: "", ready: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [got, url]);

  const doFetch = async (target) => {
    const u = (target ?? url).trim();
    const problem = urlProblem(u);
    if (problem) {
      setFetchError(problem);
      setPhase("idle");
      setGot(null);
      return;
    }
    setPhase("fetching");
    setFetchError("");
    const res = await fetchEvidence(u);
    lastFetchedUrl.current = u;
    if (res.ok) {
      setGot(res);
      setPhase("fetched");
    } else if (res.blocked) {
      setGot(null);
      setFetchError(res.error);
      setPhase("blocked");
    } else {
      setGot(null);
      setFetchError(res.error);
      setPhase("idle");
    }
  };

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const hashed = await hashLocalFile(file);
    setGot(hashed);
    setPhase("file");
  };

  const applyPaste = (value) => {
    setPasteHash(value);
    const v = value.trim().toLowerCase();
    if (!v) {
      setPasteError("");
      return;
    }
    if (v.startsWith("0x")) {
      setPasteError("Remove the 0x — the fingerprint is the bare 64 characters.");
      return;
    }
    if (!/^[0-9a-f]{64}$/.test(v)) {
      setPasteError("A fingerprint is exactly 64 hex characters (0–9, a–f).");
      return;
    }
    setPasteError("");
    setGot({ sha256: v, size: null, kind: "paste", previewText: null, objectUrl: null });
    setPhase("paste");
  };

  return (
    <div className="field">
      <label className="flabel">{label}</label>
      <div className="search" style={{ marginBottom: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => {
            if (url.trim() && url.trim() !== lastFetchedUrl.current) doFetch();
          }}
          placeholder={`Public link to the ${KIND_LABEL[kind] || "file"} — https://…`}
          inputMode="url"
        />
        <button type="button" onClick={() => doFetch()} disabled={phase === "fetching"}>
          {phase === "fetching" ? "Fetching…" : "Fetch & fingerprint"}
        </button>
      </div>

      {kind === "photo" && (
        <div className="note" style={{ marginTop: 0, marginBottom: 10 }}>
          <b>Photo only on your phone?</b> The jury can only fetch public links, and this app doesn't host
          photos. Put the photo at a public link first — for example upload it to a public file host or a
          share link that anyone can open — then paste that link here. The app reads the file at the link
          and works out its fingerprint.
        </div>
      )}

      {fetchError && phase !== "blocked" && <p className="inlineerr">{fetchError}</p>}

      {phase === "blocked" && (
        <div className="msg warn">
          <b>Fetch blocked</b>
          {fetchError}
          <div style={{ marginTop: 8 }}>
            <button type="button" className="btn ghost" onClick={() => fileRef.current && fileRef.current.click()}>
              Pick the file to fingerprint it
            </button>
            <input ref={fileRef} type="file" hidden onChange={onFile} />
          </div>
        </div>
      )}

      {(phase === "fetched" || phase === "file" || phase === "paste") && got && (
        <div className="evidencepreview">
          {got.kind === "image" && got.objectUrl && (
            <img className="evidenceimg" src={got.objectUrl} alt={`${KIND_LABEL[kind] || "Evidence"} preview`} />
          )}
          {got.kind === "text" && got.previewText && <pre className="evidencepre">{got.previewText}</pre>}
          {got.kind === "pdf" && <div className="thumb">PDF file — fingerprinted from its exact bytes</div>}
          {got.kind === "file" && <div className="thumb">File read — fingerprinted from its exact bytes</div>}
          <div className="row">
            <span className="k">Fingerprint (SHA-256)</span>
            <span className="v mono hashshort">{got.sha256.slice(0, 8)}…{got.sha256.slice(-4)}</span>
          </div>
          <div className="row">
            <span className="k">{got.size != null ? `${got.size} bytes · ` : ""}Source</span>
            <span className="v">
              {phase === "fetched" && "Computed from the exact bytes at the link — the same bytes the jury will fetch"}
              {phase === "file" && "Computed from your local copy — it must be the same file as the one at the link"}
              {phase === "paste" && "Pasted by you — it must be the fingerprint of the file at the link"}
            </span>
          </div>
        </div>
      )}

      {!pasteMode ? (
        <button type="button" className="textbtn" onClick={() => setPasteMode(true)}>
          I already have the fingerprint
        </button>
      ) : (
        <div style={{ marginTop: 8 }}>
          <input
            className="textinput"
            value={pasteHash}
            onChange={(e) => applyPaste(e.target.value)}
            placeholder="Paste the SHA-256 fingerprint — 64 hex characters, no 0x"
          />
          {pasteError && <p className="inlineerr">{pasteError}</p>}
        </div>
      )}
    </div>
  );
}
