"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SessionState = {
  signedIn: boolean;
  firstName: string | null;
  cartCount: number;
  wishlistIds: string[];
};

type Ctx = SessionState & { loaded: boolean; refreshState: () => Promise<void> };

const initial: SessionState = { signedIn: false, firstName: null, cartCount: 0, wishlistIds: [] };
const SessionStateContext = createContext<Ctx>({ ...initial, loaded: false, refreshState: async () => {} });

/** Per-visitor UI state (bag count, saved items) loaded on the client so pages stay cacheable. */
export function SessionStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(initial);
  const [loaded, setLoaded] = useState(false);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch("/api/session-state", { cache: "no-store" });
      if (res.ok) setState(await res.json());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const value = useMemo(() => ({ ...state, loaded, refreshState }), [state, loaded, refreshState]);
  return <SessionStateContext value={value}>{children}</SessionStateContext>;
}

export function useSessionState() {
  return useContext(SessionStateContext);
}
