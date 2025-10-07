import { ACCOUNT_STATUS, BILLING_STATUS, defaultUserSnapshot } from "./userDimensions";

/**
 * List of every capability the UI references. Keep this in sync with
 * COMPONENT_CAPABILITIES so each component has its features enumerated.
 */
export const CAPABILITIES = {
  APP_VIEW_SHELL: "app.viewShell",
  APP_TOGGLE_THEME: "app.toggleTheme",
  APP_CHANGE_LANGUAGE: "app.changeLanguage",
  APP_SIGN_OUT: "app.signOut",

  AUTH_VIEW_LOGIN: "auth.viewLogin",
  AUTH_SUBMIT_LOGIN: "auth.submitLogin",
  AUTH_VIEW_SIGNUP: "auth.viewSignup",
  AUTH_SUBMIT_SIGNUP: "auth.submitSignup",

  NAV_ACCESS_HOME: "navigation.accessHomeTab",
  NAV_ACCESS_MATCHES: "navigation.accessMatchesTab",
  NAV_ACCESS_INSIGHTS: "navigation.accessMatchInsightsTab",
  NAV_ACCESS_MESSAGES: "navigation.accessMessagesTab",
  NAV_ACCESS_PROFILE: "navigation.accessProfileTab",

  DISCOVERY_VIEW_HOME: "discovery.viewHomeFeed",
  DISCOVERY_VIEW_ACTIVE_USERS: "discovery.viewActiveUsers",
  DISCOVERY_USE_FILTERS: "discovery.useFilters",
  DISCOVERY_TOGGLE_FILTER_PANEL: "discovery.toggleFilterPanel",
  DISCOVERY_EXPAND_USER_PREVIEW: "discovery.expandUserPreview",
  DISCOVERY_NAVIGATE_TO_PROFILE: "discovery.navigateToProfile",
  DISCOVERY_COMPOSE_REQUEST: "discovery.composeConnectionRequest",
  DISCOVERY_SEND_REQUEST: "discovery.sendConnectionRequest",

  MATCHES_VIEW_RECOMMENDATIONS: "matches.viewRecommendations",
  MATCHES_VIEW_DETAILS: "matches.viewRecommendationDetails",
  MATCHES_VIEW_COMPATIBILITY: "matches.viewCompatibilityBreakdown",
  MATCHES_SEND_REQUEST: "matches.sendConnectionRequest",
  MATCHES_NAVIGATE_TO_PROFILE: "matches.navigateToProfile",

  REQUESTS_VIEW_RECEIVED: "requests.viewReceivedRequests",
  REQUESTS_VIEW_SENT: "requests.viewSentRequests",
  REQUESTS_RESPOND: "requests.respondToRequest",
  REQUESTS_VIEW_STATUS: "requests.viewRequestStatus",

  MESSAGING_VIEW_INBOX: "messaging.viewInbox",
  MESSAGING_VIEW_CONVERSATIONS: "messaging.viewConversationList",
  MESSAGING_OPEN_CONVERSATION: "messaging.openConversation",
  MESSAGING_VIEW_HISTORY: "messaging.viewMessageHistory",
  MESSAGING_MARK_READ: "messaging.markMessagesRead",
  MESSAGING_SEND_MESSAGE: "messaging.sendMessage",
  MESSAGING_BLOCK_USER: "messaging.blockUser",
  MESSAGING_VIEW_PARTNER_STATUS: "messaging.viewPartnerStatus",

  INSIGHTS_VIEW_DASHBOARD: "insights.viewDashboard",
  INSIGHTS_EDIT_CORE_PREFERENCES: "insights.editCorePreferences",
  INSIGHTS_SAVE_CORE_PREFERENCES: "insights.saveCorePreferences",
  INSIGHTS_VIEW_QUESTIONNAIRE: "insights.viewQuestionnaire",
  INSIGHTS_ANSWER_QUESTIONNAIRE: "insights.answerQuestionnaire",
  INSIGHTS_SELECT_CATEGORY: "insights.selectQuestionCategory",

  PROFILE_VIEW_MEMBER: "profile.viewMemberProfile",
  PROFILE_VIEW_BADGES: "profile.viewVerificationBadges",
  PROFILE_SEND_REQUEST: "profile.sendConnectionRequest",
  PROFILE_VIEW_SECTIONS: "profile.viewProfileSections",

  OWNER_PROFILE_VIEW: "ownerProfile.viewOwnProfile",
  OWNER_PROFILE_EDIT: "ownerProfile.editOwnProfile",
  OWNER_PROFILE_UPLOAD_PHOTO: "ownerProfile.uploadProfileImage",
  OWNER_PROFILE_SUBMIT_IDENTITY: "ownerProfile.submitIdentityDocuments",
  OWNER_PROFILE_SEND_OTP: "ownerProfile.sendVerificationOtp",
  OWNER_PROFILE_VERIFY_OTP: "ownerProfile.verifyContactOtp",
  OWNER_PROFILE_MANAGE_INTERESTS: "ownerProfile.manageInterests",
  OWNER_PROFILE_MANAGE_LANGUAGES: "ownerProfile.manageLanguages",
  OWNER_PROFILE_SAVE: "ownerProfile.saveProfile",
  OWNER_PROFILE_MANAGE_PAYMENTS: "ownerProfile.managePayments",
  OWNER_PROFILE_TOGGLE_VISIBILITY: "ownerProfile.toggleAccountVisibility",
  OWNER_PROFILE_REMOVE_ACCOUNT: "ownerProfile.removeAccount",

  BILLING_VIEW_PAYMENT: "billing.viewPaymentPage",
  BILLING_INITIATE_PAYMENT: "billing.initiatePayment",
};

