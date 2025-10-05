import { ACCOUNT_LIFECYCLE } from "./accountLifecycle";

/**
 * @typedef {"activated" | "deactivated" | "suspended" | "deleted"} AccountStatus
 * Application specific account lifecycle states. We currently only act on
 * activated/deactivated, but plan to introduce suspension and deletion flows.
 */
export const ACCOUNT_STATUS = {
  ACTIVATED: ACCOUNT_LIFECYCLE.ACTIVATED,
  DEACTIVATED: ACCOUNT_LIFECYCLE.DEACTIVATED,
  SUSPENDED: "suspended",
  DELETED: "deleted",
};

/**
 * @typedef {"active" | "trial" | "past-due" | "cancelled" | "free"} BillingStatus
 * Billing states cover the monetisation lifecycle without leaking UI logic.
 */
export const BILLING_STATUS = {
  ACTIVE: "active", // fully paid subscription
  TRIALING: "trial", // onboarding trial period
  PAST_DUE: "past-due", // payment failed, grace window
  CANCELLED: "cancelled", // subscription cancelled, access ends when period expires
  FREE: "free", // ad-supported free tier
};

/**
 * @typedef {"verified" | "unverified" | "pending" | "rejected"} VerificationStatus
 * Profile verification status — useful for messaging, discovery, and trust & safety.
 */
export const VERIFICATION_STATUS = {
  VERIFIED: "verified", // identity or photo verification completed
  UNVERIFIED: "unverified", // no verification attempt yet
  PENDING: "pending", // verification submitted and awaiting review
  REJECTED: "rejected", // verification failed and requires re-submission
};

/**
 * @typedef {"member" | "moderator" | "admin" | "support"} UserRole
 * Roles determine privileged access within the dating application tooling.
 */
export const USER_ROLES = {
  MEMBER: "member", // default user role
  MODERATOR: "moderator", // handles reports and content moderation
  ADMIN: "admin", // full administrative access
  SUPPORT: "support", // customer support and billing adjustments
};

/**
 * @typedef {"early-access" | "beta" | "premium-matchmaker" | "verified-photos"} UserBadge
 * Lightweight server-driven tags that can drive UI experiments without code changes.
 */
export const USER_BADGES = {
  EARLY_ACCESS: "early-access",
  BETA: "beta",
  PREMIUM_MATCHMAKER: "premium-matchmaker",
  VERIFIED_PHOTOS: "verified-photos",
};

/**
 * Creates a canonical snapshot representing a new or anonymous user session.
 * @returns {{account: AccountStatus, billing: BillingStatus, verification: VerificationStatus, role: UserRole, tags: UserBadge[]}}
 */
export const defaultUserSnapshot = () => ({
  account: ACCOUNT_STATUS.ACTIVATED,
  billing: BILLING_STATUS.FREE,
  verification: VERIFICATION_STATUS.UNVERIFIED,
  role: USER_ROLES.MEMBER,
  tags: [],
});

/**
 * Normalises an arbitrary payload into our structured snapshot format.
 * @param {{account?: AccountStatus, billing?: BillingStatus, verification?: VerificationStatus, role?: UserRole, tags?: string[]}} payload
 * @returns {{account: AccountStatus, billing: BillingStatus, verification: VerificationStatus, role: UserRole, tags: UserBadge[], raw: any}}
 */
export const normalizeSnapshotPayload = (payload = {}) => ({
  account: payload.account || ACCOUNT_STATUS.ACTIVATED,
  billing: payload.billing || BILLING_STATUS.FREE,
  verification: payload.verification || VERIFICATION_STATUS.UNVERIFIED,
  role: payload.role || USER_ROLES.MEMBER,
  tags: Array.isArray(payload.tags) ? payload.tags : [],
  raw: payload,
});

export default {
  ACCOUNT_STATUS,
  BILLING_STATUS,
  VERIFICATION_STATUS,
  USER_ROLES,
  USER_BADGES,
  defaultUserSnapshot,
  normalizeSnapshotPayload,
};
