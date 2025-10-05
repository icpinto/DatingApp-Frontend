const normalizeValue = (value) => {
  if (value == null) {
    return "unknown";
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized || "unknown";
};

export const normalizeAccountStatus = (value) => {
  const normalized = normalizeValue(value);
  if (
    [
      "activated",
      "active",
      "visible",
      "available",
      "reactivated",
      "enabled",
      "open",
    ].includes(normalized)
  ) {
    return "activated";
  }
  if (["deactivated", "inactive", "hidden", "disabled", "suspended"].includes(normalized)) {
    return "deactivated";
  }
  if (["deleted", "archived", "removed", "closed"].includes(normalized)) {
    return "deleted";
  }
  return normalized;
};

export const normalizeBillingStatus = (value) => {
  const normalized = normalizeValue(value);
  if (["paid", "active", "current", "good_standing"].includes(normalized)) {
    return "paid";
  }
  if (["trial", "trialing", "free_trial"].includes(normalized)) {
    return "trial";
  }
  if (["grace", "grace_period"].includes(normalized)) {
    return "grace";
  }
  if (["past_due", "pastdue", "overdue"].includes(normalized)) {
    return "past_due";
  }
  if (["unpaid", "none", "canceled", "cancelled", "expired"].includes(normalized)) {
    return "unpaid";
  }
  return normalized;
};

export const normalizeVerificationStatus = (value) => {
  const normalized = normalizeValue(value);
  if (["verified", "complete", "approved", "confirmed"].includes(normalized)) {
    return "verified";
  }
  if (["pending", "processing", "review"].includes(normalized)) {
    return "pending";
  }
  if (["unverified", "incomplete", "rejected", "failed"].includes(normalized)) {
    return "unverified";
  }
  return normalized;
};

export const normalizeRole = (value) => {
  const normalized = normalizeValue(value);
  if (["superadmin", "owner", "administrator"].includes(normalized)) {
    return "admin";
  }
  if (["support", "agent"].includes(normalized)) {
    return "support";
  }
  if (["moderator", "mod"].includes(normalized)) {
    return "moderator";
  }
  if (["member", "user", "standard"].includes(normalized)) {
    return "user";
  }
  if (["guest", "anonymous"].includes(normalized)) {
    return "guest";
  }
  return normalized;
};

export const normalizeUserFacts = (facts = {}) => {
  const account = normalizeAccountStatus(
    facts.account ?? facts.account_status ?? facts.status ?? facts.lifecycle
  );
  const billing = normalizeBillingStatus(
    facts.billing ?? facts.billing_status ?? facts.subscription_status ?? facts.subscription
  );
  const verification = normalizeVerificationStatus(
    facts.verification ?? facts.verification_status ?? facts.identity_status
  );
  const role = normalizeRole(facts.role ?? facts.user_role ?? facts.type);
  const serverCapabilities = Array.isArray(facts.capabilities)
    ? facts.capabilities.filter((cap) => typeof cap === "string")
    : [];

  return {
    account: account === "unknown" ? null : account,
    billing: billing === "unknown" ? null : billing,
    verification: verification === "unknown" ? null : verification,
    role: role === "unknown" ? null : role,
    capabilities: serverCapabilities,
  };
};

export const deriveCapabilities = (inputFacts = {}) => {
  const {
    account = "unknown",
    billing = "unknown",
    verification = "unknown",
    role = "guest",
    capabilities: capabilityList = [],
  } = normalizeUserFacts(inputFacts);

  const normalizedAccount = account ?? "unknown";
  const normalizedBilling = billing ?? "unknown";
  const normalizedVerification = verification ?? "unknown";
  const normalizedRole = role ?? "guest";

  const isDeleted = normalizedAccount === "deleted";
  const isActivated = normalizedAccount === "activated";
  const isDeactivated = normalizedAccount === "deactivated";
  const isVerified = normalizedVerification === "verified";
  const isVerificationPending = normalizedVerification === "pending";
  const isPaid = ["paid", "trial", "grace"].includes(normalizedBilling);
  const isBillingPastDue = normalizedBilling === "past_due";
  const isBillingUnpaid = normalizedBilling === "unpaid";
  const isAdmin = normalizedRole === "admin";
  const isSupport = normalizedRole === "support";
  const isModerator = ["moderator", "admin", "support"].includes(normalizedRole);

  const baseCapabilities = {
    accessAppShell: !isDeleted,
    browseDiscovery: isActivated && isVerified,
    viewMatchRequests: !isDeleted,
    respondToMatchRequests: isActivated && isVerified && !isBillingPastDue,
    sendMessage: isActivated && isVerified && !isBillingPastDue,
    readMessages: !isDeleted,
    accessPremium: isActivated && isPaid,
    manageBilling: isActivated && (isPaid || isBillingPastDue || isAdmin || isSupport),
    editProfile: isActivated,
    manageUsers: isAdmin,
    assistMembers: isModerator,
    viewInsights: isActivated && isVerified,
    reactivateAccount: isDeactivated,
    requestVerification: !isVerified,
    overrideBlocks: isModerator,
  };

  if (isDeleted) {
    Object.keys(baseCapabilities).forEach((key) => {
      if (!["accessAppShell", "reactivateAccount"].includes(key)) {
        baseCapabilities[key] = false;
      }
    });
  }

  if (isVerificationPending) {
    baseCapabilities.respondToMatchRequests = false;
    baseCapabilities.sendMessage = false;
    baseCapabilities.browseDiscovery = isActivated;
    baseCapabilities.viewInsights = isActivated;
  }

  if (isBillingUnpaid) {
    baseCapabilities.accessPremium = false;
  }

  const serverCapabilities = new Set(capabilityList);
  serverCapabilities.forEach((capability) => {
    baseCapabilities[capability] = true;
  });

  return baseCapabilities;
};

export default {
  normalizeAccountStatus,
  normalizeBillingStatus,
  normalizeVerificationStatus,
  normalizeRole,
  normalizeUserFacts,
  deriveCapabilities,
};
