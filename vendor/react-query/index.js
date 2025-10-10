const React = require("react");

const QueryClientContext = React.createContext(null);

const hashKey = (key) => {
  if (Array.isArray(key)) {
    return JSON.stringify(key);
  }
  if (key === undefined || key === null) {
    return JSON.stringify([]);
  }
  return JSON.stringify([key]);
};

class QueryClient {
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
    this._notify(key);
  }

  invalidateQueries({ queryKey }) {
    const key = hashKey(queryKey);
    this._notify(key);
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
      const listeners = this.listeners.get(key);
      if (!listeners) {
        return;
      }
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  _notify(key) {
    const listeners = this.listeners.get(key);
    if (!listeners) {
      return;
    }
    Array.from(listeners).forEach((listener) => {
      try {
        listener();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Query listener error", error);
      }
    });
  }
}

const QueryClientProvider = ({ client, children }) => {
  if (!client) {
    throw new Error("QueryClientProvider requires a client instance");
  }
  return React.createElement(
    QueryClientContext.Provider,
    { value: client },
    children
  );
};

const useQueryClient = () => {
  const client = React.useContext(QueryClientContext);
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider");
  }
  return client;
};

const useQuery = ({ queryKey, queryFn, enabled = true, select }) => {
  const client = useQueryClient();
  const stableKey = React.useMemo(() => hashKey(queryKey), [queryKey]);
  const [state, setState] = React.useState(() => {
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

  const runFetch = React.useCallback(async () => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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
};

const useMutation = ({ mutationFn, onSuccess, onError }) => {
  const client = useQueryClient();
  const [isPending, setIsPending] = React.useState(false);

  const mutateAsync = React.useCallback(
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
    [client, mutationFn, onSuccess, onError]
  );

  return {
    mutateAsync,
    isPending,
  };
};

module.exports = {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  useQuery,
  useMutation,
};
