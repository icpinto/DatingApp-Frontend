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
const defaultCoreStatus = { loading: false, hasSaved: false };

export const UserContext = createContext({
  user: defaultSnapshot,
  setUser: noop,
  capabilities: new Set(),
  hasCapability: () => false,
  getReason: () => undefined,
  reasons: {},
  updateCorePreferencesStatus: noop,
  corePreferencesStatus: defaultCoreStatus,
  questionnaireLocked: true,
});

export const UserProvider = ({
  children,
  initialUser,
  accountStatus,
  lifecycleLoading = false,
}) => {
  const [snapshot, setSnapshot] = useState(() => {
    if (initialUser) {
      return normalizeSnapshotPayload(initialUser);
    }
    return defaultSnapshot;
  });
  const [coreStatus, setCoreStatus] = useState(defaultCoreStatus);

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

  const updateCorePreferencesStatus = useCallback((status = {}) => {
    setCoreStatus((previous) => {
      const nextStatus = {
        loading:
          typeof status.loading === "boolean" ? status.loading : previous.loading,
        hasSaved:
          typeof status.hasSaved === "boolean" ? status.hasSaved : previous.hasSaved,
      };
      if (
        nextStatus.loading === previous.loading &&
        nextStatus.hasSaved === previous.hasSaved
      ) {
        return previous;
      }
      return nextStatus;
    });
  }, []);

  const effectiveLoading = Boolean(lifecycleLoading) || Boolean(coreStatus.loading);
  const questionnaireLocked = effectiveLoading || !coreStatus.hasSaved;

  const capabilitySnapshot = useMemo(
    () =>
      deriveCapabilities({
        user: snapshot,
        hasSavedCorePreferences: coreStatus.hasSaved,
        questionnaireLocked,
      }),
    [snapshot, coreStatus.hasSaved, questionnaireLocked]
  );

  const allowed = capabilitySnapshot.allowed || {};
  const reasons = capabilitySnapshot.reasons || {};

  const capabilitySet = useMemo(() => {
    const set = new Set();
    Object.entries(allowed).forEach(([key, value]) => {
      if (value) {
        set.add(key);
      }
    });
    return set;
  }, [allowed]);

  const hasCapability = useCallback((capability) => Boolean(allowed[capability]), [
    allowed,
  ]);
  const getReason = useCallback((capability) => reasons[capability], [reasons]);

  const value = useMemo(
    () => ({
      user: snapshot,
      setUser: updateUser,
      capabilities: capabilitySet,
      hasCapability,
      getReason,
      reasons,
      updateCorePreferencesStatus,
      corePreferencesStatus: {
        loading: effectiveLoading,
        hasSaved: coreStatus.hasSaved,
      },
      questionnaireLocked,
    }),
    [
      snapshot,
      updateUser,
      capabilitySet,
      hasCapability,
      getReason,
      reasons,
      updateCorePreferencesStatus,
      effectiveLoading,
      coreStatus.hasSaved,
      questionnaireLocked,
    ]
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
