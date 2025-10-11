import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUserCapabilities } from "../../../shared/context/UserContext";
import { isAbortError } from "../../../utils/http";
import {
  fetchActiveUsersApi,
  fetchRequestStatusApi,
  fetchUserProfileApi,
  sendConnectionRequestApi,
} from "../api/home.api";
import { FILTER_DEFAULTS } from "../model/constants";

const REQUEST_MESSAGE_ERROR_KEY = "home.validation.requestMessageRequired";

const normalizeUserId = (rawUserId) => {
  if (rawUserId === undefined || rawUserId === null || rawUserId === "") {
    return undefined;
  }

  const numericValue = Number(rawUserId);
  return Number.isNaN(numericValue) ? rawUserId : numericValue;
};

export function useHome({ accountLifecycle }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestMessageError, setRequestMessageError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...FILTER_DEFAULTS }));
  const [showFilters, setShowFilters] = useState(false);

  const activeUsersAbortRef = useRef(null);
  const profileAbortRef = useRef(null);

  const { groups = {} } = useUserCapabilities();
  const discoveryCapabilities = groups.discovery || {};
  const { isDeactivated = false, loading: lifecycleLoading = false } =
    accountLifecycle || {};
  const discoveryBlockedByLifecycle = !lifecycleLoading && isDeactivated;

  const canViewHome =
    discoveryBlockedByLifecycle || discoveryCapabilities.viewHome?.can;
  const canViewActiveUsers =
    discoveryBlockedByLifecycle || discoveryCapabilities.viewActiveUsers?.can;
  const canUseFilters = discoveryCapabilities.useFilters?.can;
  const canToggleFilterPanel = discoveryCapabilities.toggleFilterPanel?.can;
  const canExpandUserPreview = discoveryCapabilities.expandUserPreview?.can;
  const canNavigateToProfile =
    discoveryBlockedByLifecycle || discoveryCapabilities.navigateToProfile?.can;
  const canComposeRequest = discoveryCapabilities.composeRequest?.can;
  const canSendRequest = discoveryCapabilities.sendRequest?.can;

  const discoveryDisabled = discoveryBlockedByLifecycle || !canSendRequest;

  const getUserIdentifier = useCallback((user) => {
    if (!user) {
      return undefined;
    }

    const value =
      user.user_id ??
      user.id ??
      user.userId ??
      user.profile_id ??
      user.profileId;
    return normalizeUserId(value);
  }, []);

  const buildFilterParams = useCallback(() => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (key === "age") {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && numericValue > 0) {
          params[key] = numericValue;
        }
        return;
      }

      params[key] = value;
    });

    return params;
  }, [filters]);

  const resetRequestState = useCallback(() => {
    setExpandedUserId(null);
    setProfileData({});
    setFeedback(null);
    setRequestMessage("");
    setRequestMessageError("");
  }, []);

  const fetchActiveUsers = useCallback(
    async (params = {}) => {
      if (!canViewActiveUsers) {
        if (activeUsersAbortRef.current) {
          activeUsersAbortRef.current.abort();
          activeUsersAbortRef.current = null;
        }
        setActiveUsers([]);
        resetRequestState();
        setLoadingUsers(false);
        return;
      }

      if (activeUsersAbortRef.current) {
        activeUsersAbortRef.current.abort();
      }

      const controller = new AbortController();
      activeUsersAbortRef.current = controller;
      setLoadingUsers(true);

      try {
        const rawUsers = await fetchActiveUsersApi({
          params,
          signal: controller.signal,
        });
        const currentUserId = normalizeUserId(
          typeof window !== "undefined" ? localStorage.getItem("user_id") : null
        );

        const users = rawUsers
          .filter((user) => {
            const userId = getUserIdentifier(user);
            return userId !== currentUserId;
          })
          .map((user) => ({
            ...user,
            profile_image: user.profile_image_url ?? user.profile_image,
          }));

        setActiveUsers(users);
        resetRequestState();
      } catch (error) {
        if (!isAbortError(error)) {
          setFeedback({ type: "error", key: "home.messages.loadActiveError" });
        }
      } finally {
        if (activeUsersAbortRef.current === controller) {
          activeUsersAbortRef.current = null;
        }
        setLoadingUsers(false);
      }
    },
    [canViewActiveUsers, getUserIdentifier, resetRequestState]
  );

  const handleFilterChange = useCallback(
    (event) => {
      if (!canUseFilters) {
        return;
      }

      const { name, value } = event.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [canUseFilters]
  );

  const handleApplyFilters = useCallback(() => {
    if (!canUseFilters) {
      return;
    }

    const params = buildFilterParams();
    fetchActiveUsers(params);
  }, [buildFilterParams, canUseFilters, fetchActiveUsers]);

  const handleClearFilters = useCallback(() => {
    if (!canUseFilters) {
      return;
    }

    setFilters({ ...FILTER_DEFAULTS });
    fetchActiveUsers();
  }, [canUseFilters, fetchActiveUsers]);

  const handleToggleExpand = useCallback(
    async (rawUserId) => {
      if (!canExpandUserPreview) {
        return;
      }

      const normalizedUserId = normalizeUserId(rawUserId);
      if (normalizedUserId === undefined) {
        return;
      }

      if (expandedUserId === normalizedUserId) {
        if (profileAbortRef.current) {
          profileAbortRef.current.abort();
          profileAbortRef.current = null;
        }
        setExpandedUserId(null);
        return;
      }

      setExpandedUserId(normalizedUserId);
      setLoadingProfile(true);
      setProfileData({});
      setRequestMessage("");
      setRequestMessageError("");
      setFeedback(null);

      if (profileAbortRef.current) {
        profileAbortRef.current.abort();
      }

      const controller = new AbortController();
      profileAbortRef.current = controller;

      try {
        const [profile, requestStatus] = await Promise.all([
          fetchUserProfileApi(normalizedUserId, { signal: controller.signal }),
          fetchRequestStatusApi(normalizedUserId, { signal: controller.signal }),
        ]);

        setProfileData({
          ...profile,
          requestStatus,
        });
      } catch (error) {
        if (!isAbortError(error)) {
          setFeedback({ type: "error", key: "home.messages.profileError" });
        }
      } finally {
        setLoadingProfile(false);
        if (profileAbortRef.current === controller) {
          profileAbortRef.current = null;
        }
      }
    },
    [canExpandUserPreview, expandedUserId]
  );

  const handleSendRequest = useCallback(
    async (rawUserId) => {
      if (discoveryDisabled || !canSendRequest) {
        return;
      }

      const normalizedUserId = normalizeUserId(rawUserId);
      if (normalizedUserId === undefined) {
        return;
      }

      const trimmedMessage = requestMessage.trim();
      if (!trimmedMessage) {
        setRequestMessageError(REQUEST_MESSAGE_ERROR_KEY);
        return;
      }

      setRequestMessageError("");
      try {
        const parsedId = Number(normalizedUserId);
        const receiverId = Number.isNaN(parsedId) ? normalizedUserId : parsedId;
        await sendConnectionRequestApi(receiverId, trimmedMessage);
        setProfileData((prev) => ({ ...prev, requestStatus: true }));
        setFeedback({ type: "success", key: "home.messages.requestSuccess" });
        setRequestMessage(trimmedMessage);
      } catch (error) {
        if (!isAbortError(error)) {
          setFeedback({ type: "error", key: "home.messages.requestError" });
        }
      }
    },
    [canSendRequest, discoveryDisabled, requestMessage]
  );

  useEffect(() => {
    fetchActiveUsers();
  }, [fetchActiveUsers]);

  useEffect(() => {
    return () => {
      if (activeUsersAbortRef.current) {
        activeUsersAbortRef.current.abort();
        activeUsersAbortRef.current = null;
      }
      if (profileAbortRef.current) {
        profileAbortRef.current.abort();
        profileAbortRef.current = null;
      }
    };
  }, []);

  const orderedUsers = useMemo(() => {
    return Array.isArray(activeUsers) ? activeUsers : [];
  }, [activeUsers]);

  const filterPanelOpen = showFilters && canToggleFilterPanel && canUseFilters;

  return {
    state: {
      activeUsers,
      expandedUserId,
      profileData,
      feedback,
      requestMessage,
      requestMessageError,
      loadingUsers,
      loadingProfile,
      filters,
      showFilters,
    },
    computed: {
      orderedUsers,
      filterPanelOpen,
      discoveryBlockedByLifecycle,
      discoveryDisabled,
    },
    capabilities: {
      canViewHome,
      canViewActiveUsers,
      canUseFilters,
      canToggleFilterPanel,
      canExpandUserPreview,
      canNavigateToProfile,
      canComposeRequest,
      canSendRequest,
    },
    handlers: {
      setShowFilters,
      setRequestMessage,
      setRequestMessageError,
      setFeedback,
      handleFilterChange,
      handleApplyFilters,
      handleClearFilters,
      handleToggleExpand,
      handleSendRequest,
    },
  };
}
