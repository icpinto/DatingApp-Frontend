import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultUserSnapshot,
  normalizeSnapshotPayload,
} from "../../utils/userDimensions";
import { deriveCapabilities } from "../../utils/capabilities";

const noop = () => {};

const defaultSnapshot = normalizeSnapshotPayload(defaultUserSnapshot());

export const UserContext = createContext({
  user: defaultSnapshot,
  setUser: noop,
  capabilities: new Set(),
  hasCapability: () => false,
  getReason: () => undefined,
  reasons: {},
});

export const UserProvider = ({ children, initialUser, accountStatus }) => {
  const [snapshot, setSnapshot] = useState(() => {
    if (initialUser) {
      return normalizeSnapshotPayload(initialUser);
    }
    return defaultSnapshot;
  });

  useEffect(() => {
    if (!accountStatus) {
      return;
    }
    setSnapshot((previous) => {
      const raw = previous.raw || previous;
      if (raw.account === accountStatus) {
        return previous;
      }
      const nextRaw = { ...raw, account: accountStatus };
      return normalizeSnapshotPayload(nextRaw);
    });
  }, [accountStatus]);

  const updateUser = useCallback((nextUser) => {
    setSnapshot((previous) => {
      const raw = previous.raw || previous;
      const nextRaw = { ...raw, ...(nextUser || {}) };
      return normalizeSnapshotPayload(nextRaw);
    });
  }, []);

  const capabilityMatrix = useMemo(
    () => deriveCapabilities({ user: snapshot }),
    [snapshot]
  );

  const allowed = capabilityMatrix.allowed || {};
  const reasons = capabilityMatrix.reasons || {};

  const capabilitySet = useMemo(() => {
    const set = new Set();
    Object.entries(allowed).forEach(([key, value]) => {
      if (value) {
        set.add(key);
      }
    });
    return set;
  }, [allowed]);

  const hasCapability = useCallback(
    (capability) => Boolean(allowed[capability]),
    [allowed]
  );

  const getReason = useCallback((capability) => reasons[capability], [reasons]);

  const value = useMemo(
    () => ({
      user: snapshot,
      setUser: updateUser,
      capabilities: capabilitySet,
      hasCapability,
      getReason,
      reasons,
    }),
    [snapshot, updateUser, capabilitySet, hasCapability, getReason, reasons]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);

export const useUserCapabilities = () => {
  const { capabilities, hasCapability, getReason } = useUserContext();
  const capabilityList = useMemo(() => Array.from(capabilities), [capabilities]);

  return {
    capabilities: capabilityList,
    hasCapability,
    getReason,
  };
};

export default UserProvider;
