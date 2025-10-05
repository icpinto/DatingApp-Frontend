import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/api";
import { useAccountLifecycle } from "./AccountLifecycleContext";
import {
  deriveCapabilities,
  normalizeAccountStatus,
  normalizeUserFacts,
} from "./userCapabilities";

const noop = () => {};


const defaultContextValue = {
  user: {
    id: null,
    facts: {
      account: null,
      billing: null,
      verification: null,
      role: null,
      capabilities: [],
    },
  },
  capabilities: {},
  loading: false,
  error: null,
  refresh: noop,
  setFacts: noop,
  hasCapability: () => false,
};

const UserContext = createContext(defaultContextValue);

export const UserProvider = ({ children }) => {
  const { status: accountStatus, loading: accountLoading } = useAccountLifecycle();
  const [facts, setFacts] = useState(defaultContextValue.user.facts);
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem("user_id");
    return stored ? Number(stored) || stored : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resolvedFacts = useMemo(() => {
    const normalized = normalizeUserFacts(facts);
    const account =
      accountStatus != null && accountStatus !== ""
        ? normalizeAccountStatus(accountStatus)
        : normalized.account;
    return {
      ...normalized,
      account,
    };
  }, [facts, accountStatus]);

  const capabilities = useMemo(
    () => deriveCapabilities({ ...resolvedFacts }),
    [resolvedFacts]
  );

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (isMountedRef.current) {
        setFacts(defaultContextValue.user.facts);
        setUserId(null);
        setError(null);
      }
      return null;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `${token}` };
      const response = await api.get("/user/context", { headers });
      const payload = response?.data ?? {};
      const normalizedFacts = normalizeUserFacts(payload);
      const idCandidate =
        payload.user_id ?? payload.id ?? payload.userId ?? localStorage.getItem("user_id");
      if (isMountedRef.current) {
        setFacts((previous) => ({
          ...previous,
          ...normalizedFacts,
        }));
        if (idCandidate != null) {
          const parsedId = Number(idCandidate);
          setUserId(Number.isNaN(parsedId) ? idCandidate : parsedId);
        }
        setError(null);
      }
      return normalizedFacts;
    } catch (err) {
      console.error("Failed to fetch user context", err);
      if (isMountedRef.current) {
        setError(err);
      }
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
      const stored = localStorage.getItem("user_id");
      setUserId(stored ? Number(stored) || stored : null);
    };

    window.addEventListener("auth-token-changed", handleAuthTokenChange);
    return () => {
      window.removeEventListener("auth-token-changed", handleAuthTokenChange);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      user: { id: userId, facts: resolvedFacts },
      capabilities,
      loading: loading || accountLoading,
      error,
      refresh,
      setFacts,
      hasCapability: (capability) => Boolean(capabilities?.[capability]),
    }),
    [userId, resolvedFacts, capabilities, loading, accountLoading, error, refresh]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);

export const useCapabilities = () => {
  const { capabilities } = useUserContext();
  return capabilities;
};

export const Guard = ({ can, fallback = null, children, mode = "render" }) => {
  const { capabilities } = useUserContext();
  const required = Array.isArray(can) ? can : [can];
  const isAllowed = required.every((capability) => Boolean(capabilities?.[capability]));

  if (mode === "disable") {
    if (typeof children === "function") {
      return children({ allowed: isAllowed });
    }
    if (React.isValidElement(children)) {
      const existingDisabled =
        typeof children.props?.disabled === "boolean"
          ? children.props.disabled
          : Boolean(children.props?.disabled);
      return React.cloneElement(children, {
        disabled: existingDisabled || !isAllowed,
      });
    }
    return children ?? null;
  }

  if (isAllowed) {
    return <>{typeof children === "function" ? children({ allowed: true }) : children}</>;
  }

  if (typeof fallback === "function") {
    return <>{fallback({ allowed: false })}</>;
  }

  return <>{fallback}</>;
};

export const IfPaid = ({ children, fallback = null, mode }) => (
  <Guard can="accessPremium" fallback={fallback} mode={mode}>
    {children}
  </Guard>
);

export const IfVerified = ({ children, fallback = null, mode }) => (
  <Guard can="respondToMatchRequests" fallback={fallback} mode={mode}>
    {children}
  </Guard>
);

export const IfAdmin = ({ children, fallback = null, mode }) => (
  <Guard can="manageUsers" fallback={fallback} mode={mode}>
    {children}
  </Guard>
);

export { deriveCapabilities, normalizeUserFacts } from "./userCapabilities";

export default UserContext;