export const ALL_CAPABILITIES = Object.values(CAPABILITIES);

/**
 * Every component and the capability keys it consumes. This fulfils the
 * requirement to list the feature surface of each module in one place.
 */
export const COMPONENT_CAPABILITIES = {
  "App/TopBar": [
    CAPABILITIES.APP_VIEW_SHELL,
    CAPABILITIES.APP_TOGGLE_THEME,
    CAPABILITIES.APP_CHANGE_LANGUAGE,
    CAPABILITIES.APP_SIGN_OUT,
  ],
  "components/auth/Login": [
    CAPABILITIES.AUTH_VIEW_LOGIN,
    CAPABILITIES.AUTH_SUBMIT_LOGIN,
  ],
  "components/auth/Signup": [
    CAPABILITIES.AUTH_VIEW_SIGNUP,
    CAPABILITIES.AUTH_SUBMIT_SIGNUP,
  ],
  "components/tabs/MainTabs": [
    CAPABILITIES.NAV_ACCESS_HOME,
    CAPABILITIES.NAV_ACCESS_MATCHES,
    CAPABILITIES.NAV_ACCESS_INSIGHTS,
    CAPABILITIES.NAV_ACCESS_MESSAGES,
    CAPABILITIES.NAV_ACCESS_PROFILE,
  ],
  "components/home/Home": [
    CAPABILITIES.DISCOVERY_VIEW_HOME,
    CAPABILITIES.DISCOVERY_VIEW_ACTIVE_USERS,
    CAPABILITIES.DISCOVERY_USE_FILTERS,
    CAPABILITIES.DISCOVERY_TOGGLE_FILTER_PANEL,
    CAPABILITIES.DISCOVERY_EXPAND_USER_PREVIEW,
    CAPABILITIES.DISCOVERY_NAVIGATE_TO_PROFILE,
    CAPABILITIES.DISCOVERY_COMPOSE_REQUEST,
    CAPABILITIES.DISCOVERY_SEND_REQUEST,
    CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS,
    CAPABILITIES.MATCHES_VIEW_DETAILS,
    CAPABILITIES.MATCHES_VIEW_COMPATIBILITY,
    CAPABILITIES.MATCHES_SEND_REQUEST,
    CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE,
  ],
  "components/matches/MatchRecommendations": [
    CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS,
    CAPABILITIES.MATCHES_VIEW_DETAILS,
    CAPABILITIES.MATCHES_VIEW_COMPATIBILITY,
    CAPABILITIES.MATCHES_SEND_REQUEST,
    CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE,
  ],
  "components/requests/Requests": [
    CAPABILITIES.REQUESTS_VIEW_RECEIVED,
    CAPABILITIES.REQUESTS_VIEW_SENT,
    CAPABILITIES.REQUESTS_RESPOND,
    CAPABILITIES.REQUESTS_VIEW_STATUS,
  ],
  "components/chat/Messages": [
    CAPABILITIES.MESSAGING_VIEW_INBOX,
    CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS,
    CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
    CAPABILITIES.MESSAGING_VIEW_HISTORY,
    CAPABILITIES.MESSAGING_MARK_READ,
  ],
  "components/chat/ConversationListPane": [
    CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS,
    CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
  ],
  "components/chat/ChatDrawer": [
    CAPABILITIES.MESSAGING_VIEW_HISTORY,
    CAPABILITIES.MESSAGING_SEND_MESSAGE,
    CAPABILITIES.MESSAGING_BLOCK_USER,
    CAPABILITIES.MESSAGING_MARK_READ,
    CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS,
  ],
  "components/chat/ChatMessageList": [
    CAPABILITIES.MESSAGING_VIEW_HISTORY,
    CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS,
  ],
  "components/chat/ChatHeaderSection": [
    CAPABILITIES.MESSAGING_BLOCK_USER,
    CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
  ],
  "components/matchInsights/MatchInsights": [
    CAPABILITIES.INSIGHTS_VIEW_DASHBOARD,
    CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE,
  ],
  "components/matchInsights/CorePreferencesForm": [
    CAPABILITIES.INSIGHTS_EDIT_CORE_PREFERENCES,
    CAPABILITIES.INSIGHTS_SAVE_CORE_PREFERENCES,
  ],
  "components/questions/Questions": [
    CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE,
    CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE,
    CAPABILITIES.INSIGHTS_SELECT_CATEGORY,
  ],
  "components/profile/Profile": [
    CAPABILITIES.PROFILE_VIEW_MEMBER,
    CAPABILITIES.PROFILE_VIEW_BADGES,
    CAPABILITIES.PROFILE_SEND_REQUEST,
    CAPABILITIES.PROFILE_VIEW_SECTIONS,
  ],
  "components/profile/OwnerProfile": [
    CAPABILITIES.OWNER_PROFILE_VIEW,
    CAPABILITIES.OWNER_PROFILE_EDIT,
    CAPABILITIES.OWNER_PROFILE_UPLOAD_PHOTO,
    CAPABILITIES.OWNER_PROFILE_SUBMIT_IDENTITY,
    CAPABILITIES.OWNER_PROFILE_SEND_OTP,
    CAPABILITIES.OWNER_PROFILE_VERIFY_OTP,
    CAPABILITIES.OWNER_PROFILE_MANAGE_INTERESTS,
    CAPABILITIES.OWNER_PROFILE_MANAGE_LANGUAGES,
    CAPABILITIES.OWNER_PROFILE_SAVE,
    CAPABILITIES.OWNER_PROFILE_MANAGE_PAYMENTS,
    CAPABILITIES.OWNER_PROFILE_TOGGLE_VISIBILITY,
    CAPABILITIES.OWNER_PROFILE_REMOVE_ACCOUNT,
  ],
  "components/payment/Payment": [
    CAPABILITIES.BILLING_VIEW_PAYMENT,
    CAPABILITIES.BILLING_INITIATE_PAYMENT,
  ],
};

