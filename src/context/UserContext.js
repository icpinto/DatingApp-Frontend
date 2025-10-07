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
  defaultUserSnapshot,
  normalizeSnapshotPayload,
} from "../utils/userDimensions";
import { deriveCapabilities } from "../utils/capabilities";

const noop = () => {};

const defaultSnapshot = normalizeSnapshotPayload(defaultUserSnapshot());

const defaultFacts = {
  hasSavedCorePreferences: true,
  questionnaireLocked: false,
  conversation: {},
  hasProfile: true,
};

const defaultCorePreferencesStatus = { loading: false, hasSaved: false };

const normalize = (base, overrides) =>
  normalizeSnapshotPayload({ ...(base?.raw || base), ...(overrides || {}) });

const shallowEqual = (a = {}, b = {}) => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

const areSnapshotsEqual = (a, b) =>
  shallowEqual((a?.raw || a) ?? {}, (b?.raw || b) ?? {});

const withoutConversation = (facts = {}) => {
  const { conversation, ...rest } = facts;
  return rest;
};

const areCapabilityFactsEqual = (a, b) => {
  if (!shallowEqual(withoutConversation(a), withoutConversation(b))) {
    return false;
  }
  return shallowEqual(a?.conversation || {}, b?.conversation || {});
};

const mergeFacts = (previous, next = {}) => {
  if (!next || typeof next !== "object") {
    return previous;
  }

  let changed = false;
  const merged = { ...previous };

  Object.entries(next).forEach(([key, value]) => {
    if (key === "conversation") {
      const previousConversation = previous.conversation || {};
      const nextConversation = value || {};
      if (!shallowEqual(previousConversation, nextConversation)) {
        merged.conversation = { ...previousConversation, ...nextConversation };
        changed = true;
      }
      return;
    }

    if (previous[key] !== value) {
      merged[key] = value;
      changed = true;
    }
  });

  return changed ? merged : previous;
};

export const UserContext = createContext({
  user: defaultSnapshot,
  setUser: noop,
  setAccountStatus: noop,
  updateBillingStatus: noop,
  updateUser: noop,
  capabilities: new Set(),
  allowed: {},
  reasons: {},
  hasCapability: () => false,
  getReason: () => undefined,
  capabilityFacts: defaultFacts,
  updateCapabilityFacts: noop,
  setConversationFacts: noop,
  clearConversationFacts: noop,
  updateCorePreferencesStatus: noop,
  corePreferencesStatus: defaultCorePreferencesStatus,
  questionnaireLocked: defaultFacts.questionnaireLocked,
});

