import { useCallback, useEffect, useRef, useState } from "react";

type State<T> = {
  items: T[];
  loading: boolean;
  refreshing: boolean;
  error: unknown;
};

/**
 * Debounced, race-safe list loader: only the latest request's result is applied,
 * failures are captured instead of leaving `loading` stuck, and unmounts are ignored.
 */
export function useAsyncList<T, Q>(
  fetcher: (query: Q, signal: { cancelled: boolean }) => Promise<T[]>,
  query: Q,
  deps: unknown[],
  debounceMs = 250,
) {
  const [state, setState] = useState<State<T>>({ items: [], loading: true, refreshing: false, error: null });
  const seq = useRef(0);
  const alive = useRef(true);
  const latestQuery = useRef(query);
  latestQuery.current = query;

  const run = useCallback(
    async (mode: "load" | "refresh") => {
      const id = ++seq.current;
      const token = { cancelled: false };
      setState((s) => ({
        ...s,
        loading: mode === "load",
        refreshing: mode === "refresh",
        error: mode === "load" ? null : s.error,
      }));
      try {
        const items = await fetcher(latestQuery.current, token);
        if (!alive.current || id !== seq.current) return;
        setState({ items, loading: false, refreshing: false, error: null });
      } catch (error) {
        if (!alive.current || id !== seq.current) return;
        setState((s) => ({ ...s, loading: false, refreshing: false, error }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetcher],
  );

  useEffect(() => {
    alive.current = true;
    const t = setTimeout(() => run("load"), debounceMs);
    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  return {
    ...state,
    reload: () => run("load"),
    refresh: () => run("refresh"),
  };
}
