import React from "react";
import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import { Group } from "@mui/icons-material";

import FeatureCard from "../../../shared/components/FeatureCard";
import { spacing } from "../../../styles";
import FiltersPanel from "./FiltersPanel";
import ActiveUserCard from "./ActiveUserCard";
import { getUserIdentifier } from "../utils/normalizeUserId";

const ActiveUsersFeatureCard = ({
  filters,
  filterFields,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onToggleFilters,
  loadingUsers,
  canUseFilters,
  canToggleFilterPanel,
  filterPanelOpen,
  showFilters,
  feedback,
  orderedUsers,
  expandedUserId,
  canExpandUserPreview,
  canNavigateToProfile,
  canComposeRequest,
  canSendRequest,
  discoveryDisabled,
  onToggleExpand,
  onViewProfile,
  loadingProfile,
  profileData,
  requestMessage,
  requestMessageError,
  onRequestMessageChange,
  onSendRequest,
  t,
}) => {
  return (
    <FeatureCard
      title={t("home.headers.activeUsers")}
      subheader={t("home.headers.activeUsersSub")}
      icon={Group}
      dividerProps={{ sx: { borderStyle: "solid" } }}
    >
      <Stack spacing={spacing.section}>
        <FiltersPanel
          filters={filters}
          filterFields={filterFields}
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
          onToggleFilters={onToggleFilters}
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
                  onToggleExpand={onToggleExpand}
                  onViewProfile={(viewUserId) => {
                    if (!canNavigateToProfile) {
                      return;
                    }
                    onViewProfile(viewUserId);
                  }}
                  loadingProfile={loadingProfile}
                  profileData={profileData}
                  requestMessage={requestMessage}
                  requestMessageError={requestMessageError}
                  onRequestMessageChange={onRequestMessageChange}
                  onSendRequest={onSendRequest}
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
      </Stack>
    </FeatureCard>
  );
};

export default ActiveUsersFeatureCard;
