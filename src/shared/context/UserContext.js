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
} from "../../domain/user";
import { CAPABILITY_GROUPS, deriveCapabilities } from "../../domain/capabilities";

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

const areFactsEqual = (a, b) => {
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

const buildCapabilityEntry = (capability, allowed, reasons) => ({
  capability,
  can: Boolean(allowed[capability]),
  reason: reasons[capability],
});

const buildCapabilitySelection = (schema, allowed, reasons) => {
  if (!schema) {
    return {};
  }

  if (typeof schema === "string") {
    return buildCapabilityEntry(schema, allowed, reasons);
  }

  if (Array.isArray(schema)) {
    return schema.map((entry) => buildCapabilitySelection(entry, allowed, reasons));
  }

  if (typeof schema === "object") {
    return Object.entries(schema).reduce((acc, [key, value]) => {
      acc[key] = buildCapabilitySelection(value, allowed, reasons);
      return acc;
    }, {});
  }

  return {};
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
  facts: defaultFacts,
  updateFacts: noop,
  setConversationFacts: noop,
  clearConversationFacts: noop,
  updateCorePreferencesStatus: noop,
  corePreferencesStatus: defaultCorePreferencesStatus,
  questionnaireLocked: defaultFacts.questionnaireLocked,
  capabilitySelectors: { select: () => ({}), groups: {} },
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
  const [facts, setFacts] = useState({
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

    setFacts((previous) => {
      if (areFactsEqual(previous, nextFacts)) {
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

  const updateFacts = useCallback((nextFacts = {}) => {
    setFacts((previous) => mergeFacts(previous, nextFacts));
  }, []);

  const setConversationFacts = useCallback((conversationFacts = {}) => {
    updateFacts({ conversation: conversationFacts || {} });
  }, [updateFacts]);

  const clearConversationFacts = useCallback(() => {
    setFacts((previous) => {
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

      setFacts((previous) => {
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
        hasSavedCorePreferences: facts.hasSavedCorePreferences,
        questionnaireLocked: facts.questionnaireLocked,
        conversation: facts.conversation,
        hasProfile: facts.hasProfile,
      }),
    [snapshot, facts]
  );

  const allowed = useMemo(
    () => capabilityMatrix.allowed || {},
    [capabilityMatrix.allowed]
  );
  const reasons = useMemo(
    () => capabilityMatrix.reasons || {},
    [capabilityMatrix.reasons]
  );

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

  const selectCapabilities = useCallback(
    (schema) => buildCapabilitySelection(schema, allowed, reasons),
    [allowed, reasons]
  );

  const capabilitySelectors = useMemo(
    () => ({
      select: selectCapabilities,
      groups: Object.entries(CAPABILITY_GROUPS).reduce((acc, [groupKey, schema]) => {
        acc[groupKey] = selectCapabilities(schema);
        return acc;
      }, {}),
    }),
    [selectCapabilities]
  );

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
      facts,
      updateFacts,
      setConversationFacts,
      clearConversationFacts,
      updateCorePreferencesStatus,
      corePreferencesStatus,
      questionnaireLocked: facts.questionnaireLocked,
      capabilitySelectors,
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
      facts,
      updateFacts,
      setConversationFacts,
      clearConversationFacts,
      updateCorePreferencesStatus,
      corePreferencesStatus,
      capabilitySelectors,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);

export const useUserFacts = () => {
  const { facts, updateFacts, setConversationFacts, clearConversationFacts } =
    useUserContext();
  return {
    facts,
    updateFacts,
    setConversationFacts,
    clearConversationFacts,
  };
};

export const useUserCapabilities = () => {
  const { capabilities, hasCapability, getReason, capabilitySelectors } =
    useUserContext();
  const capabilityList = useMemo(() => Array.from(capabilities), [capabilities]);
  const memoizedGroups = useMemo(
    () => capabilitySelectors.groups,
    [capabilitySelectors]
  );
  const memoizedSelect = useCallback(
    (schema) => capabilitySelectors.select(schema),
    [capabilitySelectors]
  );
  return {
    capabilities: capabilityList,
    hasCapability,
    getReason,
    groups: memoizedGroups,
    select: memoizedSelect,
    selectors: capabilitySelectors,
  };
};

export default UserProvider;
