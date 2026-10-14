import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const MAX_COMPARE = 3;

interface CompareApi {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Replace the selection, e.g. when a comparison link is opened. */
  setIds: (ids: string[]) => void;
  limitReached: boolean;
}

const CompareContext = createContext<CompareApi | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIdsState] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) {
        setLimitReached(false);
        setIdsState(ids.filter((x) => x !== id));
      } else if (ids.length >= MAX_COMPARE) {
        setLimitReached(true);
      } else {
        setLimitReached(false);
        setIdsState([...ids, id]);
      }
    },
    [ids],
  );

  const remove = useCallback((id: string) => {
    setLimitReached(false);
    setIdsState((prev) => prev.filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => {
    setLimitReached(false);
    setIdsState([]);
  }, []);

  const setIds = useCallback((next: string[]) => {
    setLimitReached(false);
    setIdsState(next.slice(0, MAX_COMPARE));
  }, []);

  const value = useMemo<CompareApi>(
    () => ({ ids, has: (id) => ids.includes(id), toggle, remove, clear, setIds, limitReached }),
    [ids, toggle, remove, clear, setIds, limitReached],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareApi {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
