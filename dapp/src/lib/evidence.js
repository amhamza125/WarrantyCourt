// Evidence step (DAPP_SPEC §3.3): URL-first in every form. The app fetches
// the bytes at the pasted public URL itself, previews them, and computes
// the SHA-256 of the exact bytes the jury will fetch. A local file picker
// is only the fallback when the fetch is blocked (CORS). The app never
// hosts evidence (§11).

export async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Light client-side mirror of the contract's URL rules (the chain's word is final). */
export function urlProblem(url) {
  const s = String(url || "").trim();
  if (!s) return "Paste the public link to the file.";
  if (s.length > 512) return "That link is too long (max 512 characters).";
  let u;
  try {
    u = new URL(s);
  } catch {
    return "Enter a valid http(s) link.";
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return "Enter a valid http(s) link.";
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host)
  ) {
    return "Private or local links aren't allowed — the jury must be able to fetch the file publicly.";
  }
  return null;
}

function kindOf(contentType, bytes) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.startsWith("image/")) return "image";
  if (ct.includes("pdf")) return "pdf";
  if (ct.startsWith("text/") || ct.includes("json")) return "text";
  // Magic bytes fallback when the server doesn't say.
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50) return "image";
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) return "image";
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "pdf";
  return "file";
}

/**
 * Fetch the file at `url` and hash it. Returns
 * { ok:true, sha256, size, kind, previewText, objectUrl } or
 * { ok:false, error, blocked:true } — blocked means the fetch itself
 * failed (usually CORS), which is when the file-picker fallback applies.
 */
export async function fetchEvidence(url, timeoutMs = 20000) {
  const problem = urlProblem(url);
  if (problem) return { ok: false, error: problem, blocked: false };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      return { ok: false, error: `That link answered with HTTP ${res.status} — the jury would hit the same wall.`, blocked: false };
    }
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const sha256 = await sha256Hex(bytes);
    const kind = kindOf(res.headers.get("content-type"), bytes);
    let previewText = null;
    let objectUrl = null;
    if (kind === "text") {
      previewText = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 1200));
    }
    if (kind === "image") {
      objectUrl = URL.createObjectURL(new Blob([bytes], { type: res.headers.get("content-type") || "image/png" }));
    }
    return { ok: true, sha256, size: bytes.length, kind, previewText, objectUrl };
  } catch (e) {
    return {
      ok: false,
      blocked: true,
      error:
        "The app couldn't fetch that link from the browser (the host may block cross-origin reads). You can pick the file below to compute its fingerprint instead — but the fingerprint must be of the exact file that lives at the link above.",
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Hash a locally picked file (the CORS fallback path). */
export async function hashLocalFile(file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const sha256 = await sha256Hex(bytes);
  const kind = kindOf(file.type, bytes);
  let objectUrl = null;
  if (kind === "image") objectUrl = URL.createObjectURL(file);
  return { sha256, size: bytes.length, kind, objectUrl };
}

/**
 * Verify affordance (§3.2/§3.4): re-fetch the file at `url` and compare
 * its SHA-256 with the one recorded on chain.
 * Returns { state: "match" | "mismatch" | "failed", actual }.
 */
export async function verifyEvidence(url, expectedSha) {
  const got = await fetchEvidence(url);
  if (!got.ok) return { state: "failed", actual: null };
  return {
    state: got.sha256.toLowerCase() === String(expectedSha || "").toLowerCase() ? "match" : "mismatch",
    actual: got.sha256,
  };
}
