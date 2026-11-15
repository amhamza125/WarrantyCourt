// Money — wei-exact, BigInt only, never floats (DAPP_SPEC §5).
// Chain values are wei strings (1 GEN = 10^18 wei).

export const WEI_PER_GEN = 10n ** 18n;

/**
 * Parse a user-entered GEN decimal string to wei (BigInt).
 * Returns { ok, wei, error } — rejects >18 decimal places, non-numeric
 * input, zero and negatives with the form message for each case.
 */
export function parseGenToWei(input) {
  const s = String(input ?? "").trim();
  if (!s) return { ok: false, wei: 0n, error: "Enter an amount." };
  if (!/^[0-9]+(\.[0-9]+)?$/.test(s)) {
    return { ok: false, wei: 0n, error: "Enter an amount like 0.02 — digits and one decimal point only." };
  }
  const [whole, frac = ""] = s.split(".");
  if (frac.length > 18) {
    return { ok: false, wei: 0n, error: "Too many decimal places — GEN amounts can have at most 18." };
  }
  const wei = BigInt(whole || "0") * WEI_PER_GEN + BigInt((frac + "0".repeat(18)).slice(0, 18) || "0");
  if (wei <= 0n) return { ok: false, wei: 0n, error: "Enter an amount above zero." };
  return { ok: true, wei, error: "" };
}

/**
 * Format a wei value as GEN per SPEC §5: up to 6 decimal places, trailing
 * zeros trimmed. Returns the numeric part only — callers add " GEN".
 * Amounts under 0.000001 GEN (but above zero) format as "<0.000001".
 */
export function formatGen(wei) {
  let w;
  try {
    w = BigInt(wei);
  } catch {
    return "0";
  }
  if (w === 0n) return "0";
  if (w < 1000000000000n) return "<0.000001"; // below display precision, still real
  const whole = w / WEI_PER_GEN;
  const frac = w % WEI_PER_GEN;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(18, "0").slice(0, 6).replace(/0+$/, "");
  return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
}

/** "0.02 GEN" style composed label. */
export function genLabel(wei) {
  return `${formatGen(wei)} GEN`;
}

/** Exact wei string for the tap-to-reveal on detail amounts. */
export function weiString(wei) {
  try {
    return `${BigInt(wei).toString()} wei`;
  } catch {
    return String(wei);
  }
}
