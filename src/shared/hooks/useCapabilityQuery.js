import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUserCapabilities, useUserContext } from "../context/UserContext";
import { trackExternalRequest } from "../services/api";
import { isAbortError } from "../../utils/http";

const DEFAULT_STALE_TIME = 30_000;
const DEFAULT_CACHE_TIME = 5 * 60_000;

const queryCache = new Map();

const normalizeCapabilities = (requirements) => {
  if (!requirements) {
    return [];
  }
  if (Array.isArray(requirements)) {
    return requirements.filter(Boolean);
  }
  return [requirements].filter(Boolean);
};

const stableSerialize = (key) => {
  if (typeof key === "string") {
    return key;
  }
  try {
    return JSON.stringify(key);
  } catch (error) {
    return String(key);
  }
};

const getOrCreateEntry = (serializedKey, initialData) => {
  let entry = queryCache.get(serializedKey);
  if (!entry) {
    const hasInitialData = initialData !== undefined;
    entry = {
      key: serializedKey,
      data: initialData,
      error: null,
      status: hasInitialData ? "success" : "idle",
      updatedAt: hasInitialData ? Date.now() : 0,
      listeners: new Set(),
      subscribers: 0,
      fetchPromise: null,
      fetchController: null,
      gcTimeout: null,
    };
    queryCache.set(serializedKey, entry);
  }
  return entry;
};

const clearEntry = (serializedKey) => {
  const entry = queryCache.get(serializedKey);
  if (!entry) {
    return;
  }
  if (entry.gcTimeout) {
    clearTimeout(entry.gcTimeout);
  }
  entry.listeners.clear();
  queryCache.delete(serializedKey);
};

const scheduleGarbageCollection = (entry, cacheTime) => {
  if (entry.gcTimeout) {
    clearTimeout(entry.gcTimeout);
  }

  if (!Number.isFinite(cacheTime) || cacheTime <= 0) {
    clearEntry(entry.key);
    return;
  }

  entry.gcTimeout = setTimeout(() => {
    if (entry.subscribers === 0) {
      clearEntry(entry.key);
    }
  }, cacheTime);
};

const notifyListeners = (entry) => {
  entry.listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      // Listener errors should not break the notification loop.
    }
  });
};

const isStale = (entry, staleTime) => {
  if (!entry || entry.updatedAt === 0) {
    return true;
  }
  if (!Number.isFinite(staleTime) || staleTime <= 0) {
    return false;
  }
  return Date.now() - entry.updatedAt > staleTime;
};

const resolveRefetchInterval = (interval, entry, enabled) => {
  if (!enabled || interval === undefined || interval === null) {
    return undefined;
  }

  if (typeof interval === "function") {
    return () => interval({
      data: entry.data,
      error: entry.error,
      status: entry.status,
      updatedAt: entry.updatedAt,
    });
  }

  return interval;
};