export const UserProvider = ({
  children,
  initialSnapshot,
  accountStatus,
  initialFacts,
}) => {
  const initialState = useMemo(() => {
    const base = normalize(defaultSnapshot, initialSnapshot);
    if (!accountStatus) {
      return base;
    }
    return normalize(base, { account: accountStatus });
  }, [initialSnapshot, accountStatus]);

  const [snapshot, setSnapshot] = useState(initialState);
  const [capabilityFacts, setCapabilityFacts] = useState({
    ...defaultFacts,
    ...(initialFacts || {}),
  });
  const [corePreferencesStatus, setCorePreferencesStatus] = useState(
    defaultCorePreferencesStatus
  );

  const previousInitialSnapshotRef = useRef();

  useEffect(() => {
    const hasChanged = previousInitialSnapshotRef.current !== initialSnapshot;
    previousInitialSnapshotRef.current = initialSnapshot;
    if (!hasChanged) {
      return;
    }

    setSnapshot((previous) => {
      const base = normalize(defaultSnapshot, initialSnapshot);
      const nextSnapshot =
        accountStatus && (base.raw || base).account !== accountStatus
          ? normalize(base, { account: accountStatus })
          : base;

      if (areSnapshotsEqual(previous, nextSnapshot)) {
        return previous;
      }

      return nextSnapshot;
    });
  }, [initialSnapshot, accountStatus]);

  useEffect(() => {
    if (!accountStatus) {
      return;
    }
    setSnapshot((previous) => {
      const previousAccount = (previous.raw || previous).account;
      if (previousAccount === accountStatus) {
        return previous;
      }
      return normalize(previous, { account: accountStatus });
    });
  }, [accountStatus]);

  useEffect(() => {
    const nextFacts = {
      ...defaultFacts,
      ...(initialFacts || {}),
      conversation: {
        ...(initialFacts?.conversation || {}),
      },
    };

    setCapabilityFacts((previous) => {
      if (areCapabilityFactsEqual(previous, nextFacts)) {
        return previous;
      }
      return nextFacts;
    });
  }, [initialFacts]);

  const setUser = useCallback((nextUser = {}) => {
    setSnapshot((previous) => normalize(previous, nextUser));
  }, []);

  const updateUser = useCallback((updater) => {
    if (typeof updater === "function") {
      setSnapshot((previous) => {
        const nextValue = updater(previous.raw || previous);
        return normalize(previous, nextValue || {});
      });
      return;
    }
    setSnapshot((previous) => normalize(previous, updater || {}));
  }, []);

  const setAccountStatus = useCallback((nextStatus) => {
    if (!nextStatus) {
      return;
    }
    setSnapshot((previous) => {
      const previousAccount = (previous.raw || previous).account;
      if (previousAccount === nextStatus) {
        return previous;
      }
      return normalize(previous, { account: nextStatus });
    });
  }, []);

  const updateBillingStatus = useCallback((billingStatus) => {
    if (!billingStatus) {
      return;
    }
    setSnapshot((previous) => normalize(previous, { billing: billingStatus }));
  }, []);

  const updateCapabilityFacts = useCallback((nextFacts = {}) => {
    setCapabilityFacts((previous) => mergeFacts(previous, nextFacts));
  }, []);

  const setConversationFacts = useCallback((conversationFacts = {}) => {
    updateCapabilityFacts({ conversation: conversationFacts || {} });
  }, [updateCapabilityFacts]);

  const clearConversationFacts = useCallback(() => {
    setCapabilityFacts((previous) => {
      if (!previous.conversation || Object.keys(previous.conversation).length === 0) {
        return previous;
      }
      return { ...previous, conversation: {} };
    });
  }, []);

  const updateCorePreferencesStatus = useCallback(
    (status = {}) => {
      const nextLoading =
        typeof status.loading === "boolean"
          ? status.loading
          : corePreferencesStatus.loading;
      const nextHasSaved =
        typeof status.hasSaved === "boolean"
          ? status.hasSaved
          : corePreferencesStatus.hasSaved;

      setCorePreferencesStatus((previous) => {
        if (
          previous.loading === nextLoading &&
          previous.hasSaved === nextHasSaved
        ) {
          return previous;
        }
        return { loading: nextLoading, hasSaved: nextHasSaved };
      });

      setCapabilityFacts((previous) => {
        const locked = nextLoading || !nextHasSaved;
        const nextFacts = {
          ...previous,
          hasSavedCorePreferences: nextHasSaved,
          questionnaireLocked: locked,
        };
        if (previous.hasSavedCorePreferences === nextHasSaved && previous.questionnaireLocked === locked) {
          return previous;
        }
        return nextFacts;
      });
    },
    [corePreferencesStatus.loading, corePreferencesStatus.hasSaved]
  );

  const capabilityMatrix = useMemo(
    () =>
      deriveCapabilities({
        user: snapshot,
        hasSavedCorePreferences: capabilityFacts.hasSavedCorePreferences,
        questionnaireLocked: capabilityFacts.questionnaireLocked,
        conversation: capabilityFacts.conversation,
        hasProfile: capabilityFacts.hasProfile,
      }),
    [snapshot, capabilityFacts]
  );

  const allowed = capabilityMatrix.allowed || {};
  const reasons = capabilityMatrix.reasons || {};

  const capabilities = useMemo(() => {
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
      setUser,
      updateUser,
      setAccountStatus,
      updateBillingStatus,
      capabilities,
      allowed,
      reasons,
      hasCapability,
      getReason,
      capabilityFacts,
      updateCapabilityFacts,
      setConversationFacts,
      clearConversationFacts,
      updateCorePreferencesStatus,
      corePreferencesStatus,
      questionnaireLocked: capabilityFacts.questionnaireLocked,
    }),
    [
      snapshot,
      setUser,
      updateUser,
      setAccountStatus,
      updateBillingStatus,
      capabilities,
      allowed,
      reasons,
      hasCapability,
      getReason,
      capabilityFacts,
      updateCapabilityFacts,
      setConversationFacts,
      clearConversationFacts,
      updateCorePreferencesStatus,
      corePreferencesStatus,
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
