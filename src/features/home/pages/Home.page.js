import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Group } from "@mui/icons-material";
import { spacing } from "../../../styles";
import MatchRecommendations from "../ui/MatchRecommendations";
import { useTranslation } from "../../../i18n";
import { useAccountLifecycle } from "../../../shared/context/AccountLifecycleContext";
import { CAPABILITIES } from "../../../domain/capabilities";
import Guard from "../ui/Guard";
import FiltersPanel from "../ui/FiltersPanel";
import ActiveUserCard from "../ui/ActiveUserCard";
import { useHome } from "../hooks/useHome";
import { FILTER_FIELDS } from "../model/constants";

const getUserIdentifier = (user) => {
  if (!user) {
    return undefined;
  }

  const value =
    user.user_id ?? user.id ?? user.userId ?? user.profile_id ?? user.profileId;

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : numericValue;
};

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
    canViewActiveUsers,
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
  } = handlers;

  const handleRequestMessageChange = (value) => {
    if (!canComposeRequest) {
      return;
    }
    setRequestMessage(value);
    setRequestMessageError("");
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
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader
              title={t("home.headers.activeUsers")}
              subheader={t("home.headers.activeUsersSub")}
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Group />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              <FiltersPanel
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
                t={t}
              />
              {feedback?.key && !loadingUsers && (
                <Typography
                  variant="body2"
                  color={feedback.type === "error" ? "error.main" : "success.main"}
                  sx={{ mb: spacing.section }}
                >
                  {t(feedback.key)}
                </Typography>
              )}
              {loadingUsers ? (
                <Stack spacing={spacing.section}>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
                </Stack>
              ) : orderedUsers.length > 0 ? (
                <Stack
                  spacing={spacing.section}
                  divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}
                >
                  {orderedUsers.map((user, index) => {
                    const normalizedUserId = getUserIdentifier(user);
                    const key = normalizedUserId ?? index;
                    return (
                      <ActiveUserCard
                        key={key}
                        user={user}
                        userId={normalizedUserId}
                        index={index}
                        isExpanded={expandedUserId === normalizedUserId}
                        canExpand={canExpandUserPreview}
                        canNavigate={canNavigateToProfile}
                        canCompose={canComposeRequest}
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
                        feedback={feedback}
                        t={t}
                      />
                    );
                  })}
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1} sx={{ py: spacing.section }}>
                  <Group fontSize="large" color="disabled" />
                  <Typography color="text.secondary">
                    {t("home.labels.noActiveUsers")}
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
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