export const useCapabilityQuery = (
  requiredCapabilities,
  queryKey,
  queryFn,
  options = {}
) => {
  const {
    enabled: baseEnabled = true,
    staleTime: staleTimeOption,
    cacheTime: cacheTimeOption,
    refetchInterval: refetchIntervalOption,
    initialData,
    meta,
  } = options;

  const { hasCapability } = useUserCapabilities();
  const { user } = useUserContext();
  const accountScopeKey = useMemo(() => {
    const rawUser = user?.raw || {};
    return (
      rawUser.id ??
      rawUser.userId ??
      rawUser.user_id ??
      rawUser.accountId ??
      rawUser.account_id ??
      rawUser.account?.id ??
      rawUser.email ??
      rawUser.username ??
      "anonymous"
    );
  }, [user]);
  const normalizedCapabilities = useMemo(
    () => normalizeCapabilities(requiredCapabilities),
    [requiredCapabilities]
  );

  const capabilityReady = useMemo(
    () => normalizedCapabilities.every((capability) => hasCapability(capability)),
    [normalizedCapabilities, hasCapability]
  );

  const enabled = capabilityReady && baseEnabled;
  const serializedKey = useMemo(
    () => stableSerialize([accountScopeKey, queryKey]),
    [accountScopeKey, queryKey]
  );

  const entryRef = useRef();
  if (!entryRef.current || entryRef.current.key !== serializedKey) {
    entryRef.current = getOrCreateEntry(serializedKey, initialData);
  }
  const entry = entryRef.current;

  const staleTime =
    typeof staleTimeOption === "number" ? staleTimeOption : DEFAULT_STALE_TIME;
  const cacheTime =
    typeof cacheTimeOption === "number" ? cacheTimeOption : DEFAULT_CACHE_TIME;

  const [snapshot, setSnapshot] = useState(() => ({
    data: entry.data,
    error: entry.error,
    status: entry.status,
    updatedAt: entry.updatedAt,
  }));

  useEffect(() => {
    entry.subscribers += 1;
    if (entry.gcTimeout) {
      clearTimeout(entry.gcTimeout);
      entry.gcTimeout = null;
    }

    const listener = () => {
      setSnapshot({
        data: entry.data,
        error: entry.error,
        status: entry.status,
        updatedAt: entry.updatedAt,
      });
    };

    entry.listeners.add(listener);

    listener();

    return () => {
      entry.listeners.delete(listener);
      entry.subscribers -= 1;
      if (entry.subscribers <= 0) {
        scheduleGarbageCollection(entry, cacheTime);
      }
    };
  }, [entry, cacheTime]);

  const startFetch = useCallback(
    (force = false) => {
      if (!enabled) {
        if (entry.fetchController) {
          entry.fetchController.abort("capability-disabled");
          entry.fetchController = null;
        }
        return Promise.resolve(entry.data);
      }

      if (entry.fetchPromise) {
        return entry.fetchPromise;
      }

      if (!force && entry.status === "success" && !isStale(entry, staleTime)) {
        return Promise.resolve(entry.data);
      }

      const controller = new AbortController();
      entry.fetchController = controller;
      const unregister = trackExternalRequest(controller);
      entry.status = entry.status === "success" ? "success" : "loading";
      notifyListeners(entry);

      const promise = Promise.resolve()
        .then(() =>
          queryFn({
            signal: controller.signal,
            queryKey,
            meta,
          })
        )
        .then((result) => {
          entry.data = result;
          entry.error = null;
          entry.status = "success";
          entry.updatedAt = Date.now();
          notifyListeners(entry);
          return result;
        })
        .catch((error) => {
          if (isAbortError(error)) {
            return Promise.reject(error);
          }
          entry.error = error;
          entry.status = "error";
          entry.updatedAt = Date.now();
          notifyListeners(entry);
          return Promise.reject(error);
        })
        .finally(() => {
          entry.fetchPromise = null;
          entry.fetchController = null;
          unregister();
        });

      entry.fetchPromise = promise;
      return promise;
    },
    [enabled, entry, meta, queryFn, queryKey, staleTime]
  );

  useEffect(() => {
    if (!enabled) {
      if (entry.fetchController) {
        entry.fetchController.abort("capability-disabled");
        entry.fetchController = null;
      }
      return;
    }

    if (entry.status === "idle" || isStale(entry, staleTime)) {
      startFetch();
    }
  }, [enabled, entry, staleTime, startFetch]);

  useEffect(() => {
    const intervalOption = resolveRefetchInterval(
      refetchIntervalOption,
      entry,
      enabled
    );

    if (!enabled || intervalOption === undefined || intervalOption === false) {
      return () => {};
    }

    let cancelled = false;
    let timeoutId;

    const schedule = () => {
      if (cancelled) {
        return;
      }

      const intervalValue =
        typeof intervalOption === "function"
          ? intervalOption()
          : intervalOption;

      if (!intervalValue || intervalValue <= 0) {
        return;
      }

      timeoutId = setTimeout(async () => {
        try {
          await startFetch(true);
        } catch (error) {
          if (!isAbortError(error)) {
            // Swallow errors during background refetches.
          }
        }
        schedule();
      }, intervalValue);
    };

    schedule();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, entry, refetchIntervalOption, startFetch]);

  const refetch = useCallback(
    (options = {}) => {
      const { force = false } = options;
      return startFetch(force);
    },
    [startFetch]
  );

  const state = useMemo(
    () => ({
      data: snapshot.data,
      error: snapshot.error,
      status: snapshot.status,
      isLoading: snapshot.status === "loading",
      isSuccess: snapshot.status === "success",
      isError: snapshot.status === "error",
      updatedAt: snapshot.updatedAt,
      refetch,
      enabled,
    }),
    [snapshot.data, snapshot.error, snapshot.status, snapshot.updatedAt, refetch, enabled]
  );

  return state;
};

export default useCapabilityQuery;
