import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type QueryKey = readonly unknown[];

type QueryFunction<TData> = () => Promise<TData> | TData;

type UseQueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  enabled?: boolean;
};

type UseQueryResult<TData> = {
  data: TData | undefined;
  error: unknown;
  isLoading: boolean;
  refetch: () => Promise<TData | undefined>;
};

type MutationFunction<TVariables, TData> = (variables: TVariables | undefined) => Promise<TData> | TData;

type UseMutationOptions<TVariables, TData> = {
  mutationFn: MutationFunction<TVariables, TData>;
  onSuccess?: (data: TData, variables: TVariables | undefined) => void;
};

type UseMutationResult<TVariables, TData> = {
  mutate: (variables?: TVariables) => Promise<TData>;
  mutateAsync: (variables?: TVariables) => Promise<TData>;
  isPending: boolean;
  isLoading: boolean;
  error: unknown;
};

type InvalidateOptions = {
  queryKey: QueryKey;
};

const serializeKey = (key: QueryKey) => JSON.stringify(key);

class SimpleQueryClient {
  private cache = new Map<string, unknown>();
  private listeners = new Map<string, Set<() => void>>();

  getQueryData<TData>(key: QueryKey): TData | undefined {
    return this.cache.get(serializeKey(key)) as TData | undefined;
  }

  setQueryData<TData>(key: QueryKey, data: TData) {
    this.cache.set(serializeKey(key), data);
  }

  invalidateQueries({ queryKey }: InvalidateOptions) {
    const id = serializeKey(queryKey);
    const listeners = this.listeners.get(id);
    if (!listeners) {
      return;
    }
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });
  }

  subscribe(key: QueryKey, listener: () => void) {
    const id = serializeKey(key);
    const listeners = this.listeners.get(id) ?? new Set<() => void>();
    listeners.add(listener);
    this.listeners.set(id, listeners);
    return () => {
      const nextListeners = this.listeners.get(id);
      if (!nextListeners) {
        return;
      }
      nextListeners.delete(listener);
      if (nextListeners.size === 0) {
        this.listeners.delete(id);
      }
    };
  }
}

const QueryClientContext = createContext<SimpleQueryClient | null>(null);

export class QueryClient extends SimpleQueryClient {}

export function QueryClientProvider({ client, children }: { client: QueryClient; children: ReactNode }) {
  return <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>;
}

export function useQueryClient(): QueryClient {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error('useQueryClient must be used within a QueryClientProvider');
  }
  return client as QueryClient;
}

export function useQuery<TData>({ queryKey, queryFn, enabled = true }: UseQueryOptions<TData>): UseQueryResult<TData> {
  const client = useQueryClient();
  const [state, setState] = useState<{ data: TData | undefined; error: unknown; isLoading: boolean }>(() => {
    const cached = client.getQueryData<TData>(queryKey);
    return {
      data: cached,
      error: undefined,
      isLoading: enabled && !cached,
    };
  });

  const keyRef = useRef(queryKey);
  keyRef.current = queryKey;

  const runQuery = useCallback(async () => {
    if (!enabled) {
      return state.data;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const result = await Promise.resolve(queryFn());
      client.setQueryData(keyRef.current, result);
      setState({ data: result, error: undefined, isLoading: false });
      return result;
    } catch (error) {
      setState((prev) => ({ ...prev, error, isLoading: false }));
      return undefined;
    }
  }, [client, enabled, queryFn, state.data]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    if (enabled) {
      runQuery();
      unsub = client.subscribe(queryKey, runQuery);
    }
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [client, enabled, queryKey, runQuery]);

  return useMemo(
    () => ({
      data: state.data,
      error: state.error,
      isLoading: state.isLoading,
      refetch: runQuery,
    }),
    [state.data, state.error, state.isLoading, runQuery]
  );
}

export function useMutation<TVariables, TData>({
  mutationFn,
  onSuccess,
}: UseMutationOptions<TVariables, TData>): UseMutationResult<TVariables, TData> {
  const [state, setState] = useState<{ isPending: boolean; error: unknown }>({ isPending: false, error: undefined });

  const execute = useCallback(
    async (variables?: TVariables) => {
      setState({ isPending: true, error: undefined });
      try {
        const result = await Promise.resolve(mutationFn(variables));
        onSuccess?.(result as TData, variables);
        setState({ isPending: false, error: undefined });
        return result as TData;
      } catch (error) {
        setState({ isPending: false, error });
        throw error;
      }
    },
    [mutationFn, onSuccess]
  );

  return useMemo(
    () => ({
      mutate: (variables?: TVariables) => execute(variables),
      mutateAsync: (variables?: TVariables) => execute(variables),
      isPending: state.isPending,
      isLoading: state.isPending,
      error: state.error,
    }),
    [execute, state.error, state.isPending]
  );
}

export type { QueryKey };