/**
 * @typedef {import("./userDimensions").ACCOUNT_STATUS[keyof import("./userDimensions").ACCOUNT_STATUS]} AccountStatus
 * @typedef {import("./userDimensions").BILLING_STATUS[keyof import("./userDimensions").BILLING_STATUS]} BillingStatus
 */

/**
 * @typedef {Object} ConversationFacts
 * @property {boolean} [isBlocked]
 * @property {AccountStatus | "deleted" | null | undefined} [partnerLifecycle]
 */

/**
 * @typedef {Object} AppFacts
 * @property {{ account?: AccountStatus, billing?: BillingStatus, verification?: string, role?: string, tags?: string[] }} [user]
 * @property {boolean} [hasSavedCorePreferences]
 * @property {boolean} [questionnaireLocked]
 * @property {ConversationFacts} [conversation]
 * @property {boolean} [hasProfile]
 */

const suspensionReason = "Your account is suspended. Contact support to regain access.";
const deletionReason = "Your account has been removed. Please contact support if this is unexpected.";
const reactivationReason = "Reactivate your profile to use this feature.";

const resolveAccountRestrictionMessage = ({
  isDeleted,
  isSuspended,
  isDeactivated,
}) => {
  if (isDeleted) {
    return deletionReason;
  }
  if (isSuspended) {
    return suspensionReason;
  }
  if (isDeactivated) {
    return reactivationReason;
  }
  return undefined;
};

/**
 * Produces the capability matrix for the current session.
 * @param {AppFacts | undefined} facts
 * @returns {{ allowed: Record<string, boolean>, reasons: Record<string, string> }}
 */
