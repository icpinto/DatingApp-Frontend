import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Container, Stack } from "@mui/material";
import { spacing } from "../../../styles";
import MatchRecommendations from "../ui/MatchRecommendations";
import { useTranslation } from "../../../i18n";
import { useAccountLifecycle } from "../../../shared/context/AccountLifecycleContext";
import { CAPABILITIES } from "../../../domain/capabilities";
import Guard from "../ui/Guard";
import ActiveUsersFeatureCard from "../ui/ActiveUsersFeatureCard";
import { useHome } from "../hooks/useHome";
import { FILTER_FIELDS } from "../model/constants";

function HomeContent({ accountLifecycle }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state, computed, capabilities, handlers } = useHome({
    accountLifecycle,
  });

  const {
    expandedUserId,
    profileData,
    feedback,
    requestMessage,
    requestMessageError,
    loadingUsers,
    loadingProfile,
    filters,
    showFilters,
  } = state;

  const {
    orderedUsers,
    filterPanelOpen,
    discoveryBlockedByLifecycle,
    discoveryDisabled,
  } = computed;

  const {
    canViewHome,
    canUseFilters,
    canToggleFilterPanel,
    canExpandUserPreview,
    canNavigateToProfile,
    canComposeRequest,
    canSendRequest,
  } = capabilities;

  const {
    setShowFilters,
    setRequestMessage,
    setRequestMessageError,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
    handleToggleExpand,
    handleSendRequest,
    setFeedback,
  } = handlers;

  const handleRequestMessageChange = (value) => {
    if (!canComposeRequest) {
      return;
    }
    setRequestMessage(value);
    setRequestMessageError("");
    setFeedback(null);
  };

  if (!canViewHome) {
    return (
      <Container sx={{ p: spacing.pagePadding }}>
        <Alert severity="info">
          {t("home.messages.homeAccessRestricted", {
            defaultValue: "Access to the discovery feed is unavailable for your account.",
          })}
        </Alert>
      </Container>
    );
  }

  const matchRecommendationsGuardRequirement = discoveryBlockedByLifecycle
    ? null
    : CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS;
  const activeUsersGuardRequirement = discoveryBlockedByLifecycle
    ? null
    : CAPABILITIES.DISCOVERY_VIEW_ACTIVE_USERS;

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Guard can={matchRecommendationsGuardRequirement}>
          <MatchRecommendations limit={12} />
        </Guard>
        <Guard
          can={activeUsersGuardRequirement}
          fallback={
            <Alert severity="info">
              {t("home.messages.activeUsersUnavailable", {
                defaultValue: "Active user discovery is not available for your account.",
              })}
            </Alert>
          }
        >
          <ActiveUsersFeatureCard
            filters={filters}
            filterFields={FILTER_FIELDS}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onToggleFilters={setShowFilters}
            loadingUsers={loadingUsers}
            canUseFilters={canUseFilters}
            canToggleFilterPanel={canToggleFilterPanel}
            filterPanelOpen={filterPanelOpen}
            showFilters={showFilters}
            feedback={feedback}
            orderedUsers={orderedUsers}
            expandedUserId={expandedUserId}
            canExpandUserPreview={canExpandUserPreview}
            canNavigateToProfile={canNavigateToProfile}
            canComposeRequest={canComposeRequest}
            canSendRequest={canSendRequest}
            discoveryDisabled={discoveryDisabled}
            onToggleExpand={handleToggleExpand}
            onViewProfile={(viewUserId) => {
              if (!canNavigateToProfile) {
                return;
              }
              navigate(`/profile/${viewUserId}`);
            }}
            loadingProfile={loadingProfile}
            profileData={profileData}
            requestMessage={requestMessage}
            requestMessageError={requestMessageError}
            onRequestMessageChange={handleRequestMessageChange}
            onSendRequest={handleSendRequest}
            t={t}
          />
        </Guard>
      </Stack>
    </Container>
  );
}

function HomePage() {
  const accountLifecycle = useAccountLifecycle();
  return <HomeContent accountLifecycle={accountLifecycle} />;
}

export default HomePage;
