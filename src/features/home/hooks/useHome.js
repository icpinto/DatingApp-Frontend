import { useCallback, useEffect, useMemo } from "react";
import { useActiveUserProfile } from "./useActiveUserProfile";
import { useActiveUsers } from "./useActiveUsers";
import { useConnectionRequest } from "./useConnectionRequest";
import { useDiscoveryCapabilities } from "./useDiscoveryCapabilities";
import { useDiscoveryFilters } from "./useDiscoveryFilters";
import { useRequestMessaging } from "./useRequestMessaging";

export function useHome({ accountLifecycle }) {
  const capabilities = useDiscoveryCapabilities(accountLifecycle);
  const {
    canViewHome,
    canViewActiveUsers,
    canUseFilters,
    canToggleFilterPanel,
    canExpandUserPreview,
    canNavigateToProfile,
    canComposeRequest,
    canSendRequest,
    discoveryBlockedByLifecycle,
    discoveryDisabled,
  } = capabilities;

  const {
    feedback,
    setFeedback,
    requestMessage,
    setRequestMessage,
    requestMessageError,
    setRequestMessageError,
    resetRequestMessaging,
  } = useRequestMessaging();

  const {
    expandedUserId,
    profileData,
    setProfileData,
    loadingProfile,
    handleToggleExpand,
    resetProfile,
  } = useActiveUserProfile({
    canExpandUserPreview,
    onResetMessaging: resetRequestMessaging,
    onProfileError: setFeedback,
  });

  const resetActiveState = useCallback(() => {
    resetProfile();
    resetRequestMessaging();
  }, [resetProfile, resetRequestMessaging]);

  const { activeUsers, loadingUsers, fetchActiveUsers } = useActiveUsers({
    canViewActiveUsers,
    onResetState: resetActiveState,
    onLoadError: setFeedback,
  });

  const {
    filters,
    showFilters,
    setShowFilters,
    filterPanelOpen,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
  } = useDiscoveryFilters({
    canUseFilters,
    canToggleFilterPanel,
    onApplyFilters: fetchActiveUsers,
  });

  const handleSendRequest = useConnectionRequest({
    discoveryDisabled,
    canSendRequest,
    requestMessage,
    setRequestMessage,
    setRequestMessageError,
    setFeedback,
    setProfileData,
  });

  useEffect(() => {
    fetchActiveUsers();
  }, [fetchActiveUsers]);

  const orderedUsers = useMemo(() => {
    return Array.isArray(activeUsers) ? activeUsers : [];
  }, [activeUsers]);

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