export function deriveCapabilities(facts = {}) {
  const {
    user = defaultUserSnapshot(),
    hasSavedCorePreferences = true,
    questionnaireLocked = false,
    conversation = {},
  } = facts;

  const accountStatus = user.account || ACCOUNT_STATUS.ACTIVATED;
  const billingStatus = user.billing || BILLING_STATUS.FREE;

  const isDeleted = accountStatus === ACCOUNT_STATUS.DELETED;
  const isSuspended = accountStatus === ACCOUNT_STATUS.SUSPENDED;
  const isDeactivated = accountStatus === ACCOUNT_STATUS.DEACTIVATED;
  const isOperational = accountStatus === ACCOUNT_STATUS.ACTIVATED;
  const accountRestrictionMessage = resolveAccountRestrictionMessage({
    isDeleted,
    isSuspended,
    isDeactivated,
  });

  const isMessagingGloballyDisabled = isDeleted || isSuspended || isDeactivated;
  const isDiscoveryDisabled = isDeleted || isSuspended || isDeactivated;
  const isProfileEditingDisabled = isDeleted || isSuspended || isDeactivated;

  const conversationFacts = conversation || {};
  const conversationBlocked = Boolean(conversationFacts.isBlocked);
  const partnerLifecycle = conversationFacts.partnerLifecycle || ACCOUNT_STATUS.ACTIVATED;
  const partnerInactive = [ACCOUNT_STATUS.DEACTIVATED, "deactivated", "deleted"].includes(
    partnerLifecycle
  );

  const allowed = {};
  const reasons = {};
  const setCapability = (key, value, reason) => {
    allowed[key] = Boolean(value);
    if (!value) {
      reasons[key] = reason || accountRestrictionMessage || "Feature unavailable.";
    }
  };

  // App shell & top bar
  setCapability(CAPABILITIES.APP_VIEW_SHELL, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.APP_TOGGLE_THEME,
    !isDeleted,
    isDeleted ? deletionReason : undefined
  );
  setCapability(
    CAPABILITIES.APP_CHANGE_LANGUAGE,
    !isDeleted,
    isDeleted ? deletionReason : undefined
  );
  setCapability(
    CAPABILITIES.APP_SIGN_OUT,
    !isDeleted,
    isDeleted ? deletionReason : undefined
  );

  // Authentication surfaces (available while logged-in session is valid)
  const authUnavailableReason = accountRestrictionMessage;
  setCapability(CAPABILITIES.AUTH_VIEW_LOGIN, !isDeleted, authUnavailableReason);
  setCapability(CAPABILITIES.AUTH_SUBMIT_LOGIN, !isDeleted, authUnavailableReason);
  setCapability(CAPABILITIES.AUTH_VIEW_SIGNUP, !isDeleted, authUnavailableReason);
  setCapability(CAPABILITIES.AUTH_SUBMIT_SIGNUP, !isDeleted, authUnavailableReason);

  // Main navigation tabs
  setCapability(CAPABILITIES.NAV_ACCESS_HOME, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.NAV_ACCESS_MATCHES, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.NAV_ACCESS_INSIGHTS, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.NAV_ACCESS_MESSAGES, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.NAV_ACCESS_PROFILE, !isDeleted, deletionReason);

  // Discovery / home feed
  setCapability(CAPABILITIES.DISCOVERY_VIEW_HOME, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.DISCOVERY_VIEW_ACTIVE_USERS, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.DISCOVERY_USE_FILTERS, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.DISCOVERY_TOGGLE_FILTER_PANEL, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.DISCOVERY_EXPAND_USER_PREVIEW, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.DISCOVERY_NAVIGATE_TO_PROFILE, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.DISCOVERY_COMPOSE_REQUEST, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.DISCOVERY_SEND_REQUEST,
    !isDiscoveryDisabled,
    accountRestrictionMessage || "Activate your profile to send connection requests."
  );

  // Match recommendations
  setCapability(CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.MATCHES_VIEW_DETAILS, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.MATCHES_VIEW_COMPATIBILITY, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.MATCHES_SEND_REQUEST,
    !isDiscoveryDisabled,
    accountRestrictionMessage || "Activate your profile to reach out to matches."
  );
  setCapability(CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE, !isDeleted, deletionReason);

  // Connection requests
  setCapability(CAPABILITIES.REQUESTS_VIEW_RECEIVED, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.REQUESTS_VIEW_SENT, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.REQUESTS_RESPOND,
    !isDiscoveryDisabled,
    accountRestrictionMessage || "Reactivate your profile to respond to new requests."
  );
  setCapability(CAPABILITIES.REQUESTS_VIEW_STATUS, !isDeleted, deletionReason);

  // Messaging
  setCapability(CAPABILITIES.MESSAGING_VIEW_INBOX, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.MESSAGING_OPEN_CONVERSATION, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.MESSAGING_VIEW_HISTORY, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.MESSAGING_MARK_READ, !isDeleted, deletionReason);

  let sendMessageReason = accountRestrictionMessage;
  if (!sendMessageReason && conversationBlocked) {
    sendMessageReason = "You have blocked this conversation.";
  }
  if (!sendMessageReason && partnerInactive) {
    sendMessageReason = "This user is no longer reachable.";
  }
  setCapability(
    CAPABILITIES.MESSAGING_SEND_MESSAGE,
    !isMessagingGloballyDisabled && !conversationBlocked && !partnerInactive,
    sendMessageReason
  );

  let blockReason = accountRestrictionMessage;
  if (!blockReason && conversationBlocked) {
    blockReason = "This user is already blocked.";
  }
  setCapability(
    CAPABILITIES.MESSAGING_BLOCK_USER,
    !isMessagingGloballyDisabled && !conversationBlocked,
    blockReason
  );
  setCapability(CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS, !isDeleted, deletionReason);

  // Match insights & questionnaire
  setCapability(CAPABILITIES.INSIGHTS_VIEW_DASHBOARD, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.INSIGHTS_EDIT_CORE_PREFERENCES,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to edit preferences."
  );
  setCapability(
    CAPABILITIES.INSIGHTS_SAVE_CORE_PREFERENCES,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to save preferences."
  );
  setCapability(CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE, !isDeleted, deletionReason);

  let questionnaireReason = accountRestrictionMessage;
  if (!questionnaireReason && questionnaireLocked) {
    questionnaireReason = "Save your core match preferences to unlock the questionnaire.";
  }
  if (!questionnaireReason && !hasSavedCorePreferences) {
    questionnaireReason = "Complete your core preferences to continue.";
  }
  setCapability(
    CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE,
    !isMessagingGloballyDisabled && !questionnaireLocked && hasSavedCorePreferences,
    questionnaireReason
  );
  setCapability(
    CAPABILITIES.INSIGHTS_SELECT_CATEGORY,
    !isMessagingGloballyDisabled,
    accountRestrictionMessage
  );

  // Viewing other profiles
  setCapability(CAPABILITIES.PROFILE_VIEW_MEMBER, !isDeleted, deletionReason);
  setCapability(CAPABILITIES.PROFILE_VIEW_BADGES, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.PROFILE_SEND_REQUEST,
    !isDiscoveryDisabled,
    accountRestrictionMessage || "Activate your profile to send a connection request."
  );
  setCapability(CAPABILITIES.PROFILE_VIEW_SECTIONS, !isDeleted, deletionReason);

  // Owner profile management
  setCapability(CAPABILITIES.OWNER_PROFILE_VIEW, !isDeleted, deletionReason);
  setCapability(
    CAPABILITIES.OWNER_PROFILE_EDIT,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to edit your details."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_UPLOAD_PHOTO,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to update your photo."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_SUBMIT_IDENTITY,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to submit identity documents."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_SEND_OTP,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to verify your contact number."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_VERIFY_OTP,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to verify your contact number."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_MANAGE_INTERESTS,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to edit interests."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_MANAGE_LANGUAGES,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to edit languages."
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_SAVE,
    !isProfileEditingDisabled,
    accountRestrictionMessage || "Reactivate your profile to save changes."
  );
  setCapability(CAPABILITIES.OWNER_PROFILE_MANAGE_PAYMENTS, !isDeleted, deletionReason);

  let toggleVisibilityReason = accountRestrictionMessage;
  if (!toggleVisibilityReason && isSuspended) {
    toggleVisibilityReason = suspensionReason;
  }
  setCapability(
    CAPABILITIES.OWNER_PROFILE_TOGGLE_VISIBILITY,
    !isDeleted && !isSuspended,
    toggleVisibilityReason
  );
  setCapability(
    CAPABILITIES.OWNER_PROFILE_REMOVE_ACCOUNT,
    !isDeleted,
    deletionReason
  );

  // Billing / payments
  const billingReason = isDeleted ? deletionReason : undefined;
  setCapability(CAPABILITIES.BILLING_VIEW_PAYMENT, !isDeleted, billingReason);

  let initiatePaymentReason = billingReason;
  if (!initiatePaymentReason && billingStatus === BILLING_STATUS.ACTIVE) {
    initiatePaymentReason = "You already have an active subscription.";
  }
  setCapability(
    CAPABILITIES.BILLING_INITIATE_PAYMENT,
    !isDeleted,
    initiatePaymentReason
  );

  // Ensure every capability key is represented in the matrix
  for (const key of ALL_CAPABILITIES) {
    if (!(key in allowed)) {
      setCapability(key, false, "Capability not initialised.");
    }
  }

  return { allowed, reasons };
}

export default {
  CAPABILITIES,
  COMPONENT_CAPABILITIES,
  deriveCapabilities,
};
