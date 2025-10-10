import * as React from "react";

export type QueryKey = readonly unknown[] | string | number | null | undefined;

export interface UseQueryOptions<TData, TSelected = TData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  select?: (data: TData) => TSelected;
}

export interface UseQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<TData | undefined>;
}

export interface UseMutationOptions<TVariables, TResult> {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  onSuccess?: (data: TResult, variables: TVariables, client: QueryClient) => void | Promise<void>;
  onError?: (error: unknown, variables: TVariables, client: QueryClient) => void | Promise<void>;
}

export interface UseMutationResult<TVariables, TResult> {
  mutateAsync: (variables: TVariables) => Promise<TResult>;
  isPending: boolean;
}

export interface QueryInvalidateOptions {
  queryKey: QueryKey;
}

export class QueryClient {
  constructor();
  getQueryData<T = unknown>(queryKey: QueryKey): T | undefined;
  setQueryData<T = unknown>(queryKey: QueryKey, data: T | ((old: T | undefined) => T)): void;
  invalidateQueries(options: QueryInvalidateOptions): void;
}

export interface QueryClientProviderProps {
  client: QueryClient;
  children?: React.ReactNode;
}

export declare function QueryClientProvider(props: QueryClientProviderProps): JSX.Element;
export declare function useQueryClient(): QueryClient;
export declare function useQuery<TData = unknown, TSelected = TData>(options: UseQueryOptions<TData, TSelected>): UseQueryResult<TSelected>;
export declare function useMutation<TVariables = unknown, TResult = unknown>(options: UseMutationOptions<TVariables, TResult>): UseMutationResult<TVariables, TResult>;
