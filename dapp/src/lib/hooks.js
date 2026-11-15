import { useCallback, useEffect, useRef, useState } from "react";

/**
 * One chain-read section's state: loading (with an honest "slow" flag
 * after ~8s — a gen_call takes ~6s), error with section-local retry, and
 * data. Switching wallet/route/contract changes `deps`, which immediately
 * replaces the old data with a reading state (no stale records shown).
 */
export function useChainRead(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, slow: false, error: null });
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, slow: false, error: null });
    const slowTimer = setTimeout(() => {
      if (!cancelled) setState((s) => (s.loading ? { ...s, slow: true } : s));
    }, 8000);
    (async () => {
      try {
        const data = await fetcherRef.current();
        if (!cancelled) setState({ data, loading: false, slow: false, error: null });
      } catch (e) {
        if (!cancelled) {
          setState({ data: null, loading: false, slow: false, error: e?.message || "The read failed." });
        }
      } finally {
        clearTimeout(slowTimer);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry };
}

/** A `now` in unix seconds, re-derived on a tick — countdowns render from
 * chain timestamps against this, never from a free-running local timer. */
export function useNow(tickSeconds = 30) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), tickSeconds * 1000);
    return () => clearInterval(t);
  }, [tickSeconds]);
  return now;
}
