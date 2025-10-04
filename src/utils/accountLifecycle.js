import api from "../services/api";

export const ACCOUNT_LIFECYCLE = {
  ACTIVATED: "activated",
  DEACTIVATED: "deactivated",
};

export const ACCOUNT_DEACTIVATED_MESSAGE =
  "Your account is currently deactivated. Reactivate your profile to access discovery features and make changes.";

export const normalizeLifecycleStatus = (value) => {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (
    ["activated", "active", "visible", "reactivated", "available"].includes(
      normalized
    )
  ) {
    return ACCOUNT_LIFECYCLE.ACTIVATED;
  }

  if (
    [
      "deactivated",
      "inactive",
      "hidden",
      "disabled",
      "suspended",
      "unavailable",
    ].includes(normalized)
  ) {
    return ACCOUNT_LIFECYCLE.DEACTIVATED;
  }

  if (["1", "true", "yes", "enabled", "on"].includes(normalized)) {
    return ACCOUNT_LIFECYCLE.ACTIVATED;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return ACCOUNT_LIFECYCLE.DEACTIVATED;
  }

  return null;
};

export const parseAccountHiddenStatus = (payload) => {
  if (payload == null) {
    return false;
  }

  if (typeof payload === "boolean") {
    return payload;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const parsed = parseAccountHiddenStatus(item);
      if (typeof parsed === "boolean") {
        return parsed;
      }
    }
    return false;
  }

  if (typeof payload === "string") {
    const normalized = payload.toLowerCase();
    if (["active", "activated", "visible"].includes(normalized)) {
      return false;
    }
    if (["deactivated", "inactive", "disabled", "hidden", "suspended"].includes(normalized)) {
      return true;
    }
    return false;
  }

  if (typeof payload === "object") {
    if ("account" in payload) {
      const nested = parseAccountHiddenStatus(payload.account);
      if (typeof nested === "boolean") {
        return nested;
      }
    }

    const booleanKeys = [
      "hidden",
      "is_hidden",
      "deactivated",
      "is_deactivated",
      "inactive",
      "is_inactive",
      "disabled",
      "is_disabled",
    ];

    for (const key of booleanKeys) {
      if (key in payload) {
        return Boolean(payload[key]);
      }
    }

    if ("active" in payload) {
      return !Boolean(payload.active);
    }

    const stringKeys = ["status", "account_status", "state", "lifecycle"];
    for (const key of stringKeys) {
      if (key in payload && typeof payload[key] === "string") {
        return parseAccountHiddenStatus(payload[key]);
      }
    }

    if ("deactivated_at" in payload) {
      return Boolean(payload.deactivated_at);
    }

    if ("reactivated_at" in payload) {
      const hasDeactivation = Boolean(payload.deactivated_at);
      return hasDeactivation && !payload.reactivated_at;
    }
  }

  return false;
};

export const resolveAccountLifecycleStatus = (payload) => {
  const hidden = parseAccountHiddenStatus(payload);
  const statusCandidates = [];

  if (payload && typeof payload === "object") {
    statusCandidates.push(
      payload.status,
      payload.account_status,
      payload.accountStatus,
      payload.state,
      payload.lifecycle,
      payload.account?.status,
      payload.account?.state
    );
  } else {
    statusCandidates.push(payload);
  }

  for (const candidate of statusCandidates) {
    const parsed = normalizeLifecycleStatus(candidate);
    if (parsed) {
      return { status: parsed, hidden };
    }
  }

  const fallbackStatus = hidden
    ? ACCOUNT_LIFECYCLE.DEACTIVATED
    : ACCOUNT_LIFECYCLE.ACTIVATED;

  return { status: fallbackStatus, hidden };
};

export const fetchAccountLifecycleStatus = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return { status: null, hidden: false, raw: null };
  }

  const headers = { Authorization: `${token}` };
  const response = await api.get(`/user/status`, { headers });
  const payload = response?.data;
  const { status, hidden } = resolveAccountLifecycleStatus(payload);

  return { status, hidden, raw: payload };
};

export default {
  ACCOUNT_LIFECYCLE,
  ACCOUNT_DEACTIVATED_MESSAGE,
  normalizeLifecycleStatus,
  parseAccountHiddenStatus,
  resolveAccountLifecycleStatus,
  fetchAccountLifecycleStatus,
};
