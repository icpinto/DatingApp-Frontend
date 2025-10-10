import { ACCOUNT_STATUS, BILLING_STATUS, defaultUserSnapshot } from "./user";

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

export const CAPABILITY_GROUPS = {
  navigation: {
    accessHome: CAPABILITIES.NAV_ACCESS_HOME,
    accessMatches: CAPABILITIES.NAV_ACCESS_MATCHES,
    accessInsights: CAPABILITIES.NAV_ACCESS_INSIGHTS,
    accessMessages: CAPABILITIES.NAV_ACCESS_MESSAGES,
    accessProfile: CAPABILITIES.NAV_ACCESS_PROFILE,
  },
  discovery: {
    viewHome: CAPABILITIES.DISCOVERY_VIEW_HOME,
    viewActiveUsers: CAPABILITIES.DISCOVERY_VIEW_ACTIVE_USERS,
    useFilters: CAPABILITIES.DISCOVERY_USE_FILTERS,
    toggleFilterPanel: CAPABILITIES.DISCOVERY_TOGGLE_FILTER_PANEL,
    expandUserPreview: CAPABILITIES.DISCOVERY_EXPAND_USER_PREVIEW,
    navigateToProfile: CAPABILITIES.DISCOVERY_NAVIGATE_TO_PROFILE,
    composeRequest: CAPABILITIES.DISCOVERY_COMPOSE_REQUEST,
    sendRequest: CAPABILITIES.DISCOVERY_SEND_REQUEST,
  },
  matches: {
    viewRecommendations: CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS,
    viewDetails: CAPABILITIES.MATCHES_VIEW_DETAILS,
    viewCompatibility: CAPABILITIES.MATCHES_VIEW_COMPATIBILITY,
    sendRequest: CAPABILITIES.MATCHES_SEND_REQUEST,
    navigateToProfile: CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE,
  },
  requests: {
    viewReceived: CAPABILITIES.REQUESTS_VIEW_RECEIVED,
    viewSent: CAPABILITIES.REQUESTS_VIEW_SENT,
    respond: CAPABILITIES.REQUESTS_RESPOND,
    viewStatus: CAPABILITIES.REQUESTS_VIEW_STATUS,
  },
  messaging: {
    viewInbox: CAPABILITIES.MESSAGING_VIEW_INBOX,
    viewConversations: CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS,
    openConversation: CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
    viewHistory: CAPABILITIES.MESSAGING_VIEW_HISTORY,
    markRead: CAPABILITIES.MESSAGING_MARK_READ,
    sendMessage: CAPABILITIES.MESSAGING_SEND_MESSAGE,
    blockUser: CAPABILITIES.MESSAGING_BLOCK_USER,
    viewPartnerStatus: CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS,
  },
  insights: {
    viewDashboard: CAPABILITIES.INSIGHTS_VIEW_DASHBOARD,
    editCorePreferences: CAPABILITIES.INSIGHTS_EDIT_CORE_PREFERENCES,
    saveCorePreferences: CAPABILITIES.INSIGHTS_SAVE_CORE_PREFERENCES,
    viewQuestionnaire: CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE,
    answerQuestionnaire: CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE,
    selectCategory: CAPABILITIES.INSIGHTS_SELECT_CATEGORY,
  },
  profile: {
    viewMember: CAPABILITIES.PROFILE_VIEW_MEMBER,
    viewBadges: CAPABILITIES.PROFILE_VIEW_BADGES,
    sendRequest: CAPABILITIES.PROFILE_SEND_REQUEST,
    viewSections: CAPABILITIES.PROFILE_VIEW_SECTIONS,
  },
  ownerProfile: {
    view: CAPABILITIES.OWNER_PROFILE_VIEW,
    edit: CAPABILITIES.OWNER_PROFILE_EDIT,
    uploadPhoto: CAPABILITIES.OWNER_PROFILE_UPLOAD_PHOTO,
    submitIdentity: CAPABILITIES.OWNER_PROFILE_SUBMIT_IDENTITY,
    sendOtp: CAPABILITIES.OWNER_PROFILE_SEND_OTP,
    verifyOtp: CAPABILITIES.OWNER_PROFILE_VERIFY_OTP,
    manageInterests: CAPABILITIES.OWNER_PROFILE_MANAGE_INTERESTS,
    manageLanguages: CAPABILITIES.OWNER_PROFILE_MANAGE_LANGUAGES,
    save: CAPABILITIES.OWNER_PROFILE_SAVE,
    managePayments: CAPABILITIES.OWNER_PROFILE_MANAGE_PAYMENTS,
    toggleVisibility: CAPABILITIES.OWNER_PROFILE_TOGGLE_VISIBILITY,
    removeAccount: CAPABILITIES.OWNER_PROFILE_REMOVE_ACCOUNT,
  },
  billing: {
    viewPayment: CAPABILITIES.BILLING_VIEW_PAYMENT,
    initiatePayment: CAPABILITIES.BILLING_INITIATE_PAYMENT,
  },
};

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
  "features/auth/Login": [
    CAPABILITIES.AUTH_VIEW_LOGIN,
    CAPABILITIES.AUTH_SUBMIT_LOGIN,
  ],
  "features/auth/Signup": [
    CAPABILITIES.AUTH_VIEW_SIGNUP,
    CAPABILITIES.AUTH_SUBMIT_SIGNUP,
  ],
  "shared/components/tabs/MainTabs": [
    CAPABILITIES.NAV_ACCESS_HOME,
    CAPABILITIES.NAV_ACCESS_MATCHES,
    CAPABILITIES.NAV_ACCESS_INSIGHTS,
    CAPABILITIES.NAV_ACCESS_MESSAGES,
    CAPABILITIES.NAV_ACCESS_PROFILE,
  ],
  "features/home/Home": [
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
  "features/home/matches/MatchRecommendations": [
    CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS,
    CAPABILITIES.MATCHES_VIEW_DETAILS,
    CAPABILITIES.MATCHES_VIEW_COMPATIBILITY,
    CAPABILITIES.MATCHES_SEND_REQUEST,
    CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE,
  ],
  "features/matches/Matches": [
    CAPABILITIES.REQUESTS_VIEW_RECEIVED,
    CAPABILITIES.REQUESTS_VIEW_SENT,
    CAPABILITIES.REQUESTS_RESPOND,
    CAPABILITIES.REQUESTS_VIEW_STATUS,
  ],
  "features/messages/Messages": [
    CAPABILITIES.MESSAGING_VIEW_INBOX,
    CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS,
    CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
    CAPABILITIES.MESSAGING_VIEW_HISTORY,
    CAPABILITIES.MESSAGING_MARK_READ,
  ],
  "features/messages/ConversationListPane": [
    CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS,
    CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
  ],
  "features/messages/ChatDrawer": [
    CAPABILITIES.MESSAGING_VIEW_HISTORY,
    CAPABILITIES.MESSAGING_SEND_MESSAGE,
    CAPABILITIES.MESSAGING_BLOCK_USER,
    CAPABILITIES.MESSAGING_MARK_READ,
    CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS,
  ],
  "features/messages/ChatMessageList": [
    CAPABILITIES.MESSAGING_VIEW_HISTORY,
    CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS,
  ],
  "features/messages/ChatHeaderSection": [
    CAPABILITIES.MESSAGING_BLOCK_USER,
    CAPABILITIES.MESSAGING_OPEN_CONVERSATION,
  ],
  "features/match-insights/pages/MatchInsights.page": [
    CAPABILITIES.INSIGHTS_VIEW_DASHBOARD,
    CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE,
  ],
  "features/match-insights/ui/CorePreferencesCard": [
    CAPABILITIES.INSIGHTS_EDIT_CORE_PREFERENCES,
    CAPABILITIES.INSIGHTS_SAVE_CORE_PREFERENCES,
  ],
  "features/match-insights/ui/QuestionnaireCard": [
    CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE,
    CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE,
    CAPABILITIES.INSIGHTS_SELECT_CATEGORY,
  ],
  "features/home/profile/Profile": [
    CAPABILITIES.PROFILE_VIEW_MEMBER,
    CAPABILITIES.PROFILE_VIEW_BADGES,
    CAPABILITIES.PROFILE_SEND_REQUEST,
    CAPABILITIES.PROFILE_VIEW_SECTIONS,
  ],
  "features/profiles/pages/Profiles.page": [
    CAPABILITIES.APP_CHANGE_LANGUAGE,
    CAPABILITIES.APP_SIGN_OUT,
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
  "features/premium/Payment": [
    CAPABILITIES.BILLING_VIEW_PAYMENT,
    CAPABILITIES.BILLING_INITIATE_PAYMENT,
  ],
};

/**
 * @typedef {import("./user").ACCOUNT_STATUS[keyof import("./user").ACCOUNT_STATUS]} AccountStatus
 * @typedef {import("./user").BILLING_STATUS[keyof import("./user").BILLING_STATUS]} BillingStatus
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
  setCapability(
    CAPABILITIES.DISCOVERY_VIEW_HOME,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_VIEW_ACTIVE_USERS,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_USE_FILTERS,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_TOGGLE_FILTER_PANEL,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_EXPAND_USER_PREVIEW,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_NAVIGATE_TO_PROFILE,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_COMPOSE_REQUEST,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.DISCOVERY_SEND_REQUEST,
    !isDiscoveryDisabled,
    accountRestrictionMessage || "Activate your profile to send connection requests."
  );

  // Match recommendations
  setCapability(
    CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.MATCHES_VIEW_DETAILS,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.MATCHES_VIEW_COMPATIBILITY,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );
  setCapability(
    CAPABILITIES.MATCHES_SEND_REQUEST,
    !isDiscoveryDisabled,
    accountRestrictionMessage || "Activate your profile to reach out to matches."
  );
  setCapability(
    CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE,
    !isDiscoveryDisabled,
    accountRestrictionMessage || deletionReason
  );

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

export const selectCapabilities = (facts = {}) => {
  const matrix = deriveCapabilities(facts);
  const allowed = matrix.allowed || {};
  const capabilitySet = new Set();

  Object.entries(allowed).forEach(([key, value]) => {
    if (value) {
      capabilitySet.add(key);
    }
  });

  return {
    allowed,
    reasons: matrix.reasons || {},
    capabilitySet,
  };
};

export const buildCapabilitySet = (facts = {}) =>
  selectCapabilities(facts).capabilitySet;

export const getCapabilityReason = (facts = {}, capability) => {
  const { reasons } = selectCapabilities(facts);
  return reasons[capability];
};

const capabilityApi = {
  CAPABILITIES,
  COMPONENT_CAPABILITIES,
  deriveCapabilities,
  selectCapabilities,
  buildCapabilitySet,
  getCapabilityReason,
};

export default capabilityApi;
