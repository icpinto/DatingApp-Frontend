import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACCOUNT_LIFECYCLE,
  fetchAccountLifecycleStatus,
} from "../../domain/accountLifecycle";

const noop = () => {};

export const AccountLifecycleContext = createContext({
  status: null,
  loading: false,
  error: null,
  refresh: noop,
  setStatus: noop,
  isDeactivated: false,
});

export const AccountLifecycleProvider = ({ children }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus(null);
      setError(null);
      return null;
    }

    setLoading(true);
    try {
      const result = await fetchAccountLifecycleStatus();
      if (!isMountedRef.current) {
        return result?.status ?? null;
      }
      setStatus(result?.status ?? null);
      setError(null);
      return result?.status ?? null;
    } catch (err) {
      console.error("Failed to load account lifecycle status", err);
      if (!isMountedRef.current) {
        return null;
      }
      setError(err);
      setStatus(null);
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleAuthTokenChange = () => {
      refresh();
    };

    window.addEventListener("auth-token-changed", handleAuthTokenChange);
    return () => {
      window.removeEventListener("auth-token-changed", handleAuthTokenChange);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      status,
      loading,
      error,
      refresh,
      setStatus,
      isDeactivated: status === ACCOUNT_LIFECYCLE.DEACTIVATED,
    }),
    [status, loading, error, refresh]
  );

  return (
    <AccountLifecycleContext.Provider value={value}>
      {children}
    </AccountLifecycleContext.Provider>
  );
};

export const useAccountLifecycle = () => {
  return useContext(AccountLifecycleContext);
};
