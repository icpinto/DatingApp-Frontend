import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ACCOUNT_STATUS,
  BILLING_STATUS,
  defaultUserSnapshot,
  normalizeSnapshotPayload,
} from "../../utils/userDimensions";
import { CAPABILITIES } from "../../utils/capabilities";

const defaultSnapshot = normalizeSnapshotPayload(defaultUserSnapshot());

const deriveCapabilities = (snapshot) => {
  const capabilitySet = new Set();

  const isAccountRestricted =
    snapshot.account === ACCOUNT_STATUS.DEACTIVATED ||
    snapshot.account === ACCOUNT_STATUS.SUSPENDED;
  const isBillingRestricted =
    snapshot.billing === BILLING_STATUS.CANCELLED ||
    snapshot.billing === BILLING_STATUS.PAST_DUE;

  if (!isAccountRestricted && !isBillingRestricted) {
    [
      CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS,
      CAPABILITIES.MATCHES_VIEW_DETAILS,
      CAPABILITIES.MATCHES_VIEW_COMPATIBILITY,
      CAPABILITIES.MATCHES_SEND_REQUEST,
      CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE,
    ].forEach((capability) => capabilitySet.add(capability));
  }

  return capabilitySet;
};

const noop = () => {};

export const UserContext = createContext({
  user: defaultSnapshot,
  capabilities: new Set(),
  setUser: noop,
  hasCapability: () => false,
});

export const UserProvider = ({ children, initialUser, accountStatus }) => {
  const [snapshot, setSnapshot] = useState(() => {
    const baseSnapshot = initialUser
      ? normalizeSnapshotPayload(initialUser)
      : defaultSnapshot;

    if (!accountStatus) {
      return baseSnapshot;
    }

    const nextRaw = { ...(baseSnapshot.raw || baseSnapshot), account: accountStatus };
    return normalizeSnapshotPayload(nextRaw);
  });

  useEffect(() => {
    if (!accountStatus) {
      return;
    }
    setSnapshot((previous) => {
      if ((previous.raw || previous).account === accountStatus) {
        return previous;
      }
      const nextRaw = { ...(previous.raw || previous), account: accountStatus };
      return normalizeSnapshotPayload(nextRaw);
    });
  }, [accountStatus]);

  const updateUser = useCallback((nextUser) => {
    setSnapshot((previous) => {
      const nextRaw = { ...(previous.raw || previous), ...(nextUser || {}) };
      return normalizeSnapshotPayload(nextRaw);
    });
  }, []);

  const capabilities = useMemo(() => deriveCapabilities(snapshot), [snapshot]);

  const value = useMemo(
    () => ({
      user: snapshot,
      capabilities,
      setUser: updateUser,
      hasCapability: (capability) => capabilities.has(capability),
    }),
    [snapshot, capabilities, updateUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);

export const useUserCapabilities = () => {
  const { capabilities, hasCapability } = useUserContext();
  const capabilityList = useMemo(() => Array.from(capabilities), [capabilities]);

  return {
    capabilities: capabilityList,
    hasCapability,
  };
};

export default UserProvider;
