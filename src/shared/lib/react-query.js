import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const QueryClientContext = createContext(null);

const hashKey = (key) => {
  if (Array.isArray(key)) {
    return JSON.stringify(key);
  }
  if (key === undefined || key === null) {
    return JSON.stringify([]);
  }
  return JSON.stringify([key]);
};

export class QueryClient {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  getQueryData(queryKey) {
    const entry = this.cache.get(hashKey(queryKey));
    return entry ? entry.data : undefined;
  }

  setQueryData(queryKey, updater) {
    const key = hashKey(queryKey);
    const previous = this.cache.get(key)?.data;
    const next = typeof updater === "function" ? updater(previous) : updater;
    this.cache.set(key, { data: next });
    this.#notify(key);
  }

  invalidateQueries({ queryKey }) {
    const key = hashKey(queryKey);
    this.#notify(key);
  }

  subscribe(queryKey, listener) {
    const key = hashKey(queryKey);
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(listener);
    return () => {
      const currentListeners = this.listeners.get(key);
      if (!currentListeners) {
        return;
      }
      currentListeners.delete(listener);
      if (currentListeners.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  #notify(key) {
    const currentListeners = this.listeners.get(key);
    if (!currentListeners) {
      return;
    }
    Array.from(currentListeners).forEach((listener) => {
      try {
        listener();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Query listener error", error);
      }
    });
  }
}

export function QueryClientProvider({ client, children }) {
  if (!client) {
    throw new Error("QueryClientProvider requires a client instance");
  }
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient() {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider");
  }
  return client;
}

export function useQuery({ queryKey, queryFn, enabled = true, select }) {
  const client = useQueryClient();
  const stableKey = useMemo(() => hashKey(queryKey), [queryKey]);
  const [state, setState] = useState(() => {
    const cached = client.getQueryData(queryKey);
    if (cached !== undefined) {
      return {
        data: select ? select(cached) : cached,
        isLoading: false,
        error: null,
      };
    }
    return {
      data: undefined,
      isLoading: Boolean(enabled),
      error: null,
    };
  });

  const runFetch = useCallback(async () => {
    if (!enabled || typeof queryFn !== "function") {
      return state.data;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await queryFn();
      client.setQueryData(queryKey, result);
      const nextData = select ? select(result) : result;
      setState({ data: nextData, isLoading: false, error: null });
      return nextData;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
      return undefined;
    }
  }, [client, queryFn, queryKey, select, enabled, state.data]);

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return undefined;
    }
    let cancelled = false;
    runFetch().catch(() => {
      if (!cancelled) {
        // ignore errors here, already handled in state
      }
    });
    return () => {
      cancelled = true;
    };
  }, [stableKey, runFetch, enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    return client.subscribe(queryKey, () => {
      runFetch().catch(() => {
        // ignore errors in listener
      });
    });
  }, [client, queryKey, runFetch, enabled]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: runFetch,
  };
}

export function useMutation({ mutationFn, onSuccess, onError }) {
  const client = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async (variables) => {
      if (typeof mutationFn !== "function") {
        throw new Error("mutationFn must be a function");
      }
      setIsPending(true);
      try {
        const result = await mutationFn(variables);
        if (typeof onSuccess === "function") {
          await onSuccess(result, variables, client);
        }
        setIsPending(false);
        return result;
      } catch (error) {
        setIsPending(false);
        if (typeof onError === "function") {
          onError(error, variables, client);
        }
        throw error;
      }
    },
    [client, mutationFn, onSuccess, onError],
  );

  return {
    mutateAsync,
    isPending,
  };
}
