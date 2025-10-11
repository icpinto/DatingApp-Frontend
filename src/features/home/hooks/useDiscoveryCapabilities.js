import { useMemo } from "react";
import { useUserCapabilities } from "@/shared/context/UserContext";

export function useDiscoveryCapabilities(accountLifecycle) {
  const { groups = {} } = useUserCapabilities();
  const discoveryCapabilities = groups.discovery || {};
  const { isDeactivated = false, loading: lifecycleLoading = false } =
    accountLifecycle || {};
  const discoveryBlockedByLifecycle = !lifecycleLoading && isDeactivated;

  return useMemo(() => {
    const canViewHome =
      discoveryBlockedByLifecycle || discoveryCapabilities.viewHome?.can;
    const canViewActiveUsers =
      discoveryBlockedByLifecycle || discoveryCapabilities.viewActiveUsers?.can;
    const canUseFilters = discoveryCapabilities.useFilters?.can;
    const canToggleFilterPanel =
      discoveryCapabilities.toggleFilterPanel?.can;
    const canExpandUserPreview =
      discoveryCapabilities.expandUserPreview?.can;
    const canNavigateToProfile =
      discoveryBlockedByLifecycle ||
      discoveryCapabilities.navigateToProfile?.can;
    const canComposeRequest = discoveryCapabilities.composeRequest?.can;
    const canSendRequest = discoveryCapabilities.sendRequest?.can;
    const discoveryDisabled = discoveryBlockedByLifecycle || !canSendRequest;

    return {
      discoveryBlockedByLifecycle,
      discoveryDisabled,
      canViewHome,
      canViewActiveUsers,
      canUseFilters,
      canToggleFilterPanel,
      canExpandUserPreview,
      canNavigateToProfile,
      canComposeRequest,
      canSendRequest,
    };
  }, [discoveryBlockedByLifecycle, discoveryCapabilities]);
}
